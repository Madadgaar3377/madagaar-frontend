import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * AnimatedSection - Wrapper component that animates on scroll
 * @param {React.ReactNode} children - Content to animate
 * @param {string} animation - Animation type
 * @param {number} delay - Animation delay
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

  const combinedStyle = {
    ...style,
    ...(delay > 0 && { animationDelay: `${delay}ms` }),
  };

  return (
    <div
      ref={ref}
      className={`${isVisible ? `animate-${animation}` : 'animate-on-scroll'} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
