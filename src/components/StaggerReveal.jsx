"use client";

import React from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const ANIMATION_CLASS = {
  fadeInUp: "animate-fade-in-up",
  fadeInDown: "animate-fade-in-down",
  fadeInLeft: "animate-fade-in-left",
  fadeInRight: "animate-fade-in-right",
  fadeIn: "animate-fade-in",
  scaleIn: "animate-scale-in",
};

/**
 * Scroll-triggered reveal with optional stagger index for grid/list items.
 */
export default function StaggerReveal({
  children,
  animation = "fadeInUp",
  index = 0,
  staggerMs = 80,
  className = "",
  threshold = 0.08,
}) {
  const delay = index * staggerMs;
  const { ref, isVisible } = useScrollAnimation({
    animation,
    delay,
    threshold,
    once: true,
  });

  const animationClass = ANIMATION_CLASS[animation] || ANIMATION_CLASS.fadeInUp;

  return (
    <div
      ref={ref}
      className={`${isVisible ? animationClass : "animate-on-scroll"} ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
