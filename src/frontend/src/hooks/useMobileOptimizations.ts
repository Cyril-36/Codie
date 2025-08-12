import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import { useResponsive } from './useResponsive';

import type React from 'react';
// Touch gesture types
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type GestureType = 'tap' | 'longpress' | 'swipe' | 'pinch';
// Touch event interfaces
export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}
export interface SwipeGesture {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  duration: number;
}
export interface PinchGesture {
  scale: number;
  center: TouchPoint;
}
export interface GestureHandlers {
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
}
// Mobile optimization settings
export interface MobileOptimizations {
  // Touch targets
  minTouchTarget: number; // 44px minimum
  touchTargetSpacing: number; // 8px minimum
  // Gestures
  swipeThreshold: number; // Minimum distance for swipe
  longPressDelay: number; // Long press duration
  tapTimeout: number; // Max time for tap
  // Performance
  enableHardwareAcceleration: boolean;
  reducedMotion: boolean;
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
}
// Default mobile settings
const _DEFAULT_MOBILE_SETTINGS: MobileOptimizations = {
  minTouchTarget: 44,
  touchTargetSpacing: 8,
  swipeThreshold: 50,
  longPressDelay: 500,
  tapTimeout: 300,
  enableHardwareAcceleration: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
};
// Touch gesture hook
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: GestureHandlers,
  _options: Partial<MobileOptimizations> = {}
) {
  const settings = useMemo(() => ({
    touchOptimized: true,
    hapticFeedback: true,
    swipeThreshold: 10,
    longPressDelay: 500,
    tapTimeout: 200,
  }), []);
  const [isPressed, setIsPressed] = useState(false);
  const [startPoint, setStartPoint] = useState<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  }, []);
  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    setStartPoint(point);
    setIsPressed(true);
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      handlers.onLongPress?.(point);
      setIsPressed(false);
    }, settings.longPressDelay);
  }, [handlers, settings.longPressDelay]);
  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startPoint) return;
    const touch = e.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    // Cancel long press if moved too much
    if (distance > 10) {
      clearLongPressTimer();
    }
  }, [startPoint, clearLongPressTimer]);
  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startPoint) return;
    const touch = e.changedTouches[0];
    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endPoint.timestamp - startPoint.timestamp;
    clearLongPressTimer();
    setIsPressed(false);
    // Determine gesture type
    if (distance < 10 && duration < settings.tapTimeout) {
      // Tap gesture
      handlers.onTap?.(endPoint);
    } else if (distance > settings.swipeThreshold) {
      // Swipe gesture
      const velocity = distance / duration;
      let direction: SwipeDirection;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      handlers.onSwipe?.({
        direction,
        distance,
        velocity,
        duration,
      });
    }
    setStartPoint(null);
  }, [startPoint, handlers, settings, clearLongPressTimer]);
  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer]);
  return { isPressed };
}
// Pull to refresh hook
export function usePullToRefresh(
  onRefresh: () => Promise<void> | void,
  threshold: number = 80
) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number>(0);
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [threshold, isRefreshing]);
  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, isRefreshing]);
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  return {
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
}
// Mobile viewport hook
export function useMobileViewport() {
  const { isMobile, windowSize } = useResponsive();
  useEffect(() => {
    if (!isMobile) return;
    // Set viewport meta tag for mobile
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    // Handle iOS safe area
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }
    // Prevent zoom on input focus (iOS)
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        target.style.fontSize = '16px';
      }
    };
    document.addEventListener('focusin', preventZoom);
    return () => document.removeEventListener('focusin', preventZoom);
  }, [isMobile]);
  return { windowSize };
}
// Mobile performance optimizations
export function useMobilePerformance() {
  const { isMobile } = useResponsive();
  useEffect(() => {
    if (!isMobile) return;
    // Enable hardware acceleration for smooth animations
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
      }
      /* Optimize scrolling */
      * {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      /* Reduce paint operations */
      .will-change-transform {
        will-change: transform;
      }
      .will-change-opacity {
        will-change: opacity;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isMobile]);
}
// Touch target optimization
export function getTouchTargetStyles(isMobile: boolean) {
  if (!isMobile) return {};
  return {
    minHeight: '44px',
    minWidth: '44px',
    padding: '8px',
    margin: '4px',
    // Ensure touch targets don't overlap
    position: 'relative' as const,
    zIndex: 1,
  };
}
// Mobile-optimized spacing
export function getMobileSpacing(isMobile: boolean) {
  return {
    xs: isMobile ? '4px' : '2px',
    sm: isMobile ? '8px' : '4px',
    md: isMobile ? '16px' : '12px',
    lg: isMobile ? '24px' : '16px',
    xl: isMobile ? '32px' : '24px',
  };
}
// Mobile-optimized font sizes
export function getMobileFontSizes(isMobile: boolean) {
  return {
    xs: isMobile ? '14px' : '12px',
    sm: isMobile ? '16px' : '14px',
    base: isMobile ? '18px' : '16px',
    lg: isMobile ? '20px' : '18px',
    xl: isMobile ? '24px' : '20px',
  };
}
// Main mobile optimizations hook
export function useMobileOptimizations() {
  const responsive = useResponsive();
  useMobileViewport();
  useMobilePerformance();
  return {
    ...responsive,
    getTouchTargetStyles: (isMobile: boolean) => getTouchTargetStyles(isMobile),
    getMobileSpacing: (isMobile: boolean) => getMobileSpacing(isMobile),
    getMobileFontSizes: (isMobile: boolean) => getMobileFontSizes(isMobile),
  };
}
export default useMobileOptimizations;
