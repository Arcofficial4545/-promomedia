"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** Emerald reading-progress bar pinned under the header. */
export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = barRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-emerald"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
