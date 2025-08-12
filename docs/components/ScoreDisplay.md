# ScoreDisplay Component

A circular progress indicator component for displaying scores, percentages, and progress values with smooth animations and customizable styling.

## Import

```typescript
import { ScoreDisplay } from '../components/Analysis/ScoreDisplay';
```

## Basic Usage

```tsx
import { ScoreDisplay } from '../components/Analysis/ScoreDisplay';

function MyComponent() {
  return (
    <ScoreDisplay 
      score={85} 
      size="md"
      animated={true}
    />
  );
}
```

## Sizes

### Small
```tsx
<ScoreDisplay score={75} size="sm" />
```

### Medium (Default)
```tsx
<ScoreDisplay score={85} size="md" />
```

### Large
```tsx
<ScoreDisplay score={95} size="lg" />
```

### Extra Large
```tsx
<ScoreDisplay score={88} size="xl" />
```

## Score Ranges & Colors

The component automatically applies colors based on score ranges:

### Excellent (90-100)
```tsx
<ScoreDisplay score={95} /> {/* Green color */}
```

### Good (70-89)
```tsx
<ScoreDisplay score={80} /> {/* Blue color */}
```

### Fair (50-69)
```tsx
<ScoreDisplay score={60} /> {/* Yellow color */}
```

### Poor (0-49)
```tsx
<ScoreDisplay score={30} /> {/* Red color */}
```

## Animation Options

### Animated Progress
```tsx
<ScoreDisplay 
  score={85} 
  animated={true}
  animationDuration={1500}
/>
```

### Static Display
```tsx
<ScoreDisplay 
  score={85} 
  animated={false}
/>
```

### Custom Animation Delay
```tsx
<ScoreDisplay 
  score={85} 
  animated={true}
  animationDelay={500}
/>
```

## Tooltip Integration

### Basic Tooltip
```tsx
<ScoreDisplay 
  score={85} 
  showTooltip={true}
  tooltipContent="Code Quality Score: 85/100"
/>
```

### Custom Tooltip
```tsx
<ScoreDisplay 
  score={85} 
  showTooltip={true}
  tooltipContent={
    <div>
      <strong>Performance Score</strong>
      <br />
      85 out of 100 points
      <br />
      <em>Excellent performance!</em>
    </div>
  }
/>
```

## Custom Styling

### Custom Colors
```tsx
<ScoreDisplay 
  score={85}
  customColor="#6366f1" // Custom purple color
/>
```

### Custom Background
```tsx
<ScoreDisplay 
  score={85}
  backgroundColor="#f3f4f6"
  strokeWidth={8}
/>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `number` | **Required** | Score value (0-100) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size |
| `animated` | `boolean` | `true` | Enable animation |
| `animationDuration` | `number` | `1000` | Animation duration in ms |
| `animationDelay` | `number` | `0` | Animation delay in ms |
| `showTooltip` | `boolean` | `false` | Show tooltip on hover |
| `tooltipContent` | `React.ReactNode \| string` | - | Tooltip content |
| `customColor` | `string` | - | Custom progress color |
| `backgroundColor` | `string` | - | Custom background color |
| `strokeWidth` | `number` | `6` | Progress stroke width |
| `showValue` | `boolean` | `true` | Show numeric value |
| `suffix` | `string` | `'%'` | Value suffix |
| `className` | `string` | - | Additional CSS classes |

## Size Specifications

| Size | Diameter | Stroke Width | Font Size |
|------|----------|--------------|-----------|
| `sm` | 60px | 4px | 14px |
| `md` | 80px | 6px | 16px |
| `lg` | 120px | 8px | 20px |
| `xl` | 160px | 10px | 24px |

## Color Mapping

| Score Range | Color | Hex Code | Meaning |
|-------------|-------|----------|---------|
| 90-100 | Green | `#10b981` | Excellent |
| 70-89 | Blue | `#3b82f6` | Good |
| 50-69 | Yellow | `#f59e0b` | Fair |
| 0-49 | Red | `#ef4444` | Poor |

## Accessibility

### ARIA Support
```tsx
<ScoreDisplay 
  score={85}
  aria-label="Code quality score: 85 out of 100"
  role="progressbar"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

### Screen Reader Announcements
```tsx
<ScoreDisplay 
  score={85}
  announceValue={true} // Announces score changes
  announceText="Performance score updated to 85 percent"
