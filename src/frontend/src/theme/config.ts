/**
 * Design System Theme Configuration
 * Complete theme object with all design tokens
 */
export const theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // primary-light
      600: '#2563eb', // primary (main)
      700: '#1d4ed8',
      800: '#1e40af', // primary-dark
      900: '#1e3a8a',
    },
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Semantic Colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    // Code Editor Colors
    editor: {
      background: '#1e293b',
      text: '#e2e8f0',
      keyword: '#7dd3fc',
      string: '#86efac',
      comment: '#64748b',
      function: '#a78bfa',
      number: '#fbbf24',
    },
    // Theme-specific colors
    background: {
      primary: 'var(--color-bg-primary)',
      secondary: 'var(--color-bg-secondary)',
      tertiary: 'var(--color-bg-tertiary)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)',
    },
    border: {
      primary: 'var(--color-border-primary)',
      secondary: 'var(--color-border-secondary)',
    },
  },
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  // Spacing Scale (4px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    none: 'none',
  },
  // Transitions
  transitionDuration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  transitionTimingFunction: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Component Sizes
  components: {
    button: {
      height: '2.5rem',     // 40px
      heightSm: '2rem',     // 32px
      heightLg: '3rem',     // 48px
      paddingX: '1.5rem',   // 24px
      paddingXSm: '1rem',   // 16px
      paddingXLg: '2rem',   // 32px
    },
    input: {
      height: '2.5rem',     // 40px
      paddingX: '1rem',     // 16px
      paddingY: '0.75rem',  // 12px
    },
    card: {
      padding: '1.5rem',    // 24px
      paddingSm: '1rem',    // 16px
      paddingLg: '2rem',    // 32px
    },
  },
  // Layout
  layout: {
    containerMaxWidth: '80rem',    // 1280px
    sidebarWidth: '16rem',         // 256px
    headerHeight: '4rem',          // 64px
    headerHeightMobile: '3.5rem',  // 56px
  },
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;
// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeFontSize = typeof theme.typography.fontSize;
// Helper functions
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = theme.colors;
  for (const key of keys) {
    value = value?.[key];
  }
  return value || path;
};
export const getSpacing = (key: keyof typeof theme.spacing) => {
  return theme.spacing[key];
};
export const getFontSize = (key: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[key];
};
// Export default theme
export default theme;
