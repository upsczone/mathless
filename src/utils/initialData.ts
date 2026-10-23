import { DailyChallenge, LeaderboardEntry, PlayerStats, PowerUpType } from '../types/game';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', rank: 1, username: 'MathWiz_99', score: 248500, level: 48, avatar: '👑', date: 'Today' },
  { id: 'lb_2', rank: 2, username: 'EulerFan_01', score: 215200, level: 42, avatar: '⚡', date: 'Today' },
  { id: 'lb_3', rank: 3, username: 'TheCalcuLator', score: 198000, level: 39, avatar: '🔥', date: 'Today' },
  { id: 'lb_4', rank: 4, username: 'QuantumLeap', score: 164300, level: 33, avatar: '🌌', date: 'Yesterday' },
  { id: 'lb_5', rank: 5, username: 'RamanujanX', score: 142800, level: 29, avatar: '💠', date: 'Yesterday' },
  { id: 'lb_6', rank: 6, username: 'CosmicNova', score: 119500, level: 25, avatar: '✨', date: '3d ago' },
  { id: 'lb_7', rank: 7, username: 'BinaryBeast', score: 96400, level: 21, avatar: '🤖', date: '4d ago' },
  { id: 'lb_8', rank: 8, username: 'HypatiaPrime', score: 78200, level: 18, avatar: '🦉', date: '5d ago' },
  { id: 'lb_9', rank: 9, username: 'FibonacciHero', score: 61500, level: 15, avatar: '🌀', date: '1w ago' },
  { id: 'lb_10', rank: 10, username: 'PixelProf', score: 48900, level: 12, avatar: '🎯', date: '1w ago' },
];

export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc_accuracy',
    title: "Sniper's Focus",
    category: 'accuracy',
    description: 'Solve 10 math equations cleanly in a run without popping any wrong bubble distractor.',
    target: 10,
    current: 0,
    rewardXp: 400,
    rewardGems: 150,
    rewardBoost: '+500 Trophy Rank Boost',
    completed: false,
    claimed: false,
  },
  {
    id: 'dc_cryo',
    title: 'Cryo-Strategist',
    category: 'powerup',
    description: 'Clear 6 math equations while under the active influence of the Slow-Mo [1] power-up.',
    target: 6,
    current: 0,
    rewardXp: 450,
    rewardGems: 120,
    rewardPowerUp: 'freeze',
    rewardBoost: '1.5x Multiplier Aura for 1 Hour',
    completed: false,
    claimed: false,
  },
  {
    id: 'dc_speed',
    title: 'Supersonic Blitz',
    category: 'speed',
    description: 'Solve 8 math problems with more than 18 seconds remaining on the round clock.',
    target: 8,
    current: 0,
    rewardXp: 500,
    rewardGems: 200,
    rewardSkinId: 'supernova_solar',
    rewardPowerUp: 'multiplier',
    completed: false,
    claimed: false,
  },
];

export const POWER_UP_CONFIG: Record<
  PowerUpType,
  {
    name: string;
    description: string;
    color: string;
    bgClass: string;
    hotkey: string;
    icon: string;
  }
> = {
  freeze: {
    name: 'Slow-Mo',
    description: 'Slows bubble physics drift by 80% for 8 seconds.',
    color: '#38bdf8',
    bgClass: 'bg-cyan-400 text-black shadow-cyan-400/20',
    hotkey: '1',
    icon: 'Snowflake',
  },
  magnet: {
    name: 'Math Magnet',
    description: 'Attracts the correct bubble towards the center arena.',
    color: '#ec4899',
    bgClass: 'bg-pink-500 text-white shadow-pink-500/20',
    hotkey: '2',
    icon: 'Magnet',
  },
  bomb: {
    name: 'Bubble Bomb',
    description: 'Vaporizes 3 wrong distractors with a radial blast shockwave.',
    color: '#f59e0b',
    bgClass: 'bg-amber-400 text-black shadow-amber-400/20',
    hotkey: '3',
    icon: 'Bomb',
  },
  multiplier: {
    name: 'Double Score',
    description: 'Doubles all points earned for the next 15 seconds.',
    color: '#a855f7',
    bgClass: 'bg-purple-500 text-white shadow-purple-500/20',
    hotkey: '4',
    icon: 'Zap',
  },
  shield: {
    name: 'Combo Shield',
    description: 'Protects combo multiplier from breaking on 1 incorrect pop.',
    color: '#10b981',
    bgClass: 'bg-emerald-500 text-white shadow-emerald-500/20',
    hotkey: '5',
    icon: 'Shield',
  },
};

const STATS_KEY = 'bubble_math_player_stats';
const LEADERBOARD_KEY = 'bubble_math_leaderboard';
const DAILY_CHALLENGES_KEY = 'bubble_math_daily_challenges_v1';

export function loadSavedStats(): PlayerStats {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          username: parsed.username || 'YOU',
          highScore: parsed.highScore || 0,
          highestLevel: parsed.highestLevel || 1,
          totalGames: parsed.totalGames || 0,
          totalSolved: parsed.totalSolved || 0,
          highestCombo: parsed.highestCombo || 1,
          xp: parsed.xp || 0,
          gems: typeof parsed.gems === 'number' ? parsed.gems : 250,
          tutorialCompleted: Boolean(parsed.tutorialCompleted),
          activeSkinId: parsed.activeSkinId || 'cyan_ice',
          unlockedSkinIds: parsed.unlockedSkinIds || ['cyan_ice'],
          activeBoosterExpiry: parsed.activeBoosterExpiry,
          settings: parsed.settings || {
            particleDensity: 'high',
            sfxVolume: 0.8,
            screenShake: true,
            showHints: true,
          },
          powerUpInventory: parsed.powerUpInventory || {
            freeze: 3,
            magnet: 2,
            bomb: 2,
            multiplier: 2,
            shield: 1,
          },
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    username: 'YOU',
    highScore: 12850,
    highestLevel: 8,
    totalGames: 1,
    totalSolved: 14,
    highestCombo: 3.5,
    xp: 650,
    gems: 250,
    tutorialCompleted: false,
    activeSkinId: 'cyan_ice',
    unlockedSkinIds: ['cyan_ice'],
    settings: {
      particleDensity: 'high',
      sfxVolume: 0.8,
      screenShake: true,
      showHints: true,
    },
    powerUpInventory: {
      freeze: 3,
      magnet: 2,
      bomb: 2,
      multiplier: 2,
      shield: 1,
    },
  };
}

export function saveStats(stats: PlayerStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // storage error
  }
}

export function loadSavedLeaderboard(): LeaderboardEntry[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboard(board: LeaderboardEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
  } catch {
    // storage error
  }
}

export function loadDailyChallenges(): DailyChallenge[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(DAILY_CHALLENGES_KEY);
      if (saved) {
        const parsed: DailyChallenge[] = JSON.parse(saved);
        // Verify that all 3 new challenge IDs exist
        const valid = INITIAL_DAILY_CHALLENGES.map((initCh) => {
          const found = parsed.find((p) => p.id === initCh.id);
          return found ? { ...initCh, current: found.current, completed: found.completed, claimed: found.claimed } : initCh;
        });
        return valid;
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_DAILY_CHALLENGES;
}

export function saveDailyChallenges(challenges: DailyChallenge[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(challenges));
  } catch {
    // storage error
  }
}
