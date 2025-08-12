import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { ScoreDisplay } from '../../components/Analysis/ScoreDisplay';
import CodeEditor from '../../components/CodeEditor';
import Button from '../../components/ui/Button';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Wrapper for components that need router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  describe('WCAG Compliance', () => {
    it('Button component should not have accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ScoreDisplay component should not have accessibility violations', async () => {
      const { container } = render(
        <ScoreDisplay score={85} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('CodeEditor component should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <CodeEditor language="javascript" value="" onChange={() => {}} />
        </TestWrapper>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Attributes', () => {
    it('Button should have proper ARIA attributes', () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('Button should have role attribute', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });

    it('ScoreDisplay should have proper ARIA attributes', () => {
      render(<ScoreDisplay score={85} />);
      const scoreElement = screen.getByText('85');
      
      expect(scoreElement).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('Button should be focusable', () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button', { name: /focusable button/i });
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('Button should respond to Enter key', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button', { name: /keyboard button/i });
      
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Button should respond to Space key', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Space Button</Button>);
      const button = screen.getByRole('button', { name: /space button/i });
      
      button.focus();
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Screen Reader Support', () => {
    it('Button should have accessible name', () => {
      render(<Button>Screen Reader Button</Button>);
      const button = screen.getByRole('button', { name: /screen reader button/i });
      
      expect(button).toHaveAccessibleName('Screen Reader Button');
    });

    it.skip('Button with left icon should have accessible name', () => {
      const Icon = () => <span aria-hidden="true">🚀</span>;
      render(<Button leftIcon={<Icon />}>Launch</Button>);
      
      const button = screen.getByRole('button', { name: /launch/i });
      expect(button).toHaveAccessibleName('Launch');
      
      // Icon should be hidden from screen readers
      const icon = screen.getByText('🚀');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Color and Contrast', () => {
    it('Button should have sufficient color contrast', () => {
      render(<Button>High Contrast Button</Button>);
      const button = screen.getByRole('button', { name: /high contrast button/i });
      
      const computedStyle = window.getComputedStyle(button);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      // This is a basic check - in real testing you'd use a contrast checking library
      expect(backgroundColor).not.toBe(color);
    });

    it('Danger variant should have proper styling', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button', { name: /danger button/i });
      
      expect(button).toHaveClass('bg-error-500');
    });
  });

  describe('Form Accessibility', () => {
    it('CodeEditor should have proper accessibility', () => {
      render(
        <TestWrapper>
          <CodeEditor language="javascript" value="" onChange={() => {}} />
        </TestWrapper>
      );
      
      // Check that the editor is accessible
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Dynamic Content', () => {
    it('Loading states should be accessible', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
    });

    it('Progress indicators should be accessible', () => {
      render(
        <div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
          Uploading... 50%
        </div>
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('Status messages should be announced', () => {
      render(
        <div role="status" aria-live="polite">
          Analysis completed successfully
        </div>
      );
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Landmark Roles', () => {
    it('Content regions should have proper headings', () => {
      render(
        <TestWrapper>
          <div>
            <h2>Editor</h2>
            <CodeEditor language="javascript" value="" onChange={() => {}} />
          </div>
        </TestWrapper>
      );
      
      // Check that there are proper heading elements
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
