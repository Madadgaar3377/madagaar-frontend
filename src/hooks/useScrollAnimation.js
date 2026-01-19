import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * @param {Object} options - Configuration options
 * @param {string} options.animation - Animation type: 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeIn', 'scaleIn'
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {number} options.delay - Animation delay in milliseconds
 * @param {boolean} options.once - Whether to animate only once
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = ({
  animation = 'fadeInUp',
  threshold = 0.1,
  delay = 0,
  once = true,
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, once]);

  const animationClass = isVisible
    ? `animate-${animation}`
    : 'animate-on-scroll';

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return {
    ref: elementRef,
    isVisible,
    animationClass,
    style,
  };
};

/**
 * Hook for animating children with stagger effect
 * @param {number} staggerDelay - Delay between each child in milliseconds
 * @returns {Object} - { getAnimationProps }
 */
export const useStaggerAnimation = (staggerDelay = 100) => {
  const getAnimationProps = (index) => {
    return {
      delay: index * staggerDelay,
    };
  };

  return { getAnimationProps };
};
