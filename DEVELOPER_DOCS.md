# Developer Documentation: Bubble Math — Physics Odyssey

## 1. Project Overview

**Bubble Math: Physics Odyssey** is a high-performance, physics-driven educational arcade game built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **HTML5 Canvas**.

The application combines rapid mental arithmetic with interactive 2D rigid-body particle physics, floating buoyant dynamics, procedural Web Audio synthesis, and an in-depth metagame featuring unlockable cosmetics ("Bubble Skins"), gameplay achievements, daily challenge operations, power-up inventory, and persistent player progression.

---

## 2. Technology Stack & Runtime

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 15+ (App Router) | Dynamic client-side mounting with zero SSR hydration mismatch (`ssr: false`) |
| **Language** | TypeScript 5.8+ | Strict type-safety across game entities, physics vectors, and achievements |
| **Styling** | Tailwind CSS v4 | Native `@import "tailwindcss";`, custom glassmorphism, responsive grid layout |
| **Rendering** | HTML5 2D Canvas API | High-refresh 60 FPS animation loop with collision detection and custom shaders |
| **Audio** | Procedural Web Audio API | Low-latency oscillator-based synthesis (`Sine`, `Triangle`) with ADSR envelopes |
| **VFX** | Canvas Confetti & Custom Particles | Velocity-based burst particles, shockwave rings, and screen shake mechanics |
| **State & Persistence**| React Hooks + `localStorage` | Atomic player profiles, stats, achievements, challenges, and user preferences |

---

## 3. Directory & File Architecture

```text
/
├── public/                     # Static assets (favicons, icons)
├── src/
│   ├── app/                    # Next.js App Router entry points
│   │   ├── layout.tsx          # Root layout, fonts (Outfit & JetBrains Mono), metadata
│   │   ├── page.tsx            # Dynamic client wrapper for App.tsx (disables SSR)
│   │   └── globals.css         # Global styles & Tailwind imports
│   ├── components/             # Reusable UI & modal views
│   │   ├── BubbleSkinSelector.tsx  # Quick skin carousel on the main game dashboard
│   │   ├── DailyChallengeCard.tsx  # Left sidebar card for daily missions & active power-ups
│   │   ├── DailyChallengeModal.tsx # Full mission briefing modal with reward claims
│   │   ├── GameOverModal.tsx       # Round summary, XP gained, score analysis, restart CTA
│   │   ├── HeaderHUD.tsx           # Real-time stats bar (timer, score, multiplier, gems, pause)
│   │   ├── HowToPlayModal.tsx      # Rules, mechanics breakdown, and scoring formulas
│   │   ├── InteractiveTutorialModal.tsx # 4-step interactive onboarding academy
│   │   ├── LeaderboardCard.tsx     # Global top scores & player handle editor
│   │   ├── PhysicsCanvas.tsx       # Core 2D physics simulation & equation bubble renderer
│   │   ├── SettingsModal.tsx       # Preferred skin selector, achievements, & visual settings
│   │   └── SkinVaultModal.tsx      # 3D interactive preview showcase & gem unlock depot
│   ├── types/
│   │   └── game.ts             # TypeScript interfaces (PlayerStats, BubbleSkin, Achievement, etc.)
│   └── utils/
│       ├── achievements.ts     # Initial achievements list and evaluation pipeline
│       ├── audio.ts            # Web Audio API procedural sound engine
│       ├── initialData.ts      # Storage persistence layer (loads/saves stats, challenges, leaderboards)
│       ├── mathGenerator.ts    # Equation generator with tiered complexity (Levels 1–10+)
│       └── skins.ts            # 10 procedural skin definitions, palettes, and unlock criteria
├── DEVELOPER_DOCS.md           # Developer summary documentation
├── metadata.json               # Application metadata and runtime permissions
├── next.config.mjs             # Next.js build configuration
├── package.json                # Project dependencies and npm scripts
├── postcss.config.mjs          # PostCSS configuration for Tailwind v4
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 4. System Architecture & Data Flow

```text
+-------------------------------------------------------------------------+
|                                App.tsx                                  |
|         (Central State Orchestrator & Game Event Coordinator)           |
+------------------------------------+------------------------------------+
                                     |
           +-------------------------+-------------------------+
           |                         |                         |
+----------v----------+    +---------v---------+    +----------v----------+
|     HeaderHUD       |    |   PhysicsCanvas   |    |    Modals System    |
| - Round countdown   |    | - 2D Canvas Loop  |    | - SettingsModal     |
| - Math equation     |    | - Buoyancy & Drag |    | - SkinVaultModal    |
| - Score, Multiplier |    | - Elastic Bounces |    | - DailyChallenge    |
| - Star Gems display |    | - Pop / Collisions|    | - TutorialModal     |
| - Settings trigger  |    | - Particle Trails |    | - GameOverModal     |
+---------------------+    +-------------------+    +---------------------+
           |                         |                         |
           +-------------------------+-------------------------+
                                     |
          +--------------------------v--------------------------+
          |                  Utilities & Engines                |
          | - mathGenerator.ts (Arithmetic tier generator)     |
          | - achievements.ts  (Progress & unlock evaluator)   |
          | - audio.ts         (Web Audio procedural SFX)       |
          | - initialData.ts   (localStorage persistence)       |
          | - skins.ts         (Procedural cosmetic definition) |
          +-----------------------------------------------------+
