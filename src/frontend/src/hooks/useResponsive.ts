import { useState, useEffect, useCallback } from "react";

// Breakpoint definitions matching design system
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type BreakpointValue = typeof BREAKPOINTS[Breakpoint];
// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';
// Window dimensions interface
export interface WindowDimensions {
  width: number;
  height: number;
}
// Responsive state interface
export interface ResponsiveState {
  // Window dimensions
  windowSize: WindowDimensions;
  // Current breakpoint
  breakpoint: Breakpoint;
  // Device type
  deviceType: DeviceType;
  // Orientation
  orientation: Orientation;
  // Breakpoint checks
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  // Device checks
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  // Orientation checks
  isPortrait: boolean;
  isLandscape: boolean;
  // Touch device detection
  isTouchDevice: boolean;
  // Utility functions
  isBreakpoint: (bp: Breakpoint) => boolean;
  isAboveBreakpoint: (bp: Breakpoint) => boolean;
  isBelowBreakpoint: (bp: Breakpoint) => boolean;
}
// Detect if device supports touch
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}
// Get current breakpoint based on width
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  return 'sm';
}
// Get device type based on width and touch capability
function getDeviceType(width: number, isTouchDevice: boolean): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg || (isTouchDevice && width < BREAKPOINTS.xl)) return 'tablet';
  return 'desktop';
}
// Get orientation based on dimensions
function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}
// Main responsive hook
export function useResponsive(): ResponsiveState {
  // Initialize state
  const [windowSize, setWindowSize] = useState<WindowDimensions>(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }; // Default for SSR
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });
  const [isTouchDevice, setIsTouchDevice] = useState(() => detectTouchDevice());
  // Update window size
  const updateSize = useCallback(() => {
    if (typeof window === 'undefined') return;
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Update touch device detection
    setIsTouchDevice(detectTouchDevice());
    // Add resize listener
    window.addEventListener('resize', updateSize);
    // Add orientation change listener
    window.addEventListener('orientationchange', updateSize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [updateSize]);
  // Calculate derived values
  const breakpoint = getCurrentBreakpoint(windowSize.width);
  const deviceType = getDeviceType(windowSize.width, isTouchDevice);
  const orientation = getOrientation(windowSize.width, windowSize.height);
  // Breakpoint checks
  const isSm = breakpoint === 'sm';
  const isMd = breakpoint === 'md';
  const isLg = breakpoint === 'lg';
  const isXl = breakpoint === 'xl';
  const is2xl = breakpoint === '2xl';
  // Device checks
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  // Orientation checks
  const isPortrait = orientation === 'portrait';
  const isLandscape = orientation === 'landscape';
  // Utility functions
  const isBreakpoint = useCallback((bp: Breakpoint): boolean => {
    return breakpoint === bp;
  }, [breakpoint]);
  const isAboveBreakpoint = useCallback((bp: Breakpoint): boolean => {
    return windowSize.width >= BREAKPOINTS[bp];
  }, [windowSize.width]);
  const isBelowBreakpoint = useCallback((bp: Breakpoint): boolean => {
    return windowSize.width < BREAKPOINTS[bp];
  }, [windowSize.width]);
  return {
    windowSize,
    breakpoint,
    deviceType,
    orientation,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    isTouchDevice,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
  };
}
// Hook for specific breakpoint
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { isBreakpoint } = useResponsive();
  return isBreakpoint(breakpoint);
}
// Hook for above breakpoint
export function useAboveBreakpoint(breakpoint: Breakpoint): boolean {
  const { isAboveBreakpoint } = useResponsive();
  return isAboveBreakpoint(breakpoint);
}
// Hook for below breakpoint
export function useBelowBreakpoint(breakpoint: Breakpoint): boolean {
  const { isBelowBreakpoint } = useResponsive();
  return isBelowBreakpoint(breakpoint);
}
// Hook for device type
export function useDeviceType(): DeviceType {
  const { deviceType } = useResponsive();
  return deviceType;
}
// Hook for orientation
export function useOrientation(): Orientation {
  const { orientation } = useResponsive();
  return orientation;
}
// Hook for touch device detection
export function useTouchDevice(): boolean {
  const { isTouchDevice } = useResponsive();
  return isTouchDevice;
}
// Hook for window dimensions
export function useWindowSize(): WindowDimensions {
  const { windowSize } = useResponsive();
  return windowSize;
}
// Media query hook (for CSS-in-JS)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);
  return matches;
}
// Responsive value hook - returns different values based on breakpoint
export function useResponsiveValue<T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T {
  const { breakpoint } = useResponsive();
  // Return the value for current breakpoint or fall back to smaller breakpoints
  if (breakpoint === '2xl' && values['2xl'] !== undefined) return values['2xl'];
  if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (breakpoint === 'md' && values.md !== undefined) return values.md;
  if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
  return values.default;
}
// Responsive classes hook - returns different classes based on breakpoint
export function useResponsiveClasses(classes: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  default: string;
}): string {
  return useResponsiveValue(classes);
}
// Export utilities
export const responsiveUtils = {
  BREAKPOINTS,
  getCurrentBreakpoint,
  getDeviceType,
  getOrientation,
  detectTouchDevice,
};
export default useResponsive;
