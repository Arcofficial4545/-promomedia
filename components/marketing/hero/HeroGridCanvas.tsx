"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const GRID_SPACING = 52;
const LINE_COLOR = "rgba(236, 249, 238, 0.055)";
const DOT_COLOR = "rgba(30, 198, 119, 0.14)";

/**
 * "The Deal Grid": an animated thin-line grid + dot matrix on canvas with
 * slow idle drift and subtle mouse parallax. Solid low-opacity strokes —
 * no gradients. Renders one static frame under prefers-reduced-motion.
 */
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

    // Parallax target/current offsets (lerped for smoothness).
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(drift: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const offsetX = ((currentX + drift) % GRID_SPACING) - GRID_SPACING;
      const offsetY = (currentY % GRID_SPACING) - GRID_SPACING;

      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = offsetX; x <= width + GRID_SPACING; x += GRID_SPACING) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y <= height + GRID_SPACING; y += GRID_SPACING) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      ctx.fillStyle = DOT_COLOR;
      for (let x = offsetX; x <= width + GRID_SPACING; x += GRID_SPACING) {
        for (let y = offsetY; y <= height + GRID_SPACING; y += GRID_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    resize();

    if (reducedMotion) {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const start = performance.now();

    function frame(now: number) {
      if (!running) return;
      // Idle drift: ~4px/s. Parallax lerp toward the mouse target.
      const drift = ((now - start) / 1000) * 4;
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      draw(drift);
      raf = requestAnimationFrame(frame);
    }

    function onMouseMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 14;
      targetY = ny * 14;
    }

    const onResize = () => resize();

    // Pause the loop when the hero is offscreen.
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

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
