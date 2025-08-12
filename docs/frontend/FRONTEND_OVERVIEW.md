# Modern Design System

A comprehensive, production-ready design system built with React, TypeScript, and Tailwind CSS. Features professional animations, accessibility compliance, and comprehensive testing suite.

## 🚀 Features

### 🎨 **Complete Design System**
- **50+ React components** with TypeScript support
- **Consistent design tokens** for colors, typography, and spacing
- **Dark mode support** with smooth transitions
- **Professional animations** using Framer Motion
- **Mobile-first responsive design**

### ♿ **Accessibility First**
- **WCAG AA/AAA compliant** components
- **Screen reader support** with proper ARIA labels
- **Keyboard navigation** throughout the application
- **Color contrast compliance** with automated testing
- **Focus management** and visual indicators

### 🧪 **Comprehensive Testing**
- **Visual regression testing** for component consistency
- **Accessibility testing** with WCAG compliance checks
- **Performance testing** with Core Web Vitals monitoring
- **Cross-browser compatibility** testing and feature detection
- **Automated test suites** with detailed reporting

### ⚡ **Performance Optimized**
- **Bundle size optimization** with code splitting
- **Lazy loading** components and routes
- **60fps animations** with GPU acceleration
- **Memory leak prevention** and cleanup
- **Core Web Vitals** monitoring and optimization

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript checks
npm run cleanup         # Run automated cleanup

# Testing
npm run test            # Run unit tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Analysis
npm run analyze         # Analyze bundle size
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Core UI components
│   ├── Analysis/       # Analysis-specific components
│   ├── Transitions/    # Animation components
│   └── Testing/        # Testing utilities
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API services
├── pages/              # Page components
└── types/              # TypeScript definitions

docs/                   # Documentation
├── components/         # Component documentation
├── api/               # API reference
└── README.md          # Main documentation

scripts/               # Build and utility scripts
```

## 🎨 Component Usage

### Basic Components

```tsx
import { Button, Input, Card, Alert } from './components/ui';

function MyComponent() {
  return (
    <Card>
      <Alert variant="success">
        Welcome to the design system!
      </Alert>
      
      <Input 
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      
      <Button variant="primary" size="lg">
        Get Started
      </Button>
    </Card>
  );
}
```

### Advanced Components

```tsx
import { ScoreDisplay, PageTransition, LoadingOverlay } from './components';

function Dashboard() {
  return (
    <PageTransition type="fade">
      <LoadingOverlay isLoading={loading}>
        <div className="grid grid-cols-3 gap-6">
          <ScoreDisplay 
            score={85} 
            size="lg"
            animated={true}
            showTooltip={true}
          />
        </div>
      </LoadingOverlay>
    </PageTransition>
  );
}
```

## 🎯 Design Tokens

### Colors
```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
```

### Typography
```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', Consolas, monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
```

### Spacing
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
```

## 🧪 Testing

### Running Tests

```bash
# Visual Testing
npm run test:visual

# Accessibility Testing
npm run test:a11y

# Performance Testing
npm run test:performance

# Cross-browser Testing
npm run test:browser
```

### Test Coverage

The project maintains high test coverage across:
- **Component rendering** and behavior
- **Accessibility compliance** (WCAG AA/AAA)
- **Performance metrics** (Core Web Vitals)
- **Cross-browser compatibility**
- **Visual regression** testing

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Usage
```tsx
// Responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>

// Responsive hook
const { isMobile, isTablet, isDesktop } = useResponsive();
```

## ♿ Accessibility

### WCAG Compliance
- **Level AA** compliance for all components
- **Level AAA** compliance for critical interactions
- **Color contrast** ratios meet or exceed standards
- **Keyboard navigation** throughout the application

### Screen Reader Support
```tsx
// Proper ARIA labeling
<Button aria-label="Close dialog" onClick={handleClose}>
  <CloseIcon />
</Button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## 🌐 Browser Support

### Supported Browsers
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Polyfills Included
- CSS Custom Properties
- Intersection Observer
- ResizeObserver
- Fetch API

## 🚀 Performance

### Optimization Features
- **Code splitting** by route and component
- **Lazy loading** for non-critical components
- **Image optimization** with responsive images
- **Bundle analysis** and size monitoring
- **Memory leak prevention**

### Core Web Vitals Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## 📚 Documentation

### Component Documentation
- [Button](./docs/components/Button.md)
- [ScoreDisplay](./docs/components/ScoreDisplay.md)
- [PageTransition](./docs/components/PageTransition.md)
- [API Reference](./docs/api/README.md)

### Guides
- [Getting Started](./docs/getting-started.md)
- [Theming Guide](./docs/theming.md)
- [Testing Guide](./docs/testing.md)
- [Performance Guide](./docs/performance.md)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Run** tests and linting
5. **Submit** a pull request

### Development Guidelines
- Follow **TypeScript** best practices
- Maintain **accessibility** standards
- Write **comprehensive tests**
- Update **documentation**
- Follow **commit conventions**

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Framer Motion** for smooth animations
- **TypeScript** for type safety
- **Vite** for fast development experience

---

**Built with ❤️ for modern web development**
