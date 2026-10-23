import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Lock, Check, Gem, ShieldAlert, Award } from 'lucide-react';
import { BubbleSkin } from '../types/game';

interface SkinVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  skins: BubbleSkin[];
  activeSkinId: string;
  playerScore: number;
  playerLevel: number;
  playerGems: number;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkinWithGems: (skinId: string, cost: number) => void;
}

export const SkinVaultModal: React.FC<SkinVaultModalProps> = ({
  isOpen,
  onClose,
  skins,
  activeSkinId,
  playerScore,
  playerLevel,
  playerGems,
  onSelectSkin,
  onUnlockSkinWithGems,
}) => {
  const [selectedSkinId, setSelectedSkinId] = useState<string>(activeSkinId);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const selectedSkin = skins.find((s) => s.id === selectedSkinId) || skins[0];

  // Sync selected skin when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedSkinId(activeSkinId);
    }
  }, [isOpen, activeSkinId]);

  // Live 3D animated canvas preview for the selected skin
  useEffect(() => {
    if (!isOpen || !selectedSkin) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.035;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = 58;

      // Soft wobble deformation
      const wobble = Math.sin(phase) * 3.5;
      const scaleX = 1 + wobble * 0.03;
      const scaleY = 1 - wobble * 0.03;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleX, scaleY);

      // Radial glow
      ctx.shadowColor = selectedSkin.palette.glow;
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 4;

      // 3D Spherical gradient
      const grad = ctx.createRadialGradient(
        -r * 0.35,
        -r * 0.35,
        r * 0.08,
        0,
        0,
        r
      );
      grad.addColorStop(0, selectedSkin.palette.highlight);
      grad.addColorStop(0.35, selectedSkin.palette.primary);
      grad.addColorStop(0.85, selectedSkin.palette.secondary);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Custom Surface Texture & Style
      const style = selectedSkin.patternStyle;
      if (style === 'plasma') {
        // Corona prominences
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
        ctx.lineWidth = 2.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const spikeLen = r + 6 + Math.sin(phase * 1.5 + a * 3) * 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
          ctx.lineTo(Math.cos(a) * spikeLen, Math.sin(a) * spikeLen);
          ctx.stroke();
        }
      } else if (style === 'gold_ring') {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      } else if (style === 'cyber_grid') {
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.65, 0);
        ctx.lineTo(r * 0.65, 0);
        ctx.moveTo(0, -r * 0.65);
        ctx.lineTo(0, r * 0.65);
        ctx.stroke();
      } else if (style === 'ember') {
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, r * 0.15, r * 0.55, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      } else if (style === 'nebula') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, r * 0.2, 2, 0, Math.PI * 2);
        ctx.arc(r * 0.28, -r * 0.25, 2.5, 0, Math.PI * 2);
        ctx.arc(r * 0.35, r * 0.3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === 'void_warp') {
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      } else if (style === 'quantum_lattice') {
        ctx.strokeStyle = 'rgba(134, 239, 172, 0.7)';
        ctx.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.6, i * 12);
          ctx.lineTo(r * 0.6, i * 12);
          ctx.stroke();
        }
      } else if (style === 'aurora_shimmer') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.7, r * 0.35, phase * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer border rim
      ctx.shadowBlur = 0;
      ctx.strokeStyle = selectedSkin.palette.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Specular highlight crescent
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.35, r * 0.45, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      // Demo equation inside bubble
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 32px "Outfit", "JetBrains Mono", sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText('42', 1, 2);
      ctx.fillStyle = selectedSkin.palette.text;
      ctx.fillText('42', 0, 0);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedSkin]);

  if (!isOpen) return null;

  const filteredSkins = skins.filter((s) => {
    if (filter === 'unlocked') return s.unlocked;
    if (filter === 'locked') return !s.unlocked;
    return true;
  });

  const canAffordGems = Boolean(
    selectedSkin.gemCost && playerGems >= selectedSkin.gemCost && !selectedSkin.unlocked
  );

  return (
    <div
      id="skin-vault-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-purple-950/95 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-fuchsia-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles size={20} className="text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                Bubble Skins Vault
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-fuchsia-200 font-mono">
                  {skins.filter((s) => s.unlocked).length}/{skins.length} Unlocked
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Unlock distinct physical textures, particle trails, and caustics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player Gem Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black shadow-inner">
              <Gem size={14} className="text-amber-400" />
              <span>{playerGems} Star Gems</span>
            </div>

            <button
              id="btn-close-skin-vault"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Grid + Right Detailed Inspector */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* Left Column: Skin Selection List & Filter */}
          <div className="w-full md:w-1/2 p-5 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {(['all', 'unlocked', 'locked'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === tab
                      ? 'bg-cyan-400 text-black shadow-md'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Skins Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
              {filteredSkins.map((skin) => {
                const isEquipped = skin.id === activeSkinId;
                const isCurrentInspect = skin.id === selectedSkinId;
                const isUnlocked = skin.unlocked;

                return (
                  <button
                    key={skin.id}
                    id={`vault-skin-item-${skin.id}`}
                    onClick={() => setSelectedSkinId(skin.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-between gap-2 relative transition-all duration-200 group ${
                      isCurrentInspect
                        ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <span className="absolute top-2 left-2 text-[9px] font-black uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded-md shadow-sm">
                        Equipped
                      </span>
                    )}

                    {/* Bubble Orb Thumbnail */}
                    <div
                      className="w-14 h-14 rounded-full relative flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${skin.palette.highlight}, ${skin.palette.primary}, ${skin.palette.secondary})`,
                        boxShadow: `0 0 16px ${skin.palette.glow}`,
                      }}
                    >
                      {!isUnlocked ? (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Lock size={16} className="text-white/80" />
                        </div>
                      ) : isEquipped ? (
                        <Check size={18} className="text-white drop-shadow stroke-[3]" />
                      ) : null}
                    </div>

                    <div className="w-full text-center">
                      <span className="block text-xs font-black text-white truncate">
                        {skin.name}
                      </span>
                      <span className="block text-[10px] text-white/50 truncate font-mono">
                        {isUnlocked ? 'Unlocked' : skin.requiredScore ? `${skin.requiredScore.toLocaleString()} pts` : skin.requiredLevel ? `LVL ${skin.requiredLevel}` : 'Challenge'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Skin Inspector & 3D Interactive Preview */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-black/20">
            <div>
              {/* Preview Arena */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-b from-black/40 to-black/60 border border-white/15 relative flex items-center justify-center overflow-hidden shadow-inner mb-4">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <canvas
                  ref={previewCanvasRef}
                  width={200}
                  height={170}
                  className="relative z-10"
                />

                <div className="absolute top-3 right-3 text-[10px] uppercase font-bold text-white/50 tracking-wider bg-black/40 px-2 py-1 rounded-md border border-white/10">
                  Live Physics Render
                </div>
              </div>

              {/* Skin Title & Description */}
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black text-white">{selectedSkin.name}</h3>
                  {selectedSkin.unlocked ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      <Check size={13} /> Unlocked
                    </span>
                  ) : (
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      <Lock size={13} /> Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {selectedSkin.description}
                </p>
              </div>

              {/* Detailed Breakdown: Texture & Visual FX */}
              <div className="space-y-2.5 bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-300 block mb-0.5">
                    Surface Texture
                  </span>
                  <p className="text-white/80 font-mono text-[11px] leading-snug">
                    {selectedSkin.texture}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-fuchsia-300 block mb-0.5">
                    Particle & Aura Effects
                  </span>
                  <p className="text-white/80 font-mono text-[11px] leading-snug">
                    {selectedSkin.visualFx}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 block mb-0.5">
                    Unlock Criteria
                  </span>
                  <p className="text-white/90 font-medium text-[11px] leading-snug">
                    {selectedSkin.unlockCriteriaText}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar (Equip or Unlock) */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              {selectedSkin.unlocked ? (
                <button
                  id="btn-equip-vault-skin"
                  onClick={() => onSelectSkin(selectedSkin.id)}
                  disabled={selectedSkin.id === activeSkinId}
                  className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                    selectedSkin.id === activeSkinId
                      ? 'bg-white/10 text-white/40 cursor-default'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black active:scale-95'
                  }`}
                >
                  {selectedSkin.id === activeSkinId ? (
                    <>
                      <Check size={16} /> Currently Equipped
                    </>
                  ) : (
                    'Equip Skin'
                  )}
                </button>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  {selectedSkin.gemCost && (
                    <button
                      id="btn-buy-skin-gems"
                      onClick={() => onUnlockSkinWithGems(selectedSkin.id, selectedSkin.gemCost!)}
                      disabled={!canAffordGems}
                      className={`w-full py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                        canAffordGems
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black active:scale-95'
                          : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      <Gem size={15} /> Unlock for {selectedSkin.gemCost} Star Gems
                    </button>
                  )}
                  <div className="text-center text-[10px] text-white/50">
                    Or fulfill unlock milestones via levels and high scores!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
