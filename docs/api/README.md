# API Reference

Complete API documentation for all components, hooks, and utilities in the design system.

## Components

### Core UI Components

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
  children: React.ReactNode;
  onClick?: (event: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

#### Input
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  className?: string;
}
```

#### Select
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
  className?: string;
}
```

#### Card
```typescript
interface CardProps {
  elevation?: 1 | 2 | 3;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

#### Alert
```typescript
interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}
```

#### Badge
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

### Analysis Components

#### ScoreDisplay
```typescript
interface ScoreDisplayProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode | string;
  customColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  showValue?: boolean;
  suffix?: string;
  className?: string;
}
```

#### SuggestionCard
```typescript
interface SuggestionCardProps {
  title: string;
  description: string;
  code?: string;
  language?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  onApply?: () => void;
  onDismiss?: () => void;
  className?: string;
}
```

#### UploadArea
```typescript
interface UploadAreaProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
  loading?: boolean;
  progress?: number;
  error?: string;
  className?: string;
}
```

### Transition Components

#### PageTransition
```typescript
interface PageTransitionProps {
  type?: 'fade' | 'slide' | 'scale' | 'blur';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}
```

#### LoadingOverlay
```typescript
interface LoadingOverlayProps {
  isLoading: boolean;
  type?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  progress?: number;
  backdrop?: boolean;
  className?: string;
}
```

#### ProgressIndicator
```typescript
interface ProgressIndicatorProps {
  value: number;
  max?: number;
  variant?: 'linear' | 'circular';
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showValue?: boolean;
  className?: string;
}
```

### Layout Components

#### Header
```typescript
interface HeaderProps {
  title?: string;
  logo?: React.ReactNode;
  navigation?: NavigationItem[];
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
}
```

#### Sidebar
```typescript
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
  children?: SidebarItem[];
}
```

## Hooks

### useResponsive
```typescript
interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
}

function useResponsive(): ResponsiveValues;
```

### useScreenReader
```typescript
interface ScreenReaderHook {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isScreenReaderActive: boolean;
}

function useScreenReaderAnnouncement(): ScreenReaderHook;

// ARIA patterns utility
const ariaPatterns = {
  button: (label: string) => ({
    'aria-label': label,
    role: 'button'
  }),
  textbox: (label: string) => ({
    'aria-label': label,
    role: 'textbox'
  }),
  navigation: (label: string) => ({
    'aria-label': label,
    role: 'navigation'
  })
};
```

### useTheme
```typescript
interface ThemeHook {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

function useTheme(): ThemeHook;
```

### useLocalStorage
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void];
```

## Utilities

### Testing Utilities

#### Visual Testing
```typescript
interface VisualTestResult {
  scenario: string;
  component: string;
  state: string;
  breakpoint: string;
  theme: string;
  passed: boolean;
  issues?: string[];
  screenshot?: string;
}

class VisualTester {
  testScenario(scenario: TestScenario): Promise<VisualTestResult[]>;
  generateReport(): TestReport;
  clearResults(): void;
}
```

#### Accessibility Testing
```typescript
interface AccessibilityTestResult {
  rule: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  category: 'color' | 'keyboard' | 'screen-reader' | 'focus' | 'structure';
  passed: boolean;
  element?: string;
  issue?: string;
  suggestion?: string;
}

class AccessibilityTester {
  runTests(element?: HTMLElement): Promise<AccessibilityTestResult[]>;
  generateReport(): AccessibilityReport;
  clearResults(): void;
}
```

#### Performance Testing
```typescript
interface PerformanceTestResult {
  metric: string;
  value: number;
  threshold: number;
  unit: string;
  passed: boolean;
  score: number; // 0-100
  category: 'loading' | 'interactivity' | 'visual-stability' | 'custom';
  description: string;
  suggestion?: string;
}

class PerformanceTester {
  runPerformanceTests(): Promise<PerformanceTestResult[]>;
  generateReport(results: PerformanceTestResult[]): PerformanceReport;
  cleanup(): void;
}
```

#### Cross-browser Testing
```typescript
interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  supported: boolean;
}

interface CrossBrowserTestResult {
  browser: BrowserInfo;
  features: FeatureSupport[];
  cssSupport: Record<string, boolean>;
  jsSupport: Record<string, boolean>;
  overallCompatibility: number; // 0-100
  issues: string[];
  recommendations: string[];
}

class CrossBrowserTester {
  static runTests(): Promise<CrossBrowserTestResult>;
  static getBrowserMatrix(): Record<string, { minVersion: number; supported: boolean }>;
  static meetsMinimumRequirements(): boolean;
}
```

## Type Definitions

### Common Types
```typescript
// Size variants
type Size = 'sm' | 'md' | 'lg' | 'xl';

// Color variants
type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// Theme
type Theme = 'light' | 'dark' | 'system';

// Breakpoints
type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

// Animation types
type AnimationType = 'fade' | 'slide' | 'scale' | 'blur';

// Direction
type Direction = 'up' | 'down' | 'left' | 'right';
```

### Event Handlers
```typescript
type ClickHandler = (event: MouseEvent<HTMLElement>) => void;
type ChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
type FocusHandler = (event: FocusEvent<HTMLElement>) => void;
type KeyboardHandler = (event: KeyboardEvent<HTMLElement>) => void;
```

### Component Refs
```typescript
// Button ref
type ButtonRef = HTMLButtonElement;

// Input ref
type InputRef = HTMLInputElement;

// Card ref
type CardRef = HTMLDivElement;
```

## Constants

### Breakpoints
```typescript
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1280,
  xlarge: 1536
} as const;
```

### Colors
```typescript
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  }
} as const;
```

### Animation Durations
```typescript
export const DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  loading: 1000
} as const;
```

---

**Last updated**: December 2024