/>
```

### Reduced Motion Support
The component respects `prefers-reduced-motion` settings:

```css
@media (prefers-reduced-motion: reduce) {
  .score-display {
    animation: none;
  }
}
```

## Examples

### Dashboard Metrics
```tsx
function DashboardMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="text-center">
        <ScoreDisplay 
          score={92} 
          size="lg"
          showTooltip={true}
          tooltipContent="Security Score: Excellent"
        />
        <h3 className="mt-2 font-medium">Security</h3>
      </div>
      
      <div className="text-center">
        <ScoreDisplay 
          score={78} 
          size="lg"
          showTooltip={true}
          tooltipContent="Performance Score: Good"
        />
        <h3 className="mt-2 font-medium">Performance</h3>
      </div>
      
      <div className="text-center">
        <ScoreDisplay 
          score={85} 
          size="lg"
          showTooltip={true}
          tooltipContent="Code Quality: Good"
        />
        <h3 className="mt-2 font-medium">Quality</h3>
      </div>
      
      <div className="text-center">
        <ScoreDisplay 
          score={96} 
          size="lg"
          showTooltip={true}
          tooltipContent="Test Coverage: Excellent"
        />
        <h3 className="mt-2 font-medium">Coverage</h3>
      </div>
    </div>
  );
}
```

### Progress Tracking
```tsx
function ProgressTracker() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100));
    }, 500);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-center">
      <ScoreDisplay 
        score={progress}
        size="xl"
        animated={true}
        suffix="%"
        showTooltip={true}
        tooltipContent={`Upload progress: ${progress}%`}
      />
      <p className="mt-4 text-gray-600">
        Uploading files... {progress}% complete
      </p>
    </div>
  );
}
```

### Comparison View
```tsx
function ScoreComparison() {
  return (
    <div className="flex justify-center items-center gap-8">
      <div className="text-center">
        <ScoreDisplay score={65} size="lg" />
        <p className="mt-2 text-sm text-gray-600">Before</p>
      </div>
      
      <div className="text-2xl text-gray-400">→</div>
      
      <div className="text-center">
        <ScoreDisplay 
          score={89} 
          size="lg"
          animationDelay={500}
        />
        <p className="mt-2 text-sm text-gray-600">After</p>
      </div>
    </div>
  );
}
```

## Styling

### CSS Custom Properties
```css
.score-display {
  --score-excellent: #10b981;
  --score-good: #3b82f6;
  --score-fair: #f59e0b;
  --score-poor: #ef4444;
  --score-background: #e5e7eb;
  --score-text: #374151;
}
```

### Dark Mode Support
```css
.dark .score-display {
  --score-background: #374151;
  --score-text: #f3f4f6;
}
```

## Performance

### Optimization Tips
- Use `React.memo` for static scores
- Debounce rapid score updates
- Consider using CSS animations for better performance

### Bundle Impact
- Base component: ~1.5KB gzipped
- With animations: ~2KB gzipped
- SVG-based for crisp rendering at any size

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './ScoreDisplay';

test('displays correct score value', () => {
  render(<ScoreDisplay score={85} />);
  expect(screen.getByText('85%')).toBeInTheDocument();
});

test('applies correct color for score range', () => {
  const { container } = render(<ScoreDisplay score={95} />);
  const circle = container.querySelector('circle');
  expect(circle).toHaveAttribute('stroke', '#10b981');
});
```

### Visual Testing
```tsx
// Storybook stories
export const AllSizes = () => (
  <div className="flex items-center gap-8">
    <ScoreDisplay score={85} size="sm" />
    <ScoreDisplay score={85} size="md" />
    <ScoreDisplay score={85} size="lg" />
    <ScoreDisplay score={85} size="xl" />
  </div>
);

export const AllScoreRanges = () => (
  <div className="flex items-center gap-8">
    <ScoreDisplay score={30} /> {/* Poor */}
    <ScoreDisplay score={60} /> {/* Fair */}
    <ScoreDisplay score={80} /> {/* Good */}
    <ScoreDisplay score={95} /> {/* Excellent */}
  </div>
);
```

## Related Components

- [ProgressIndicator](./ProgressIndicator.md) - For linear progress
- [Badge](./Badge.md) - For status indicators
- [Card](./Card.md) - For containing score displays
- [Tooltip](./Tooltip.md) - For additional context

---

**Last updated**: December 2024
