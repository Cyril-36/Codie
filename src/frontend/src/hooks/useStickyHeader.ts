import { useState, useEffect, useCallback } from 'react';

interface UseStickyHeaderOptions {
  threshold?: number;
  className?: string;
  selector?: string;
}

export const useStickyHeader = ({
  threshold = 4,
  className = 'scrolled',
  selector = '.header'
}: UseStickyHeaderOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > threshold;
    setIsScrolled(scrolled);
    
    // Apply class to header element
    const headerElement = document.querySelector(selector);
    if (headerElement) {
      headerElement.classList.toggle(className, scrolled);
    }
  }, [threshold, className, selector]);

  useEffect(() => {
    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // Clean up class on unmount
      const headerElement = document.querySelector(selector);
      if (headerElement) {
        headerElement.classList.remove(className);
      }
    };
  }, [handleScroll, className, selector]);

  return { isScrolled };
};

export default useStickyHeader;
