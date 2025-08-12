import { useTheme } from '../styles/theme';

/**
 * Theme Utilities
 * Helper functions for theme-aware styling and components
 */
// Theme-aware class name utilities
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
// Get theme-aware background classes
export function getThemeBackground(variant: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  const backgrounds = {
    primary: 'bg-white dark:bg-slate-900',
    secondary: 'bg-gray-50 dark:bg-slate-800', 
    tertiary: 'bg-gray-100 dark:bg-slate-700',
  };
  return backgrounds[variant];
}
// Get theme-aware text classes
export function getThemeText(variant: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  const textColors = {
    primary: 'text-gray-900 dark:text-slate-100',
    secondary: 'text-gray-700 dark:text-slate-300',
    tertiary: 'text-gray-500 dark:text-slate-400',
  };
  return textColors[variant];
}
// Get theme-aware border classes
export function getThemeBorder(variant: 'primary' | 'secondary' = 'primary'): string {
  const borders = {
    primary: 'border-gray-200 dark:border-slate-700',
    secondary: 'border-gray-300 dark:border-slate-600',
  };
  return borders[variant];
}
// Get theme-aware card classes
export function getThemeCard(elevated: boolean = false): string {
  const base = getThemeBackground('primary');
  const border = getThemeBorder('primary');
  const shadow = elevated ? 'shadow-lg dark:shadow-slate-900/20' : 'shadow-sm';
  return cn(base, border, 'border', 'rounded-xl', shadow);
}
// Get theme-aware button classes
export function getThemeButton(variant: 'primary' | 'secondary' | 'ghost' = 'primary'): string {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg',
    secondary: cn(
      getThemeBackground('primary'),
      getThemeText('primary'),
      getThemeBorder('primary'),
      'border hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm'
    ),
    ghost: cn(
      'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800',
      getThemeText('primary')
    ),
  };
  return variants[variant];
}
// Get theme-aware input classes
export function getThemeInput(hasError: boolean = false): string {
  const base = cn(
    getThemeBackground('primary'),
    getThemeText('primary'),
    'border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2'
  );
  if (hasError) {
    return cn(base, 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900');
  }
  return cn(
    base,
    getThemeBorder('primary'),
    'focus:border-primary-600 focus:ring-primary-100 dark:focus:ring-primary-900',
    'hover:border-gray-400 dark:hover:border-slate-500'
  );
}
// Get theme-aware sidebar classes
export function getThemeSidebar(): string {
  return cn(
    'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md',
    'border-gray-200 dark:border-slate-700'
  );
}
// Get theme-aware header classes
export function getThemeHeader(): string {
  return cn(
    'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md',
    'border-gray-200 dark:border-slate-700'
  );
}
// Get theme-aware navigation item classes
export function getThemeNavItem(isActive: boolean = false): string {
  const base = 'transition-all duration-200 rounded-lg';
  if (isActive) {
    return cn(
      base,
      'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400',
      'shadow-sm'
    );
  }
  return cn(
    base,
    getThemeText('primary'),
    'hover:bg-gray-100 dark:hover:bg-slate-700'
  );
}
// Get theme-aware modal classes
export function getThemeModal(): string {
  return cn(
    getThemeBackground('primary'),
    'border border-gray-200 dark:border-slate-700',
    'shadow-xl dark:shadow-slate-900/50'
  );
}
// Get theme-aware tooltip classes
export function getThemeTooltip(): string {
  return 'bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-100 border border-gray-700 dark:border-slate-600';
}
// Get theme-aware code block classes
export function getThemeCodeBlock(): string {
  return 'bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 border border-slate-700 dark:border-slate-800';
}
// Get theme-aware severity colors
export function getSeverityColors(severity: 'high' | 'medium' | 'low' | 'info') {
  const colors = {
    high: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
    },
    medium: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500',
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
    },
    info: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500',
    },
  };
  return colors[severity];
}
// Theme transition classes
export const THEME_TRANSITION = 'transition-colors duration-200 ease-in-out';
// Common theme-aware component combinations
export const themeClasses = {
  // Page container
  page: cn(
    getThemeBackground('secondary'),
    'min-h-screen transition-colors duration-200'
  ),
  // Content container
  container: 'max-w-7xl mx-auto px-6 md:px-12',
  // Section
  section: cn(
    getThemeCard(),
    'p-6 md:p-8'
  ),
  // Form group
  formGroup: 'space-y-2',
  // Button group
  buttonGroup: 'flex items-center gap-3',
  // Stats grid
  statsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  // List item
  listItem: cn(
    'flex items-center justify-between p-4 rounded-lg',
    getThemeBackground('primary'),
    getThemeBorder('primary'),
    'border hover:shadow-md transition-all duration-200'
  ),
};
// Hook for theme-aware styling
export function useThemeClasses() {
  const { isDark, isLight } = useTheme();
  return {
    isDark,
    isLight,
    getThemeBackground,
    getThemeText,
    getThemeBorder,
    getThemeCard,
    getThemeButton,
    getThemeInput,
    getThemeSidebar,
    getThemeHeader,
    getThemeNavItem,
    getThemeModal,
    getThemeTooltip,
    getThemeCodeBlock,
    getSeverityColors,
    themeClasses,
    cn,
  };
}
// CSS-in-JS theme object for styled-components or emotion
export const themeObject = {
  colors: {
    light: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
      },
      text: {
        primary: '#111827',
        secondary: '#374151',
        tertiary: '#6B7280',
      },
      border: {
        primary: '#E5E7EB',
        secondary: '#D1D5DB',
      },
    },
    dark: {
      background: {
        primary: '#0F172A',
        secondary: '#1E293B',
        tertiary: '#334155',
      },
      text: {
        primary: '#F1F5F9',
        secondary: '#CBD5E1',
        tertiary: '#94A3B8',
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
      },
    },
  },
  transitions: {
    fast: '200ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};
export default {
  useThemeClasses,
  themeClasses,
  themeObject,
  cn,
  getThemeBackground,
  getThemeText,
  getThemeBorder,
  getThemeCard,
  getThemeButton,
  getThemeInput,
  getSeverityColors,
  THEME_TRANSITION,
};
