import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BubbleEntity, BubbleSkin, FloatingText, MathProblem, Particle, PowerUpType } from '../types/game';
import { sounds } from '../utils/audio';

interface PhysicsCanvasProps {
  problem: MathProblem;
  activeSkin: BubbleSkin;
  isSlowMoActive: boolean;
  isMagnetActive: boolean;
  isDoubleScoreActive: boolean;
  shieldActive: boolean;
  onCorrectAnswer: (bubbleId: string, value: number, points: number) => void;
  onWrongAnswer: (bubbleId: string, value: number) => void;
  onCollectPowerUp: (type: PowerUpType) => void;
  triggerBombEffect?: number; // counter to trigger bomb explosion
  multiplier: number;
  particleDensity?: 'high' | 'medium' | 'low';
  screenShake?: boolean;
}

export const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({
  problem,
  activeSkin,
  isSlowMoActive,
  isMagnetActive,
  isDoubleScoreActive,
  shieldActive,
  onCorrectAnswer,
  onWrongAnswer,
  onCollectPowerUp,
  triggerBombEffect,
  multiplier,
  particleDensity = 'high',
  screenShake = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bubblesRef = useRef<BubbleEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 500 });
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<string | null>(null);
  const prevBombTriggerRef = useRef<number | undefined>(triggerBombEffect);

  // Initialize bubbles whenever the math problem changes
  useEffect(() => {
    const { width, height } = canvasDimensions;
    if (width <= 0 || height <= 0) return;

    const newBubbles: BubbleEntity[] = [];
    const options = problem.options;
    const padding = 70;

    options.forEach((val, idx) => {
      const isCorrect = val === problem.targetAnswer;
      // Stagger initial positions across canvas width & height
      const cols = Math.ceil(Math.sqrt(options.length + 1));
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const cellW = (width - padding * 2) / cols;
      const cellH = (height - padding * 2) / cols;

      const baseX = padding + col * cellW + Math.random() * (cellW * 0.5);
      const baseY = padding + row * cellH + Math.random() * (cellH * 0.5);

      const baseRadius = 38 + (val.toString().length > 2 ? 6 : 0);

      newBubbles.push({
        id: `b_${idx}_${val}_${Date.now()}`,
        value: val,
        isCorrect,
        x: Math.min(Math.max(baseX, baseRadius + 10), width - baseRadius - 10),
        y: Math.min(Math.max(baseY, baseRadius + 10), height - baseRadius - 10),
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        radius: baseRadius,
        baseRadius,
        mass: baseRadius,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 2,
        wobbleMagnitude: 0,
        isPopping: false,
        popProgress: 0,
        opacity: 1,
      });
    });

    // 20% chance to spawn a bonus floating power-up bubble!
    if (Math.random() < 0.22) {
      const pTypes: PowerUpType[] = ['freeze', 'magnet', 'bomb', 'multiplier', 'shield'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      newBubbles.push({
        id: `bonus_p_${Date.now()}`,
        value: 0,
        isCorrect: false,
        isSpecialPowerUp: true,
        powerUpType: pType,
        x: Math.random() * (width - 120) + 60,
        y: Math.random() * (height - 120) + 60,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        radius: 32,
        baseRadius: 32,
        mass: 32,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 4,
        wobbleMagnitude: 2,
        isPopping: false,
        popProgress: 0,
        opacity: 1,
      });
    }

    bubblesRef.current = newBubbles;
  }, [problem, canvasDimensions]);

  // Handle Bomb Trigger from Power-Up Button
  useEffect(() => {
    if (triggerBombEffect !== undefined && triggerBombEffect !== prevBombTriggerRef.current) {
      prevBombTriggerRef.current = triggerBombEffect;
      const wrongBubbles = bubblesRef.current.filter((b) => !b.isCorrect && !b.isPopping && !b.isSpecialPowerUp);
      if (wrongBubbles.length > 0) {
        // Pop up to 3 incorrect bubbles!
        const toPop = wrongBubbles.slice(0, 3);
        toPop.forEach((b) => {
          b.isPopping = true;
          // Spawn particle explosion
          createExplosion(b.x, b.y, '#f59e0b', 24);
          sounds.playPop(1.4);
          // Spawn shockwave
          shockwavesRef.current.push({
            x: b.x,
            y: b.y,
            radius: 10,
            maxRadius: 160,
            alpha: 0.9,
          });
        });
      }
    }
  }, [triggerBombEffect]);

  // Spawn particle explosion
  const createExplosion = useCallback((x: number, y: number, color: string, count = 20) => {
    const scaledCount = particleDensity === 'low' ? Math.max(6, Math.round(count * 0.5)) : particleDensity === 'medium' ? Math.round(count * 0.75) : count;
    for (let i = 0; i < scaledCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.025,
      });
    }
  }, []);

  // Spawn floating score text (+1250 or -50)
  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.8,
    });
  }, []);

  // Update canvas sizing with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setCanvasDimensions({ width, height });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Main 60FPS Physics Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const rawDt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Time scaling for Slow-Mo power-up
      const dt = isSlowMoActive ? rawDt * 0.22 : rawDt;
      const speedMultiplier = isSlowMoActive ? 0.3 : 1;

      const { width, height } = canvasDimensions;
      canvas.width = width;
      canvas.height = height;

      // Clear with slight trailing opacity or clean clear
      ctx.clearRect(0, 0, width, height);

      // Render Ambient Glass Grid / Backdrops
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // If Magnet is active, draw connecting aura towards the correct bubble
      if (isMagnetActive) {
        const correctBubble = bubblesRef.current.find((b) => b.isCorrect && !b.isPopping);
        if (correctBubble) {
          const centerX = width / 2;
          const centerY = 80;

          // Pull physics towards top-center
          const dx = centerX - correctBubble.x;
          const dy = centerY - correctBubble.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 20) {
            correctBubble.vx += (dx / dist) * 0.8 * speedMultiplier;
            correctBubble.vy += (dy / dist) * 0.8 * speedMultiplier;
          }

          // Draw magnetic beam
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(correctBubble.x, correctBubble.y);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
          ctx.lineWidth = 3 + Math.sin(time * 0.01) * 1.5;
          ctx.setLineDash([8, 6]);
          ctx.stroke();

          // Magnetic beacon ring around correct bubble
          ctx.beginPath();
          ctx.arc(correctBubble.x, correctBubble.y, correctBubble.radius + 12 + Math.sin(time * 0.01) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // If Slow-Mo is active, draw gentle falling frost flakes
      if (isSlowMoActive) {
        ctx.save();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
        for (let i = 0; i < 18; i++) {
          const fx = ((i * 12345 + time * 0.04) % width);
          const fy = ((i * 54321 + time * 0.08) % height);
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 1. UPDATE & DRAW SHOCKWAVES
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 3.5;
        sw.alpha -= 0.03;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(sw.alpha, 0)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Push away other bubbles physically with shockwave pressure
        bubblesRef.current.forEach((b) => {
          if (!b.isPopping) {
            const dx = b.x - sw.x;
            const dy = b.y - sw.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0 && Math.abs(dist - sw.radius) < 30) {
              const push = 3.5;
              b.vx += (dx / dist) * push;
              b.vy += (dy / dist) * push;
              b.wobbleMagnitude = Math.min(b.wobbleMagnitude + 4, 10);
            }
          }
        });

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // 2. BUBBLE PHYSICS UPDATE
      const bubbles = bubblesRef.current;

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        if (b.isPopping) {
          b.popProgress += rawDt * 4.5;
          b.radius = b.baseRadius * (1 + b.popProgress * 0.6);
          b.opacity = Math.max(0, 1 - b.popProgress);
          continue;
        }

        // Wobble decay
        if (b.wobbleMagnitude > 0) {
          b.wobbleMagnitude *= 0.94;
          if (b.wobbleMagnitude < 0.05) b.wobbleMagnitude = 0;
        }
        b.wobblePhase += b.wobbleSpeed * dt;

        // Fluid forces: slight upward buoyancy + gentle wave sway
        b.vy -= 0.02 * speedMultiplier;
        b.vx += Math.sin(time * 0.0015 + b.wobblePhase) * 0.04 * speedMultiplier;

        // Fluid drag
        b.vx *= 0.995;
        b.vy *= 0.995;

        // Update position
        b.x += b.vx * speedMultiplier * 60 * dt;
        b.y += b.vy * speedMultiplier * 60 * dt;

        // Wall collisions with elastic bounce
        const r = b.radius;
        if (b.x - r < 0) {
          b.x = r;
          b.vx = Math.abs(b.vx) * 0.88;
          b.wobbleMagnitude = Math.min(b.wobbleMagnitude + 3, 8);
        } else if (b.x + r > width) {
          b.x = width - r;
          b.vx = -Math.abs(b.vx) * 0.88;
          b.wobbleMagnitude = Math.min(b.wobbleMagnitude + 3, 8);
        }

        if (b.y - r < 0) {
          b.y = r;
          b.vy = Math.abs(b.vy) * 0.88;
          b.wobbleMagnitude = Math.min(b.wobbleMagnitude + 3, 8);
        } else if (b.y + r > height) {
          b.y = height - r;
          b.vy = -Math.abs(b.vy) * 0.88;
          b.wobbleMagnitude = Math.min(b.wobbleMagnitude + 3, 8);
        }
      }

      // Bubble-to-bubble elastic collision resolution
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];
          if (b1.isPopping || b2.isPopping) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            // Normal vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping spheres
            const overlap = minDist - dist;
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Relative velocity
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

            // Impulse response with restitution
            const restitution = 0.85;
            b1.vx -= p * b2.mass * nx * restitution;
            b1.vy -= p * b2.mass * ny * restitution;
            b2.vx += p * b1.mass * nx * restitution;
            b2.vy += p * b1.mass * ny * restitution;

            // Trigger deformation wobble on impact
            b1.wobbleMagnitude = Math.min(b1.wobbleMagnitude + 2.5, 7);
            b2.wobbleMagnitude = Math.min(b2.wobbleMagnitude + 2.5, 7);
          }
        }
      }

      // Remove completed popping bubbles
      bubblesRef.current = bubbles.filter((b) => !b.isPopping || b.popProgress < 1);

      // 3. DRAW BUBBLES WITH FROSTED GLASS SHADING
      bubblesRef.current.forEach((b) => {
        ctx.save();
        ctx.globalAlpha = b.opacity;

        // Calculate wobble deformation
        const wobble = Math.sin(b.wobblePhase) * b.wobbleMagnitude;
        const scaleX = 1 + wobble * 0.05;
        const scaleY = 1 - wobble * 0.05;

        ctx.translate(b.x, b.y);
        ctx.scale(scaleX, scaleY);

        const r = b.radius;
        const isBonus = b.isSpecialPowerUp;

        // Custom palette based on bubble skin or power-up
        let primaryColor = activeSkin.palette.primary;
        let secondaryColor = activeSkin.palette.secondary;
        let glowColor = activeSkin.palette.glow;
        let highlightColor = activeSkin.palette.highlight;
        let borderColor = activeSkin.palette.border;

        if (isBonus && b.powerUpType) {
          primaryColor = '#fbbf24';
          secondaryColor = '#b45309';
          glowColor = 'rgba(251, 191, 36, 0.8)';
          highlightColor = '#fef3c7';
          borderColor = 'rgba(255, 255, 255, 0.9)';
        }

        // Ambient shadow glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isBonus ? 24 : 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Base 3D Sphere Glass Gradient
        const grad = ctx.createRadialGradient(
          -r * 0.35,
          -r * 0.35,
          r * 0.1,
          0,
          0,
          r
        );
        grad.addColorStop(0, highlightColor);
        grad.addColorStop(0.35, primaryColor);
        grad.addColorStop(0.85, secondaryColor);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Skin Specific Surface Texture & Embellishments
        if (!isBonus) {
          const style = activeSkin.patternStyle;
          if (style === 'plasma') {
            // Supernova Corona Prominences
            ctx.save();
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
            ctx.lineWidth = 2;
            const timeVal = Date.now() * 0.003;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              const spikeLen = r + 4 + Math.sin(timeVal + a * 2) * 4;
              ctx.beginPath();
              ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
              ctx.lineTo(Math.cos(a) * spikeLen, Math.sin(a) * spikeLen);
              ctx.stroke();
            }
            ctx.restore();
          } else if (style === 'ember') {
            // Sunset Ember Convection Arcs
            ctx.save();
            ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, r * 0.15, r * 0.55, -Math.PI * 0.8, -Math.PI * 0.2);
            ctx.stroke();
            ctx.restore();
          } else if (style === 'gold_ring') {
            // 24K Golden Concentric Foil Ring
            ctx.save();
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (style === 'cyber_grid') {
            // Cyber Grid Diffraction Reticle
            ctx.save();
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, 0);
            ctx.lineTo(r * 0.6, 0);
            ctx.moveTo(0, -r * 0.6);
            ctx.lineTo(0, r * 0.6);
            ctx.stroke();
            ctx.restore();
          } else if (style === 'nebula') {
            // Cosmic Stardust Dots
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.beginPath();
            ctx.arc(-r * 0.3, r * 0.2, 1.5, 0, Math.PI * 2);
            ctx.arc(r * 0.25, -r * 0.25, 2, 0, Math.PI * 2);
            ctx.arc(r * 0.35, r * 0.3, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (style === 'void_warp') {
            // Void Singularity Event Horizon Ring
            ctx.save();
            ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (style === 'quantum_lattice') {
            // Sub-atomic Green Matrix Traces
            ctx.save();
            ctx.strokeStyle = 'rgba(134, 239, 172, 0.45)';
            ctx.lineWidth = 1;
            for (let i = -1; i <= 1; i++) {
              ctx.beginPath();
              ctx.moveTo(-r * 0.55, i * 14);
              ctx.lineTo(r * 0.55, i * 14);
              ctx.stroke();
            }
            ctx.restore();
          } else if (style === 'aurora_shimmer') {
            // Iridescent Spectral Ribbon
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.65, r * 0.3, time * 0.002, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }

        // Outer Frosted Border Ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner Specular Glass Crescent Highlight (Top Left)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(-r * 0.32, -r * 0.35, r * 0.45, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        ctx.restore();

        // Secondary subtle rim reflection (Bottom Right)
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r - 3, Math.PI * 0.25, Math.PI * 0.7);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Render Value or Power-up Icon
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isBonus && b.powerUpType) {
          // Bonus power-up icon badge
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px Outfit, sans-serif';
          const iconText = b.powerUpType === 'freeze' ? '❄️' : b.powerUpType === 'magnet' ? '🧲' : b.powerUpType === 'bomb' ? '💣' : b.powerUpType === 'multiplier' ? '⚡' : '🛡️';
          ctx.fillText(iconText, 0, 0);

          ctx.font = 'bold 8px Outfit, sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.fillText('POWER', 0, r * 0.55);
        } else {
          // Math Number Value
          const text = b.value.toString();
          const fontSize = text.length > 3 ? Math.round(r * 0.58) : Math.round(r * 0.72);
          ctx.font = `800 ${fontSize}px "Outfit", "JetBrains Mono", sans-serif`;

          // Text shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillText(text, 1, 2);

          // Front Crisp Text
          ctx.fillStyle = activeSkin.palette.text;
          ctx.fillText(text, 0, 0);
        }

        ctx.restore();
      });

      // 4. PARTICLES UPDATE & RENDER
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * 60 * rawDt;
        p.y += p.vy * 60 * rawDt;
        p.vy += 0.08; // gravity for sparkle dust
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. FLOATING TEXTS UPDATE & RENDER (+Points or -Error)
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y += ft.vy * 60 * rawDt;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = '800 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(ft.text, ft.x + 1, ft.y + 2);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [canvasDimensions, isSlowMoActive, isMagnetActive, activeSkin]);

  // Pointer Interaction Handler: Click / Tap to pop
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit on bubbles in reverse order (topmost rendered bubble first)
    const bubbles = bubblesRef.current;
    let hitBubble: BubbleEntity | null = null;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (b.isPopping) continue;

      const dist = Math.hypot(clickX - b.x, clickY - b.y);
      if (dist <= b.radius * 1.1) {
        hitBubble = b;
        break;
      }
    }

    if (hitBubble) {
      if (hitBubble.isSpecialPowerUp && hitBubble.powerUpType) {
        // Collect Power-up bubble
        hitBubble.isPopping = true;
        createExplosion(hitBubble.x, hitBubble.y, '#f59e0b', 25);
        sounds.playPowerUp(hitBubble.powerUpType);
        spawnFloatingText(`+${hitBubble.powerUpType.toUpperCase()}!`, hitBubble.x, hitBubble.y, '#fef08a');
        onCollectPowerUp(hitBubble.powerUpType);
        return;
      }

      if (hitBubble.isCorrect) {
        // Correct Bubble Popped!
        hitBubble.isPopping = true;
        sounds.playPop(1.1);
        sounds.playCorrect(multiplier);

        const basePoints = 250;
        const totalPoints = Math.round(basePoints * multiplier * (isDoubleScoreActive ? 2 : 1));

        createExplosion(hitBubble.x, hitBubble.y, activeSkin.palette.primary, 32);
        shockwavesRef.current.push({
          x: hitBubble.x,
          y: hitBubble.y,
          radius: 12,
          maxRadius: 180,
          alpha: 0.9,
        });

        spawnFloatingText(
          `+${totalPoints} pts`,
          hitBubble.x,
          hitBubble.y,
          multiplier >= 3 ? '#22d3ee' : '#34d399'
        );

        onCorrectAnswer(hitBubble.id, hitBubble.value, totalPoints);
      } else {
        // Wrong Answer Bubble Hit
        sounds.playWrong();
        hitBubble.wobbleMagnitude = 10;
        hitBubble.wobblePhase = 0;

        // Push bubble away from tap
        const dx = hitBubble.x - clickX;
        const dy = hitBubble.y - clickY;
        const dist = Math.hypot(dx, dy) || 1;
        hitBubble.vx += (dx / dist) * 7;
        hitBubble.vy += (dy / dist) * 7;

        createExplosion(clickX, clickY, '#ef4444', 8);

        if (shieldActive) {
          spawnFloatingText('SHIELD SAVED!', hitBubble.x, hitBubble.y, '#34d399');
        } else {
          spawnFloatingText('-100', hitBubble.x, hitBubble.y, '#f87171');
        }

        onWrongAnswer(hitBubble.id, hitBubble.value);
      }
    } else {
      // Click on empty canvas: create a gentle ripple impulse
      shockwavesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 8,
        maxRadius: 70,
        alpha: 0.5,
      });
      sounds.playPop(0.7);
    }
  };

  return (
    <div
      ref={containerRef}
      id="physics-canvas-container"
      className="relative w-full h-full min-h-[360px] bg-black/35 rounded-3xl border border-white/10 shadow-inner overflow-hidden cursor-crosshair"
    >
      {/* Radial backlight spotlight */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* Main Physics Canvas */}
      <canvas
        ref={canvasRef}
        id="physics-math-canvas"
        onPointerDown={handlePointerDown}
        className="w-full h-full block"
      />

      {/* Arena HUD Overlays */}
      <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/50 bg-black/40 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
          Target: <strong className="text-amber-300 font-mono font-bold text-xs">{problem.equation.replace(' = ?', '')}</strong>
        </span>
        {isSlowMoActive && (
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-400 text-black animate-pulse">
            Slow-Mo Active
          </span>
        )}
        {isDoubleScoreActive && (
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500 text-white animate-pulse">
            2X Multiplier
          </span>
        )}
        {shieldActive && (
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
            Shield Ready
          </span>
        )}
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none">
        <span className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">
          Tap or pop bubbles with physics impulse
        </span>
      </div>
    </div>
  );
};
