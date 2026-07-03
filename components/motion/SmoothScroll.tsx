"use client";

import { ReactLenis } from "lenis/react";
import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Site-wide smooth scrolling via Lenis. Disabled on touch devices and when
 * the user prefers reduced motion — in those cases children render with
 * native scrolling untouched. Defaults to "touch" during SSR so the first
 * paint never smooth-scrolls on low-end devices.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(pointer: coarse)", true);

  if (reducedMotion || isTouch) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, lerp: 0.12 }}>
      {children}
    </ReactLenis>
  );
}
