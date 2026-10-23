import React from 'react';
import { Snowflake, Magnet, Bomb, Zap, Shield, CheckCircle2, Gift } from 'lucide-react';
import { DailyChallenge, PowerUpType } from '../types/game';
import { POWER_UP_CONFIG } from '../utils/initialData';

interface DailyChallengeCardProps {
  challenges: DailyChallenge[];
  activePowerUps: Record<PowerUpType, number>;
  isSlowMoActive: boolean;
  isMagnetActive: boolean;
  isDoubleScoreActive: boolean;
  shieldActive: boolean;
  onActivatePowerUp: (type: PowerUpType) => void;
  onClaimReward: (id: string) => void;
  onOpenDailyModal: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenges,
  activePowerUps,
  isSlowMoActive,
  isMagnetActive,
  isDoubleScoreActive,
  shieldActive,
  onActivatePowerUp,
  onClaimReward,
  onOpenDailyModal,
}) => {
  // Focus on the primary active challenge
  const activeChallenge = challenges.find((c) => !c.claimed) || challenges[0];

  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'freeze':
        return <Snowflake size={14} />;
      case 'magnet':
        return <Magnet size={14} />;
      case 'bomb':
        return <Bomb size={14} />;
      case 'multiplier':
        return <Zap size={14} />;
      case 'shield':
        return <Shield size={14} />;
    }
  };

  const isPowerUpCurrentlyBuffed = (type: PowerUpType) => {
    if (type === 'freeze') return isSlowMoActive;
    if (type === 'magnet') return isMagnetActive;
    if (type === 'multiplier') return isDoubleScoreActive;
    if (type === 'shield') return shieldActive;
    return false;
  };

  return (
    <div
      id="daily-challenge-card"
      className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex flex-col shadow-xl select-none"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs sm:text-sm uppercase font-black text-fuchsia-200 flex items-center gap-2 tracking-wider">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
          Daily Ops
        </h3>
        <button
          id="btn-view-all-challenges"
          onClick={onOpenDailyModal}
          className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold underline decoration-cyan-400/40 underline-offset-2 transition-colors"
        >
          View All 3 →
        </button>
      </div>

      {/* Challenge Progress Box */}
      {activeChallenge && (
        <div className="bg-black/25 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-xs font-bold text-white leading-snug">
              {activeChallenge.title}
            </h4>
            {activeChallenge.completed && !activeChallenge.claimed ? (
              <button
                id="btn-claim-reward"
                onClick={() => onClaimReward(activeChallenge.id)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black px-2 py-0.5 rounded-md hover:scale-105 active:scale-95 transition-all shadow-md animate-bounce"
              >
                <Gift size={11} /> Claim
              </button>
            ) : activeChallenge.claimed ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 size={11} /> Done
              </span>
            ) : null}
          </div>

          <p className="text-[11px] text-white/80 leading-relaxed">
            {activeChallenge.description}
          </p>

          <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (activeChallenge.current / activeChallenge.target) * 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-white/70 mt-0.5">
            <span>
              {activeChallenge.current}/{activeChallenge.target}
            </span>
            <span className="text-amber-300 font-bold">
              +{activeChallenge.rewardGems || 150} Gems
            </span>
          </div>
        </div>
      )}

      {/* Active Power-ups Section */}
      <div className="mt-auto pt-3 border-t border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
            Active Power-ups
          </span>
          <span className="text-[9px] text-white/40 font-mono">Press [1-4]</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['freeze', 'magnet', 'bomb', 'multiplier'] as PowerUpType[]).map((type) => {
            const config = POWER_UP_CONFIG[type];
            const count = activePowerUps[type] || 0;
            const isBuffed = isPowerUpCurrentlyBuffed(type);
            const canUse = count > 0 && !isBuffed;

            return (
              <button
                key={type}
                id={`powerup-btn-${type}`}
                onClick={() => onActivatePowerUp(type)}
                disabled={!canUse}
                className={`p-2 rounded-xl text-xs font-black flex items-center justify-between transition-all duration-200 border ${
                  isBuffed
                    ? 'bg-cyan-400 text-black border-white/40 shadow-lg shadow-cyan-400/30 scale-102 ring-2 ring-cyan-300'
                    : count > 0
                    ? `${config.bgClass} border-white/20 hover:scale-102 active:scale-98 shadow-md`
                    : 'bg-white/5 text-white/40 border-white/5 opacity-40 cursor-not-allowed'
                }`}
                title={`${config.name} (${count} available) - ${config.description}`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {getPowerUpIcon(type)}
                  <span className="text-[11px] truncate tracking-tight">{config.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-black/20">
                  {isBuffed ? 'ACTIVE' : `×${count}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
