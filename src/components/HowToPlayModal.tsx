import React from 'react';
import { X, Sparkles, Zap, Snowflake, Magnet, Bomb, Shield, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="how-to-play-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        id="how-to-play-dialog"
        className="w-full max-w-lg bg-gradient-to-b from-indigo-950/95 to-purple-950/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <h2 className="text-xl font-black uppercase tracking-wide text-fuchsia-200 flex items-center gap-2">
            <Sparkles size={20} className="text-cyan-400" />
            How to Play Bubble Math
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs text-white/80">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              🎯 The Objective
            </h4>
            <p className="leading-relaxed">
              Solve the math equation shown in the top header by clicking or tapping the floating bubble containing the correct answer before time runs out.
            </p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              ⚡ Physics & Combos
            </h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Bubbles bounce elastically off walls and collide with real momentum.</li>
              <li>Popping a bubble releases a radial physics shockwave that pushes nearby bubbles.</li>
              <li>Consecutive correct answers ramp up your <strong>Combo Multiplier</strong> (up to x5.0+), earning massive points!</li>
              <li>Hitting the wrong bubble resets your combo and docks 100 points unless protected by a <strong>Shield</strong>.</li>
            </ul>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              💎 Power-Ups (Hotkeys 1 - 4)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                <Snowflake size={16} className="text-cyan-400 shrink-0" />
                <div>
                  <strong className="text-white">Slow-Mo [1]:</strong> Slows bubble movement by 80%.
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                <Magnet size={16} className="text-pink-400 shrink-0" />
                <div>
                  <strong className="text-white">Magnet [2]:</strong> Pulls correct bubble towards target.
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                <Bomb size={16} className="text-amber-400 shrink-0" />
                <div>
                  <strong className="text-white">Bomb [3]:</strong> Blasts 3 wrong distractors.
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                <Zap size={16} className="text-purple-400 shrink-0" />
                <div>
                  <strong className="text-white">2X Multiplier [4]:</strong> Doubles all points scored.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              🎨 Unlockable Skins & Daily Challenges
            </h4>
            <p className="leading-relaxed">
              Earn XP and high scores to unlock radiant bubble skins like Sunset Ember, Emerald Crystal, and Golden Royalty. Complete the 3 daily challenges to earn bonus power-up refills!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-cyan-400 text-black font-black uppercase text-xs tracking-wider hover:bg-cyan-300 transition-colors"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
