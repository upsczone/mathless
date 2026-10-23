import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Sparkles,
  Lock,
  Check,
  Gem,
  Award,
  Volume2,
  VolumeX,
  Palette,
  Sliders,
  Flame,
  Target,
  Compass,
  Zap,
  Cpu,
  Crown,
  Layers,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Achievement, BubbleSkin, GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skins: BubbleSkin[];
  activeSkinId: string;
  playerGems: number;
  playerScore: number;
  playerLevel: number;
  achievements: Achievement[];
  settings: GameSettings;
  isMuted: boolean;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkinWithGems: (skinId: string, cost: number) => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onToggleMute: () => void;
  onOpenVault: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  skins,
  activeSkinId,
  playerGems,
  playerScore,
  playerLevel,
  achievements,
  settings,
  isMuted,
  onSelectSkin,
  onUnlockSkinWithGems,
  onUpdateSettings,
  onToggleMute,
  onOpenVault,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'achievements' | 'preferences'>('skins');
  const [inspectSkinId, setInspectSkinId] = useState<string>(activeSkinId);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const inspectedSkin = skins.find((s) => s.id === inspectSkinId) || skins[0];
  const activeSkin = skins.find((s) => s.id === activeSkinId) || skins[0];

  // Sync inspected skin with active skin upon opening
  useEffect(() => {
    if (isOpen) {
      setInspectSkinId(activeSkinId);
      setConfirmReset(false);
    }
  }, [isOpen, activeSkinId]);

  // Live 3D animated canvas preview for the inspected skin in settings
  useEffect(() => {
    if (!isOpen || activeTab !== 'skins' || !inspectedSkin) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = 50;

      // Soft wobble deformation
      const wobble = Math.sin(phase) * 3;
      const scaleX = 1 + wobble * 0.03;
      const scaleY = 1 - wobble * 0.03;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleX, scaleY);

      // Radial glow
      ctx.shadowColor = inspectedSkin.palette.glow;
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 3;

      // 3D Spherical gradient
      const grad = ctx.createRadialGradient(
        -r * 0.35,
        -r * 0.35,
        r * 0.08,
        0,
        0,
        r
      );
      grad.addColorStop(0, inspectedSkin.palette.highlight);
      grad.addColorStop(0.35, inspectedSkin.palette.primary);
      grad.addColorStop(0.85, inspectedSkin.palette.secondary);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Custom Surface Texture & Style
      const style = inspectedSkin.patternStyle;
      if (style === 'plasma') {
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const spikeLen = r + 5 + Math.sin(phase * 1.5 + a * 3) * 5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
          ctx.lineTo(Math.cos(a) * spikeLen, Math.sin(a) * spikeLen);
          ctx.stroke();
        }
      } else if (style === 'gold_ring') {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
        ctx.stroke();
      } else if (style === 'cyber_grid') {
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.65, 0);
        ctx.lineTo(r * 0.65, 0);
        ctx.moveTo(0, -r * 0.65);
        ctx.lineTo(0, r * 0.65);
        ctx.stroke();
      } else if (style === 'ember') {
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, r * 0.15, r * 0.55, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      } else if (style === 'nebula') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
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

      // Outer rim
      ctx.shadowBlur = 0;
      ctx.strokeStyle = inspectedSkin.palette.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Specular highlight crescent
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.35, r * 0.45, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      // Equation inside bubble
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 28px "Outfit", "JetBrains Mono", sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText('99', 1, 2);
      ctx.fillStyle = inspectedSkin.palette.text;
      ctx.fillText('99', 0, 0);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab, inspectedSkin]);

  if (!isOpen) return null;

  const unlockedCount = skins.filter((s) => s.unlocked).length;
  const isInspectedPreferred = inspectedSkin.id === activeSkinId;
  const canAffordInspected = Boolean(
    inspectedSkin.gemCost && playerGems >= inspectedSkin.gemCost && !inspectedSkin.unlocked
  );

  // Helper icon for achievements
  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame size={16} className="text-orange-400" />;
      case 'Target':
        return <Target size={16} className="text-emerald-400" />;
      case 'Compass':
        return <Compass size={16} className="text-purple-400" />;
      case 'Zap':
        return <Zap size={16} className="text-yellow-400" />;
      case 'Cpu':
        return <Cpu size={16} className="text-cyan-400" />;
      case 'Crown':
        return <Crown size={16} className="text-amber-400" />;
      case 'Layers':
        return <Layers size={16} className="text-pink-400" />;
      case 'Gem':
        return <Gem size={16} className="text-violet-400" />;
      default:
        return <Sparkles size={16} className="text-cyan-300" />;
    }
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      <div className="bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-purple-950/95 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <SettingsIcon size={20} className="text-cyan-300 animate-spin-slow" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                Game Settings & Skins
              </h2>
              <p className="text-xs text-white/60">
                Choose preferred bubble skin, track achievements, and configure game preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Star Gem Currency Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black shadow-inner">
              <Gem size={14} className="text-amber-400" />
              <span id="settings-gem-balance">{playerGems} Star Gems</span>
            </div>

            <button
              id="btn-close-settings"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 pt-3 border-b border-white/10 bg-black/20 gap-2">
          <button
            id="tab-btn-skins"
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border-t border-x ${
              activeTab === 'skins'
                ? 'bg-white/10 text-cyan-300 border-cyan-400/40 shadow-sm'
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={15} />
            Preferred Skin ({unlockedCount}/{skins.length})
          </button>

          <button
            id="tab-btn-achievements"
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border-t border-x ${
              activeTab === 'achievements'
                ? 'bg-white/10 text-cyan-300 border-cyan-400/40 shadow-sm'
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Award size={15} />
            Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
          </button>

          <button
            id="tab-btn-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border-t border-x ${
              activeTab === 'preferences'
                ? 'bg-white/10 text-cyan-300 border-cyan-400/40 shadow-sm'
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders size={15} />
            Preferences
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {/* TAB 1: PREFERRED BUBBLE SKIN */}
          {activeTab === 'skins' && (
            <div id="settings-skins-view" className="flex flex-col md:flex-row gap-6 h-full">
              {/* Left Column: All Available Skins Grid */}
              <div className="w-full md:w-7/12 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                      Select Your Preferred Skin
                    </h3>
                    <p className="text-[11px] text-white/60">
                      Earn skins through achievements or unlock directly with Star Gems.
                    </p>
                  </div>

                  <button
                    id="btn-settings-open-vault"
                    onClick={onOpenVault}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline decoration-cyan-400/40 underline-offset-2 flex items-center gap-1"
                  >
                    Open Vault Details →
                  </button>
                </div>

                {/* Skins Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {skins.map((skin) => {
                    const isPreferred = skin.id === activeSkinId;
                    const isInspected = skin.id === inspectSkinId;
                    const isUnlocked = skin.unlocked;

                    return (
                      <button
                        key={skin.id}
                        id={`settings-skin-card-${skin.id}`}
                        onClick={() => {
                          setInspectSkinId(skin.id);
                        }}
                        className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-between gap-2.5 relative transition-all duration-200 ${
                          isInspected
                            ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_18px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {/* Preferred Badge */}
                        {isPreferred && (
                          <span className="absolute top-2 left-2 text-[8px] font-black uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded shadow-sm">
                            Preferred
                          </span>
                        )}

                        {/* Thumbnail Bubble */}
                        <div
                          className="w-14 h-14 rounded-full relative flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${skin.palette.highlight}, ${skin.palette.primary}, ${skin.palette.secondary})`,
                            boxShadow: `0 0 14px ${skin.palette.glow}`,
                          }}
                        >
                          {!isUnlocked ? (
                            <div className="absolute inset-0 bg-black/55 rounded-full flex items-center justify-center">
                              <Lock size={15} className="text-white/80" />
                            </div>
                          ) : isPreferred ? (
                            <Check size={18} className="text-white drop-shadow stroke-[3]" />
                          ) : null}
                        </div>

                        {/* Title & Info */}
                        <div className="w-full text-center">
                          <span className="block text-xs font-black text-white truncate">
                            {skin.name}
                          </span>
                          <span className="block text-[10px] text-white/50 truncate font-mono">
                            {isUnlocked ? (
                              <span className="text-emerald-400 font-bold">Ready</span>
                            ) : skin.gemCost ? (
                              <span className="text-amber-300 font-bold">{skin.gemCost} Gems</span>
                            ) : (
                              'Locked'
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live 3D Inspector & Equip/Unlock Controls */}
              <div className="w-full md:w-5/12 bg-black/30 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  {/* Live Canvas Box */}
                  <div className="w-full h-40 rounded-xl bg-gradient-to-b from-black/40 to-black/70 border border-white/15 relative flex items-center justify-center overflow-hidden shadow-inner mb-4">
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage:
                          'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                    <canvas ref={previewCanvasRef} width={180} height={150} className="relative z-10" />

                    <div className="absolute top-2 right-2 text-[9px] uppercase font-bold text-white/50 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                      Live Physical Preview
                    </div>
                  </div>

                  {/* Skin Info */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base font-black text-white">{inspectedSkin.name}</h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                        {inspectedSkin.description}
                      </p>
                    </div>
                    {inspectedSkin.unlocked ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 ml-2">
                        <Check size={12} /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 ml-2">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>

                  {/* Unlock Requirement / Achievement details */}
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[10px] tracking-wider">
                      <Award size={12} /> Unlock Criteria:
                    </div>
                    <p className="text-white/80 font-medium text-xs">
                      {inspectedSkin.unlockCriteriaText}
                    </p>
                  </div>
                </div>

                {/* Equip / Unlock Action Buttons */}
                <div className="pt-4 border-t border-white/10 mt-4">
                  {inspectedSkin.unlocked ? (
                    <button
                      id="btn-settings-select-preferred-skin"
                      onClick={() => onSelectSkin(inspectedSkin.id)}
                      disabled={isInspectedPreferred}
                      className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isInspectedPreferred
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black active:scale-95'
                      }`}
                    >
                      {isInspectedPreferred ? (
                        <>
                          <Check size={16} /> Preferred Skin (Active)
                        </>
                      ) : (
                        'Set as Preferred Skin'
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {inspectedSkin.gemCost && (
                        <button
                          id="btn-settings-buy-skin-gems"
                          onClick={() =>
                            onUnlockSkinWithGems(inspectedSkin.id, inspectedSkin.gemCost!)
                          }
                          disabled={!canAffordInspected}
                          className={`w-full py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                            canAffordInspected
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black active:scale-95'
                              : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                          }`}
                        >
                          <Gem size={14} /> Unlock Now with {inspectedSkin.gemCost} Star Gems
                        </button>
                      )}
                      <div className="text-center text-[10px] text-white/50">
                        {canAffordInspected
                          ? 'You have enough Star Gems to unlock this skin immediately!'
                          : `Need ${
                              (inspectedSkin.gemCost || 0) - playerGems
                            } more Star Gems or complete the achievement.`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAMEPLAY ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div id="settings-achievements-view" className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Gameplay Achievements & Skin Milestones
                  </h3>
                  <p className="text-[11px] text-white/60">
                    Accomplish math milestones to earn Star Gems and unlock exclusive bubble skins!
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-1 rounded-lg">
                  {achievements.filter((a) => a.unlocked).length} / {achievements.length} Complete
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {achievements.map((ach) => {
                  const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));
                  return (
                    <div
                      key={ach.id}
                      id={`achievement-card-${ach.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        ach.unlocked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              ach.unlocked
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                : 'bg-white/10 border border-white/15 text-white/60'
                            }`}
                          >
                            {renderAchievementIcon(ach.icon)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{ach.title}</h4>
                            <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                              {ach.description}
                            </p>
                          </div>
                        </div>

                        {ach.unlocked ? (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Check size={12} /> Earned
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-white/50 font-mono shrink-0">
                            {ach.progress.toLocaleString()} / {ach.target.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {!ach.unlocked && (
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}

                      {/* Reward Footprint */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[10px]">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Gem size={12} /> +{ach.rewardGems} Star Gems
                        </div>
                        {ach.rewardSkinName && (
                          <div className="flex items-center gap-1 text-fuchsia-300 font-bold">
                            <Palette size={11} /> Skin: {ach.rewardSkinName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & GRAPHICS PREFERENCES */}
          {activeTab === 'preferences' && (
            <div id="settings-preferences-view" className="space-y-6 max-w-xl mx-auto py-2">
              {/* Sound & Audio */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
                  <Volume2 size={16} /> Audio Controls
                </h4>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white block">Master Audio Mute</span>
                    <span className="text-xs text-white/50">
                      Mute or unmute pop sounds, level-up fanfare, and combo sound FX
                    </span>
                  </div>

                  <button
                    id="btn-settings-toggle-mute"
                    onClick={onToggleMute}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${
                      isMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX size={15} /> Muted
                      </>
                    ) : (
                      <>
                        <Volume2 size={15} /> Sound On
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Graphics & Simulation */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                  <Sliders size={16} /> Graphics & Particle Performance
                </h4>

                {/* Particle Density */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Bubble Particle Density</span>
                    <span className="text-xs text-white/50">
                      Control burst particle counts and aura reflections
                    </span>
                  </div>

                  <div className="flex gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
                    {(['low', 'medium', 'high'] as const).map((density) => (
                      <button
                        key={density}
                        id={`btn-density-${density}`}
                        onClick={() => onUpdateSettings({ particleDensity: density })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          settings.particleDensity === density
                            ? 'bg-cyan-400 text-black shadow-md'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen Shake Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-sm font-bold text-white block">Bubble Elastic Wobble</span>
                    <span className="text-xs text-white/50">
                      Physically deform bubbles dynamically on boundary collisions
                    </span>
                  </div>

                  <button
                    id="btn-settings-toggle-shake"
                    onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.screenShake
                        ? 'bg-cyan-400 text-black font-black'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {settings.screenShake ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Show Hints Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-sm font-bold text-white block">In-Game Equation Hints</span>
                    <span className="text-xs text-white/50">
                      Display optional mathematical strategy hints on difficult equations
                    </span>
                  </div>

                  <button
                    id="btn-settings-toggle-hints"
                    onClick={() => onUpdateSettings({ showHints: !settings.showHints })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.showHints
                        ? 'bg-cyan-400 text-black font-black'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {settings.showHints ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Reset Game Progress Area */}
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-rose-300 block">Reset Player Data</span>
                  <span className="text-xs text-rose-200/60">
                    Reset local high scores, achievements, and unlock progress to defaults
                  </span>
                </div>

                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-cancel-reset"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-confirm-reset"
                      onClick={() => {
                        onResetProgress();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-lg"
                    >
                      Confirm Reset
                    </button>
                  </div>
                ) : (
                  <button
                    id="btn-initiate-reset"
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
