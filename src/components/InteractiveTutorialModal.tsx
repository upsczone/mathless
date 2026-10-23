import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Snowflake, Magnet, Bomb, Zap, ArrowRight, CheckCircle2, Trophy, Award, MousePointer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTutorial: () => void;
}

interface TutorialBubble {
  id: string;
  value: number;
  isCorrect: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPopping: boolean;
}

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
  onCompleteTutorial,
}) => {
  const [step, setStep] = useState<number>(1);
  const [subStep, setSubStep] = useState<number>(1); // For multi-question steps
  const [isSlowMoActive, setIsSlowMoActive] = useState<boolean>(false);
  const [isMagnetActive, setIsMagnetActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [tutorialMultiplier, setTutorialMultiplier] = useState<number>(1.0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<TutorialBubble[]>([]);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);

  // Setup scenario based on tutorial step
  useEffect(() => {
    if (!isOpen) return;

    if (step === 1) {
      // Step 1: Static / gentle drift 4+5=9
      bubblesRef.current = [
        { id: 't1_1', value: 9, isCorrect: true, x: 250, y: 150, vx: 0.2, vy: 0.2, radius: 44, isPopping: false },
        { id: 't1_2', value: 8, isCorrect: false, x: 120, y: 110, vx: -0.2, vy: 0.2, radius: 40, isPopping: false },
        { id: 't1_3', value: 11, isCorrect: false, x: 380, y: 120, vx: 0.2, vy: -0.2, radius: 40, isPopping: false },
        { id: 't1_4', value: 14, isCorrect: false, x: 200, y: 230, vx: -0.2, vy: -0.2, radius: 40, isPopping: false },
      ];
      setFeedbackMessage('Aim and tap the bubble with the correct answer: 9');
    } else if (step === 2) {
      // Step 2: Bouncing floating physics 7x3=21
      bubblesRef.current = [
        { id: 't2_1', value: 21, isCorrect: true, x: 220, y: 140, vx: 1.8, vy: -1.2, radius: 44, isPopping: false },
        { id: 't2_2', value: 18, isCorrect: false, x: 100, y: 90, vx: -1.5, vy: 1.3, radius: 40, isPopping: false },
        { id: 't2_3', value: 24, isCorrect: false, x: 380, y: 180, vx: 1.2, vy: 1.6, radius: 40, isPopping: false },
        { id: 't2_4', value: 28, isCorrect: false, x: 300, y: 220, vx: -1.4, vy: -1.4, radius: 40, isPopping: false },
      ];
      setFeedbackMessage('Bubbles bounce with real 2D elasticity! Track and pop 21.');
    } else if (step === 3) {
      // Step 3: Power-ups 48 ÷ 6 = 8 with fast drift
      setIsSlowMoActive(false);
      bubblesRef.current = [
        { id: 't3_1', value: 8, isCorrect: true, x: 320, y: 160, vx: 3.2, vy: -2.8, radius: 44, isPopping: false },
        { id: 't3_2', value: 6, isCorrect: false, x: 140, y: 100, vx: -2.8, vy: 2.2, radius: 40, isPopping: false },
        { id: 't3_3', value: 9, isCorrect: false, x: 380, y: 220, vx: 2.5, vy: 3.1, radius: 40, isPopping: false },
        { id: 't3_4', value: 12, isCorrect: false, x: 180, y: 230, vx: -3.0, vy: -2.0, radius: 40, isPopping: false },
      ];
      setFeedbackMessage('Fast bubbles incoming! Click the Slow-Mo [1] power-up below to freeze physics.');
    } else if (step === 4) {
      // Step 4: Combos
      setTutorialMultiplier(1.0);
      setSubStep(1);
      bubblesRef.current = [
        { id: 't4_1', value: 25, isCorrect: true, x: 260, y: 150, vx: 1.2, vy: 1.0, radius: 44, isPopping: false },
        { id: 't4_2', value: 23, isCorrect: false, x: 120, y: 120, vx: -1.0, vy: 1.2, radius: 40, isPopping: false },
        { id: 't4_3', value: 27, isCorrect: false, x: 380, y: 180, vx: 1.0, vy: -1.2, radius: 40, isPopping: false },
      ];
      setFeedbackMessage('Solve 12 + 13 to initiate your Multiplier Streak!');
    }
  }, [step, isOpen]);

  // Main interactive physics render loop
  useEffect(() => {
    if (!isOpen || step === 5) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const speedFactor = isSlowMoActive ? 0.2 : 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 32; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 32; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Physics update
      const bubbles = bubblesRef.current;
      bubbles.forEach((b) => {
        if (b.isPopping) return;

        b.x += b.vx * speedFactor;
        b.y += b.vy * speedFactor;

        // Boundary bounce
        if (b.x - b.radius < 10) {
          b.x = b.radius + 10;
          b.vx *= -1;
        } else if (b.x + b.radius > w - 10) {
          b.x = w - b.radius - 10;
          b.vx *= -1;
        }

        if (b.y - b.radius < 10) {
          b.y = b.radius + 10;
          b.vy *= -1;
        } else if (b.y + b.radius > h - 10) {
          b.y = h - b.radius - 10;
          b.vy *= -1;
        }
      });

      // Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 6;
        sw.alpha -= 0.035;

        if (sw.alpha <= 0) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${sw.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render bubbles
      bubbles.forEach((b) => {
        if (b.isPopping) return;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Targeted bubble glow hint in step 1
        if (step === 1 && b.isCorrect) {
          ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
          ctx.shadowBlur = 24;
        } else {
          ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
          ctx.shadowBlur = 12;
        }

        // Gradient
        const grad = ctx.createRadialGradient(
          -b.radius * 0.35,
          -b.radius * 0.35,
          b.radius * 0.1,
          0,
          0,
          b.radius
        );
        grad.addColorStop(0, '#cffafe');
        grad.addColorStop(0.35, '#06b6d4');
        grad.addColorStop(0.85, '#2563eb');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Border ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.ellipse(
          -b.radius * 0.32,
          -b.radius * 0.35,
          b.radius * 0.45,
          b.radius * 0.22,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Number
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '800 24px "Outfit", "JetBrains Mono", sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillText(b.value.toString(), 1, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(b.value.toString(), 0, 0);

        ctx.restore();
      });

      // Target Pointer Nudge in Step 1
      if (step === 1) {
        const correctB = bubbles.find((b) => b.isCorrect && !b.isPopping);
        if (correctB) {
          ctx.save();
          const pointerY = correctB.y + correctB.radius + 15 + Math.sin(Date.now() * 0.006) * 5;
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(correctB.x, pointerY);
          ctx.lineTo(correctB.x - 8, pointerY + 14);
          ctx.lineTo(correctB.x + 8, pointerY + 14);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('CLICK ME!', correctB.x, pointerY + 28);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, step, isSlowMoActive]);

  // Click bubble handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bubbles = bubblesRef.current;
    let hit: TutorialBubble | null = null;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (b.isPopping) continue;
      const d = Math.hypot(clickX - b.x, clickY - b.y);
      if (d <= b.radius * 1.1) {
        hit = b;
        break;
      }
    }

    if (!hit) return;

    if (hit.isCorrect) {
      // Correct!
      hit.isPopping = true;
      sounds.playPop(1.2);
      sounds.playCorrect(tutorialMultiplier);

      // Create shockwave
      shockwavesRef.current.push({
        x: hit.x,
        y: hit.y,
        radius: 10,
        maxRadius: 150,
        alpha: 0.9,
      });

      // Displace neighbor bubbles with shockwave impulse
      bubbles.forEach((other) => {
        if (other !== hit && !other.isPopping) {
          const dx = other.x - hit!.x;
          const dy = other.y - hit!.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 0) {
            const force = (180 - dist) / 180 * 4;
            other.vx += (dx / dist) * force;
            other.vy += (dy / dist) * force;
          }
        }
      });

      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });

      if (step === 1) {
        setFeedbackMessage('Awesome! You mastered the basic Aim & Pop.');
        setTimeout(() => setStep(2), 1200);
      } else if (step === 2) {
        setFeedbackMessage('Physics in motion! Shockwaves displaced surrounding distractors.');
        setTimeout(() => setStep(3), 1400);
      } else if (step === 3) {
        setFeedbackMessage('Freezing physics made a tricky shot effortless!');
        setTimeout(() => setStep(4), 1400);
      } else if (step === 4) {
        if (subStep === 1) {
          setTutorialMultiplier(1.5);
          setSubStep(2);
          setFeedbackMessage('Combo Streak x1.5! Now solve 5 × 8 = ? to hit x2.0!');
          bubblesRef.current = [
            { id: 't4_sub_1', value: 40, isCorrect: true, x: 260, y: 150, vx: -1.5, vy: 1.2, radius: 44, isPopping: false },
            { id: 't4_sub_2', value: 35, isCorrect: false, x: 130, y: 110, vx: 1.2, vy: -1.0, radius: 40, isPopping: false },
            { id: 't4_sub_3', value: 45, isCorrect: false, x: 370, y: 190, vx: -1.1, vy: 1.4, radius: 40, isPopping: false },
          ];
        } else {
          setTutorialMultiplier(2.0);
          setFeedbackMessage('Multiplier x2.0 achieved! High combos unlock maximum scores!');
          setTimeout(() => setStep(5), 1200);
        }
      }
    } else {
      // Wrong bubble clicked
      sounds.playWrong();
      setFeedbackMessage(`Oops! ${hit.value} isn't right. Check the equation and try again!`);
    }
  };

  const handleActivateSlowMo = () => {
    setIsSlowMoActive(true);
    sounds.playPowerUp('freeze');
    setFeedbackMessage('Slow-Mo active! Drift reduced by 80%. Now tap bubble 8!');
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Step 1: Aim & Pop Mechanics';
      case 2:
        return 'Step 2: 2D Physics & Shockwaves';
      case 3:
        return 'Step 3: Tactical Power-Ups';
      case 4:
        return 'Step 4: Combo Streaks & Multipliers';
      case 5:
        return 'Academy Graduation: Ready for Action!';
    }
  };

  const getCurrentEquation = () => {
    if (step === 1) return '4 + 5 = ?';
    if (step === 2) return '7 × 3 = ?';
    if (step === 3) return '48 ÷ 6 = ?';
    if (step === 4) return subStep === 1 ? '12 + 13 = ?' : '5 × 8 = ?';
    return 'Level 1 Awaits!';
  };

  if (!isOpen) return null;

  return (
    <div
      id="interactive-tutorial-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-purple-950/95 border border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles size={20} className="text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Maths Odyssey Academy
              </h2>
              <p className="text-xs text-cyan-300 font-semibold">{getStepTitle()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step indicators */}
            <div className="flex gap-1.5 mr-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === s
                      ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                      : step > s
                      ? 'bg-emerald-400'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              id="btn-close-tutorial"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {step < 5 ? (
          <div className="p-6 flex flex-col items-center">
            {/* Interactive Equation Card */}
            <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-3.5 mb-4 flex justify-between items-center px-6 shadow-md">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-fuchsia-200">Current Target</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {getCurrentEquation()}
                </span>
              </div>

              {step === 4 && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-cyan-200">Multiplier</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-400 block">
                    x{tutorialMultiplier.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Physics Canvas Area */}
            <div className="relative w-full rounded-2xl border border-white/15 bg-black/40 overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={560}
                height={280}
                onClick={handleCanvasClick}
                className="cursor-pointer max-w-full"
              />

              {/* Frost particles indicator when slow mo active */}
              {isSlowMoActive && (
                <div className="absolute top-2 left-3 text-[10px] uppercase font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/40 flex items-center gap-1">
                  <Snowflake size={12} className="animate-spin" /> Slow-Mo Active
                </div>
              )}
            </div>

            {/* Step 3 Power-Up prompt button */}
            {step === 3 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  id="btn-tutorial-slowmo"
                  onClick={handleActivateSlowMo}
                  disabled={isSlowMoActive}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                    !isSlowMoActive
                      ? 'bg-cyan-400 text-black hover:bg-cyan-300 active:scale-95 animate-bounce'
                      : 'bg-white/10 text-white/40 cursor-default border border-white/10'
                  }`}
                >
                  <Snowflake size={14} /> [1] Activate Slow-Mo
                </button>
              </div>
            )}

            {/* Guidance Feedback Toast */}
            <div className="mt-4 w-full text-center py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/90">
              {feedbackMessage}
            </div>
          </div>
        ) : (
          /* Step 5: Graduation Celebration Screen */
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-1 shadow-[0_0_24px_rgba(251,191,36,0.5)] mb-4 animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Trophy size={40} className="text-amber-400" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-1">
              Academy Certified!
            </h3>
            <p className="text-xs text-white/70 max-w-md mb-6 leading-relaxed">
              You understand bubble physics, power-up timing, and combo multiplier dynamics. You are fully primed to take on Level 1 and climb the global leaderboards!
            </p>

            {/* Starter Gift Box */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-sm w-full mb-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-fuchsia-300 block mb-2">
                Rookie Prodigy Starter Pack Unlocked
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="bg-amber-500/20 border border-amber-400/30 text-amber-300 p-2 rounded-xl">
                  +150 Star Gems
                </div>
                <div className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 p-2 rounded-xl">
                  +3 Free Power-Ups
                </div>
              </div>
            </div>

            <button
              id="btn-start-first-level"
              onClick={onCompleteTutorial}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black uppercase text-sm tracking-wider shadow-xl active:scale-95 transition-all flex items-center gap-2"
            >
              🚀 Launch Official Level 1
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
