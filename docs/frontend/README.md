# Design System Documentation

A comprehensive, modern design system built with React, TypeScript, and Tailwind CSS, featuring professional animations, accessibility compliance, and cross-browser compatibility.

## 🎨 Overview

This design system provides a complete set of reusable components, utilities, and patterns for building modern web applications. It includes:

- **50+ React components** with TypeScript support
- **Comprehensive accessibility** (WCAG AA/AAA compliant)
- **Dark mode support** with smooth transitions
- **Professional animations** using Framer Motion
- **Mobile-first responsive design**
- **Cross-browser compatibility**
- **Performance optimized** with lazy loading and code splitting

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 📦 Component Categories

### Core UI Components
- [Button](./components/Button.md) - Primary, secondary, outline, and icon variants
- [Input](./components/Input.md) - Text inputs with validation and accessibility
- [Select](./components/Select.md) - Dropdown selectors with search and multi-select
- [Card](./components/Card.md) - Content containers with elevation and hover effects
- [Alert](./components/Alert.md) - Status messages with variants and actions
- [Badge](./components/Badge.md) - Status indicators and labels
- [Loading](./components/Loading.md) - Spinners, skeletons, and progress indicators
- [Modal](./components/Modal.md) - Dialogs and overlays with focus management

### Layout Components
- [Header](./components/Header.md) - Navigation header with responsive design
- [Sidebar](./components/Sidebar.md) - Navigation sidebar with collapsible menu
- [Layout](./components/Layout.md) - Main application layout with responsive grid

### Analysis Components
- [ScoreDisplay](./components/ScoreDisplay.md) - Circular progress indicators with animations
- [SuggestionCard](./components/SuggestionCard.md) - Code suggestions with syntax highlighting
- [UploadArea](./components/UploadArea.md) - Drag-and-drop file upload with progress

### Transition Components
- [PageTransition](./components/PageTransition.md) - Page-level animations and transitions
- [LoadingOverlay](./components/LoadingOverlay.md) - Full-screen loading states
- [ProgressIndicator](./components/ProgressIndicator.md) - Linear and circular progress bars

### Testing Components
- [VisualTestRunner](./components/VisualTestRunner.md) - Visual regression testing
- [AccessibilityTestRunner](./components/AccessibilityTestRunner.md) - WCAG compliance testing
- [PerformanceTestRunner](./components/PerformanceTestRunner.md) - Performance metrics testing
- [CrossBrowserTestRunner](./components/CrossBrowserTestRunner.md) - Browser compatibility testing

## 🎯 Design Principles

### 1. Accessibility First
- WCAG AA/AAA compliance
- Screen reader support
- Keyboard navigation
- Color contrast compliance
- Focus management

### 2. Performance Optimized
- Lazy loading components
- Code splitting
- Optimized animations (60fps)
- Bundle size optimization
- Memory leak prevention

### 3. Developer Experience
- TypeScript support
- Comprehensive prop documentation
- Usage examples
- Error boundaries
- Development tools

### 4. Design Consistency
- Unified color palette
- Consistent spacing scale
- Typography hierarchy
- Animation timing
- Component patterns

## 🌈 Theme System

### Color Palette
```typescript
// Primary Colors
primary: {
  50: '#eff6ff',
  500: '#3b82f6',
  600: '#2563eb',
  900: '#1e3a8a'
}

// Semantic Colors
success: '#10b981',
warning: '#f59e0b',
error: '#ef4444',
info: '#3b82f6'
```

### Typography Scale
```typescript
// Font Families
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace']
}

// Font Sizes
fontSize: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem' // 30px
}
```

### Spacing Scale
```typescript
spacing: {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem'      // 64px
}
```

## 🎭 Animation System

### Transition Timing
- **Micro-interactions**: 200ms
- **Component transitions**: 300ms
- **Page transitions**: 500ms
- **Loading states**: 1000ms+

### Easing Functions
```css
/* Standard easing */
cubic-bezier(0.4, 0.0, 0.2, 1)

/* Emphasized easing */
cubic-bezier(0.0, 0.0, 0.2, 1)

/* Decelerated easing */
cubic-bezier(0.0, 0.0, 0.2, 1)
```

## ♿ Accessibility Features

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and roles
- Live regions for dynamic content
- Skip navigation links
- Descriptive alt text

### Keyboard Navigation
- Tab order follows visual hierarchy
- Escape closes modals/dropdowns
- Enter submits forms
- Arrow keys navigate lists
- Focus trapping in modals

### Color & Contrast
- WCAG AA contrast ratios (4.5:1)
- AAA compliance for important actions (7:1)
- Color-blind friendly palette
- High contrast mode support

## 📱 Responsive Design

### Breakpoints
```typescript
breakpoints: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Mobile Optimizations
- Touch-friendly targets (44px minimum)
- Swipe gestures
- Pull-to-refresh
- Optimized animations
- Reduced motion support

## 🧪 Testing

### Visual Testing
- Component screenshots
- Cross-browser testing
- Responsive design validation
- Dark mode consistency

### Accessibility Testing
- WCAG compliance automation
- Screen reader testing
- Keyboard navigation validation
- Color contrast verification

### Performance Testing
- Core Web Vitals monitoring
- Bundle size analysis
- Animation performance
- Memory usage tracking

## 🔧 Development Tools

### Storybook Integration
```bash
# Start Storybook
npm run storybook
```

### Testing Suite
```bash
# Run visual tests
npm run test:visual

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
```

### Build Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for unused code
npm run unused

# Lint and format
npm run lint
npm run format
```

## 📈 Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB gzipped

### Optimization Techniques
- Code splitting by route
- Lazy loading components
- Image optimization
- CSS purging
- Tree shaking

## 🌐 Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Included
- CSS Custom Properties
- Intersection Observer
- ResizeObserver
- Fetch API

## 📚 Additional Resources

- [Component API Reference](./api/README.md)
- [Design Tokens](./tokens/README.md)
- [Migration Guide](./migration/README.md)
- [Contributing Guidelines](./contributing/README.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

Please read our [Contributing Guidelines](./contributing/README.md) before submitting pull requests.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Built with ❤️ by the Design System Team**
