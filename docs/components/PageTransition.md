# PageTransition Component

A comprehensive page transition system providing smooth animations between routes and loading states with professional motion design.

## Import

```typescript
import { PageTransition, LoadingOverlay, ProgressIndicator } from '../components/Transitions/PageTransition';
```

## Basic Usage

### Page Transitions
```tsx
import { PageTransition } from '../components/Transitions/PageTransition';

function MyPage() {
  return (
    <PageTransition type="fade">
      <div>
        <h1>Page Content</h1>
        <p>This content will fade in smoothly</p>
      </div>
    </PageTransition>
  );
}
```

## Transition Types

### Fade Transition
```tsx
<PageTransition type="fade">
  <YourPageContent />
</PageTransition>
```

### Slide Transition
```tsx
<PageTransition type="slide" direction="right">
  <YourPageContent />
</PageTransition>
```

### Scale Transition
```tsx
<PageTransition type="scale">
  <YourPageContent />
</PageTransition>
```

### Blur Transition
```tsx
<PageTransition type="blur">
  <YourPageContent />
</PageTransition>
```

## Loading Overlay

### Basic Loading Overlay
```tsx
import { LoadingOverlay } from '../components/Transitions/PageTransition';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <LoadingOverlay 
        isLoading={isLoading}
        message="Loading your data..."
      />
      <YourContent />
    </div>
  );
}
```

### Loading Types
```tsx
// Spinner loading
<LoadingOverlay 
  isLoading={true}
  type="spinner"
  message="Processing..."
/>

// Skeleton loading
<LoadingOverlay 
  isLoading={true}
  type="skeleton"
  message="Loading content..."
/>

// Progress loading
<LoadingOverlay 
  isLoading={true}
  type="progress"
  progress={65}
  message="Uploading files... 65%"
/>
```

## Progress Indicator

### Linear Progress
```tsx
import { ProgressIndicator } from '../components/Transitions/PageTransition';

<ProgressIndicator
  value={75}
  max={100}
  variant="linear"
  color="primary"
  animated={true}
/>
```

### Circular Progress
```tsx
<ProgressIndicator
  value={60}
  max={100}
  variant="circular"
  color="success"
  size="lg"
/>
```

## Props API

### PageTransition Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'fade' \| 'slide' \| 'scale' \| 'blur'` | `'fade'` | Transition animation type |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` | Slide direction (for slide type) |
| `duration` | `number` | `300` | Animation duration in ms |
| `delay` | `number` | `0` | Animation delay in ms |
| `children` | `React.ReactNode` | **Required** | Page content |
| `className` | `string` | - | Additional CSS classes |

### LoadingOverlay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | **Required** | Show/hide loading overlay |
| `type` | `'spinner' \| 'skeleton' \| 'progress'` | `'spinner'` | Loading animation type |
| `message` | `string` | `'Loading...'` | Loading message |
| `progress` | `number` | - | Progress value (0-100) for progress type |
| `backdrop` | `boolean` | `true` | Show backdrop blur |
| `className` | `string` | - | Additional CSS classes |

### ProgressIndicator Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **Required** | Current progress value |
| `max` | `number` | `100` | Maximum progress value |
| `variant` | `'linear' \| 'circular'` | `'linear'` | Progress bar style |
| `color` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Progress color |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `animated` | `boolean` | `true` | Enable animations |
| `showValue` | `boolean` | `false` | Show percentage text |
| `className` | `string` | - | Additional CSS classes |

## Animation Specifications

### Transition Timing
```typescript
const transitionTimings = {
  fast: 200,      // Quick micro-interactions
  normal: 300,    // Standard page transitions
  slow: 500,      // Complex animations
  loading: 1000   // Loading states
};
```

### Easing Functions
```typescript
const easingFunctions = {
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};
```

## Advanced Usage

### Route Transitions with React Router
```tsx
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition 
        key={location.pathname}
        type="slide"
        direction="right"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}
```

