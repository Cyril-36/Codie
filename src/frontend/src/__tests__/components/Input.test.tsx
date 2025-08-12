import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Input from '../../components/ui/Input';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders input element with default props', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with custom id', () => {
      render(<Input id="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('id', 'custom-input');
    });

    it('renders with custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email Address" data-testid="input" />);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toHaveAttribute('for');
    });

    it('does not render label when not provided', () => {
      render(<Input data-testid="input" />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Email Address" data-testid="input" />);
      const label = screen.getByText('Email Address');
      const input = screen.getByTestId('input');
      expect(label).toHaveAttribute('for', input.id);
    });
  });

  describe('Variants', () => {
    it('should render with different variants', () => {
      const { rerender } = render(<Input variant="default" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      rerender(<Input variant="error" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      rerender(<Input variant="success" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<Input inputSize="sm" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      rerender(<Input inputSize="md" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      rerender(<Input inputSize="lg" data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should render with full width by default', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('w-full');
    });

    it('should always render with full width', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('Width', () => {
    it('always applies full width by default', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('w-full');
    });

    it('maintains full width behavior', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="icon">🔍</span>;

    it('renders left icon when provided', () => {
      render(<Input leftIcon={<TestIcon />} data-testid="input" />);
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      render(<Input rightIcon={<TestIcon />} data-testid="input" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders both icons when provided', () => {
      render(<Input leftIcon={<TestIcon />} rightIcon={<TestIcon />} data-testid="input" />);
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
      expect(screen.getByTestId('icon-right')).toBeInTheDocument();
    });

    it('adjusts padding when icons are present', () => {
      render(<Input leftIcon={<TestIcon />} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pl-10'); // Default size (md)
    });
  });

  describe('Error State', () => {
    it('renders error message when provided', () => {
      render(<Input error="This field is required" data-testid="input" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-error-600', 'dark:text-error-400');
    });

    it('applies error styles to input', () => {
      render(<Input error="Error message" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-error-500');
    });

    it('applies error styles to label', () => {
      render(<Input label="Email" error="Error message" data-testid="input" />);
      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-error-600', 'dark:text-error-400');
    });

    it('applies error styles to icons', () => {
      const TestIcon = () => <span data-testid="icon">🔍</span>;
      render(<Input leftIcon={<TestIcon />} error="Error message" data-testid="input" />);
      const iconLeft = screen.getByTestId('icon-left');
      expect(iconLeft.querySelector('span')).toHaveClass('text-error-500');
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="Enter your email address" data-testid="input" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address')).toHaveClass('text-gray-500', 'dark:text-gray-400');
    });

    it('does not render helper text when error is present', () => {
      render(<Input helperText="Helper text" error="Error message" data-testid="input" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Focus and Blur Events', () => {
    it('calls onFocus when input is focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('updates focus state for styling', async () => {
      render(<Input label="Email" data-testid="input" />);
      const input = screen.getByTestId('input');
      const label = screen.getByText('Email');
      
      // Initially not focused
      expect(label).not.toHaveClass('text-primary-600');
      
      // Focus the input
      fireEvent.focus(input);
      await waitFor(() => {
        expect(label).toHaveClass('text-primary-600', 'dark:text-primary-400');
      });
      
      // Blur the input
      fireEvent.blur(input);
      await waitFor(() => {
        expect(label).not.toHaveClass('text-primary-600');
      });
    });
  });

  describe('Input Props', () => {
    it('forwards all HTML input attributes', () => {
      render(
        <Input
          data-testid="input"
          type="email"
          placeholder="Enter email"
          required
          disabled
          readOnly
        />
      );
      
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toHaveAttribute('required');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('readonly');
    });

    it('handles value changes', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(input).toHaveValue('test@example.com');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes when error is present', () => {
      render(<Input error="This field is required" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('maintains proper label association', () => {
      render(<Input label="Email Address" data-testid="input" />);
      const label = screen.getByText('Email Address');
      const input = screen.getByTestId('input');
      
      expect(label).toHaveAttribute('for', input.id);
      expect(input).toHaveAttribute('id', input.id);
    });
  });

  describe('Edge Cases', () => {
    it('generates unique id when none provided', () => {
      const { rerender } = render(<Input data-testid="input1" />);
      const input1 = screen.getByTestId('input1');
      const id1 = input1.id;
      
      rerender(<Input data-testid="input2" />);
      const input2 = screen.getByTestId('input2');
      const id2 = input2.id;
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^input-/);
      expect(id2).toMatch(/^input-/);
    });

    it('handles empty string values', () => {
      render(<Input value="" onChange={() => {}} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveValue('');
    });

    it('handles null and undefined values gracefully', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });
  });
});
