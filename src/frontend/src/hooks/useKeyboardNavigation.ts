import { useRef, useCallback, useEffect } from 'react';

import type React from 'react';
// Keyboard navigation hook for lists and menus
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number, item: T) => void;
    onEscape?: () => void;
  } = {}
) {
  const { loop = true, orientation = 'vertical', onSelect, onEscape } = options;
  const currentIndex = useRef<number>(-1);
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        currentIndex.current = loop 
          ? (currentIndex.current + 1) % items.length
          : Math.min(currentIndex.current + 1, items.length - 1);
        items[currentIndex.current]?.focus();
        break;
      case prevKey:
        event.preventDefault();
        currentIndex.current = loop
          ? currentIndex.current <= 0 ? items.length - 1 : currentIndex.current - 1
          : Math.max(currentIndex.current - 1, 0);
        items[currentIndex.current]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        currentIndex.current = 0;
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        currentIndex.current = items.length - 1;
        items[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex.current >= 0 && onSelect) {
          onSelect(currentIndex.current, items[currentIndex.current]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [items, loop, orientation, onSelect, onEscape]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const setCurrentIndex = useCallback((index: number) => {
    currentIndex.current = index;
  }, []);
  return { currentIndex: currentIndex.current, setCurrentIndex };
}
// Focus trap hook for modals and dialogs
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  const previousFocus = useRef<HTMLElement | null>(null);
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');
    return Array.from(container.querySelectorAll(focusableSelectors));
  }, []);
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isActive, containerRef, getFocusableElements]);
  useEffect(() => {
    if (isActive && containerRef.current) {
      // Store previous focus
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus first focusable element
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore previous focus
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isActive, containerRef, getFocusableElements, handleKeyDown]);
}
// Escape key handler hook
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        callback();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}
// Enter key handler hook
export function useEnterKey(callback: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        callback();
      }
    };
    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [callback, isActive]);
}
// Arrow key navigation for grids
export function useGridNavigation<T extends HTMLElement>(
  grid: T[][],
  options: {
    onSelect?: (row: number, col: number, item: T) => void;
    onEscape?: () => void;
    wrap?: boolean;
  } = {}
) {
  const { onSelect, onEscape, wrap = false } = options;
  const currentPosition = useRef<{ row: number; col: number }>({ row: 0, col: 0 });
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (grid.length === 0 || grid[0].length === 0) return;
    const { row, col } = currentPosition.current;
    const maxRow = grid.length - 1;
    const maxCol = grid[0].length - 1;
    let newRow = row;
    let newCol = col;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newRow = wrap ? (row + 1) % grid.length : Math.min(row + 1, maxRow);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newRow = wrap ? (row - 1 + grid.length) % grid.length : Math.max(row - 1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = wrap ? (col + 1) % grid[0].length : Math.min(col + 1, maxCol);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = wrap ? (col - 1 + grid[0].length) % grid[0].length : Math.max(col - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          newRow = maxRow;
          newCol = maxCol;
        } else {
          newCol = maxCol;
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onSelect && grid[row]?.[col]) {
          onSelect(row, col, grid[row][col]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
    if (newRow !== row || newCol !== col) {
      currentPosition.current = { row: newRow, col: newCol };
      grid[newRow]?.[newCol]?.focus();
    }
  }, [grid, onSelect, onEscape, wrap]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const setCurrentPosition = useCallback((row: number, col: number) => {
    currentPosition.current = { row, col };
  }, []);
  return { 
    currentPosition: currentPosition.current, 
    setCurrentPosition 
  };
}
// Tab order management
export function useTabOrder(elements: HTMLElement[], isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;
    elements.forEach((element, index) => {
      element.tabIndex = index;
    });
    return () => {
      elements.forEach(element => {
        element.tabIndex = -1;
      });
    };
  }, [elements, isActive]);
}
// Roving tabindex for complex widgets
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  activeIndex: number = 0
) {
  useEffect(() => {
    items.forEach((item, index) => {
      item.tabIndex = index === activeIndex ? 0 : -1;
    });
  }, [items, activeIndex]);
  const setActiveIndex = useCallback((index: number) => {
    items.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1;
    });
    items[index]?.focus();
  }, [items]);
  return { setActiveIndex };
}
// Form navigation utilities
export function useFormNavigation(formRef: React.RefObject<HTMLFormElement>) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!formRef.current) return;
    // Enter key submits form (unless in textarea)
    if (event.key === 'Enter' && event.target instanceof HTMLElement) {
      if (event.target.tagName !== 'TEXTAREA') {
        const submitButton = formRef.current.querySelector('[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          event.preventDefault();
          submitButton.click();
        }
      }
    }
    // Escape key resets form
    if (event.key === 'Escape') {
      const resetButton = formRef.current.querySelector('[type="reset"]') as HTMLButtonElement;
      if (resetButton) {
        event.preventDefault();
        resetButton.click();
      }
    }
  }, [formRef]);
  useEffect(() => {
    const form = formRef.current;
    if (form) {
      form.addEventListener('keydown', handleKeyDown);
      return () => form.removeEventListener('keydown', handleKeyDown);
    }
  }, [formRef, handleKeyDown]);
}
// Skip links utility
export function createSkipLink(targetId: string, text: string = 'Skip to main content') {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
  document.body.insertBefore(skipLink, document.body.firstChild);
  return skipLink;
}
// Export all keyboard navigation utilities
export default {
  useKeyboardNavigation,
  useFocusTrap,
  useEscapeKey,
  useEnterKey,
  useGridNavigation,
  useTabOrder,
  useRovingTabIndex,
  useFormNavigation,
  createSkipLink,
};
