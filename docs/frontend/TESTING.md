# Frontend QA Testing Suite

This document outlines the comprehensive testing strategy implemented for the frontend application, covering all aspects of quality assurance testing.

## 🎯 Testing Strategy Overview

Our testing approach follows a **pyramid strategy** with multiple layers of testing to ensure comprehensive coverage:

```
    🔴 E2E Tests (Few, Critical Paths)
         🔵 Integration Tests (API, Component Interaction)
              🟢 Unit Tests (Components, Functions)
```

## 🧪 Test Types

### 1. Unit Tests (`src/__tests__/components/`)
- **Purpose**: Test individual components in isolation
- **Coverage**: Component rendering, props, state changes, event handlers
- **Examples**: Button variants, form inputs, UI components
- **Tools**: React Testing Library, Vitest

### 2. Integration Tests (`src/__tests__/integration/`)
- **Purpose**: Test component interactions and API integration
- **Coverage**: File uploads, API calls, error handling, state persistence
- **Examples**: CodeEditor with API, form submissions, data flow
- **Tools**: React Testing Library, Vitest, Mocked APIs

### 3. Accessibility Tests (`src/__tests__/accessibility/`)
- **Purpose**: Ensure WCAG compliance and accessibility standards
- **Coverage**: ARIA attributes, keyboard navigation, screen reader support
- **Examples**: Button accessibility, form labels, focus management
- **Tools**: jest-axe, React Testing Library, Accessibility matchers

### 4. Performance Tests (`src/__tests__/performance/`)
- **Purpose**: Monitor component performance and optimization
- **Coverage**: Render performance, memory usage, animation performance
- **Examples**: Component render times, memory leaks, bundle optimization
- **Tools**: Performance API mocks, React Testing Library

### 5. Visual Regression Tests (`src/__tests__/visual/`)
- **Purpose**: Ensure UI consistency and visual stability
- **Coverage**: Component styling, layout consistency, responsive behavior
- **Examples**: Button variants, spacing consistency, color schemes
- **Tools**: Canvas mocks, Style testing, Responsive mocks

### 6. Cross-Browser Tests (`src/__tests__/cross-browser/`)
- **Purpose**: Ensure compatibility across different browsers
- **Coverage**: Feature detection, fallback behavior, browser-specific APIs
- **Examples**: CSS feature support, JavaScript compatibility, API fallbacks
- **Tools**: Browser mocks, Feature detection, User agent simulation

## 🚀 Running Tests

### Quick Start
```bash
# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:accessibility # Accessibility tests only
pnpm test:performance   # Performance tests only
pnpm test:visual        # Visual regression tests only
pnpm test:cross-browser # Cross-browser tests only
```

### Development Mode
```bash
# Watch mode for development
pnpm test:watch

# Debug mode with breakpoints
pnpm test:debug

# UI mode for interactive testing
pnpm test:ui
```

### Coverage and Analysis
```bash
# Generate coverage report
pnpm test:coverage

# Analyze bundle size
pnpm analyze
```

## 🛠️ Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    css: true,
  },
})
```

### Test Setup (`src/test-setup.ts`)
Global test configuration including:
- Browser API mocks (IntersectionObserver, ResizeObserver, etc.)
- Custom Jest matchers
- Global test utilities
- Test timeouts and cleanup

## 📁 Test File Structure

```
src/__tests__/
├── components/           # Unit tests for UI components
│   ├── Button.test.tsx
│   └── ScoreDisplay.test.tsx
├── integration/          # Integration tests
│   └── CodeEditor.test.tsx
├── accessibility/        # Accessibility tests
│   └── Accessibility.test.tsx
├── performance/          # Performance tests
│   └── Performance.test.tsx
├── visual/              # Visual regression tests
│   └── VisualRegression.test.tsx
├── cross-browser/       # Cross-browser tests
│   └── CrossBrowser.test.tsx
└── Home.test.tsx        # Page-level tests
```

## 🔧 Test Utilities

### Global Test Utilities
```typescript
// Available in all test files
global.testUtils = {
  mockApiResponse: (data: any, status = 200) => ({ /* ... */ }),
  createMockElement: (tagName: string, attributes: Record<string, string> = {}) => { /* ... */ },
  waitForElementToBeRemoved: (element: Element) => { /* ... */ },
};
```

### Custom Matchers
```typescript
// Accessibility matchers
expect(element).toHaveAccessibleName('Button Label');
expect(element).toBeVisible();

