"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * "The Evaluation Field" — the hero background.
 *
 * Three layers, all flat alpha strokes (no gradients, no glow):
 *  1. A blueprint lattice of fine plus-marks at grid intersections.
 *  2. Sparse "nodes" that breathe (slow alpha pulse) — a handful emerald.
 *  3. The score-ring motif: two large thin concentric rings behind the
 *     headline with one slowly orbiting emerald arc segment — the Score
 *     Card identity built into the architecture of the page.
 *
 * Interaction: marks within reach of the pointer lift in opacity (a torch
 * effect computed per-mark — discrete alphas, not a gradient fill), and the
 * whole field parallaxes a few pixels toward the pointer.
 *
 * Discipline: DPR capped at 2, rAF paused when offscreen, one static frame
 * under prefers-reduced-motion, no pointer work on touch devices.
 */

const SPACING = 64;
const CROSS = 3.5; // half-length of a plus-mark arm
const REVEAL_RADIUS = 240;

const MINT = "236, 249, 238";
const EMERALD = "30, 198, 119";

export function HeroGridCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;

    // Pointer state (lerped). Start far offscreen so nothing is revealed.
    let targetX = -9999;
    let targetY = -9999;
    let pointerX = -9999;
    let pointerY = -9999;
    // Field parallax (lerped, ±10px).
    let parTX = 0;
    let parTY = 0;
    let parX = 0;
    let parY = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /** Deterministic pseudo-random in [0,1) from a grid coordinate. */
    function hash(ix: number, iy: number) {
      const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
      return n - Math.floor(n);
    }

    function ringCenter() {
      // Behind the headline block: horizontally centered, upper-middle.
      return { cx: width / 2, cy: height * 0.42 };
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const px = parX;
      const py = parY;

      /* ---------------- 1+2. Plus-mark lattice + breathing nodes -------- */
      ctx.lineWidth = 1;
      const x0 = -SPACING;
      const y0 = -SPACING;
      for (let x = x0; x <= width + SPACING; x += SPACING) {
        for (let y = y0; y <= height + SPACING; y += SPACING) {
          const ix = Math.round(x / SPACING);
          const iy = Math.round(y / SPACING);
          const r = hash(ix, iy);

          const dx = x + px;
          const dy = y + py;

          // Base alpha, gently varied per mark so the field isn't uniform.
          let alpha = 0.045 + r * 0.02;

          // Breathing: a sparse subset of marks pulse slowly, out of phase.
          if (r > 0.82) {
            alpha += 0.05 * (0.5 + 0.5 * Math.sin(t * 0.0006 + r * 40));
          }

          // Pointer reveal: smoothstep falloff by distance (per-mark alpha).
          const ddx = dx - pointerX;
          const ddy = dy - pointerY;
          const dist = Math.hypot(ddx, ddy);
          if (dist < REVEAL_RADIUS) {
            const k = 1 - dist / REVEAL_RADIUS;
            alpha += k * k * 0.3;
          }

          // A handful of designated emerald nodes (score-dots in the field).
          const isAccent = r > 0.985;
          const color = isAccent ? EMERALD : MINT;
          if (isAccent) alpha += 0.08;

          ctx.strokeStyle = `rgba(${color}, ${Math.min(alpha, 0.5)})`;
          ctx.beginPath();
          ctx.moveTo(dx - CROSS, dy);
          ctx.lineTo(dx + CROSS, dy);
          ctx.moveTo(dx, dy - CROSS);
          ctx.lineTo(dx, dy + CROSS);
          ctx.stroke();
        }
      }

      /* ---------------- 3. Score rings + orbiting emerald arc ----------- */
      const { cx, cy } = ringCenter();
      const rings = [
        Math.min(width, height) * 0.34,
        Math.min(width, height) * 0.52,
      ];

      ctx.lineWidth = 1;
      for (const radius of rings) {
        ctx.strokeStyle = `rgba(${MINT}, 0.07)`;
        ctx.beginPath();
        ctx.arc(cx + px * 0.5, cy + py * 0.5, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Fine tick marks on the outer ring — instrument-panel detailing.
      const outer = rings[1];
      ctx.strokeStyle = `rgba(${MINT}, 0.1)`;
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const inner = outer - 4;
        ctx.beginPath();
        ctx.moveTo(
          cx + px * 0.5 + Math.cos(a) * inner,
          cy + py * 0.5 + Math.sin(a) * inner,
        );
        ctx.lineTo(
          cx + px * 0.5 + Math.cos(a) * outer,
          cy + py * 0.5 + Math.sin(a) * outer,
        );
        ctx.stroke();
      }

      // The orbiting emerald arc: one clean segment, slow and deliberate.
      const start = t * 0.00012;
      ctx.strokeStyle = `rgba(${EMERALD}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + px * 0.5, cy + py * 0.5, rings[0], start, start + Math.PI / 3);
      ctx.stroke();
      // A shorter counter-arc on the outer ring for balance.
      ctx.strokeStyle = `rgba(${EMERALD}, 0.22)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        cx + px * 0.5,
        cy + py * 0.5,
        outer,
        -start * 0.7 + Math.PI,
        -start * 0.7 + Math.PI + Math.PI / 5,
      );
      ctx.stroke();
    }

    resize();

    if (reducedMotion) {
      // One static, fully-composed frame (fixed arc positions).
      draw(9000);
      const onResize = () => {
        resize();
        draw(9000);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    function frame(now: number) {
      if (!running) return;
      pointerX += (targetX - pointerX) * 0.12;
      pointerY += (targetY - pointerY) * 0.12;
      parX += (parTX - parX) * 0.05;
      parY += (parTY - parY) * 0.05;
      draw(now);
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      parTX = (e.clientX / window.innerWidth - 0.5) * -12;
      parTY = (e.clientY / window.innerHeight - 0.5) * -8;
    }

    function onPointerLeave() {
      targetX = -9999;
      targetY = -9999;
      parTX = 0;
      parTY = 0;
    }

    const onResize = () => resize();

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      } else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(canvas);

    if (!isTouch) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener(
        "pointerleave",
        onPointerLeave,
      );
    }
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      if (!isTouch) {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave,
        );
      }
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
