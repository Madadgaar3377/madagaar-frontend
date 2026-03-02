import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/** Map animation type to CSS class (kebab-case) to match index.css */
const ANIMATION_CLASS = {
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
};

/**
 * AnimatedSection - Wrapper component that animates on scroll
 * @param {React.ReactNode} children - Content to animate
 * @param {string} animation - Animation type (fadeInUp, fadeIn, scaleIn, etc.)
 * @param {number} delay - Animation delay in ms
 * @param {string} className - Additional CSS classes
 */
const AnimatedSection = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  className = '',
  ...props
}) => {
  const { ref, isVisible, style } = useScrollAnimation({
    animation,
    delay,
    threshold: 0.1,
    once: true,
  });

  const animationClass = ANIMATION_CLASS[animation] || ANIMATION_CLASS.fadeInUp;
  const combinedStyle = {
    ...style,
    ...(delay > 0 && { animationDelay: `${delay}ms` }),
  };

  return (
    <div
      ref={ref}
      className={`${isVisible ? animationClass : 'animate-on-scroll'} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