// Component matchers
expect(component).toHaveProps({ variant: 'primary' });
expect(component).toHaveTextContent('Button Text');
```

## 📊 Test Coverage Goals

| Test Type | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Unit Tests | 90%+ | 🟡 In Progress |
| Integration Tests | 80%+ | 🟡 In Progress |
| Accessibility Tests | 95%+ | 🟡 In Progress |
| Performance Tests | 70%+ | 🟡 In Progress |
| Visual Tests | 85%+ | 🟡 In Progress |
| Cross-Browser Tests | 80%+ | 🟡 In Progress |

## 🧪 Writing Tests

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '../ui/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CodeEditor from '../CodeEditor';
import * as api from '../services/api';

vi.mock('../services/api');

describe('CodeEditor Integration', () => {
  it('handles file upload and analysis', async () => {
    const mockResponse = { score: 85, suggestions: [] };
    vi.mocked(api.analyzeCode).mockResolvedValue(mockResponse);

    render(<CodeEditor />);
    
    // Test file upload and API interaction
    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    });
  });
});
```

## 🚨 Common Testing Patterns

### Mocking APIs
```typescript
// Mock entire service
vi.mock('../services/api');

// Mock specific functions
vi.mocked(api.analyzeCode).mockResolvedValue(mockData);
```

### Testing Async Operations
```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});

// Test loading states
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### Testing User Interactions
```typescript
// Click events
fireEvent.click(screen.getByRole('button'));

// Form inputs
fireEvent.change(screen.getByLabelText('Email'), {
  target: { value: 'test@example.com' }
});

// Keyboard navigation
fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
```

## 🔍 Debugging Tests

### Debug Mode
```bash
pnpm test:debug
```

### Console Logging
```typescript
// In tests, use screen.debug() to see DOM structure
screen.debug();

// Or debug specific elements
screen.debug(screen.getByRole('button'));
```

### Test Isolation
```typescript
// Use beforeEach/afterEach for cleanup
beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

## 📈 Continuous Integration

### GitHub Actions
Tests are automatically run on:
- Pull requests
- Push to main branch
- Scheduled runs

### Pre-commit Hooks
```bash
# Run tests before commit
pnpm test:unit
pnpm lint
pnpm type-check
```

## 🎯 Best Practices

### Test Organization
1. **Arrange**: Set up test data and mocks
2. **Act**: Perform the action being tested
3. **Assert**: Verify the expected outcome

### Test Naming
- Use descriptive test names
- Follow the pattern: "should [expected behavior] when [condition]"
- Example: "should show error message when API fails"

### Test Isolation
- Each test should be independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Avoid shared state between tests

### Accessibility Testing
- Test with screen readers in mind
- Verify keyboard navigation
- Check ARIA attributes and labels

## 🐛 Troubleshooting

### Common Issues

#### Test Environment Issues
```bash
# Clear test cache
pnpm test --clearCache

# Reset node_modules
rm -rf node_modules && pnpm install
```

#### Mock Issues
```typescript
// Ensure mocks are properly set up
vi.mock('../services/api', () => ({
  analyzeCode: vi.fn(),
}));
```

#### Async Test Issues
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Accessibility Testing with jest-axe](https://github.com/nickcolley/jest-axe)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Ensure proper test coverage
3. Add appropriate mocks and setup
4. Test both success and failure scenarios
5. Include accessibility considerations

## 📊 Test Reports

After running tests, you can find:
- Coverage reports in `coverage/` directory
- Test results in console output
- Detailed logs for debugging

---

**Remember**: Good tests are like good documentation - they help developers understand how the code should work and catch regressions before they reach production.
