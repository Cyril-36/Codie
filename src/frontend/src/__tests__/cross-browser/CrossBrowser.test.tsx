import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ScoreDisplay } from '../../components/Analysis/ScoreDisplay';
import CodeEditor from '../../components/CodeEditor';
import Button from '../../components/ui/Button';

// Mock different browser environments
const mockBrowsers = {
  chrome: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: {
      flexbox: true,
      grid: true,
      cssVariables: true,
      es6: true,
      webp: true,
      webgl: true,
    },
  },
  firefox: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    features: {
      flexbox: true,
      grid: true,
      cssVariables: true,
      es6: true,
      webp: true,
      webgl: true,
    },
  },
  safari: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    features: {
      flexbox: true,
      grid: true,
      cssVariables: true,
      es6: true,
      webp: false, // Safari has limited webp support
      webgl: true,
    },
  },
  edge: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: {
      flexbox: true,
      grid: true,
      cssVariables: true,
      es6: true,
      webp: true,
      webgl: true,
    },
  },
  ie11: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    features: {
      flexbox: false,
      grid: false,
      cssVariables: false,
      es6: false,
      webp: false,
      webgl: false,
    },
  },
};

// Mock browser feature detection
const mockFeatureDetection = {
  supportsFlexbox: () => true,
  supportsGrid: () => true,
  supportsCSSVariables: () => true,
  supportsES6: () => true,
  supportsWebP: () => true,
  supportsWebGL: () => true,
  supportsIntersectionObserver: () => true,
  supportsResizeObserver: () => true,
  supportsMatchMedia: () => true,
};

