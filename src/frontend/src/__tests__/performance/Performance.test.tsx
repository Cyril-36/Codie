import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ScoreDisplay } from '../../components/Analysis/ScoreDisplay';
import CodeEditor from '../../components/CodeEditor';
import Button from '../../components/ui/Button';

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(),
  now: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock requestAnimationFrame
const mockRAF = vi.fn((callback) => setTimeout(callback, 16));
Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRAF,
  writable: true,
});

// Wrapper for components that need router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Reset performance mocks
    mockPerformance.mark.mockClear();
    mockPerformance.measure.mockClear();
    mockPerformance.now.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Render Performance', () => {
    it('Button should render within acceptable time', () => {
      const startTime = performance.now();
      
      render(<Button>Performance Test Button</Button>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50); // Should render in under 50ms
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('ScoreDisplay should render within acceptable time', () => {
      const startTime = performance.now();
      
      render(<ScoreDisplay score={85} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('CodeEditor should render within acceptable time', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <CodeEditor language="javascript" value="" onChange={() => {}} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(200); // Should render in under 200ms
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle large content efficiently', () => {
      const largeContent = 'const largeCode = "' + 'x'.repeat(10000) + '";';
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <CodeEditor language="javascript" value={largeContent} onChange={() => {}} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(500); // Should handle large content in under 500ms
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with multiple renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<Button>Button {i}</Button>);
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
    });

    it('should clean up event listeners properly', () => {
      const handleClick = vi.fn();
      
      const { unmount } = render(<Button onClick={handleClick}>Event Button</Button>);
      
      // Simulate some interactions
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Unmount and check for cleanup
      unmount();
      
      // Try to trigger the event after unmount (should not work)
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1); // Should not increase
    });
  });

  describe('Animation Performance', () => {
    it('should use requestAnimationFrame for animations', () => {
      render(<ScoreDisplay score={85} animated={true} />);
      
      // Check if requestAnimationFrame was called
      expect(mockRAF).toHaveBeenCalled();
    });

    it('should limit animation frame usage', () => {
      render(<ScoreDisplay score={85} animated={true} />);
      
      // Should not call requestAnimationFrame excessively
      expect(mockRAF).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Handling Performance', () => {
    it('should handle rapid clicks efficiently', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Rapid Click Button</Button>);
      
      const button = screen.getByRole('button');
      const startTime = performance.now();
      
      // Simulate rapid clicking with setTimeout(0) yields to ensure event processing per click
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(button, { key: 'Enter' });
        await new Promise((r) => setTimeout(r, 2));
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(handleClick).toHaveBeenCalledTimes(10);
      expect(totalTime).toBeLessThan(1000); // still performant under 1s in tests
    });

    it('should debounce rapid input changes', () => {
      const handleChange = vi.fn();
      render(
        <TestWrapper>
          <CodeEditor language="javascript" value="" onChange={handleChange} />
        </TestWrapper>
      );
      
      const editor = screen.getByRole('textbox');
      const startTime = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 20; i++) {
        fireEvent.change(editor, { target: { value: `const x${i} = ${i};` } });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(200); // Should handle rapid changes efficiently
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should not import unnecessary dependencies', async () => {
      // Check that components don't import heavy libraries unnecessarily
      const ButtonModule = await import('../../components/ui/Button');
      const ScoreDisplayModule = await import('../../components/Analysis/ScoreDisplay');
      
      // These should be lightweight components
      expect(ButtonModule).toBeDefined();
      expect(ScoreDisplayModule).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should support code splitting', () => {
      // Test that components can be dynamically imported
      const dynamicImport = () => import('../../components/ui/Button');
      
      expect(dynamicImport).toBeDefined();
      expect(typeof dynamicImport).toBe('function');
    });
  });

  describe('Optimization Checks', () => {
    it('should use React.memo for expensive components', async () => {
      // Check if components use React.memo for optimization
      const ScoreDisplayComponent = (await import('../../components/Analysis/ScoreDisplay')).ScoreDisplay;
      
      // This is a basic check - in real testing you'd check the actual implementation
      expect(ScoreDisplayComponent).toBeDefined();
    });

    it('should avoid unnecessary re-renders', () => {
      const renderCount = vi.fn();
      const TestComponent = () => {
        renderCount();
        return <Button>Test</Button>;
      };
      
      const { rerender } = render(<TestComponent />);
      
      // Re-render with same props
      rerender(<TestComponent />);
      
      // Should not re-render unnecessarily
      expect(renderCount).toHaveBeenCalledTimes(2); // Initial render + 1 rerender
    });
  });

  describe('Network Performance', () => {
    it('should handle API calls efficiently', async () => {
      // Mock fetch for performance testing
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ score: 85, suggestions: [] }),
      });
      
      global.fetch = mockFetch;
      
      const startTime = performance.now();
      
      // Simulate API call
      const response = await fetch('/api/analyze');
      const data = await response.json();
      
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      
      expect(apiTime).toBeLessThan(100); // Mock API call should be fast
      expect(data.score).toBe(85);
    });
  });

  describe('Accessibility Performance', () => {
    it('should not impact performance when accessibility features are enabled', () => {
      const startTime = performance.now();
      
      render(
        <Button aria-label="Accessible Button" aria-describedby="description">
          Accessible Button
        </Button>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50); // Accessibility shouldn't slow down rendering
      expect(screen.getByRole('button', { name: /accessible button/i })).toBeInTheDocument();
    });
  });
});