```

### Game Loop Execution Flow:
1. **Equation Generation**: `mathGenerator.ts` generates a target problem according to player `level` (e.g., `12 × 4 = ?`).
2. **Physics Bubble Population**: `PhysicsCanvas.tsx` spawns 1 target bubble with the correct answer and 3–5 distractor bubbles with realistic miscalculations.
3. **Collision & Interaction**:
   - Player clicks/taps on a bubble.
   - If **Correct**: Combo increases (`1.0x` -> `5.0x`), bonus time added (+3.5s), score calculated with multiplier, power-ups triggered, achievements evaluated, and new problem loaded.
   - If **Incorrect**: Shield absorbs hit if active; otherwise combo resets to `1.0x`, time penalty applied (-2s), and clean streak resets.
4. **Achievement Pipeline**: `evaluateAchievements()` checks current game context against all unearned milestones, triggering gem payouts, skin unlocks, and toast banners.
5. **Cosmetic Rendering**: `PhysicsCanvas.tsx` draws each bubble according to the player's active `BubbleSkin` palette, border style, specular highlight, and procedural pattern shader.

---

## 5. Core Subsystems

### 5.1. 2D Physics Engine (`PhysicsCanvas.tsx`)
- **Buoyancy & Gravity**: Soft upward vertical drift with sinus-based lateral currents simulate underwater bubbles.
- **Elastic Collisions**: Spherical distance calculation with mass-proportional momentum conservation and position separation prevents bubble overlap.
- **Dynamic Pattern Shaders**:
  - `standard`: Gradient shine with crescent specular reflection.
  - `plasma_rings`: Concentric rotating harmonic orbital rings.
  - `ember`: Fiery arc highlights with warm particle embers.
  - `nebula`: Celestial micro-stars mapped with offset orbits.
  - `void_warp`: Gravitational distortion rings with dark twilight aura.
  - `quantum_lattice`: Geometric quantum field lines.
  - `aurora_shimmer`: Oscillating elliptical wave field.
- **Performance Optimization**: Supports configurable `particleDensity` (`low`, `medium`, `high`) and optional `screenShake` suppression for low-spec hardware.

### 5.2. Procedural Audio Engine (`audio.ts`)
- Implemented entirely with native **Web Audio API** (`AudioContext`).
- Zero network latency and zero audio file downloads.
- Custom synthesizer routines:
  - `playPop(pitchRatio)`: Decaying sine burst mimicking an underwater membrane rupture.
  - `playCorrect(combo)`: Ascending arpeggio tuned to musical harmonic intervals.
  - `playWrong()`: Damped square/saw wave dissonant thud.
  - `playLevelUp()`: Multi-stage harmonic fanfare.
  - `playPowerUp()`: Sweeping resonant bandpass filter rise.

### 5.3. Cosmetic Skins System (`skins.ts` & `SettingsModal.tsx`)
- Every skin contains:
  - Unique ID, display name, and lore description.
  - Palette mapping (`primary`, `secondary`, `glow`, `border`, `text`, `highlight`, `particles`).
  - Procedural pattern identifier.
  - Acquisition requirement: milestone score, player level, achievement link, or Star Gem purchase cost.
- **Preferred Skin Selector**:
  - Players can designate their preferred skin via the **Settings Modal** or **Skin Vault**.
  - Includes a real-time 3D wobble preview rendered via `requestAnimationFrame`.

### 5.4. Progression & Achievements Engine (`achievements.ts`)
- Achievements evaluate multiple vectors:
  - `first_solve`: Solve your first equation.
  - `novice_dynamo`: Reach 1,000 points.
  - `combo_maestro`: Reach a 3.0x multiplier.
  - `clean_sheet`: Solve 5 consecutive problems without a mistake.
  - `quantum_scholar`: Reach Level 5.
  - `daily_devotee`: Complete 3 daily challenges.
  - `star_hoarder`: Accumulate 500 Star Gems.
- Rewards include Star Gems and exclusive Bubble Skins (e.g. *Sunset Ember* and *Matrix Emerald*).

---

## 6. Data Storage & Schema (`localStorage`)

| Storage Key | Type | Description |
|---|---|---|
| `bubble_math_player_stats` | `PlayerStats` | High score, level, gems, unlocked skin IDs, active skin ID, power-up inventory, settings |
| `bubble_math_achievements_v1` | `Achievement[]` | Completion status, unlocked timestamp, and progress values |
| `bubble_math_daily_challenges_v1` | `DailyChallenge[]` | Daily objectives, targets, current progress, and claim status |
| `bubble_math_leaderboard_v1` | `LeaderboardEntry[]` | Ranked scores, timestamps, and usernames |

---

## 7. Developer Quickstart & Scripts

### Installation
```bash
# Install dependencies
npm install
```

### Development Server
```bash
# Launch Next.js local server on port 3000
npm run dev
```

### Production Build & Linting
```bash
# Run TypeScript compilation and static verification
npm run lint

# Production Next.js build
npm run build

# Start production server
npm run start
```

---

## 8. Extension Guide for Contributors

### Adding a New Bubble Skin:
1. Open `src/types/game.ts` and add any new pattern identifier to `BubbleSkin['pattern']`.
2. Open `src/utils/skins.ts` and append a new `BubbleSkin` object to `BUBBLE_SKINS` with hex colors and unlock constraints.
3. Update `drawPatternShader` in `src/components/PhysicsCanvas.tsx` and `src/components/SettingsModal.tsx` to handle the new procedural pattern.

### Adding a New Math Operator or Tier:
1. Open `src/utils/mathGenerator.ts`.
2. In `generateMathProblem(level: number)`, define new operator pools (e.g., modular arithmetic, fractions, or algebraic exponents).
3. Ensure plausible distractor generator `generateDistractors()` includes common mental errors for the new operator.

### Adding a New Power-Up:
1. Add the power-up key to `PowerUpType` in `src/types/game.ts`.
2. Configure spawn chance inside `PhysicsCanvas.tsx`.
3. Add inventory tracking and activation callback in `App.tsx` and `DailyChallengeCard.tsx`.
