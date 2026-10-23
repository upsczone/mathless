import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { BubbleSkin } from '../types/game';

interface BubbleSkinSelectorProps {
  skins: BubbleSkin[];
  activeSkinId: string;
  playerScore: number;
  playerLevel: number;
  onSelectSkin: (skinId: string) => void;
  onOpenVault: () => void;
}

export const BubbleSkinSelector: React.FC<BubbleSkinSelectorProps> = ({
  skins,
  activeSkinId,
  playerScore,
  playerLevel,
  onSelectSkin,
  onOpenVault,
}) => {
  const [hoveredSkin, setHoveredSkin] = useState<BubbleSkin | null>(null);

  // Find next locked skin to tease progress
  const nextLocked = skins.find((s) => !s.unlocked);

  return (
    <div
      id="bubble-skins-card"
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl select-none flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-xs uppercase font-black text-fuchsia-200 tracking-wider">
            Bubble Skins
          </h3>
          <button
            id="btn-open-skin-vault"
            onClick={onOpenVault}
            className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold underline decoration-cyan-400/40 underline-offset-2 flex items-center gap-1 transition-colors"
          >
            Skins Vault →
          </button>
        </div>

        {/* Skin Bubbles Row */}
        <div className="flex gap-2 flex-wrap items-center">
          {skins.map((skin) => {
            const isSelected = skin.id === activeSkinId;
            const isUnlocked = skin.unlocked;

            return (
              <button
                key={skin.id}
                id={`skin-btn-${skin.id}`}
                onClick={() => {
                  if (isUnlocked) onSelectSkin(skin.id);
                }}
                onMouseEnter={() => setHoveredSkin(skin)}
                onMouseLeave={() => setHoveredSkin(null)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-white shadow-lg ring-2 ring-white/40 scale-110 z-10'
                    : isUnlocked
                    ? 'border-2 border-white/30 hover:scale-105 hover:border-white/80 opacity-90'
                    : 'border-2 border-transparent opacity-40 hover:opacity-60 cursor-not-allowed'
                }`}
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${skin.palette.highlight}, ${skin.palette.primary}, ${skin.palette.secondary})`,
                  boxShadow: isSelected ? `0 0 16px ${skin.palette.glow}` : undefined,
                }}
                title={`${skin.name} ${!isUnlocked ? `(Locked)` : ''}`}
                aria-label={skin.name}
              >
                {isSelected && (
                  <Check size={14} className="text-white drop-shadow-md stroke-[3]" />
                )}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <Lock size={12} className="text-white/80" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tooltip / Info bar */}
      <div className="mt-2.5 pt-2 border-t border-white/10 min-h-[32px] flex items-center justify-between text-[11px]">
        {hoveredSkin ? (
          <div className="w-full">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white truncate">{hoveredSkin.name}</span>
              {!hoveredSkin.unlocked && (
                <span className="text-[10px] text-amber-300 font-mono font-semibold">
                  {hoveredSkin.requiredScore
                    ? `Req: ${hoveredSkin.requiredScore.toLocaleString()} pts`
                    : hoveredSkin.requiredLevel
                    ? `Req: LVL ${hoveredSkin.requiredLevel}`
                    : 'Locked'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/60 truncate">{hoveredSkin.description}</p>
          </div>
        ) : nextLocked ? (
          <div className="flex items-center justify-between w-full text-[10px] text-white/60">
            <span>Next Unlock:</span>
            <span className="text-fuchsia-300 font-bold">
              {nextLocked.name} ({nextLocked.requiredScore ? `${nextLocked.requiredScore.toLocaleString()} pts` : `LVL ${nextLocked.requiredLevel}`})
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-emerald-400 font-bold">
            All Bubble Skins Mastered!
          </span>
        )}
      </div>
    </div>
  );
};
