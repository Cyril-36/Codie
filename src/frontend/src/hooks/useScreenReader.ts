import { useRef, useEffect, useCallback } from "react";

// Live region types for screen reader announcements
export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';
// Screen reader announcement hook
export function useScreenReaderAnnouncement() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('aria-relevant', 'text');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);
  const announce = useCallback((
    message: string, 
    politeness: LiveRegionPoliteness = 'polite'
  ) => {
    if (!liveRegionRef.current) return;
    // Update politeness level
    liveRegionRef.current.setAttribute('aria-live', politeness);
    // Clear and set new message
    liveRegionRef.current.textContent = '';
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);
  }, []);
  return { announce };
}
// ARIA attributes generator
export function generateAriaAttributes(config: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  role?: string;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  hidden?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  level?: number;
  setSize?: number;
  posInSet?: number;
  controls?: string;
  owns?: string;
  flowTo?: string;
  live?: LiveRegionPoliteness;
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}) {
  const attributes: Record<string, string | boolean | number> = {};
  if (config.label) attributes['aria-label'] = config.label;
  if (config.labelledBy) attributes['aria-labelledby'] = config.labelledBy;
  if (config.describedBy) attributes['aria-describedby'] = config.describedBy;
  if (config.role) attributes['role'] = config.role;
  if (config.expanded !== undefined) attributes['aria-expanded'] = config.expanded;
  if (config.selected !== undefined) attributes['aria-selected'] = config.selected;
  if (config.checked !== undefined) attributes['aria-checked'] = config.checked;
  if (config.disabled !== undefined) attributes['aria-disabled'] = config.disabled;
  if (config.required !== undefined) attributes['aria-required'] = config.required;
  if (config.invalid !== undefined) attributes['aria-invalid'] = config.invalid;
  if (config.hidden !== undefined) attributes['aria-hidden'] = config.hidden;
  if (config.current) attributes['aria-current'] = config.current;
  if (config.level) attributes['aria-level'] = config.level;
  if (config.setSize) attributes['aria-setsize'] = config.setSize;
  if (config.posInSet) attributes['aria-posinset'] = config.posInSet;
  if (config.controls) attributes['aria-controls'] = config.controls;
  if (config.owns) attributes['aria-owns'] = config.owns;
  if (config.flowTo) attributes['aria-flowto'] = config.flowTo;
  if (config.live) attributes['aria-live'] = config.live;
  if (config.atomic !== undefined) attributes['aria-atomic'] = config.atomic;
  if (config.relevant) attributes['aria-relevant'] = config.relevant;
  return attributes;
}
// Screen reader optimized component props
export interface ScreenReaderProps {
  // Basic ARIA
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'role'?: string;
  // State ARIA
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-hidden'?: boolean;
  // Navigation ARIA
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  // Relationship ARIA
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-flowto'?: string;
  // Live region ARIA
  'aria-live'?: LiveRegionPoliteness;
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
}
// Common ARIA patterns
export const ariaPatterns = {
  // Button patterns
  button: (label: string, expanded?: boolean) => ({
    role: 'button',
    'aria-label': label,
    'aria-expanded': expanded,
    tabIndex: 0,
  }),
  // Menu patterns
  menu: (label: string) => ({
    role: 'menu',
    'aria-label': label,
  }),
  menuItem: (label: string, selected?: boolean) => ({
    role: 'menuitem',
    'aria-label': label,
    'aria-selected': selected,
    tabIndex: -1,
  }),
  // Dialog patterns
  dialog: (labelledBy: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-modal': true,
  }),
  // Form patterns
  textbox: (label: string, required?: boolean, invalid?: boolean, describedBy?: string) => ({
    role: 'textbox',
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
  }),
  // List patterns
  list: (label: string) => ({
    role: 'list',
    'aria-label': label,
  }),
  listItem: (posInSet: number, setSize: number) => ({
    role: 'listitem',
    'aria-posinset': posInSet,
    'aria-setsize': setSize,
  }),
  // Tab patterns
  tabList: (label: string) => ({
    role: 'tablist',
    'aria-label': label,
  }),
  tab: (controls: string, selected?: boolean) => ({
    role: 'tab',
    'aria-controls': controls,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1,
  }),
  tabPanel: (labelledBy: string) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
    tabIndex: 0,
  }),
  // Grid patterns
  grid: (label: string, rowCount: number, colCount: number) => ({
    role: 'grid',
    'aria-label': label,
    'aria-rowcount': rowCount,
    'aria-colcount': colCount,
  }),
  gridCell: (rowIndex: number, colIndex: number) => ({
    role: 'gridcell',
    'aria-rowindex': rowIndex,
    'aria-colindex': colIndex,
  }),
  // Status and alert patterns
  status: (label: string) => ({
    role: 'status',
    'aria-label': label,
    'aria-live': 'polite' as const,
    'aria-atomic': true,
  }),
  alert: (label: string) => ({
    role: 'alert',
    'aria-label': label,
    'aria-live': 'assertive' as const,
    'aria-atomic': true,
  }),
  // Progress patterns
  progressbar: (label: string, value: number, max: number = 100) => ({
    role: 'progressbar',
    'aria-label': label,
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuetext': `${value} of ${max}`,
  }),
  // Navigation patterns
  navigation: (label: string) => ({
    role: 'navigation',
    'aria-label': label,
  }),
  breadcrumb: () => ({
    role: 'navigation',
    'aria-label': 'Breadcrumb',
  }),
  // Search patterns
  search: (label: string) => ({
    role: 'search',
    'aria-label': label,
  }),
  searchbox: (label: string, expanded?: boolean, controls?: string) => ({
    role: 'searchbox',
    'aria-label': label,
    'aria-expanded': expanded,
    'aria-controls': controls,
  }),
};
// Screen reader text utility
export function createScreenReaderText(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = text;
  span.className = 'sr-only';
  span.style.position = 'absolute';
  span.style.width = '1px';
  span.style.height = '1px';
  span.style.padding = '0';
  span.style.margin = '-1px';
  span.style.overflow = 'hidden';
  span.style.clip = 'rect(0, 0, 0, 0)';
  span.style.whiteSpace = 'nowrap';
  span.style.border = '0';
  return span;
}
// Loading state announcements
export function useLoadingAnnouncements() {
  const { announce } = useScreenReaderAnnouncement();
  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, 'polite');
  }, [announce]);
  const announceLoaded = useCallback((message: string = 'Content loaded') => {
    announce(message, 'polite');
  }, [announce]);
  const announceError = useCallback((message: string = 'An error occurred') => {
    announce(message, 'assertive');
  }, [announce]);
  return {
    announceLoading,
    announceLoaded,
    announceError,
  };
}
// Form validation announcements
export function useFormAnnouncements() {
  const { announce } = useScreenReaderAnnouncement();
  const announceValidation = useCallback((
    fieldName: string, 
    errors: string[]
  ) => {
    if (errors.length > 0) {
      const message = `${fieldName}: ${errors.join(', ')}`;
      announce(message, 'assertive');
    }
  }, [announce]);
  const announceSuccess = useCallback((message: string = 'Form submitted successfully') => {
    announce(message, 'polite');
  }, [announce]);
  return {
    announceValidation,
    announceSuccess,
  };
}
// Page navigation announcements
export function useNavigationAnnouncements() {
  const { announce } = useScreenReaderAnnouncement();
  const announcePageChange = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`, 'polite');
  }, [announce]);
  const announceRouteChange = useCallback((routeName: string) => {
    announce(`Page changed to ${routeName}`, 'polite');
  }, [announce]);
  return {
    announcePageChange,
    announceRouteChange,
  };
}
// Export all screen reader utilities
export default {
  useScreenReaderAnnouncement,
  generateAriaAttributes,
  ariaPatterns,
  createScreenReaderText,
  useLoadingAnnouncements,
  useFormAnnouncements,
  useNavigationAnnouncements,
};
