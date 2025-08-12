/**
 * Accessibility Testing Utilities
 * Comprehensive testing utilities for WCAG compliance and accessibility
 */
export interface AccessibilityTestResult {
  rule: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  category: 'color' | 'keyboard' | 'screen-reader' | 'focus' | 'structure';
  passed: boolean;
  element?: string;
  issue?: string;
  suggestion?: string;
}
export interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  passed: boolean;
}
/**
 * WCAG Color Contrast Testing
 */
export class ColorContrastTester {
  /**
   * Calculate color contrast ratio between two colors
   */
  static calculateContrast(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  /**
   * Test color contrast compliance
   */
  static testContrast(foreground: string, background: string): ColorContrastResult {
    const ratio = this.calculateContrast(foreground, background);
    let level: 'AA' | 'AAA' | 'fail';
    let passed: boolean;
    if (ratio >= 7) {
      level = 'AAA';
      passed = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      passed = true;
    } else {
      level = 'fail';
      passed = false;
    }
    return {
      foreground,
      background,
      ratio: Math.round(ratio * 100) / 100,
      level,
      passed
    };
  }
}
/**
 * Accessibility Test Suite
 */
export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];
  /**
   * Run comprehensive accessibility tests
   */
  async runTests(element?: HTMLElement): Promise<AccessibilityTestResult[]> {
    this.results = [];
    const testElement = element || document.body;
    // Color contrast tests
    await this.testColorContrast(testElement);
    // Keyboard navigation tests
    await this.testKeyboardNavigation(testElement);
    // Screen reader tests
    await this.testScreenReaderSupport(testElement);
    // Focus management tests
    await this.testFocusManagement(testElement);
    // Semantic structure tests
    await this.testSemanticStructure(testElement);
    return this.results;
  }
  /**
   * Test color contrast compliance
   */
  private async testColorContrast(element: HTMLElement): Promise<void> {
    const textElements = element.querySelectorAll('*');
    const colorPairs = new Set<string>();
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorPairs.add(`${color}|${backgroundColor}`);
      }
    });
    colorPairs.forEach(pair => {
      const [fg, bg] = pair.split('|');
      try {
        const fgHex = this.rgbToHex(fg);
        const bgHex = this.rgbToHex(bg);
        if (fgHex && bgHex) {
          const result = ColorContrastTester.testContrast(fgHex, bgHex);
          this.results.push({
            rule: 'WCAG 2.1 - Color Contrast',
            description: 'Text must have sufficient contrast against background',
            level: 'AA',
            category: 'color',
            passed: result.passed,
            element: `${fg} on ${bg}`,
            issue: result.passed ? undefined : `Contrast ratio ${result.ratio}:1 is below minimum 4.5:1`,
            suggestion: result.passed ? undefined : 'Increase color contrast or use different colors'
          });
        }
      } catch {
        // Skip invalid color values
      }
    });
  }
  /**
   * Test keyboard navigation
   */
  private async testKeyboardNavigation(element: HTMLElement): Promise<void> {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );
    let hasTabIndex = true;
    let hasKeyboardHandlers = true;
    interactiveElements.forEach(el => {
      const tabIndex = el.getAttribute('tabindex');
      // Check if focusable elements have proper tabindex
      if (tabIndex === '-1' && !el.hasAttribute('disabled')) {
        hasTabIndex = false;
      }
      // Check for keyboard event handlers (more comprehensive check)
      const hasKeyHandler = el.hasAttribute('onkeydown') ||
                           el.hasAttribute('onkeyup') ||
                           el.hasAttribute('onkeypress') ||
                           el.tagName.toLowerCase() === 'button' ||
                           el.tagName.toLowerCase() === 'a';
      if (el.getAttribute('role') === 'button' && !hasKeyHandler) {
        hasKeyboardHandlers = false;
      }
    });
    this.results.push({
      rule: 'WCAG 2.1 - Keyboard Navigation',
      description: 'All interactive elements must be keyboard accessible',
      level: 'A',
      category: 'keyboard',
      passed: hasTabIndex && hasKeyboardHandlers,
      issue: !hasTabIndex ? 'Some elements have tabindex="-1"' :
             !hasKeyboardHandlers ? 'Custom interactive elements missing keyboard handlers' : undefined,
      suggestion: 'Ensure all interactive elements are focusable and have keyboard event handlers'
    });
  }
  /**
   * Test screen reader support
   */
  private async testScreenReaderSupport(element: HTMLElement): Promise<void> {
    const buttons = element.querySelectorAll('button, [role="button"]');
    const inputs = element.querySelectorAll('input, textarea, select');
    const images = element.querySelectorAll('img');
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let hasAriaLabels = true;
    let hasAltText = true;
    let hasHeadingStructure = true;
    // Check button labels
    buttons.forEach(button => {
      const hasLabel = button.getAttribute('aria-label') || 
                      button.getAttribute('aria-labelledby') ||
                      button.textContent?.trim();
      if (!hasLabel) hasAriaLabels = false;
    });
    // Check input labels
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby') ||
                      element.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) hasAriaLabels = false;
    });
    // Check image alt text
    images.forEach(img => {
      if (!img.getAttribute('alt') && img.getAttribute('role') !== 'presentation') {
        hasAltText = false;
      }
    });
    // Check heading structure
    const headingLevels = Array.from(headings).map(h => 
      parseInt(h.tagName.charAt(1))
    );
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i-1] + 1) {
        hasHeadingStructure = false;
        break;
      }
    }
    this.results.push(
      {
        rule: 'WCAG 2.1 - Labels and Names',
        description: 'All form controls and buttons must have accessible names',
        level: 'A',
        category: 'screen-reader',
        passed: hasAriaLabels,
        issue: hasAriaLabels ? undefined : 'Some interactive elements lack accessible names',
        suggestion: 'Add aria-label, aria-labelledby, or visible text labels'
      },
      {
        rule: 'WCAG 2.1 - Images of Text',
        description: 'Images must have appropriate alternative text',
        level: 'A',
        category: 'screen-reader',
        passed: hasAltText,
        issue: hasAltText ? undefined : 'Some images lack alt text',
        suggestion: 'Add descriptive alt text or role="presentation" for decorative images'
      },
      {
        rule: 'WCAG 2.1 - Headings and Labels',
        description: 'Headings must be properly structured',
        level: 'AA',
        category: 'structure',
        passed: hasHeadingStructure,
        issue: hasHeadingStructure ? undefined : 'Heading levels skip or are out of order',
        suggestion: 'Use heading levels sequentially (h1, h2, h3, etc.)'
      }
    );
  }
  /**
   * Test focus management
   */
  private async testFocusManagement(element: HTMLElement): Promise<void> {
    const focusableElements = element.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    let hasFocusIndicators = true;
    let hasLogicalTabOrder = true;
    // Check focus indicators (simplified check)
    focusableElements.forEach(el => {
      const styles = window.getComputedStyle(el, ':focus');
      const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';
      if (!hasOutline && !hasBoxShadow) {
        hasFocusIndicators = false;
      }
    });
    // Check tab order
    const tabIndexes = Array.from(focusableElements).map(el => {
      const tabIndex = el.getAttribute('tabindex');
      return tabIndex ? parseInt(tabIndex) : 0;
    });
    const sortedIndexes = [...tabIndexes].sort((a, b) => a - b);
    hasLogicalTabOrder = JSON.stringify(tabIndexes) === JSON.stringify(sortedIndexes);
    this.results.push({
      rule: 'WCAG 2.1 - Focus Management',
      description: 'Focus indicators must be visible and tab order logical',
      level: 'AA',
      category: 'focus',
      passed: hasFocusIndicators && hasLogicalTabOrder,
      issue: !hasFocusIndicators ? 'Some elements lack visible focus indicators' :
             !hasLogicalTabOrder ? 'Tab order is not logical' : undefined,
      suggestion: 'Add :focus styles and ensure logical tab order'
    });
  }
  /**
   * Test semantic structure
   */
  private async testSemanticStructure(element: HTMLElement): Promise<void> {
    const hasMain = element.querySelector('main') !== null;
    const landmarks = element.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
    this.results.push({
      rule: 'WCAG 2.1 - Page Structure',
      description: 'Pages should use semantic HTML and landmarks',
      level: 'AA',
      category: 'structure',
      passed: hasMain || landmarks.length > 0,
      issue: (!hasMain && landmarks.length === 0) ? 'Page lacks semantic structure' : undefined,
      suggestion: 'Use semantic HTML elements (main, nav, header, footer) or ARIA landmarks'
    });
  }
  /**
   * Convert RGB color to hex (simplified)
   */
  private rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  /**
   * Generate accessibility report
   */
  generateReport(): {
    summary: {
      total: number;
      passed: number;
      failed: number;
      passRate: number;
      byLevel: Record<string, number>;
      byCategory: Record<string, number>;
    };
    results: AccessibilityTestResult[];
    recommendations: string[];
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const byLevel = this.results.reduce((acc, result) => {
      acc[result.level] = (acc[result.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byCategory = this.results.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const recommendations = this.results
      .filter(r => !r.passed && r.suggestion)
      .map(r => r.suggestion!)
      .filter((rec, index, arr) => arr.indexOf(rec) === index);
    return {
      summary: {
        total,
        passed,
        failed,
        passRate: Math.round(passRate * 100) / 100,
        byLevel,
        byCategory
      },
      results: this.results,
      recommendations
    };
  }
  /**
   * Clear test results
   */
  clearResults(): void {
    this.results = [];
  }
}
/**
 * Export default tester instance
 */
export const accessibilityTester = new AccessibilityTester();
