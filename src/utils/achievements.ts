import { Achievement, BubbleSkin, PlayerStats } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_apprentice',
    title: 'Math Apprentice',
    description: 'Solve 5 math equations correctly in the arena.',
    category: 'equations',
    target: 5,
    progress: 0,
    unlocked: false,
    rewardGems: 50,
    icon: 'Sparkles',
  },
  {
    id: 'ach_novice_dynamo',
    title: 'Novice Dynamo',
    description: 'Accumulate a round score of 5,000 points or more.',
    category: 'score',
    target: 5000,
    progress: 0,
    unlocked: false,
    rewardGems: 100,
    rewardSkinId: 'sunset_ember',
    rewardSkinName: 'Sunset Ember',
    icon: 'Flame',
  },
  {
    id: 'ach_sniper',
    title: 'Sharpshooter',
    description: 'Reach a clean streak of 10 correct solves without popping a single wrong bubble.',
    category: 'accuracy',
    target: 10,
    progress: 0,
    unlocked: false,
    rewardGems: 150,
    rewardSkinId: 'emerald_glow',
    rewardSkinName: 'Emerald Jadeite',
    icon: 'Target',
  },
  {
    id: 'ach_dimensional',
    title: 'Dimensional Voyager',
    description: 'Advance your mathematical journey to Level 8.',
    category: 'level',
    target: 8,
    progress: 0,
    unlocked: false,
    rewardGems: 200,
    rewardSkinId: 'cosmic_nebula',
    rewardSkinName: 'Cosmic Nebula',
    icon: 'Compass',
  },
  {
    id: 'ach_combo_overlord',
    title: 'Combo Overlord',
    description: 'Ramp up your momentum to hit a massive 4.0x Combo Multiplier.',
    category: 'combo',
    target: 40, // 4.0x represented as * 10
    progress: 0,
    unlocked: false,
    rewardGems: 250,
    rewardSkinId: 'void_singularity',
    rewardSkinName: 'Void Singularity',
    icon: 'Zap',
  },
  {
    id: 'ach_daily_trio',
    title: 'Daily Champion',
    description: 'Successfully complete all 3 daily challenges in the Academy.',
    category: 'challenges',
    target: 3,
    progress: 0,
    unlocked: false,
    rewardGems: 300,
    rewardSkinId: 'supernova_solar',
    rewardSkinName: 'Supernova Solar',
    icon: 'Award',
  },
  {
    id: 'ach_calculation_master',
    title: 'Calculation Master',
    description: 'Solve 50 total math equations across all your game sessions.',
    category: 'equations',
    target: 50,
    progress: 0,
    unlocked: false,
    rewardGems: 250,
    rewardSkinId: 'quantum_matrix',
    rewardSkinName: 'Quantum Matrix',
    icon: 'Cpu',
  },
  {
    id: 'ach_sovereign_gold',
    title: 'Sovereign Gold',
    description: 'Achieve high society status by reaching a score of 45,000 points.',
    category: 'score',
    target: 45000,
    progress: 0,
    unlocked: false,
    rewardGems: 350,
    rewardSkinId: 'golden_royalty',
    rewardSkinName: 'Golden Royalty',
    icon: 'Crown',
  },
  {
    id: 'ach_cyber_overclock',
    title: 'Cyber Overclock',
    description: 'Surpass all boundaries by reaching Level 15 in the simulation.',
    category: 'level',
    target: 15,
    progress: 0,
    unlocked: false,
    rewardGems: 400,
    rewardSkinId: 'cyber_prism',
    rewardSkinName: 'Cyber Prism',
    icon: 'Layers',
  },
  {
    id: 'ach_aurora_hoarder',
    title: 'Star Hoarder',
    description: 'Earn and hold 500 Star Gems in your intergalactic vault.',
    category: 'gems',
    target: 500,
    progress: 0,
    unlocked: false,
    rewardGems: 500,
    rewardSkinId: 'rainbow_aurora',
    rewardSkinName: 'Prismatic Aurora',
    icon: 'Gem',
  },
];

const ACHIEVEMENTS_STORAGE_KEY = 'bubble_math_achievements_v1';

export const loadAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const parsed: Achievement[] = JSON.parse(raw);
    // Merge in any new achievements that might not exist in stored version
    return INITIAL_ACHIEVEMENTS.map((initial) => {
      const found = parsed.find((p) => p.id === initial.id);
      return found ? { ...initial, ...found } : initial;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
};

export const saveAchievements = (achievements: Achievement[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.warn('Failed to save achievements', err);
  }
};

export interface CheckAchievementContext {
  score: number;
  level: number;
  combo: number;
  cleanStreak: number;
  totalSolved: number;
  completedDailyCount: number;
  gems: number;
}

export interface AchievementEvaluationResult {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
  gemsAwarded: number;
  unlockedSkinIds: string[];
}

export const evaluateAchievements = (
  currentList: Achievement[],
  context: CheckAchievementContext
): AchievementEvaluationResult => {
  const newlyUnlocked: Achievement[] = [];
  let gemsAwarded = 0;
  const unlockedSkinIds: string[] = [];

  const updatedAchievements = currentList.map((ach) => {
    if (ach.unlocked) return ach;

    let currentVal = ach.progress;

    switch (ach.id) {
      case 'ach_apprentice':
        currentVal = context.totalSolved;
        break;
      case 'ach_novice_dynamo':
        currentVal = Math.max(ach.progress, context.score);
        break;
      case 'ach_sniper':
        currentVal = Math.max(ach.progress, context.cleanStreak);
        break;
      case 'ach_dimensional':
        currentVal = Math.max(ach.progress, context.level);
        break;
      case 'ach_combo_overlord':
        currentVal = Math.max(ach.progress, Math.round(context.combo * 10));
        break;
      case 'ach_daily_trio':
        currentVal = Math.max(ach.progress, context.completedDailyCount);
        break;
      case 'ach_calculation_master':
        currentVal = context.totalSolved;
        break;
      case 'ach_sovereign_gold':
        currentVal = Math.max(ach.progress, context.score);
        break;
      case 'ach_cyber_overclock':
        currentVal = Math.max(ach.progress, context.level);
        break;
      case 'ach_aurora_hoarder':
        currentVal = Math.max(ach.progress, context.gems);
        break;
      default:
        break;
    }

    const isComplete = currentVal >= ach.target;

    if (isComplete && !ach.unlocked) {
      const unlockedAch: Achievement = {
        ...ach,
        progress: Math.min(currentVal, ach.target),
        unlocked: true,
        unlockedAt: new Date().toLocaleTimeString(),
      };
      newlyUnlocked.push(unlockedAch);
      gemsAwarded += ach.rewardGems;
      if (ach.rewardSkinId) {
        unlockedSkinIds.push(ach.rewardSkinId);
      }
      return unlockedAch;
    }

    return {
      ...ach,
      progress: Math.min(currentVal, ach.target),
    };
  });

  return {
    updatedAchievements,
    newlyUnlocked,
    gemsAwarded,
    unlockedSkinIds,
  };
};
