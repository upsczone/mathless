export type GameStatus = 'idle' | 'playing' | 'paused' | 'game_over' | 'level_complete';

export type PowerUpType = 'freeze' | 'magnet' | 'bomb' | 'multiplier' | 'shield';

export interface MathProblem {
  id: string;
  equation: string;
  targetAnswer: number;
  options: number[];
  operation: '+' | '-' | '×' | '÷' | 'mixed';
  hint?: string;
}

export interface BubbleEntity {
  id: string;
  value: number;
  isCorrect: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  mass: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleMagnitude: number;
  isPopping: boolean;
  popProgress: number;
  isSpecialPowerUp?: boolean;
  powerUpType?: PowerUpType;
  opacity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'star' | 'number';
  text?: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

export interface BubbleSkin {
  id: string;
  name: string;
  description: string;
  texture: string;
  visualFx: string;
  unlocked: boolean;
  requiredScore?: number;
  requiredLevel?: number;
  requiredChallenge?: string;
  achievementId?: string;
  gemCost?: number;
  unlockCriteriaText: string;
  patternStyle?: 'crystalline' | 'plasma' | 'nebula' | 'gold_ring' | 'cyber_grid' | 'ember' | 'void_warp' | 'quantum_lattice' | 'aurora_shimmer' | 'default';
  palette: {
    primary: string;
    secondary: string;
    glow: string;
    highlight: string;
    text: string;
    border: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'score' | 'level' | 'accuracy' | 'combo' | 'gems' | 'equations' | 'challenges';
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardGems: number;
  rewardSkinId?: string;
  rewardSkinName?: string;
  icon: string;
}

export interface GameSettings {
  particleDensity: 'high' | 'medium' | 'low';
  sfxVolume: number;
  screenShake: boolean;
  showHints: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  category: 'accuracy' | 'powerup' | 'speed';
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardGems: number;
  rewardSkinId?: string;
  rewardBoost?: string;
  rewardPowerUp?: PowerUpType;
  completed: boolean;
  claimed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  level: number;
  avatar: string;
  isCurrentPlayer?: boolean;
  date: string;
}

export interface PlayerStats {
  username: string;
  highScore: number;
  highestLevel: number;
  totalGames: number;
  totalSolved: number;
  highestCombo: number;
  xp: number;
  gems: number;
  tutorialCompleted: boolean;
  activeSkinId: string;
  unlockedSkinIds: string[];
  powerUpInventory: Record<PowerUpType, number>;
  activeBoosterExpiry?: number;
  achievements?: Achievement[];
  settings?: GameSettings;
}
