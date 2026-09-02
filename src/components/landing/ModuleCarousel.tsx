"use client";

import { motion, useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function ModuleCarousel({ children }: { children: React.ReactNode }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const permanentlyPausedRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useAnimationFrame((_time, delta) => {
    const carousel = carouselRef.current;
    if (!carousel || reducedMotion || pausedRef.current || permanentlyPausedRef.current) return;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (maxScroll > 0) carousel.scrollLeft = carousel.scrollLeft >= maxScroll ? 0 : carousel.scrollLeft + delta * 0.012;
  });

  function pauseForHover() {
    pausedRef.current = true;
  }

  function resumeAfterHover() {
    if (!permanentlyPausedRef.current) pausedRef.current = false;
  }

  function stopForUserInteraction() {
    permanentlyPausedRef.current = true;
    pausedRef.current = true;
  }

  return (
    <motion.div
      ref={carouselRef}
      className="flex gap-4 overflow-x-auto scroll-px-5 p-5 snap-x snap-mandatory"
      onMouseEnter={pauseForHover}
      onMouseLeave={resumeAfterHover}
      onPointerDown={stopForUserInteraction}
      onTouchStart={stopForUserInteraction}
      onWheel={stopForUserInteraction}
    >
      {children}
    </motion.div>
  );
}
