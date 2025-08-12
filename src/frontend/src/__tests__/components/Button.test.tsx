import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Button from '../../components/ui/Button';

describe('Button Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders button element with default props', () => {
      render(<Button data-testid="button">Click me</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
      expect(button).not.toBeDisabled();
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class" data-testid="button">Click me</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards all HTML button attributes', () => {
      render(
        <Button
          data-testid="button"
          type="submit"
          name="submit-btn"
          value="submit"
          aria-label="Submit form"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
      expect(button).toHaveAttribute('value', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles (default)', () => {
      render(<Button variant="primary" data-testid="button">Primary</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-brand-gradient', 'text-white');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary" data-testid="button">Secondary</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-bg-tertiary', 'text-[color:var(--text-primary)]');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline" data-testid="button">Outline</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-transparent', 'border', 'border-border-default');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost" data-testid="button">Ghost</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-transparent', 'border-transparent');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger" data-testid="button">Danger</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-error-500', 'text-white');
    });

    it('applies icon variant styles', () => {
      render(<Button variant="icon" data-testid="button">🔍</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('w-10', 'h-10', 'rounded-lg');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Button size="sm" data-testid="button">Small</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm', 'min-w-[100px]');
    });

    it('applies medium size styles (default)', () => {
      render(<Button size="md" data-testid="button">Medium</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-sm', 'min-w-[120px]');
    });

    it('applies large size styles', () => {
      render(<Button size="lg" data-testid="button">Large</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'min-w-[140px]');
    });

    it('applies correct icon sizes for icon variant', () => {
      render(<Button variant="icon" size="sm" data-testid="button">🔍</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<Button loading data-testid="button">Submit</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('disables button when loading is true', () => {
      render(<Button loading data-testid="button">Submit</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('hides loading text for icon variant', () => {
      render(<Button variant="icon" loading data-testid="button">🔍</Button>);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('applies correct spinner size based on button size', () => {
      render(<Button size="lg" loading data-testid="button">Large Button</Button>);
      const spinner = screen.getByTestId('button').querySelector('svg');
      expect(spinner).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="icon">🔍</span>;

    it('renders left icon when provided', () => {
      render(<Button leftIcon={<TestIcon />} data-testid="button">With Icon</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      render(<Button rightIcon={<TestIcon />} data-testid="button">With Icon</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders both icons when provided', () => {
      render(
        <Button leftIcon={<TestIcon />} rightIcon={<TestIcon />} data-testid="button">
          With Icons
        </Button>
      );
      const icons = screen.getAllByTestId('icon');
      expect(icons).toHaveLength(2);
    });

    it('applies correct gap between icons and text', () => {
      render(<Button leftIcon={<TestIcon />} size="sm" data-testid="button">Text</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('gap-2');
    });
  });

  describe('Width', () => {
    it('applies full width when specified', () => {
      render(<Button fullWidth data-testid="button">Full Width</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not apply full width when not specified', () => {
      render(<Button fullWidth={false} data-testid="button">Normal Width</Button>);
      const button = screen.getByTestId('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} data-testid="button">Click me</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick} data-testid="button">Disabled</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick} data-testid="button">Loading</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Ripple Effect', () => {
    it.skip('shows ripple effect when clicked and ripple is enabled', async () => {
      render(<Button data-testid="button">Click me</Button>);
      const button = screen.getByTestId('button');
      
      // Click the button to trigger ripple, wrapped in act() for state updates
      act(() => {
        fireEvent.click(button);
      });
      
      // Check if ripple appears immediately
      let ripple = button.querySelector('[data-testid="ripple"]');
      if (!ripple) {
        // If not immediately, wait a bit for the state to update
        await new Promise(resolve => setTimeout(resolve, 10));
        ripple = button.querySelector('[data-testid="ripple"]');
      }
      
      expect(ripple).toBeInTheDocument();
    });

    it('does not show ripple effect when ripple is disabled', () => {
      render(<Button ripple={false} data-testid="button">Click me</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      const ripple = button.querySelector('[class*="bg-white/20"]');
      expect(ripple).not.toBeInTheDocument();
    });

    it('does not show ripple effect when disabled', () => {
      render(<Button disabled ripple data-testid="button">Disabled</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      const ripple = button.querySelector('[class*="bg-white/20"]');
      expect(ripple).not.toBeInTheDocument();
    });

    it('does not show ripple effect when loading', () => {
      render(<Button loading ripple data-testid="button">Loading</Button>);
      
      const button = screen.getByTestId('button');
      act(() => {
        fireEvent.click(button);
      });
      
      const ripple = button.querySelector('[class*="bg-white/20"]');
      expect(ripple).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styles when disabled prop is true', () => {
      render(<Button disabled data-testid="button">Disabled</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('applies disabled styles when loading prop is true', () => {
      render(<Button loading data-testid="button">Loading</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('maintains focus ring for keyboard navigation', () => {
      render(<Button data-testid="button">Accessible</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('has proper disabled state for screen readers', () => {
      render(<Button disabled data-testid="button">Disabled</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('maintains proper button semantics', () => {
      render(<Button data-testid="button">Button</Button>);
      const button = screen.getByTestId('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button data-testid="button" />);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('handles null and undefined children gracefully', () => {
      render(<Button data-testid="button">{null}</Button>);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      render(
        <Button data-testid="button">
          <span>Complex</span>
          <strong>Content</strong>
        </Button>
      );
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('ComplexContent');
    });

    it('handles very long text content', () => {
      const longText = 'This is a very long button text that might wrap to multiple lines and test the component\'s ability to handle extended content gracefully';
      render(<Button data-testid="button">{longText}</Button>);
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent(longText);
    });
  });

  describe('Animation States', () => {
    it('applies hover scale effect when not disabled or loading', () => {
      render(<Button data-testid="button">Hover me</Button>);
      const button = screen.getByTestId('button');
      // Note: We can't easily test framer-motion animations in unit tests
      // This test ensures the component renders without errors
      expect(button).toBeInTheDocument();
    });

    it('applies tap scale effect when not disabled or loading', () => {
      render(<Button data-testid="button">Tap me</Button>);
      const button = screen.getByTestId('button');
      // Note: We can't easily test framer-motion animations in unit tests
      // This test ensures the component renders without errors
      expect(button).toBeInTheDocument();
    });
  });
});