### Custom Loading States
```tsx
function DataFetcher() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fetchData = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Actual data fetching
      const data = await api.fetchData();
      return data;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <LoadingOverlay
        isLoading={loading}
        type="progress"
        progress={progress}
        message={`Loading data... ${progress}%`}
      />
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}
```

### Staggered Animations
```tsx
function StaggeredContent() {
  return (
    <PageTransition type="fade">
      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.content}
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
```

## Accessibility

### Reduced Motion Support
```tsx
<PageTransition 
  type="fade"
  respectReducedMotion={true} // Disables animations if user prefers reduced motion
>
  <YourContent />
</PageTransition>
```

### Screen Reader Announcements
```tsx
<LoadingOverlay
  isLoading={loading}
  message="Loading your dashboard data"
  announceToScreenReader={true}
  aria-live="polite"
/>
```

### Focus Management
```tsx
<PageTransition 
  type="fade"
  onAnimationComplete={() => {
    // Focus first heading after transition
    document.querySelector('h1')?.focus();
  }}
>
  <YourContent />
</PageTransition>
```

## Performance Optimization

### Lazy Loading with Transitions
```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense 
      fallback={
        <LoadingOverlay 
          isLoading={true}
          type="skeleton"
          message="Loading component..."
        />
      }
    >
      <PageTransition type="fade">
        <LazyComponent />
      </PageTransition>
    </Suspense>
  );
}
```

### GPU Acceleration
The component automatically uses GPU-accelerated properties:
- `transform` instead of changing `left/top`
- `opacity` for fade effects
- `will-change` optimization

## Examples

### Dashboard Page Transition
```tsx
function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('overview')}>Overview</button>
        <button onClick={() => setActiveTab('analytics')}>Analytics</button>
      </nav>
      
      <AnimatePresence mode="wait">
        <PageTransition 
          key={activeTab}
          type="slide"
          direction="left"
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </PageTransition>
      </AnimatePresence>
    </div>
  );
}
```

### Form Submission with Progress
```tsx
function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setProgress(0);
    
    try {
      // Simulate form submission steps
      setProgress(25); // Validating
      await validateForm(formData);
      
      setProgress(50); // Sending
      await sendForm(formData);
      
      setProgress(75); // Processing
      await processResponse();
      
      setProgress(100); // Complete
      
      // Show success transition
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <LoadingOverlay
        isLoading={submitting}
        type="progress"
        progress={progress}
        message={getProgressMessage(progress)}
      />
      
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </div>
  );
}
```

## Styling

### CSS Custom Properties
```css
:root {
  --transition-duration-fast: 200ms;
  --transition-duration-normal: 300ms;
  --transition-duration-slow: 500ms;
  --transition-easing: cubic-bezier(0.4, 0.0, 0.2, 1);
  --loading-backdrop: rgba(0, 0, 0, 0.5);
  --loading-blur: 8px;
}
```

### Dark Mode Support
```css
.dark {
  --loading-backdrop: rgba(0, 0, 0, 0.7);
  --progress-bg: #374151;
  --progress-fill: #3b82f6;
}
```

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { PageTransition } from './PageTransition';

test('renders children after transition', async () => {
  render(
    <PageTransition type="fade">
      <div>Test content</div>
    </PageTransition>
  );
  
  expect(screen.getByText('Test content')).toBeInTheDocument();
});
```

### Visual Testing
```tsx
// Storybook stories
export const AllTransitionTypes = () => (
  <div className="space-y-8">
    <PageTransition type="fade">
      <div className="p-4 bg-blue-100">Fade Transition</div>
    </PageTransition>
    
    <PageTransition type="slide" direction="right">
      <div className="p-4 bg-green-100">Slide Transition</div>
    </PageTransition>
    
    <PageTransition type="scale">
      <div className="p-4 bg-purple-100">Scale Transition</div>
    </PageTransition>
  </div>
);
```

## Related Components

- [Button](./Button.md) - For triggering transitions
- [Modal](./Modal.md) - For overlay transitions
- [Card](./Card.md) - For content containers
- [Loading](./Loading.md) - For loading states

---

**Last updated**: December 2024
