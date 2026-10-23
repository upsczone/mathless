import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Award, Zap, CheckCircle, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  score: number;
  highScore: number;
  level: number;
  solvedCount: number;
  maxCombo: number;
  xpEarned: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  level,
  solvedCount,
  maxCombo,
  xpEarned,
  onRestart,
}) => {
  const isNewHighScore = score > highScore && score > 0;

  useEffect(() => {
    if (isNewHighScore) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f59e0b', '#ec4899', '#10b981'],
      });
    }
  }, [isNewHighScore]);

  return (
    <div
      id="game-over-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        id="game-over-dialog"
        className="w-full max-w-md bg-gradient-to-b from-indigo-950/90 to-purple-950/95 border border-white/25 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden flex flex-col items-center"
      >
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
          <Trophy size={32} className={isNewHighScore ? 'text-amber-400 animate-bounce' : 'text-fuchsia-300'} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1">
          {isNewHighScore ? 'New High Score!' : 'Game Over'}
        </h2>
        <p className="text-xs text-white/60 mb-5">
          {isNewHighScore ? 'Outstanding mental math reflexes!' : 'Great run! Practice makes speed.'}
        </p>

        {/* Score Card */}
        <div className="w-full bg-black/30 border border-white/15 rounded-2xl p-4 mb-5 flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-200">
            Final Score
          </span>
          <span className="text-4xl font-black text-amber-400 font-mono tracking-tight my-1">
            {score.toLocaleString()}
          </span>
          {isNewHighScore ? (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Award size={13} /> Beats previous: {highScore.toLocaleString()} pts
            </span>
          ) : (
            <span className="text-[11px] text-white/50 font-mono">
              Best Score: {highScore.toLocaleString()} pts
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
            <span className="block text-[9px] uppercase font-bold text-white/50">Level</span>
            <span className="text-lg font-black text-white font-mono">LVL {level}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
            <span className="block text-[9px] uppercase font-bold text-white/50">Solved</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{solvedCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
            <span className="block text-[9px] uppercase font-bold text-white/50">Max Combo</span>
            <span className="text-lg font-black text-amber-400 font-mono">x{maxCombo.toFixed(1)}</span>
          </div>
        </div>

        {/* XP Bonus */}
        <div className="w-full bg-white/10 border border-white/15 rounded-xl p-2.5 mb-6 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-white/80">
            <Zap size={14} className="text-amber-400" /> Progression XP
          </span>
          <span className="text-cyan-400 font-mono">+{xpEarned} XP</span>
        </div>

        {/* Action Button */}
        <button
          id="btn-restart-game"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-black uppercase tracking-wider text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} /> Play Again
        </button>
      </div>
    </div>
  );
};
