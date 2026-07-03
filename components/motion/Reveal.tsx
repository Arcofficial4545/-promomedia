"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

type RevealProps = {
  children: React.ReactNode;
  /** Seconds to delay the entrance (use for manual stagger). */
  delay?: number;
  className?: string;
  /** Portion of the element that must be visible before revealing. */
  amount?: number;
  as?: "div" | "section" | "li" | "article" | "span";
};

/**
 * Scroll-reveal wrapper: fade + 16px rise once the element enters the
 * viewport. Collapses to a plain wrapper under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  amount = 0.25,
  as = "div",
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      custom={delay}
    >
      {children}
    </Component>
  );
}
