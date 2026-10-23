import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Achievement, GameSettings, GameStatus, MathProblem, PlayerStats, PowerUpType } from './types/game';
import { generateMathProblem } from './utils/mathGenerator';
import { BUBBLE_SKINS } from './utils/skins';
import {
  loadDailyChallenges,
  loadSavedLeaderboard,
  loadSavedStats,
  saveDailyChallenges,
  saveLeaderboard,
  saveStats,
} from './utils/initialData';
import {
  loadAchievements,
  saveAchievements,
  evaluateAchievements,
} from './utils/achievements';
import { sounds } from './utils/audio';

import { HeaderHUD } from './components/HeaderHUD';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { BubbleSkinSelector } from './components/BubbleSkinSelector';
import { PhysicsCanvas } from './components/PhysicsCanvas';
import { LeaderboardCard } from './components/LeaderboardCard';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SkinVaultModal } from './components/SkinVaultModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Player persistence & configuration
  const [stats, setStats] = useState<PlayerStats>(loadSavedStats);
  const [leaderboard, setLeaderboard] = useState(loadSavedLeaderboard);
  const [challenges, setChallenges] = useState(loadDailyChallenges);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [skins, setSkins] = useState(() => {
    return BUBBLE_SKINS.map((s) => ({
      ...s,
      unlocked: s.unlocked || loadSavedStats().unlockedSkinIds.includes(s.id),
    }));
  });

  // Modal dialog states
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSkinVault, setShowSkinVault] = useState<boolean>(false);
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(() => !loadSavedStats().tutorialCompleted);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Toast notifications for achievements and skin unlocks
  const [toastNotification, setToastNotification] = useState<{
    id: number;
    title: string;
    subtitle: string;
    type?: 'achievement' | 'skin';
  } | null>(null);

  const showToast = useCallback((title: string, subtitle: string, type: 'achievement' | 'skin' = 'achievement') => {
    setToastNotification({ id: Date.now(), title, subtitle, type });
    setTimeout(() => {
      setToastNotification((cur) => (cur && Date.now() - cur.id >= 4400 ? null : cur));
    }, 4500);
  }, []);

  // Consecutive clean answers tracker for sniper daily challenge
  const [cleanStreak, setCleanStreak] = useState<number>(0);

  // Game gameplay state
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [highestCombo, setHighestCombo] = useState<number>(1.0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateMathProblem(1));

  // Timer: 30s base, capped at 40s
  const [maxRoundTime, setMaxRoundTime] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Power-ups active timers
  const [isSlowMoActive, setIsSlowMoActive] = useState<boolean>(false);
  const [isMagnetActive, setIsMagnetActive] = useState<boolean>(false);
  const [isDoubleScoreActive, setIsDoubleScoreActive] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [bombTrigger, setBombTrigger] = useState<number>(0);

  // Audio & Modals
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted);

  const slowMoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const magnetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleScoreTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active skin object
  const activeSkin = skins.find((s) => s.id === stats.activeSkinId) || skins[0];

  // Check and unlock new skins dynamically as score/level/combos/achievements increase
  const checkSkinUnlocks = useCallback(
    (
      currentScore: number,
      currentLevel: number,
      currentCombo = multiplier,
      currentStreak = cleanStreak
    ) => {
      let newlyUnlocked = false;
      const directUnlockedSkinIds: string[] = [];

      // 1. Direct score and level milestone checks
      let updatedSkins = skins.map((skin) => {
        if (!skin.unlocked) {
          const scoreMet = Boolean(skin.requiredScore && currentScore >= skin.requiredScore);
          const levelMet = Boolean(skin.requiredLevel && currentLevel >= skin.requiredLevel);
          if (scoreMet || levelMet) {
            newlyUnlocked = true;
            directUnlockedSkinIds.push(skin.id);
            return { ...skin, unlocked: true };
          }
        }
        return skin;
      });

      // 2. Comprehensive Achievement Evaluation
      const completedDailyCount = challenges.filter((c) => c.completed).length;
      const evalResult = evaluateAchievements(achievements, {
        score: Math.max(stats.highScore, currentScore),
        level: currentLevel,
        combo: currentCombo,
        cleanStreak: currentStreak,
        totalSolved: stats.totalSolved + solvedCount,
        completedDailyCount,
        gems: stats.gems || 0,
      });

      let finalUnlockedIds = [...stats.unlockedSkinIds, ...directUnlockedSkinIds];

      if (evalResult.newlyUnlocked.length > 0) {
        setAchievements(evalResult.updatedAchievements);
        saveAchievements(evalResult.updatedAchievements);

        // Handle skin rewards from achievements
        if (evalResult.unlockedSkinIds.length > 0) {
          newlyUnlocked = true;
          finalUnlockedIds = Array.from(new Set([...finalUnlockedIds, ...evalResult.unlockedSkinIds]));
          updatedSkins = updatedSkins.map((s) =>
            finalUnlockedIds.includes(s.id) ? { ...s, unlocked: true } : s
          );
        }

        // Celebrate with toast notifications
        evalResult.newlyUnlocked.forEach((ach) => {
          showToast(
            `Achievement: ${ach.title}!`,
            `+${ach.rewardGems} Star Gems${ach.rewardSkinName ? ` • Unlocked ${ach.rewardSkinName} Skin!` : ''}`,
            'achievement'
          );
        });

        confetti({ particleCount: 75, spread: 80, origin: { y: 0.55 } });
        sounds.playLevelUp();
      }

      if (newlyUnlocked || evalResult.gemsAwarded > 0) {
        setSkins(updatedSkins);
        setStats((prev) => {
          const updated = {
            ...prev,
            gems: (prev.gems || 0) + evalResult.gemsAwarded,
            unlockedSkinIds: Array.from(new Set([...prev.unlockedSkinIds, ...finalUnlockedIds])),
          };
          saveStats(updated);
          return updated;
        });
      }
    },
    [
      skins,
      achievements,
      challenges,
      stats.highScore,
      stats.totalSolved,
      stats.gems,
      stats.unlockedSkinIds,
      multiplier,
      cleanStreak,
      solvedCount,
      showToast,
    ]
  );

  // Update daily challenge progress
  const updateChallengeProgress = useCallback(
    (type: 'clean_solve' | 'cryo_solve' | 'speed_solve', amount = 1) => {
      setChallenges((prev) => {
        const next = prev.map((ch) => {
          if (ch.completed) return ch;
          let newCurr = ch.current;

          if (type === 'clean_solve' && ch.id === 'dc_accuracy') {
            newCurr = Math.min(ch.target, ch.current + amount);
          } else if (type === 'cryo_solve' && ch.id === 'dc_cryo') {
            newCurr = Math.min(ch.target, ch.current + amount);
          } else if (type === 'speed_solve' && ch.id === 'dc_speed') {
            newCurr = Math.min(ch.target, ch.current + amount);
          }

          const completed = newCurr >= ch.target;
          if (completed && !ch.completed) {
            sounds.playLevelUp();
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
          }

          return {
            ...ch,
            current: newCurr,
            completed,
          };
        });
        saveDailyChallenges(next);
        return next;
      });
    },
    []
  );

  // Claim Daily Challenge Reward
  const handleClaimReward = (id: string) => {
    setChallenges((prev) => {
      const next = prev.map((ch) => {
        if (ch.id === id && ch.completed && !ch.claimed) {
          // Award Gems, XP, Booster, and Power-Up
          setStats((st) => {
            const pType = ch.rewardPowerUp || 'freeze';
            const updated = {
              ...st,
              gems: (st.gems || 0) + (ch.rewardGems || 150),
              xp: st.xp + ch.rewardXp,
              activeBoosterExpiry: ch.rewardBoost
                ? Date.now() + 24 * 60 * 60 * 1000
                : st.activeBoosterExpiry,
              powerUpInventory: {
                ...st.powerUpInventory,
                [pType]: (st.powerUpInventory[pType] || 0) + 1,
              },
            };
            saveStats(updated);
            return updated;
          });

          // If challenge rewards a skin (e.g. Supernova Solar), unlock it directly!
          if (ch.rewardSkinId) {
            setSkins((curSkins) => {
              const unlocked = curSkins.map((s) =>
                s.id === ch.rewardSkinId ? { ...s, unlocked: true } : s
              );
              setStats((st) => {
                const updated = {
                  ...st,
                  unlockedSkinIds: Array.from(
                    new Set([...st.unlockedSkinIds, ch.rewardSkinId!])
                  ),
                };
                saveStats(updated);
                return updated;
              });
              return unlocked;
            });
          }

          sounds.playLevelUp();
          confetti({ particleCount: 65, spread: 70, origin: { y: 0.7 } });
          return { ...ch, claimed: true };
        }
        return ch;
      });
      saveDailyChallenges(next);
      return next;
    });
  };

  // Unlock Skin with Star Gems
  const handleUnlockSkinWithGems = (skinId: string, cost: number) => {
    if ((stats.gems || 0) < cost) return;

    const targetSkin = skins.find((s) => s.id === skinId);
    const skinName = targetSkin ? targetSkin.name : 'Bubble Skin';

    setStats((prev) => {
      const updated = {
        ...prev,
        gems: (prev.gems || 0) - cost,
        unlockedSkinIds: Array.from(new Set([...prev.unlockedSkinIds, skinId])),
        activeSkinId: skinId, // Set as preferred automatically!
      };
      saveStats(updated);
      return updated;
    });

    setSkins((prev) =>
      prev.map((s) => (s.id === skinId ? { ...s, unlocked: true } : s))
    );

    sounds.playLevelUp();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    showToast(`Skin Unlocked: ${skinName}!`, 'Equipped as your preferred bubble skin.', 'skin');
  };

  // Academy Tutorial Completed Callback
  const handleCompleteTutorial = () => {
    setShowTutorialModal(false);
    // Award Starter Pack (+150 Star Gems & +3 Power-ups)
    setStats((prev) => {
      const updated = {
        ...prev,
        tutorialCompleted: true,
        gems: (prev.gems || 0) + 150,
        powerUpInventory: {
          ...prev.powerUpInventory,
          freeze: (prev.powerUpInventory.freeze || 0) + 1,
          magnet: (prev.powerUpInventory.magnet || 0) + 1,
          bomb: (prev.powerUpInventory.bomb || 0) + 1,
        },
      };
      saveStats(updated);
      return updated;
    });

    // Start Level 1 fresh
    handleRestartGame();
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
    showToast('Starter Pack Awarded!', '+150 Star Gems & 3 Free Power-ups added to inventory.', 'achievement');
  };

  // Timer Loop (runs when game is actively playing)
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Game Over!
          setGameStatus('game_over');
          sounds.playWrong();

          // Update player stats and leaderboards
          setStats((st) => {
            const newHigh = Math.max(st.highScore, score);
            const newHighestLvl = Math.max(st.highestLevel, level);
            const newCombo = Math.max(st.highestCombo, highestCombo);
            const xpGained = Math.round(score * 0.05) + solvedCount * 10;
            const updated: PlayerStats = {
              ...st,
              highScore: newHigh,
              highestLevel: newHighestLvl,
              highestCombo: newCombo,
              totalGames: st.totalGames + 1,
              totalSolved: st.totalSolved + solvedCount,
              xp: st.xp + xpGained,
            };
            saveStats(updated);

            // Update leaderboard if new high
            setLeaderboard((prevBoard) => {
              const playerEntryIdx = prevBoard.findIndex((e) => e.isCurrentPlayer);
              const newEntry = {
                id: 'player_entry',
                rank: 42,
                username: st.username,
                score: Math.max(newHigh, score),
                level: newHighestLvl,
                avatar: '🎮',
                isCurrentPlayer: true,
                date: 'Just now',
              };

              let nextBoard: typeof prevBoard;
              if (playerEntryIdx >= 0) {
                nextBoard = [...prevBoard];
                nextBoard[playerEntryIdx] = newEntry;
              } else {
                nextBoard = [...prevBoard, newEntry];
              }
              nextBoard.sort((a, b) => b.score - a.score);
              const ranked = nextBoard.map((e, idx) => ({ ...e, rank: idx + 1 }));
              saveLeaderboard(ranked);
              return ranked;
            });

            return updated;
          });

          return 0;
        }

        if (prev <= 6 && Math.floor(prev) === prev) {
          sounds.playTick();
        }

        return prev - 0.25;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [gameStatus, score, level, solvedCount, highestCombo]);

  // Activate a Power-Up
  const handleActivatePowerUp = useCallback(
    (type: PowerUpType) => {
      const currentCount = stats.powerUpInventory[type] || 0;
      if (currentCount <= 0) return;

      // Consume inventory
      setStats((prev) => {
        const updated = {
          ...prev,
          powerUpInventory: {
            ...prev.powerUpInventory,
            [type]: currentCount - 1,
          },
        };
        saveStats(updated);
        return updated;
      });

      sounds.playPowerUp(type);

      if (type === 'freeze') {
        setIsSlowMoActive(true);
        if (slowMoTimerRef.current) clearTimeout(slowMoTimerRef.current);
        slowMoTimerRef.current = setTimeout(() => setIsSlowMoActive(false), 8000);
      } else if (type === 'magnet') {
        setIsMagnetActive(true);
        if (magnetTimerRef.current) clearTimeout(magnetTimerRef.current);
        magnetTimerRef.current = setTimeout(() => setIsMagnetActive(false), 7000);
      } else if (type === 'bomb') {
        setBombTrigger((c) => c + 1);
      } else if (type === 'multiplier') {
        setIsDoubleScoreActive(true);
        if (doubleScoreTimerRef.current) clearTimeout(doubleScoreTimerRef.current);
        doubleScoreTimerRef.current = setTimeout(() => setIsDoubleScoreActive(false), 15000);
      } else if (type === 'shield') {
        setShieldActive(true);
      }
    },
    [stats.powerUpInventory, updateChallengeProgress]
  );

  // Hotkey support for Power-ups (Keys 1, 2, 3, 4, 5) & Pause (Key P or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (gameStatus !== 'playing') return;

      if (e.key === '1') handleActivatePowerUp('freeze');
      else if (e.key === '2') handleActivatePowerUp('magnet');
      else if (e.key === '3') handleActivatePowerUp('bomb');
      else if (e.key === '4') handleActivatePowerUp('multiplier');
      else if (e.key === '5') handleActivatePowerUp('shield');
      else if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        setGameStatus((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleActivatePowerUp]);

  // Handle Correct Bubble Pop
  const handleCorrectAnswer = (bubbleId: string, value: number, points: number) => {
    const nextScore = score + points;
    const nextSolved = solvedCount + 1;
    const nextCombo = Math.min(multiplier + 0.5, 5.0);

    setScore(nextScore);
    setSolvedCount(nextSolved);
    setMultiplier(nextCombo);
    setHighestCombo((h) => Math.max(h, nextCombo));

    // Award Star Gems on correct answers (scaled by combo!)
    const gemsGained = Math.round(5 * nextCombo);
    setStats((st) => {
      const updated = { ...st, gems: (st.gems || 0) + gemsGained };
      saveStats(updated);
      return updated;
    });

    // Bonus time on correct solve (+3.5s, up to 40s)
    setTimeLeft((t) => Math.min(40, t + 3.5));

    // Update daily challenge trackers
    const newStreak = cleanStreak + 1;
    setCleanStreak(newStreak);
    updateChallengeProgress('clean_solve', 1);

    if (isSlowMoActive) {
      updateChallengeProgress('cryo_solve', 1);
    }

    if (timeLeft >= 18) {
      updateChallengeProgress('speed_solve', 1);
    }

    // Progressive leveling: every 4 solved problems increases difficulty level!
    if (nextSolved % 4 === 0) {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      sounds.playLevelUp();
      // Increase round base time slightly on new tier
      setMaxRoundTime((m) => Math.max(20, m - 0.5));
    }

    // Check unlocks & achievements
    checkSkinUnlocks(nextScore, level, nextCombo, newStreak);

    // Generate next math equation
    setCurrentProblem(generateMathProblem(level));
  };

  // Handle Wrong Bubble Pop
  const handleWrongAnswer = (bubbleId: string, value: number) => {
    if (shieldActive) {
      // Shield saves combo!
      setShieldActive(false);
      return;
    }

    // Reset clean streak for sniper challenge
    setCleanStreak(0);
    setChallenges((prev) => {
      const next = prev.map((c) =>
        c.id === 'dc_accuracy' && !c.completed ? { ...c, current: 0 } : c
      );
      saveDailyChallenges(next);
      return next;
    });

    // Dock score and reset combo
    setScore((s) => Math.max(0, s - 100));
    setMultiplier(1.0);
    // Slight penalty to time
    setTimeLeft((t) => Math.max(1, t - 2));
  };

  // Handle Free Floating Power-Up Bubble Pop
  const handleCollectPowerUp = (type: PowerUpType) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        powerUpInventory: {
          ...prev.powerUpInventory,
          [type]: (prev.powerUpInventory[type] || 0) + 1,
        },
      };
      saveStats(updated);
      return updated;
    });
  };

  // Handle Skin Selection
  const handleSelectSkin = (skinId: string) => {
    const chosen = skins.find((s) => s.id === skinId);
    setStats((prev) => {
      const updated = { ...prev, activeSkinId: skinId };
      saveStats(updated);
      return updated;
    });
    sounds.playPop(1.3);
    if (chosen) {
      showToast('Preferred Skin Equipped', `${chosen.name} is now active in the arena.`, 'skin');
    }
  };

  // Handle Settings Update
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setStats((prev) => {
      const updatedSettings: GameSettings = {
        particleDensity: 'high',
        sfxVolume: 0.8,
        screenShake: true,
        showHints: true,
        ...(prev.settings || {}),
        ...newSettings,
      };
      const updated = { ...prev, settings: updatedSettings };
      saveStats(updated);
      return updated;
    });
  };

  // Reset Progress Handler
  const handleResetProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bubble_math_player_stats');
      localStorage.removeItem('bubble_math_achievements_v1');
      localStorage.removeItem('bubble_math_daily_challenges_v1');
    }
    const freshStats = loadSavedStats();
    setStats(freshStats);
    setAchievements(loadAchievements());
    setChallenges(loadDailyChallenges());
    setSkins(
      BUBBLE_SKINS.map((s) => ({
        ...s,
        unlocked: s.id === 'cyan_ice',
      }))
    );
    handleRestartGame();
    showToast('Progress Reset', 'Game stats and achievements reset to default.', 'achievement');
  };

  // Handle Username Update
  const handleUpdateUsername = (newName: string) => {
    setStats((prev) => {
      const updated = { ...prev, username: newName };
      saveStats(updated);
      return updated;
    });
  };

  // Restart / Reset Game Loop
  const handleRestartGame = () => {
    setScore(0);
    setLevel(1);
    setMultiplier(1.0);
    setHighestCombo(1.0);
    setSolvedCount(0);
    setTimeLeft(30);
    setMaxRoundTime(30);
    setIsSlowMoActive(false);
    setIsMagnetActive(false);
    setIsDoubleScoreActive(false);
    setShieldActive(false);
    setCurrentProblem(generateMathProblem(1));
    setGameStatus('playing');
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePause = () => {
    setGameStatus((prev) => (prev === 'playing' ? 'paused' : 'playing'));
  };

  // Determine next milestone skin text for the leaderboard card
  const nextLockedSkin = skins.find((s) => !s.unlocked);
  const nextUnlockLabel = nextLockedSkin
    ? `${nextLockedSkin.name} at ${nextLockedSkin.requiredScore ? `${nextLockedSkin.requiredScore.toLocaleString()} pts` : `LVL ${nextLockedSkin.requiredLevel}`}`
    : 'All Skins Mastered!';

  return (
    <div
      id="math-game-root"
      className="min-h-screen w-full bg-gradient-to-tr from-indigo-950 via-purple-900 to-rose-950 flex flex-col p-3 sm:p-5 lg:p-6 select-none font-sans text-white relative overflow-x-hidden"
    >
      {/* Toast Notification Alert for Achievements & Skins */}
      {toastNotification && (
        <div
          id="toast-notification-banner"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 border border-cyan-400/50 backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.3)] animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
            {toastNotification.type === 'skin' ? (
              <Sparkles size={18} className="text-black" />
            ) : (
              <Trophy size={18} className="text-black" />
            )}
          </div>
          <div>
            <span className="block text-xs font-black uppercase text-cyan-300 tracking-wide">
              {toastNotification.title}
            </span>
            <span className="block text-[11px] text-white/80 font-medium">
              {toastNotification.subtitle}
            </span>
          </div>
        </div>
      )}

      {/* Ambient background glow orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Frosted Glass Layout Container */}
      <div className="w-full max-w-[1360px] mx-auto flex-1 flex flex-col min-h-0 z-10">
        {/* Header HUD */}
        <HeaderHUD
          level={level}
          score={score}
          gems={stats.gems || 0}
          multiplier={multiplier}
          timeLeft={timeLeft}
          maxTime={maxRoundTime}
          problem={currentProblem}
          isPaused={gameStatus === 'paused'}
          isMuted={isMuted}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenTutorial={() => setShowTutorialModal(true)}
          onOpenSkinVault={() => setShowSkinVault(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Center Game Arena & Sidebars */}
        <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0">
          {/* Left Column: Daily Challenge & Bubble Skins */}
          <div className="w-full lg:w-64 flex flex-col gap-4 order-2 lg:order-1">
            <DailyChallengeCard
              challenges={challenges}
              activePowerUps={stats.powerUpInventory}
              isSlowMoActive={isSlowMoActive}
              isMagnetActive={isMagnetActive}
              isDoubleScoreActive={isDoubleScoreActive}
              shieldActive={shieldActive}
              onActivatePowerUp={handleActivatePowerUp}
              onClaimReward={handleClaimReward}
              onOpenDailyModal={() => setShowDailyModal(true)}
            />

            <BubbleSkinSelector
              skins={skins}
              activeSkinId={stats.activeSkinId}
              playerScore={score}
              playerLevel={level}
              onSelectSkin={handleSelectSkin}
              onOpenVault={() => setShowSkinVault(true)}
            />
          </div>

          {/* Center Arena: Physics Bubble Simulation */}
          <div className="flex-1 flex flex-col min-h-[420px] lg:min-h-0 order-1 lg:order-2">
            <PhysicsCanvas
              problem={currentProblem}
              activeSkin={activeSkin}
              isSlowMoActive={isSlowMoActive}
              isMagnetActive={isMagnetActive}
              isDoubleScoreActive={isDoubleScoreActive}
              shieldActive={shieldActive}
              onCorrectAnswer={handleCorrectAnswer}
              onWrongAnswer={handleWrongAnswer}
              onCollectPowerUp={handleCollectPowerUp}
              triggerBombEffect={bombTrigger}
              multiplier={multiplier}
              particleDensity={stats.settings?.particleDensity || 'high'}
              screenShake={stats.settings?.screenShake ?? true}
            />
          </div>

          {/* Right Column: Global Leaderboard & Milestones */}
          <div className="w-full lg:w-72 order-3">
            <LeaderboardCard
              entries={leaderboard}
              currentPlayerScore={score}
              currentPlayerLevel={level}
              currentUsername={stats.username}
              onUpdateUsername={handleUpdateUsername}
              nextUnlockLabel={nextUnlockLabel}
            />
          </div>
        </div>
      </div>

      {/* Paused Overlay */}
      {gameStatus === 'paused' && (
        <div
          id="paused-overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center select-none"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-3xl font-black uppercase text-white mb-2">Game Paused</h3>
            <p className="text-xs text-white/60 mb-6">Take a breath, your mental gears are primed!</p>
            <button
              id="btn-resume"
              onClick={handleTogglePause}
              className="w-full py-3 rounded-xl bg-cyan-400 text-black font-black uppercase tracking-wider text-sm hover:bg-cyan-300 transition-colors shadow-lg"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus === 'game_over' && (
        <GameOverModal
          score={score}
          highScore={stats.highScore}
          level={level}
          solvedCount={solvedCount}
          maxCombo={highestCombo}
          xpEarned={Math.round(score * 0.05) + solvedCount * 10}
          onRestart={handleRestartGame}
        />
      )}

      {/* How to Play Rules Modal */}
      <HowToPlayModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Bubble Skins Vault Modal */}
      <SkinVaultModal
        isOpen={showSkinVault}
        onClose={() => setShowSkinVault(false)}
        skins={skins}
        activeSkinId={stats.activeSkinId}
        playerScore={Math.max(score, stats.highScore)}
        playerLevel={level}
        playerGems={stats.gems || 0}
        onSelectSkin={handleSelectSkin}
        onUnlockSkinWithGems={handleUnlockSkinWithGems}
      />

      {/* Game Settings & Preferred Skin Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        skins={skins}
        activeSkinId={stats.activeSkinId}
        playerGems={stats.gems || 0}
        playerScore={Math.max(score, stats.highScore)}
        playerLevel={level}
        achievements={achievements}
        settings={
          stats.settings || {
            particleDensity: 'high',
            sfxVolume: 0.8,
            screenShake: true,
            showHints: true,
          }
        }
        isMuted={isMuted}
        onSelectSkin={handleSelectSkin}
        onUnlockSkinWithGems={handleUnlockSkinWithGems}
        onUpdateSettings={handleUpdateSettings}
        onToggleMute={handleToggleMute}
        onOpenVault={() => {
          setShowSettingsModal(false);
          setShowSkinVault(true);
        }}
        onResetProgress={handleResetProgress}
      />

      {/* Daily Challenges Operations Modal */}
      <DailyChallengeModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        challenges={challenges}
        onClaimReward={handleClaimReward}
        playerGems={stats.gems || 0}
      />

      {/* Interactive Academy Tutorial Modal */}
      <InteractiveTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        onCompleteTutorial={handleCompleteTutorial}
      />
    </div>
  );
}
