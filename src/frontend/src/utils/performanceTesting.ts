/**
 * Performance Testing Utilities
 * Comprehensive performance monitoring and testing tools
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  // Additional Metrics
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
  // Custom Metrics
  bundleSize: number;
  animationFrameRate: number;
  memoryUsage: number;
  networkRequests: number;
}
export interface PerformanceTestResult {
  metric: string;
  value: number;
  threshold: number;
  unit: string;
  passed: boolean;
  score: number; // 0-100
  category: 'loading' | 'interactivity' | 'visual-stability' | 'custom';
  description: string;
  suggestion?: string;
}
/**
 * Performance Testing Suite
 */
export class PerformanceTester {
  private observer: PerformanceObserver | null = null;
  private metrics: Partial<PerformanceMetrics> = {};
  private animationFrames: number[] = [];
  private startTime: number = 0;
  constructor() {
    this.startTime = performance.now();
    this.initializeObservers();
  }
  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });
        this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch { void 0; }
    }
  }
  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
        break;
      case 'largest-contentful-paint':
        this.metrics.largestContentfulPaint = entry.startTime;
        break;
      case 'first-input':
        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        break;
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.metrics.cumulativeLayoutShift = 
            (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value;
        }
        break;
    }
  }
  /**
   * Measure animation frame rate
   */
  measureFrameRate(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      this.animationFrames = [];
      const startTime = performance.now();
      let frameCount = 0;
      const measureFrame = () => {
        frameCount++;
        this.animationFrames.push(performance.now());
        if (performance.now() - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const fps = (frameCount / duration) * 1000;
          this.metrics.animationFrameRate = fps;
          resolve(fps);
        }
      };
      requestAnimationFrame(measureFrame);
    });
  }
  /**
   * Measure bundle size
   */
  async measureBundleSize(): Promise<number> {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });
      this.metrics.bundleSize = totalSize;
      return totalSize;
    } catch {
      return 0;
    }
  }
  /**
   * Measure memory usage
   */
  measureMemoryUsage(): number {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        this.metrics.memoryUsage = usedMemory;
        return usedMemory;
      }
    } catch { void 0; }
    return 0;
  }
  /**
   * Count network requests
   */
  countNetworkRequests(): number {
    try {
      const resources = performance.getEntriesByType('resource');
      this.metrics.networkRequests = resources.length;
      return resources.length;
    } catch {
      return 0;
    }
  }
  /**
   * Calculate Time to Interactive (simplified)
   */
  calculateTimeToInteractive(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const tti = navigationEntry.domInteractive - navigationEntry.startTime;
      this.metrics.timeToInteractive = tti;
      return tti;
    }
    return 0;
  }
  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    // Wait for initial metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Measure additional metrics
    await this.measureFrameRate();
    await this.measureBundleSize();
    this.measureMemoryUsage();
    this.countNetworkRequests();
    this.calculateTimeToInteractive();
    // Test First Contentful Paint
    if (this.metrics.firstContentfulPaint) {
      results.push({
        metric: 'First Contentful Paint',
        value: this.metrics.firstContentfulPaint,
        threshold: 1500,
        unit: 'ms',
        passed: this.metrics.firstContentfulPaint <= 1500,
        score: this.calculateScore(this.metrics.firstContentfulPaint, 1500, 3000),
        category: 'loading',
        description: 'Time until first text or image is painted',
        suggestion: this.metrics.firstContentfulPaint > 1500 ? 'Optimize critical resources and reduce render-blocking assets' : undefined
      });
    }
    // Test Largest Contentful Paint
    if (this.metrics.largestContentfulPaint) {
      results.push({
        metric: 'Largest Contentful Paint',
        value: this.metrics.largestContentfulPaint,
        threshold: 2500,
        unit: 'ms',
        passed: this.metrics.largestContentfulPaint <= 2500,
        score: this.calculateScore(this.metrics.largestContentfulPaint, 2500, 4000),
        category: 'loading',
        description: 'Time until largest content element is painted',
        suggestion: this.metrics.largestContentfulPaint > 2500 ? 'Optimize images and critical rendering path' : undefined
      });
    }
    // Test Time to Interactive
    if (this.metrics.timeToInteractive) {
      results.push({
        metric: 'Time to Interactive',
        value: this.metrics.timeToInteractive,
        threshold: 3000,
        unit: 'ms',
        passed: this.metrics.timeToInteractive <= 3000,
        score: this.calculateScore(this.metrics.timeToInteractive, 3000, 5000),
        category: 'interactivity',
        description: 'Time until page is fully interactive',
        suggestion: this.metrics.timeToInteractive > 3000 ? 'Reduce JavaScript execution time and optimize main thread work' : undefined
      });
    }
    // Test First Input Delay
    if (this.metrics.firstInputDelay !== undefined) {
      results.push({
        metric: 'First Input Delay',
        value: this.metrics.firstInputDelay,
        threshold: 100,
        unit: 'ms',
        passed: this.metrics.firstInputDelay <= 100,
        score: this.calculateScore(this.metrics.firstInputDelay, 100, 300, true),
        category: 'interactivity',
        description: 'Delay between first user input and browser response',
        suggestion: this.metrics.firstInputDelay > 100 ? 'Reduce main thread blocking time and optimize event handlers' : undefined
      });
    }
    // Test Cumulative Layout Shift
    if (this.metrics.cumulativeLayoutShift !== undefined) {
      results.push({
        metric: 'Cumulative Layout Shift',
        value: this.metrics.cumulativeLayoutShift,
        threshold: 0.1,
        unit: 'score',
        passed: this.metrics.cumulativeLayoutShift <= 0.1,
        score: this.calculateScore(this.metrics.cumulativeLayoutShift, 0.1, 0.25, true),
        category: 'visual-stability',
        description: 'Measure of visual stability during page load',
        suggestion: this.metrics.cumulativeLayoutShift > 0.1 ? 'Add size attributes to images and avoid inserting content above existing content' : undefined
      });
    }
    // Test Animation Frame Rate
    if (this.metrics.animationFrameRate) {
      results.push({
        metric: 'Animation Frame Rate',
        value: this.metrics.animationFrameRate,
        threshold: 60,
        unit: 'fps',
        passed: this.metrics.animationFrameRate >= 55, // Allow some tolerance
        score: this.calculateScore(this.metrics.animationFrameRate, 60, 30, false, true),
        category: 'custom',
        description: 'Smoothness of animations and interactions',
        suggestion: this.metrics.animationFrameRate < 55 ? 'Optimize animations and reduce main thread work during animations' : undefined
      });
    }
    // Test Bundle Size
    if (this.metrics.bundleSize) {
      const bundleSizeKB = this.metrics.bundleSize / 1024;
      results.push({
        metric: 'Bundle Size',
        value: bundleSizeKB,
        threshold: 200,
        unit: 'KB',
        passed: bundleSizeKB <= 200,
        score: this.calculateScore(bundleSizeKB, 200, 500),
        category: 'loading',
        description: 'Total size of JavaScript and CSS bundles',
        suggestion: bundleSizeKB > 200 ? 'Implement code splitting and remove unused dependencies' : undefined
      });
    }
    // Test Memory Usage
    if (this.metrics.memoryUsage) {
      const memoryMB = this.metrics.memoryUsage / (1024 * 1024);
      results.push({
        metric: 'Memory Usage',
        value: memoryMB,
        threshold: 50,
        unit: 'MB',
        passed: memoryMB <= 50,
        score: this.calculateScore(memoryMB, 50, 100),
        category: 'custom',
        description: 'JavaScript heap memory usage',
        suggestion: memoryMB > 50 ? 'Optimize memory usage and check for memory leaks' : undefined
      });
    }
    return results;
  }
  /**
   * Calculate performance score (0-100)
   */
  private calculateScore(
    value: number, 
    goodThreshold: number, 
    poorThreshold: number, 
    lowerIsBetter: boolean = true,
    higherIsBetter: boolean = false
  ): number {
    if (higherIsBetter) {
      if (value >= goodThreshold) return 100;
      if (value <= poorThreshold) return 0;
      return Math.round(((value - poorThreshold) / (goodThreshold - poorThreshold)) * 100);
    }
    if (lowerIsBetter) {
      if (value <= goodThreshold) return 100;
      if (value >= poorThreshold) return 0;
      return Math.round(((poorThreshold - value) / (poorThreshold - goodThreshold)) * 100);
    }
    return 50; // Default neutral score
  }
  /**
   * Generate performance report
   */
  generateReport(results: PerformanceTestResult[]): {
    summary: {
      overallScore: number;
      totalTests: number;
      passedTests: number;
      failedTests: number;
      byCategory: Record<string, { passed: number; total: number; score: number }>;
    };
    results: PerformanceTestResult[];
    recommendations: string[];
  } {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    // Calculate overall score as average of all test scores
    const overallScore = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;
    // Group by category
    const byCategory = results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = { passed: 0, total: 0, score: 0 };
      }
      acc[result.category].total++;
      if (result.passed) acc[result.category].passed++;
      acc[result.category].score += result.score;
      return acc;
    }, {} as Record<string, { passed: number; total: number; score: number }>);
    // Calculate average scores for each category
    Object.keys(byCategory).forEach(category => {
      byCategory[category].score = Math.round(byCategory[category].score / byCategory[category].total);
    });
    const recommendations = results
      .filter(r => r.suggestion)
      .map(r => r.suggestion!)
      .filter((rec, index, arr) => arr.indexOf(rec) === index);
    return {
      summary: {
        overallScore,
        totalTests,
        passedTests,
        failedTests,
        byCategory
      },
      results,
      recommendations
    };
  }
  /**
   * Cleanup observers
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
/**
 * Export default tester instance
 */
export const performanceTester = new PerformanceTester();
