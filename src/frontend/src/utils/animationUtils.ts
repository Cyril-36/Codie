/**
 * Animation Utilities for Codie Frontend
 * Integrates all animation features from design snippets
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  stagger?: number;
}

export interface RippleConfig {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

/**
 * Ripple effect utility
 */
export const createRipple = (
  element: HTMLElement,
  event: MouseEvent,
  config: Partial<RippleConfig> = {}
): void => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    background: ${config.color || 'rgba(255, 255, 255, 0.3)'};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1000;
  `;
  
  element.style.position = 'relative';
  element.appendChild(ripple);
  
  // Animate ripple
  requestAnimationFrame(() => {
    ripple.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    ripple.style.width = `${config.size || 300}px`;
    ripple.style.height = `${config.size || 300}px`;
    ripple.style.opacity = '0';
  });
  
  // Cleanup
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

/**
 * Stagger reveal animation
 */
export const staggerReveal = (
  elements: NodeListOf<Element> | Element[],
  config: AnimationConfig = {}
): void => {
  const {
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0,
    stagger = 100
  } = config;
  
  Array.from(elements).forEach((el, index) => {
    const element = el as HTMLElement;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `all ${duration}ms ${easing}`;
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay + (index * stagger));
  });
};

/**
 * Panel entrance animation
 */
export const animatePanel = (
  element: HTMLElement,
  config: AnimationConfig = {}
): void => {
  const {
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0
  } = config;
  
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `all ${duration}ms ${easing}`;
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
};

/**
 * Chart animation utilities
 */
export const animateChart = (
  element: HTMLElement,
  type: 'enter' | 'update' | 'exit' = 'enter'
): void => {
  const paths = element.querySelectorAll('path');
  
  if (type === 'enter') {
    paths.forEach((path, index) => {
      const isArea = path.classList.contains('area');
      const isLine = path.classList.contains('line');
      
      if (isArea) {
        path.style.opacity = '0';
        path.style.transform = 'translateY(20px)';
        path.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      
      if (isLine) {
        path.style.strokeDasharray = '1000';
        path.style.strokeDashoffset = '1000';
        path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      
      setTimeout(() => {
        if (isArea) {
          path.style.opacity = '1';
          path.style.transform = 'translateY(0)';
        }
        if (isLine) {
          path.style.strokeDashoffset = '0';
        }
      }, index * 100);
    });
  }
};

/**
 * Progress bar animation
 */
export const animateProgress = (
  element: HTMLElement,
  targetValue: number,
  config: AnimationConfig = {}
): void => {
  const {
    duration = 1000,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
  } = config;
  
  const progressBar = element.querySelector('.progress-fill') as HTMLElement;
  if (!progressBar) return;
  
  progressBar.style.transition = `width ${duration}ms ${easing}`;
  progressBar.style.width = `${targetValue}%`;
};

/**
 * List reorder animation (FLIP-like)
 */
export const animateListReorder = (
  container: HTMLElement,
  newOrder: Element[]
): void => {
  const items = Array.from(container.children);
  const firstRects = items.map(el => el.getBoundingClientRect());
  
  // Apply new order
  newOrder.forEach(el => container.appendChild(el));
  
  const lastRects = Array.from(container.children).map(el => el.getBoundingClientRect());
  
  // Animate each item to its new position
  Array.from(container.children).forEach((el, i) => {
    const element = el as HTMLElement;
    const dx = firstRects[i].left - lastRects[i].left;
    const dy = firstRects[i].top - lastRects[i].top;
    
    element.style.transform = `translate(${dx}px, ${dy}px)`;
    element.style.transition = 'none';
    
    requestAnimationFrame(() => {
      element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.transform = 'translate(0, 0)';
      
      element.addEventListener('transitionend', () => {
        element.style.transition = '';
      }, { once: true });
    });
  });
};

/**
 * Typing indicator animation
 */
export const animateTyping = (element: HTMLElement): void => {
  const dots = element.querySelectorAll('.typing-dot');
  
  dots.forEach((dot, index) => {
    const dotElement = dot as HTMLElement;
    dotElement.style.animation = `typing 1.4s ease-in-out infinite`;
    dotElement.style.animationDelay = `${index * 0.2}s`;
  });
};

/**
 * Success/Error feedback animations
 */
export const animateFeedback = (
  element: HTMLElement,
  type: 'success' | 'error' | 'warning' = 'success'
): void => {
  const animations = {
    success: 'success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    error: 'error-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
    warning: 'warning-pulse 0.6s ease-in-out'
  };
  
  element.style.animation = animations[type];
  
  element.addEventListener('animationend', () => {
    element.style.animation = '';
  }, { once: true });
};

/**
 * Sidebar animation
 */
export const animateSidebar = (
  element: HTMLElement,
  collapsed: boolean,
  config: AnimationConfig = {}
): void => {
  const {
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
  } = config;
  
  element.style.transition = `transform ${duration}ms ${easing}`;
  
  if (collapsed) {
    element.style.transform = 'translateX(-100%)';
    element.classList.add('is-collapsed');
  } else {
    element.style.transform = 'translateX(0)';
    element.classList.remove('is-collapsed');
  }
};

/**
 * Shimmer effect
 */
export const addShimmer = (element: HTMLElement): void => {
  element.classList.add('shimmer');
};

export const removeShimmer = (element: HTMLElement): void => {
  element.classList.remove('shimmer');
};

/**
 * Scroll-triggered animations
 */
export const observeScrollAnimations = (
  selector: string = '.reveal',
  threshold: number = 0.1
): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold }
  );
  
  document.querySelectorAll(selector).forEach((el) => {
    observer.observe(el);
  });
};

/**
 * Parallax effect utility
 */
export const createParallax = (
  element: HTMLElement,
  speed: number = 0.5
): (() => void) => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * speed;
    element.style.transform = `translateY(${rate}px)`;
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Smooth scroll utility
 */
export const smoothScrollTo = (
  target: Element | string,
  options: ScrollToOptions = {}
): void => {
  const targetElement = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
    
  if (!targetElement) return;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  targetElement.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
    ...options
  });
};

/**
 * Animation presets
 */
export const animationPresets = {
  fadeIn: {
    opacity: [0, 1],
    transform: ['translateY(20px)', 'translateY(0)'],
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  slideIn: {
    opacity: [0, 1],
    transform: ['translateX(-20px)', 'translateX(0)'],
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  scaleIn: {
    opacity: [0, 1],
    transform: ['scale(0.9)', 'scale(1)'],
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  bounceIn: {
    opacity: [0, 1],
    transform: ['scale(0.3)', 'scale(1)'],
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

/**
 * Apply animation preset
 */
export const applyAnimationPreset = (
  element: HTMLElement,
  preset: keyof typeof animationPresets,
  config: Partial<AnimationConfig> = {}
): void => {
  const presetConfig = animationPresets[preset];
  const {
    duration = presetConfig.duration,
    easing = presetConfig.easing,
    delay = 0
  } = config;
  
  element.style.opacity = '0';
  element.style.transform = presetConfig.transform[0];
  element.style.transition = `all ${duration}ms ${easing}`;
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = presetConfig.transform[1];
  }, delay);
};

export default {
  createRipple,
  staggerReveal,
  animatePanel,
  animateChart,
  animateProgress,
  animateListReorder,
  animateTyping,
  animateFeedback,
  animateSidebar,
  addShimmer,
  removeShimmer,
  observeScrollAnimations,
  createParallax,
  smoothScrollTo,
  applyAnimationPreset
};
