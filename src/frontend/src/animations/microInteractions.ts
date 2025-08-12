/**
 * Micro-interactions System
 * Exact design system specifications for animations and transitions
 */
import type { Variants, Transition } from 'framer-motion';

// Design System Animation Constants (exact specifications)
export const ANIMATION_DURATIONS = {
  fast: 200,      // 200ms - micro-interactions
  normal: 300,    // 300ms - page transitions  
  slow: 500,      // 500ms - complex animations
} as const;
export const EASING = {
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Default ease
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',        // Ease in
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',       // Ease out
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',   // Ease in-out
  spring: { type: 'spring', damping: 25, stiffness: 300 },
} as const;
// Button Micro-interactions (exact specifications)
export const buttonAnimations = {
  // Hover effect: translateY(-2px) as specified
  hover: {
    y: -2,
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeOut,
    },
  },
  // Press effect
  tap: {
    y: 0,
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.easeInOut,
    },
  },
  // Loading state
  loading: {
    opacity: 0.7,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.ease,
    },
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.ease,
    },
  },
};
// Card Micro-interactions
export const cardAnimations = {
  // Hover elevation
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeOut,
    },
  },
  // Press effect for interactive cards
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.easeInOut,
    },
  },
  // Entry animation
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.easeOut,
    },
  },
  // Exit animation
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeIn,
    },
  },
};
// Icon Micro-interactions
export const iconAnimations = {
  // Scale on hover
  hover: {
    scale: 1.1,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeOut,
    },
  },
  // Press effect
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: EASING.easeInOut,
    },
  },
  // Rotation animation
  rotate: {
    rotate: 180,
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.ease,
    },
  },
  // Bounce animation
  bounce: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: EASING.easeOut,
    },
  },
};
// Input Micro-interactions
export const inputAnimations = {
  // Focus effect
  focus: {
    scale: 1.01,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeOut,
    },
  },
  // Error shake
  error: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: EASING.easeInOut,
    },
  },
  // Success pulse
  success: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: EASING.easeOut,
    },
  },
};
// Modal Micro-interactions
export const modalAnimations = {
  // Backdrop
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.ease,
    },
  },
  // Modal content
  modal: {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.easeOut,
    },
  },
};
// Tooltip Micro-interactions
export const tooltipAnimations = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  transition: {
    duration: 0.15,
    ease: EASING.easeOut,
  },
};
// List Item Micro-interactions
export const listItemAnimations = {
  // Staggered entry
  container: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: ANIMATION_DURATIONS.normal / 1000,
        ease: EASING.easeOut,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: ANIMATION_DURATIONS.fast / 1000,
        ease: EASING.easeIn,
      },
    },
  },
  // Hover effect
  hover: {
    x: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000,
      ease: EASING.easeOut,
    },
  },
};
// Page Transition Variants
export const pageTransitions = {
  // Fade transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.ease,
    },
  },
  // Slide transition
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.easeOut,
    },
  },
  // Scale transition
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: {
      duration: ANIMATION_DURATIONS.normal / 1000,
      ease: EASING.easeOut,
    },
  },
};
// Loading Animations
export const loadingAnimations = {
  // Spinner
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  // Pulse
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.easeInOut,
    },
  },
  // Dots
  dots: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: EASING.easeInOut,
    },
  },
};
// Utility Functions
export const createStaggeredAnimation = (
  children: number,
  staggerDelay: number = 0.05
): Variants => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});
export const createDelayedAnimation = (
  delay: number,
  animation: any
): Variants => ({
  ...animation,
  transition: {
    ...animation.transition,
    delay,
  },
});
// Common transition presets
export const transitions: Record<string, Transition> = {
  fast: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING.easeOut,
  },
  normal: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING.easeOut,
  },
  slow: {
    duration: ANIMATION_DURATIONS.slow / 1000,
    ease: EASING.easeOut,
  },
  spring: EASING.spring,
};
// Export all animations
export default {
  buttonAnimations,
  cardAnimations,
  iconAnimations,
  inputAnimations,
  modalAnimations,
  tooltipAnimations,
  listItemAnimations,
  pageTransitions,
  loadingAnimations,
  transitions,
  ANIMATION_DURATIONS,
  EASING,
};