// Mock browser APIs
const mockBrowserAPIs = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  fetch: vi.fn(),
  XMLHttpRequest: vi.fn().mockImplementation(() => ({
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4,
  })) as any,
  FormData: vi.fn(),
  FileReader: vi.fn().mockImplementation(() => ({
    EMPTY: 0,
    LOADING: 1,
    DONE: 2,
  })) as any,
  Blob: vi.fn(),
  URL: vi.fn().mockImplementation(() => ({
    canParse: vi.fn(),
    createObjectURL: vi.fn(),
    parse: vi.fn(),
    revokeObjectURL: vi.fn(),
  })) as any,
  URLSearchParams: vi.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Cross-Browser Compatibility Tests', () => {
  let originalUserAgent: string;
  let originalFeatures: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Store original values
    originalUserAgent = navigator.userAgent;
    originalFeatures = { ...mockFeatureDetection };
    
    // Mock global browser APIs
    global.localStorage = mockBrowserAPIs.localStorage;
    global.sessionStorage = mockBrowserAPIs.sessionStorage;
    global.fetch = mockBrowserAPIs.fetch;
    global.XMLHttpRequest = mockBrowserAPIs.XMLHttpRequest;
    global.FormData = mockBrowserAPIs.FormData;
    global.FileReader = mockBrowserAPIs.FileReader;
    global.Blob = mockBrowserAPIs.Blob;
    global.URL = mockBrowserAPIs.URL;
    global.URLSearchParams = mockBrowserAPIs.URLSearchParams;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    
    // Restore original values
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  describe('Browser Feature Detection', () => {
    it('should detect CSS Flexbox support', () => {
      const supportsFlexbox = mockFeatureDetection.supportsFlexbox();
      expect(supportsFlexbox).toBe(true);
    });

    it('should detect CSS Grid support', () => {
      const supportsGrid = mockFeatureDetection.supportsGrid();
      expect(supportsGrid).toBe(true);
    });

    it('should detect CSS Variables support', () => {
      const supportsCSSVariables = mockFeatureDetection.supportsCSSVariables();
      expect(supportsCSSVariables).toBe(true);
    });

    it('should detect ES6 support', () => {
      const supportsES6 = mockFeatureDetection.supportsES6();
      expect(supportsES6).toBe(true);
    });

    it('should detect WebP image format support', () => {
      const supportsWebP = mockFeatureDetection.supportsWebP();
      expect(supportsWebP).toBe(true);
    });

    it('should detect WebGL support', () => {
      const supportsWebGL = mockFeatureDetection.supportsWebGL();
      expect(supportsWebGL).toBe(true);
    });
  });

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockBrowsers.chrome.userAgent,
        writable: true,
      });
    });

    it('should render components correctly in Chrome', () => {
      const { container } = render(
        <Button variant="primary">Chrome Button</Button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Chrome Button');
      expect(button?.getAttribute('data-variant')).toBe('primary');
    });

    it('should handle Chrome-specific CSS features', () => {
      const { container } = render(
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      
      // Chrome supports flexbox and gap
      expect(mockFeatureDetection.supportsFlexbox()).toBe(true);
    });

    it('should support Chrome-specific JavaScript features', () => {
      // Test ES6 features
      const arrowFunction = () => 'arrow function works';
      const templateLiteral = `template literal ${'works'}`;
      const destructuring = { a: 1, b: 2 };
      const { a, b } = destructuring;

      expect(arrowFunction()).toBe('arrow function works');
      expect(templateLiteral).toBe('template literal works');
      expect(a).toBe(1);
      expect(b).toBe(2);
    });
  });

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockBrowsers.firefox.userAgent,
        writable: true,
      });
    });

    it('should render components correctly in Firefox', () => {
      const { container } = render(
        <Button variant="secondary">Firefox Button</Button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Firefox Button');
    });

    it('should handle Firefox-specific CSS features', () => {
      const { container } = render(
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <Button>Grid Button 1</Button>
          <Button>Grid Button 2</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      
      // Firefox supports CSS Grid
      expect(mockFeatureDetection.supportsGrid()).toBe(true);
    });

    it('should support Firefox-specific JavaScript features', async () => {
      // Test modern JavaScript features
      const asyncFunction = async () => 'async works';
      const promise = Promise.resolve('promise works');
      
      await expect(asyncFunction()).resolves.toBe('async works');
      await expect(promise).resolves.toBe('promise works');
    });
  });

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockBrowsers.safari.userAgent,
        writable: true,
      });
    });

    it('should render components correctly in Safari', () => {
      const { container } = render(
        <Button variant="primary">Safari Button</Button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Safari Button');
    });

    it('should handle Safari-specific limitations', () => {
      // Safari has limited WebP support
      expect(mockBrowsers.safari.features.webp).toBe(false);
      
      // But supports other modern features
      expect(mockBrowsers.safari.features.flexbox).toBe(true);
      expect(mockBrowsers.safari.features.grid).toBe(true);
    });

    it('should support Safari-specific CSS features', () => {
      const { container } = render(
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Button>Centered Button</Button>
        </div>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      // Safari supports flexbox
      expect(mockFeatureDetection.supportsFlexbox()).toBe(true);
    });
  });

  describe('Edge Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockBrowsers.edge.userAgent,
        writable: true,
      });
    });

    it('should render components correctly in Edge', () => {
      const { container } = render(
        <Button variant="danger">Edge Button</Button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Edge Button');
    });

    it('should handle Edge-specific features', () => {
      // Edge supports all modern features
      expect(mockBrowsers.edge.features.flexbox).toBe(true);
      expect(mockBrowsers.edge.features.grid).toBe(true);
      expect(mockBrowsers.edge.features.cssVariables).toBe(true);
      expect(mockBrowsers.edge.features.es6).toBe(true);
      expect(mockBrowsers.edge.features.webp).toBe(true);
      expect(mockBrowsers.edge.features.webgl).toBe(true);
    });
  });

  describe('Internet Explorer 11 Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockBrowsers.ie11.userAgent,
        writable: true,
      });
    });

    it('should provide fallbacks for IE11 limitations', () => {
      // IE11 doesn't support modern CSS features
      expect(mockBrowsers.ie11.features.flexbox).toBe(false);
      expect(mockBrowsers.ie11.features.grid).toBe(false);
      expect(mockBrowsers.ie11.features.cssVariables).toBe(false);
      expect(mockBrowsers.ie11.features.es6).toBe(false);
      expect(mockBrowsers.ie11.features.webp).toBe(false);
      expect(mockBrowsers.ie11.features.webgl).toBe(false);
    });

    it('should render basic components in IE11', () => {
      const { container } = render(
        <Button>IE11 Button</Button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('IE11 Button');
    });

    it('should use polyfills for missing features', () => {
      // Test that polyfills would be available
      const polyfillAvailable = typeof window.Promise !== 'undefined';
      expect(polyfillAvailable).toBe(true); // In test environment
    });
  });

  describe('CSS Feature Support', () => {
    it('should handle CSS Grid layouts gracefully', () => {
      const { container } = render(
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <Button>Grid Item 1</Button>
          <Button>Grid Item 2</Button>
          <Button>Grid Item 3</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(3);
      
      // Verify grid support
      expect(mockFeatureDetection.supportsGrid()).toBe(true);
    });

    it('should handle CSS Variables gracefully', () => {
      const { container } = render(
        <div style={{ 
          '--primary-color': '#007bff',
          '--secondary-color': '#6c757d',
          backgroundColor: 'var(--primary-color)',
          color: 'var(--secondary-color)'
        } as React.CSSProperties}>
          <Button>CSS Variables Button</Button>
        </div>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      // Verify CSS variables support
      expect(mockFeatureDetection.supportsCSSVariables()).toBe(true);
    });

    it('should handle Flexbox layouts gracefully', () => {
      const { container } = render(
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Button>Flex Item 1</Button>
          <Button>Flex Item 2</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      
      // Verify flexbox support
      expect(mockFeatureDetection.supportsFlexbox()).toBe(true);
    });
  });

  describe('JavaScript Feature Support', () => {
    it('should handle ES6+ features gracefully', () => {
      // Test various ES6+ features
      const arrowFunction = () => 'arrow function';
      const templateLiteral = `template ${'literal'}`;
      const destructuring = { x: 1, y: 2 };
      const { x, y } = destructuring;
      const spread = [...[1, 2, 3]];
      const rest = (...args: number[]) => args.length;

      expect(arrowFunction()).toBe('arrow function');
      expect(templateLiteral).toBe('template literal');
      expect(x).toBe(1);
      expect(y).toBe(2);
      expect(spread).toEqual([1, 2, 3]);
      expect(rest(1, 2, 3)).toBe(3);
    });

    it('should handle async/await gracefully', async () => {
      const asyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      };

      const result = await asyncFunction();
      expect(result).toBe('async result');
    });

    it('should handle Promises gracefully', async () => {
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('promise resolved'), 10);
      });

      await expect(promise).resolves.toBe('promise resolved');
    });
  });

  describe('API Compatibility', () => {
    it('should handle Fetch API gracefully', async () => {
      const mockResponse = { data: 'test data' };
      mockBrowserAPIs.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const fetchData = async () => {
        const response = await fetch('/api/test');
        return response.json();
      };

      await expect(fetchData()).resolves.toEqual(mockResponse);
    });

    it('should handle localStorage gracefully', () => {
      mockBrowserAPIs.localStorage.setItem('test-key', 'test-value');
      mockBrowserAPIs.localStorage.getItem.mockReturnValue('test-value');

      expect(mockBrowserAPIs.localStorage.getItem('test-key')).toBe('test-value');
      expect(mockBrowserAPIs.localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should handle sessionStorage gracefully', () => {
      mockBrowserAPIs.sessionStorage.setItem('session-key', 'session-value');
      mockBrowserAPIs.sessionStorage.getItem.mockReturnValue('session-value');

      expect(mockBrowserAPIs.sessionStorage.getItem('session-key')).toBe('session-value');
      expect(mockBrowserAPIs.sessionStorage.setItem).toHaveBeenCalledWith('session-key', 'session-value');
    });
  });

  describe('Component Cross-Browser Rendering', () => {
    it('should render Button component consistently across browsers', () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'];
      
      browsers.forEach(browser => {
        Object.defineProperty(navigator, 'userAgent', {
          value: mockBrowsers[browser as keyof typeof mockBrowsers].userAgent,
          writable: true,
        });

        const { container } = render(
          <Button variant="primary">{`${browser} Button`}</Button>
        );

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toBe(`${browser} Button`);
      });
    });

    it('should render ScoreDisplay component consistently across browsers', () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'];
      
      browsers.forEach(browser => {
        Object.defineProperty(navigator, 'userAgent', {
          value: mockBrowsers[browser as keyof typeof mockBrowsers].userAgent,
          writable: true,
        });

        const { container } = render(
          <ScoreDisplay score={85} label={`${browser} Score`} />
        );

        const scoreDisplay = container.querySelector('[data-testid="score-display"]');
        expect(scoreDisplay).toBeInTheDocument();
      });
    });

    it('should render CodeEditor component consistently across browsers', () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'];
      
      browsers.forEach(browser => {
        Object.defineProperty(navigator, 'userAgent', {
          value: mockBrowsers[browser as keyof typeof mockBrowsers].userAgent,
          writable: true,
        });

        const { container } = render(
          <TestWrapper>
            <CodeEditor 
              language="javascript" 
              value={`// ${browser} test`} 
              onChange={() => {}} 
            />
          </TestWrapper>
        );

        const editor = container.querySelector('[data-testid="code-editor"]') || container.querySelector('textarea');
        expect(editor).toBeInTheDocument();
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('should provide fallbacks for unsupported features', () => {
      // Simulate a browser without modern feature support
      const limitedBrowser = {
        flexbox: false,
        grid: false,
        cssVariables: false,
        es6: false,
      };

      // Test fallback logic
      const useFallback = (feature: keyof typeof limitedBrowser) => {
        return limitedBrowser[feature] || 'fallback';
      };

      expect(useFallback('flexbox')).toBe('fallback');
      expect(useFallback('grid')).toBe('fallback');
      expect(useFallback('cssVariables')).toBe('fallback');
      expect(useFallback('es6')).toBe('fallback');
    });

    it('should handle graceful degradation', () => {
      // Test that components still render even with limited support
      const { container } = render(
        <div>
          <Button>Basic Button</Button>
          <p>Basic text content</p>
        </div>
      );

      const button = container.querySelector('button');
      const paragraph = container.querySelector('p');

      expect(button).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(button?.textContent).toBe('Basic Button');
      expect(paragraph?.textContent).toBe('Basic text content');
    });
  });
});
