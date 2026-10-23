import React from 'react';
import { X, Calendar, Trophy, Gift, Zap, CheckCircle2, Clock, Gem, ArrowRight, ShieldCheck } from 'lucide-react';
import { DailyChallenge, PowerUpType } from '../types/game';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: DailyChallenge[];
  onClaimReward: (id: string) => void;
  playerGems: number;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  challenges,
  onClaimReward,
  playerGems,
}) => {
  if (!isOpen) return null;

  const allCompleted = challenges.every((c) => c.completed);
  const allClaimed = challenges.every((c) => c.claimed);

  const getCategoryBadge = (category: DailyChallenge['category']) => {
    switch (category) {
      case 'accuracy':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Accuracy & Precision
          </span>
        );
      case 'powerup':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Power-Up Mastery
          </span>
        );
      case 'speed':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Speed Blitz
          </span>
        );
    }
  };

  return (
    <div
      id="daily-challenge-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-purple-950/95 border border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Calendar size={20} className="text-amber-300" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                Daily Operations
              </h2>
              <p className="text-xs text-white/60">
                Fresh daily challenges reset in <span className="font-mono text-cyan-300">18h 17m</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
              <Gem size={14} />
              <span>{playerGems}</span>
            </div>

            <button
              id="btn-close-daily-modal"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Challenge Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {challenges.map((ch, idx) => {
            const isDone = ch.completed;
            const isClaimed = ch.claimed;
            const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));

            return (
              <div
                key={ch.id}
                id={`daily-challenge-item-${ch.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isClaimed
                    ? 'bg-white/5 border-white/10 opacity-75'
                    : isDone
                    ? 'bg-amber-400/10 border-amber-400/40 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white">{ch.title}</h4>
                        {getCategoryBadge(ch.category)}
                      </div>
                      <p className="text-xs text-white/75 mt-0.5 leading-snug">
                        {ch.description}
                      </p>
                    </div>
                  </div>

                  {/* Status / Claim Button */}
                  {isDone && !isClaimed ? (
                    <button
                      id={`btn-claim-${ch.id}`}
                      onClick={() => onClaimReward(ch.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black uppercase text-xs tracking-wider shadow-md active:scale-95 animate-pulse flex items-center gap-1.5 shrink-0"
                    >
                      <Gift size={14} /> Claim
                    </button>
                  ) : isClaimed ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                      <CheckCircle2 size={14} /> Claimed
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-white/50 px-2 py-1 shrink-0">
                      {ch.current}/{ch.target}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Reward Badges */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-white/10 font-medium text-white/80">
                  <span className="text-white/40 uppercase text-[10px] font-bold">Rewards:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Gem size={12} /> +{ch.rewardGems} Gems
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono font-bold">
                    +{ch.rewardXp} XP
                  </span>
                  {ch.rewardSkinId && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold flex items-center gap-1">
                      <Trophy size={12} /> Solar Skin Unlock
                    </span>
                  )}
                  {ch.rewardBoost && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1">
                      <Zap size={12} /> {ch.rewardBoost}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Daily Master Completion Bonus */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs text-purple-200 uppercase tracking-wider">
                  Grand Master Bonus
                </h4>
                <p className="text-[11px] text-white/70">
                  Complete all 3 challenges to unlock the exclusive <strong className="text-amber-300">Supernova Solar</strong> skin!
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-xl">
              {challenges.filter((c) => c.completed).length}/3 Done
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
