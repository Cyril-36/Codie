import { useAnimation, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
// Hook for reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  return prefersReducedMotion;
}
// Hook for scroll-triggered animations
export function useScrollAnimation(threshold: number = 0.1) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: '-100px',
    amount: threshold 
  });
  const controls = useAnimation();
  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [isInView, controls]);
  return { ref, controls, isInView };
}
// Hook for staggered animations
export function useStaggeredAnimation(itemCount: number, delay: number = 0.05) {
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const startAnimation = useCallback(async () => {
    setIsVisible(true);
    await controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * delay,
        duration: 0.3,
        ease: 'easeOut',
      },
    }));
  }, [controls, delay]);
  return {
    controls,
    startAnimation,
    isVisible,
    itemVariants: {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * delay,
          duration: 0.3,
          ease: 'easeOut',
        },
      }),
    },
  };
}
// Hook for hover animations
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const handleHoverStart = useCallback(() => {
    setIsHovered(true);
    controls.start('hover');
  }, [controls]);
  const handleHoverEnd = useCallback(() => {
    setIsHovered(false);
    controls.start('initial');
  }, [controls]);
  return {
    isHovered,
    controls,
    hoverProps: {
      onHoverStart: handleHoverStart,
      onHoverEnd: handleHoverEnd,
    },
  };
}
// Hook for press animations
export function usePressAnimation() {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();
  const handleTapStart = useCallback(() => {
    setIsPressed(true);
    controls.start('tap');
  }, [controls]);
  const handleTap = useCallback(() => {
    setIsPressed(false);
    controls.start('initial');
  }, [controls]);
  const handleTapCancel = useCallback(() => {
    setIsPressed(false);
    controls.start('initial');
  }, [controls]);
  return {
    isPressed,
    controls,
    pressProps: {
      onTapStart: handleTapStart,
      onTap: handleTap,
      onTapCancel: handleTapCancel,
    },
  };
}
// Hook for loading animations
export function useLoadingAnimation(isLoading: boolean) {
  const controls = useAnimation();
  useEffect(() => {
    if (isLoading) {
      controls.start('loading');
    } else {
      controls.start('initial');
    }
  }, [isLoading, controls]);
  return { controls };
}
// Hook for success/error animations
export function useStatusAnimation() {
  const controls = useAnimation();
  const showSuccess = useCallback(async () => {
    await controls.start('success');
    setTimeout(() => controls.start('initial'), 1000);
  }, [controls]);
  const showError = useCallback(async () => {
    await controls.start('error');
    setTimeout(() => controls.start('initial'), 1000);
  }, [controls]);
  return {
    controls,
    showSuccess,
    showError,
  };
}
// Hook for page transition animations
export function usePageTransition(transitionType: 'fade' | 'slide' | 'scale' = 'fade') {
  const controls = useAnimation();
  const [isExiting, setIsExiting] = useState(false);
  const startExit = useCallback(async () => {
    setIsExiting(true);
    await controls.start('exit');
  }, [controls]);
  const startEnter = useCallback(async () => {
    setIsExiting(false);
    await controls.start('animate');
  }, [controls]);
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
  };
  return {
    controls,
    isExiting,
    startExit,
    startEnter,
    variants: variants[transitionType],
  };
}
// Hook for ripple effect
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const createRipple = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  }, []);
  return {
    ripples,
    createRipple,
  };
}
// Hook for intersection observer animations
export function useIntersectionAnimation(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  return { ref, isVisible };
}
// Hook for sequential animations
export function useSequentialAnimation(steps: string[], delay: number = 0.2) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const controls = useAnimation();
  const startSequence = useCallback(async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await controls.start(steps[i]);
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }
    setIsComplete(true);
  }, [steps, delay, controls]);
  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    controls.start('initial');
  }, [controls]);
  return {
    currentStep,
    isComplete,
    controls,
    startSequence,
    resetSequence,
  };
}
// Hook for morphing animations
export function useMorphAnimation() {
  const [morphState, setMorphState] = useState<string>('initial');
  const controls = useAnimation();
  const morphTo = useCallback(async (state: string) => {
    setMorphState(state);
    await controls.start(state);
  }, [controls]);
  return {
    morphState,
    controls,
    morphTo,
  };
}
// Export all hooks
export default {
  useReducedMotion,
  useScrollAnimation,
  useStaggeredAnimation,
  useHoverAnimation,
  usePressAnimation,
  useLoadingAnimation,
  useStatusAnimation,
  usePageTransition,
  useRippleEffect,
  useIntersectionAnimation,
  useSequentialAnimation,
  useMorphAnimation,
};
