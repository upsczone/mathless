import { BubbleSkin } from '../types/game';

export const BUBBLE_SKINS: BubbleSkin[] = [
  {
    id: 'cyan_ice',
    name: 'Frosted Glacial',
    description: 'Crisp sub-zero crystalline glass with pure cyan refraction and cool white caustic edge highlights.',
    texture: 'Semi-translucent frosted ice crystal with soft matte diffusion',
    visualFx: 'Ambient sub-zero mist aura with drifting ice sparkles upon bounce',
    unlocked: true,
    unlockCriteriaText: 'Starter Skin — Ready from your first equation',
    patternStyle: 'crystalline',
    palette: {
      primary: '#06b6d4', // cyan-500
      secondary: '#2563eb', // blue-600
      glow: 'rgba(34, 211, 238, 0.6)',
      highlight: '#cffafe',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.7)',
    },
  },
  {
    id: 'sunset_ember',
    name: 'Sunset Ember',
    description: 'Molten volcanic glass glowing with fiery tangerine-to-crimson gradients and crackling solar embers.',
    texture: 'Smooth pyrex obsidian with internal thermal convection ripples',
    visualFx: 'Radiant flame halo that ejects micro-solar flare particles on impact',
    unlocked: false,
    requiredScore: 5000,
    achievementId: 'ach_novice_dynamo',
    gemCost: 150,
    unlockCriteriaText: 'Earn the Novice Dynamo achievement (5,000+ pts) or spend 150 Star Gems',
    patternStyle: 'ember',
    palette: {
      primary: '#f97316', // orange-500
      secondary: '#e11d48', // rose-600
      glow: 'rgba(249, 115, 22, 0.65)',
      highlight: '#ffedd5',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.75)',
    },
  },
  {
    id: 'emerald_glow',
    name: 'Emerald Jadeite',
    description: 'Polished imperial jade with deep forest undertones and high-frequency bio-luminescent sheen.',
    texture: 'High-density oiled jade stone with prismatic mineral banding',
    visualFx: 'Pulsing bio-luminescent spore rings with soothing emerald light trails',
    unlocked: false,
    requiredScore: 12000,
    requiredChallenge: 'dc_accuracy',
    achievementId: 'ach_sniper',
    gemCost: 200,
    unlockCriteriaText: 'Earn the Sharpshooter achievement (10 clean streak) or spend 200 Star Gems',
    patternStyle: 'crystalline',
    palette: {
      primary: '#10b981', // emerald-500
      secondary: '#0f766e', // teal-700
      glow: 'rgba(16, 185, 129, 0.65)',
      highlight: '#d1fae5',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.75)',
    },
  },
  {
    id: 'cosmic_nebula',
    name: 'Cosmic Nebula',
    description: 'Deep ultraviolet orb enclosing distant stellar nurseries, swirling cosmic dust, and celestial starlight.',
    texture: 'Multi-layered ethereal astral glass with celestial depth parallax',
    visualFx: 'Twinkling star cluster core with lavender gravitational shockwaves',
    unlocked: false,
    requiredScore: 25000,
    requiredLevel: 8,
    achievementId: 'ach_dimensional',
    gemCost: 250,
    unlockCriteriaText: 'Earn the Dimensional Voyager achievement (Reach Level 8) or spend 250 Star Gems',
    patternStyle: 'nebula',
    palette: {
      primary: '#a855f7', // purple-500
      secondary: '#4338ca', // indigo-700
      glow: 'rgba(168, 85, 247, 0.7)',
      highlight: '#f3e8ff',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.8)',
    },
  },
  {
    id: 'void_singularity',
    name: 'Void Singularity',
    description: 'Inky spacetime gravitational abyss bordered by an ultra-bright relativistic accretion disk and dark matter tendrils.',
    texture: 'Light-bending event horizon with quantum distortion distortion',
    visualFx: 'Singularity vacuum vortex with gravitational gravitational lensing pulses',
    unlocked: false,
    achievementId: 'ach_combo_overlord',
    gemCost: 280,
    unlockCriteriaText: 'Earn the Combo Overlord achievement (4.0x multiplier) or spend 280 Star Gems',
    patternStyle: 'void_warp',
    palette: {
      primary: '#3b0764', // purple-950
      secondary: '#7e22ce', // purple-700
      glow: 'rgba(168, 85, 247, 0.85)',
      highlight: '#e9d5ff',
      text: '#fdf4ff',
      border: 'rgba(216, 180, 254, 0.85)',
    },
  },
  {
    id: 'supernova_solar',
    name: 'Supernova Solar',
    description: 'Blazing thermonuclear sun sphere with rotating coronal rim and pulsing white-hot fusion core.',
    texture: 'Incandescent plasma membrane with magnetic filament currents',
    visualFx: 'Swirling solar prominence corona with thermonuclear plasma bursts',
    unlocked: false,
    requiredChallenge: 'dc_speed',
    achievementId: 'ach_daily_trio',
    gemCost: 300,
    unlockCriteriaText: 'Earn the Daily Champion achievement (Clear 3 daily challenges) or spend 300 Star Gems',
    patternStyle: 'plasma',
    palette: {
      primary: '#eab308', // yellow-500
      secondary: '#dc2626', // red-600
      glow: 'rgba(234, 179, 8, 0.85)',
      highlight: '#fef9c3',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.9)',
    },
  },
  {
    id: 'quantum_matrix',
    name: 'Quantum Matrix',
    description: 'Sub-atomic cybernetic matrix cycling mathematical equations and hyper-dense green circuitry traces.',
    texture: 'Hexagonal cryptographic mesh with cascading phosphorescent glyphs',
    visualFx: 'Digital binary matrix particles and holographic quantum ripple rings',
    unlocked: false,
    achievementId: 'ach_calculation_master',
    gemCost: 350,
    unlockCriteriaText: 'Earn the Calculation Master achievement (Solve 50 equations) or spend 350 Star Gems',
    patternStyle: 'quantum_lattice',
    palette: {
      primary: '#22c55e', // green-500
      secondary: '#047857', // emerald-700
      glow: 'rgba(34, 197, 94, 0.8)',
      highlight: '#dcfce7',
      text: '#ffffff',
      border: 'rgba(134, 239, 172, 0.85)',
    },
  },
  {
    id: 'golden_royalty',
    name: 'Golden Royalty',
    description: 'Pristine 24K gilded metallic glass with regal sovereign caustics and radiant auric shimmer.',
    texture: 'Mirror-finished electroplated gold with etched sovereign watermark',
    visualFx: 'Sovereign crown light refraction and celebratory golden glitter trails',
    unlocked: false,
    requiredScore: 45000,
    requiredLevel: 10,
    achievementId: 'ach_sovereign_gold',
    gemCost: 400,
    unlockCriteriaText: 'Earn the Sovereign Gold achievement (45,000+ pts) or spend 400 Star Gems',
    patternStyle: 'gold_ring',
    palette: {
      primary: '#f59e0b', // amber-500
      secondary: '#b45309', // amber-700
      glow: 'rgba(245, 158, 11, 0.8)',
      highlight: '#fef3c7',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.85)',
    },
  },
  {
    id: 'cyber_prism',
    name: 'Cyber Prism',
    description: 'Hyper-chromatic holographic diffraction lattice shifting dynamically between synthwave magenta and electric cyan.',
    texture: 'Laser-etched nano-diffraction grating with circuit trace reflections',
    visualFx: 'Chroma-shifting iridescent edge glow with digital voxel fragmentation',
    unlocked: false,
    requiredScore: 75000,
    requiredLevel: 15,
    achievementId: 'ach_cyber_overclock',
    gemCost: 450,
    unlockCriteriaText: 'Earn the Cyber Overclock achievement (Reach Level 15) or spend 450 Star Gems',
    patternStyle: 'cyber_grid',
    palette: {
      primary: '#ec4899', // pink-500
      secondary: '#06b6d4', // cyan-500
      glow: 'rgba(236, 72, 153, 0.85)',
      highlight: '#fdf2f8',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.9)',
    },
  },
  {
    id: 'rainbow_aurora',
    name: 'Prismatic Aurora',
    description: 'Celestial northern lights fluid prism dispersing iridescent spectral ribbons across the cosmic night sky.',
    texture: 'Super-fluid liquid opal with iridescent refractive film dynamics',
    visualFx: 'Undulating aurora borealis light curtains with multi-chromatic sparkles',
    unlocked: false,
    achievementId: 'ach_aurora_hoarder',
    gemCost: 500,
    unlockCriteriaText: 'Earn the Star Hoarder achievement (500 Star Gems) or spend 500 Star Gems',
    patternStyle: 'aurora_shimmer',
    palette: {
      primary: '#8b5cf6', // violet-500
      secondary: '#06b6d4', // cyan-500
      glow: 'rgba(217, 70, 239, 0.85)',
      highlight: '#fdf4ff',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
