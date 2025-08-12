# Button Component

A versatile button component with multiple variants, sizes, and states. Supports loading states, icons, and accessibility features.

## Import

```typescript
import Button from '../components/ui/Button';
```

## Basic Usage

```tsx
import Button from '../components/ui/Button';

function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click me
    </Button>
  );
}
```

## Variants

### Primary Button (Default)
```tsx
<Button variant="primary">Primary Action</Button>
```

### Secondary Button
```tsx
<Button variant="secondary">Secondary Action</Button>
```

### Outline Button
```tsx
<Button variant="outline">Outline Button</Button>
```

### Ghost Button
```tsx
<Button variant="ghost">Ghost Button</Button>
```

### Danger Button
```tsx
<Button variant="danger">Delete Item</Button>
```

### Icon Button
```tsx
<Button variant="icon" aria-label="Settings">
  <SettingsIcon />
</Button>
```

## Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (Default)</Button>
<Button size="lg">Large</Button>
```

## States

### Loading State
```tsx
<Button loading={isLoading} onClick={handleSubmit}>
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

### Disabled State
```tsx
<Button disabled>Disabled Button</Button>
```

### Full Width
```tsx
<Button fullWidth>Full Width Button</Button>
```

## With Icons

### Left Icon
```tsx
<Button 
  leftIcon={<PlusIcon />}
  onClick={handleAdd}
>
  Add Item
</Button>
```

### Right Icon
```tsx
<Button 
  rightIcon={<ArrowRightIcon />}
  onClick={handleNext}
>
  Next Step
</Button>
```

## Advanced Features

### Ripple Effect
```tsx
<Button ripple={true}>Button with Ripple</Button>
```

### Custom Styling
```tsx
<Button className="custom-button-class">
  Custom Styled Button
</Button>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'icon'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner and disables button |
| `disabled` | `boolean` | `false` | Disables the button |
| `fullWidth` | `boolean` | `false` | Makes button take full width of container |
| `leftIcon` | `React.ReactNode` | - | Icon to display on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon to display on the right side |
| `ripple` | `boolean` | `true` | Enables ripple animation on click |
| `children` | `React.ReactNode` | - | Button content |
| `onClick` | `(event: MouseEvent) => void` | - | Click event handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | - | Additional CSS classes |

## Accessibility

### ARIA Support
- Automatically includes `role="button"`
- Supports `aria-label` for icon-only buttons
- Proper `aria-disabled` state management
- Loading state announced to screen readers

### Keyboard Navigation
- Focusable with Tab key
- Activated with Enter or Space
- Proper focus indicators
- Focus management during loading states

### Screen Reader Support
```tsx
// Icon button with proper labeling
<Button 
  variant="icon" 
  aria-label="Delete item"
  onClick={handleDelete}
>
  <TrashIcon />
</Button>

// Loading state with screen reader feedback
<Button 
  loading={isSubmitting}
  aria-describedby="submit-status"
>
  Submit Form
</Button>
```

## Styling

### CSS Classes
The button component uses these CSS classes:

```css
/* Base button styles */
.btn-base {
  @apply inline-flex items-center justify-center;
  @apply font-medium rounded-lg transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Hover animations */
.btn-hover {
  @apply hover:transform hover:-translate-y-0.5;
  @apply hover:shadow-lg transition-all duration-200;
}

/* Ripple effect */
.btn-ripple {
  @apply relative overflow-hidden;
}
```

### Custom Theming
```tsx
// Using CSS custom properties
<Button 
  style={{
    '--btn-primary-bg': '#custom-color',
    '--btn-primary-hover': '#custom-hover-color'
  }}
>
  Custom Themed Button
</Button>
```

## Examples

### Form Submit Button
```tsx
function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button 
      type="submit"
      loading={isSubmitting}
      fullWidth
      onClick={handleSubmit}
    >
      {isSubmitting ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}
```

### Action Button Group
```tsx
function ActionButtons() {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
      <Button onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
```

### Icon Button Toolbar
```tsx
function Toolbar() {
  return (
    <div className="flex gap-2">
      <Button variant="icon" aria-label="Bold">
        <BoldIcon />
      </Button>
      <Button variant="icon" aria-label="Italic">
        <ItalicIcon />
      </Button>
      <Button variant="icon" aria-label="Underline">
        <UnderlineIcon />
      </Button>
    </div>
  );
}
```

## Performance

### Optimization Tips
- Use `React.memo` for buttons that don't change frequently
- Avoid creating new objects in props (use `useCallback` for handlers)
- Consider using icon sprites for better performance with many icon buttons

### Bundle Impact
- Base component: ~2KB gzipped
- With animations: ~3KB gzipped
- Treeshakeable - only imports what you use

## Testing

### Unit Tests
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import Button from './Button';

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('shows loading state', () => {
  render(<Button loading>Loading</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

### Visual Testing
```tsx
// Storybook stories for visual testing
export const AllVariants = () => (
  <div className="space-y-4">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
  </div>
);
```

## Migration Guide

### From v1.x to v2.x
```tsx
// Old API
<Button type="primary" size="large">Button</Button>

// New API
<Button variant="primary" size="lg">Button</Button>
```

## Related Components

- [Input](./Input.md) - For form inputs
- [Select](./Select.md) - For dropdown selections
- [Modal](./Modal.md) - For dialog actions
- [Alert](./Alert.md) - For status messages

---

**Last updated**: December 2024
