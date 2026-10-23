import React from 'react';
import { Volume2, VolumeX, Pause, Play, HelpCircle, GraduationCap, Gem, Settings as SettingsIcon } from 'lucide-react';
import { MathProblem } from '../types/game';

interface HeaderHUDProps {
  level: number;
  score: number;
  gems: number;
  multiplier: number;
  timeLeft: number;
  maxTime: number;
  problem: MathProblem;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  onOpenTutorial: () => void;
  onOpenSkinVault: () => void;
  onOpenSettings: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  level,
  score,
  gems,
  multiplier,
  timeLeft,
  maxTime,
  problem,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onOpenHelp,
  onOpenTutorial,
  onOpenSkinVault,
  onOpenSettings,
}) => {
  const isUrgent = timeLeft <= 5;
  const timePercentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  return (
    <header
      id="game-header-hud"
      className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-4 lg:mb-6 shadow-2xl select-none"
    >
      {/* Left: Level, Score, and Star Gems */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-fit">
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-fuchsia-200 font-bold">
            Current Level
          </span>
          <span className="text-2xl sm:text-3xl font-black italic tracking-tight text-white drop-shadow-sm">
            LVL {level}
          </span>
        </div>
        <div className="h-10 w-[1px] bg-white/20" />
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-fuchsia-200 font-bold">
            Score
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight drop-shadow-sm">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="h-10 w-[1px] bg-white/20 hidden sm:block" />
        <button
          id="hud-gems-display"
          onClick={onOpenSkinVault}
          className="hidden sm:flex flex-col text-left hover:scale-105 active:scale-95 transition-transform"
          title="Click to browse Bubble Skins Vault"
        >
          <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1">
            <Gem size={10} /> Star Gems
          </span>
          <span className="text-xl font-black text-amber-300 font-mono tracking-tight">
            {gems}
          </span>
        </button>
      </div>

      {/* Center: Math Question */}
      <div
        id="hud-question-box"
        className="order-3 lg:order-2 w-full lg:w-auto bg-white/20 px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl border border-white/30 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
          Solve Fast!
        </span>
        <span className="text-2xl sm:text-4xl font-mono font-black tracking-tighter text-white drop-shadow-md">
          {problem.equation}
        </span>
        {problem.hint && (
          <span className="text-[10px] text-fuchsia-200/90 font-medium mt-0.5 max-w-xs truncate">
            Hint: {problem.hint}
          </span>
        )}
      </div>

      {/* Right: Multiplier, Timer, Controls */}
      <div className="order-2 lg:order-3 flex items-center gap-3 sm:gap-4 min-w-fit">
        <div className="text-right">
          <span className="block text-[10px] sm:text-xs uppercase font-bold text-fuchsia-200">
            Multiplier
          </span>
          <span
            id="hud-multiplier"
            className="text-xl sm:text-2xl font-black text-cyan-400 underline decoration-cyan-400/50 underline-offset-4"
          >
            x{multiplier.toFixed(1)}
          </span>
        </div>

        {/* Circular Timer Display */}
        <div
          id="hud-timer-circle"
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 flex items-center justify-center transition-colors duration-300 relative ${
            isUrgent
              ? 'border-rose-500 bg-rose-500/25 animate-pulse text-rose-200'
              : 'border-amber-400 bg-amber-400/20 text-white'
          }`}
          title={`${timeLeft}s remaining`}
        >
          <span className="text-lg sm:text-xl font-black font-mono">
            {Math.ceil(timeLeft)}s
          </span>
        </div>

        {/* Utility Buttons: Tutorial, Sound, Pause, Help */}
        <div className="flex items-center gap-1.5 ml-1 border-l border-white/15 pl-3">
          <button
            id="hud-btn-tutorial"
            onClick={onOpenTutorial}
            className="h-9 px-2.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 flex items-center gap-1.5 text-cyan-300 hover:text-white transition-all text-xs font-bold"
            title="Interactive Academy Tutorial"
            aria-label="Tutorial"
          >
            <GraduationCap size={16} />
            <span className="hidden md:inline text-[11px] uppercase tracking-wider font-extrabold">Academy</span>
          </button>
          <button
            id="hud-btn-mute"
            onClick={onToggleMute}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            id="hud-btn-pause"
            onClick={onTogglePause}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            id="hud-btn-settings"
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/90 hover:text-cyan-300 transition-all"
            title="Settings & Bubble Skins"
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </button>
          <button
            id="hud-btn-help"
            onClick={onOpenHelp}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all"
            title="How to Play & Rules"
            aria-label="How to play"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
