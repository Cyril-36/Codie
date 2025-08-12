import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Setup test utilities on window object
Object.defineProperty(window, 'testUtils', {
  value: {
    mockApiResponse: (data: any, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
    }),
    
    createMockElement: (tagName: string, attributes: Record<string, string> = {}) => {
      const element = document.createElement(tagName);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      return element;
    },
    
    waitForElementToBeRemoved: (element: Element) => {
      return new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          if (!document.contains(element)) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    },
  },
  writable: true,
});

// Extend expect with custom matchers
expect.extend({
  toHaveAccessibleName(received, expectedName) {
    const pass = received.getAttribute('aria-label') === expectedName ||
                 received.getAttribute('aria-labelledby') === expectedName ||
                 received.textContent?.trim() === expectedName;
    
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to have accessible name "${expectedName}"`,
    };
  },
  
  toBeVisible(received) {
    const style = window.getComputedStyle(received);
    const pass = style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0';
    
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be visible`,
    };
  },
});

// Global test timeout - using vi.setConfig for Vitest
beforeEach(() => {
  // Vitest handles timeouts differently, no need to set global timeout
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Polyfill PointerEvent for motion/gesture libs in jsdom
if (typeof (globalThis as any).PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, props?: MouseEventInit) {
      super(type, props);
    }
  } as any;
}

// Mock framer-motion to render basic elements and ignore animation/gesture props
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag: string) => {
      return (props: any) => {
        const { whileHover, whileTap, whileFocus, variants, initial, animate, transition, exit, children, ...rest } = props || {};
        return React.createElement(tag, rest, children);
      };
    },
  }),
  AnimatePresence: (props: any) => React.createElement(React.Fragment, null, props.children),
}));
