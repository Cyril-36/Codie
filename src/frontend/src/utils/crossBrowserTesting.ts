/**
 * Cross-browser Testing Utilities
 * Browser compatibility detection and testing tools
 */
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  supported: boolean;
}
export interface FeatureSupport {
  feature: string;
  supported: boolean;
  fallback?: string;
  polyfillNeeded: boolean;
  criticalForApp: boolean;
}
export interface CrossBrowserTestResult {
  browser: BrowserInfo;
  features: FeatureSupport[];
  cssSupport: Record<string, boolean>;
  jsSupport: Record<string, boolean>;
  overallCompatibility: number; // 0-100
  issues: string[];
  recommendations: string[];
}
/**
 * Browser Detection Utility
 */
export class BrowserDetector {
  static detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    let name = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    let mobile = false;
    let supported = true;
    // Detect mobile
    mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome';
      engine = 'Blink';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      supported = parseInt(version) >= 90;
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      engine = 'Gecko';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      supported = parseInt(version) >= 88;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      engine = 'WebKit';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      supported = parseInt(version) >= 14;
    } else if (userAgent.includes('Edg')) {
      name = 'Edge';
      engine = 'Blink';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      supported = parseInt(version) >= 90;
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      name = 'Internet Explorer';
      engine = 'Trident';
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      version = match ? match[1] : 'Unknown';
      supported = false; // IE not supported
    }
    return {
      name,
      version,
      engine,
      platform,
      mobile,
      supported
    };
  }
}
/**
 * Feature Detection Utility
 */
export class FeatureDetector {
  /**
   * Test CSS feature support
   */
  static testCSSFeature(property: string, value?: string): boolean {
    const element = document.createElement('div');
    const style = element.style;
    try {
      if (value) {
        (style as any)[property] = value;
        return (style as any)[property] === value;
      } else {
        return property in style;
      }
    } catch {
      return false;
    }
  }
  /**
   * Test JavaScript API support
   */
  static testJSFeature(feature: string): boolean {
    try {
      switch (feature) {
        case 'fetch':
          return typeof fetch !== 'undefined';
        case 'Promise':
          return typeof Promise !== 'undefined';
        case 'IntersectionObserver':
          return typeof IntersectionObserver !== 'undefined';
        case 'ResizeObserver':
          return typeof ResizeObserver !== 'undefined';
        case 'MutationObserver':
          return typeof MutationObserver !== 'undefined';
        case 'requestAnimationFrame':
          return typeof requestAnimationFrame !== 'undefined';
        case 'localStorage':
          return typeof Storage !== 'undefined' && 'localStorage' in window;
        case 'sessionStorage':
          return typeof Storage !== 'undefined' && 'sessionStorage' in window;
        case 'WebGL': {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        }
        case 'WebGL2': {
          const canvas2 = document.createElement('canvas');
          return !!canvas2.getContext('webgl2');
        }
        case 'ServiceWorker':
          return 'serviceWorker' in navigator;
        case 'WebAssembly':
          return typeof WebAssembly !== 'undefined';
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
  /**
   * Get comprehensive feature support
   */
  static getFeatureSupport(): FeatureSupport[] {
    const features = [
      {
        feature: 'CSS Grid',
        test: () => this.testCSSFeature('display', 'grid'),
        criticalForApp: true,
        fallback: 'Flexbox layout'
      },
      {
        feature: 'CSS Flexbox',
        test: () => this.testCSSFeature('display', 'flex'),
        criticalForApp: true,
        fallback: 'Float-based layout'
      },
      {
        feature: 'CSS Custom Properties',
        test: () => this.testCSSFeature('--test-var', 'test'),
        criticalForApp: true,
        fallback: 'Sass variables'
      },
      {
        feature: 'CSS Transforms',
        test: () => this.testCSSFeature('transform'),
        criticalForApp: false,
        fallback: 'Position-based animations'
      },
      {
        feature: 'CSS Transitions',
        test: () => this.testCSSFeature('transition'),
        criticalForApp: false,
        fallback: 'JavaScript animations'
      },
      {
        feature: 'Fetch API',
        test: () => this.testJSFeature('fetch'),
        criticalForApp: true,
        fallback: 'XMLHttpRequest'
      },
      {
        feature: 'Promises',
        test: () => this.testJSFeature('Promise'),
        criticalForApp: true,
        fallback: 'Callback-based async'
      },
      {
        feature: 'Intersection Observer',
        test: () => this.testJSFeature('IntersectionObserver'),
        criticalForApp: false,
        fallback: 'Scroll event listeners'
      },
      {
        feature: 'Local Storage',
        test: () => this.testJSFeature('localStorage'),
        criticalForApp: true,
        fallback: 'Cookies'
      },
      {
        feature: 'Request Animation Frame',
        test: () => this.testJSFeature('requestAnimationFrame'),
        criticalForApp: false,
        fallback: 'setTimeout animations'
      }
    ];
    return features.map(({ feature, test, criticalForApp, fallback }) => {
      const supported = test();
      return {
        feature,
        supported,
        fallback,
        polyfillNeeded: !supported && criticalForApp,
        criticalForApp
      };
    });
  }
}
/**
 * Cross-browser Testing Suite
 */
export class CrossBrowserTester {
  /**
   * Run comprehensive cross-browser tests
   */
  static async runTests(): Promise<CrossBrowserTestResult> {
    const browser = BrowserDetector.detectBrowser();
    const features = FeatureDetector.getFeatureSupport();
    // Test CSS support
    const cssSupport = {
      'grid': FeatureDetector.testCSSFeature('display', 'grid'),
      'flexbox': FeatureDetector.testCSSFeature('display', 'flex'),
      'customProperties': FeatureDetector.testCSSFeature('--test', 'value'),
      'transforms': FeatureDetector.testCSSFeature('transform'),
      'transitions': FeatureDetector.testCSSFeature('transition'),
      'animations': FeatureDetector.testCSSFeature('animation'),
      'backdropFilter': FeatureDetector.testCSSFeature('backdropFilter'),
      'clipPath': FeatureDetector.testCSSFeature('clipPath')
    };
    // Test JavaScript support
    const jsSupport = {
      'fetch': FeatureDetector.testJSFeature('fetch'),
      'promises': FeatureDetector.testJSFeature('Promise'),
      'intersectionObserver': FeatureDetector.testJSFeature('IntersectionObserver'),
      'resizeObserver': FeatureDetector.testJSFeature('ResizeObserver'),
      'localStorage': FeatureDetector.testJSFeature('localStorage'),
      'requestAnimationFrame': FeatureDetector.testJSFeature('requestAnimationFrame'),
      'serviceWorker': FeatureDetector.testJSFeature('ServiceWorker'),
      'webGL': FeatureDetector.testJSFeature('WebGL')
    };
    // Calculate overall compatibility
    const totalFeatures = features.length;
    const supportedFeatures = features.filter(f => f.supported).length;
    const criticalFeatures = features.filter(f => f.criticalForApp);
    const supportedCriticalFeatures = criticalFeatures.filter(f => f.supported);
    // Weight critical features more heavily
    const criticalWeight = 0.7;
    const nonCriticalWeight = 0.3;
    const criticalScore = criticalFeatures.length > 0 
      ? (supportedCriticalFeatures.length / criticalFeatures.length) * 100 
      : 100;
    const nonCriticalScore = totalFeatures > criticalFeatures.length
      ? ((supportedFeatures - supportedCriticalFeatures.length) / (totalFeatures - criticalFeatures.length)) * 100
      : 100;
    const overallCompatibility = Math.round(
      (criticalScore * criticalWeight) + (nonCriticalScore * nonCriticalWeight)
    );
    // Generate issues and recommendations
    const issues: string[] = [];
    const recommendations: string[] = [];
    if (!browser.supported) {
      issues.push(`${browser.name} ${browser.version} is not officially supported`);
      recommendations.push('Please upgrade to a modern browser for the best experience');
    }
    features.forEach(feature => {
      if (!feature.supported && feature.criticalForApp) {
        issues.push(`${feature.feature} is not supported`);
        if (feature.fallback) {
          recommendations.push(`Consider using ${feature.fallback} as a fallback for ${feature.feature}`);
        }
      }
      if (feature.polyfillNeeded) {
        recommendations.push(`Add polyfill for ${feature.feature}`);
      }
    });
    // Browser-specific recommendations
    if (browser.name === 'Safari' && parseInt(browser.version) < 15) {
      recommendations.push('Some modern CSS features may not work in older Safari versions');
    }
    if (browser.name === 'Firefox' && parseInt(browser.version) < 90) {
      recommendations.push('Consider testing backdrop-filter and other modern CSS features');
    }
    return {
      browser,
      features,
      cssSupport,
      jsSupport,
      overallCompatibility,
      issues,
      recommendations
    };
  }
  /**
   * Get browser compatibility matrix
   */
  static getBrowserMatrix(): Record<string, { minVersion: number; supported: boolean }> {
    return {
      'Chrome': { minVersion: 90, supported: true },
      'Firefox': { minVersion: 88, supported: true },
      'Safari': { minVersion: 14, supported: true },
      'Edge': { minVersion: 90, supported: true },
      'Internet Explorer': { minVersion: 11, supported: false },
      'Opera': { minVersion: 76, supported: true },
      'Samsung Internet': { minVersion: 14, supported: true }
    };
  }
  /**
   * Check if current browser meets minimum requirements
   */
  static meetsMinimumRequirements(): boolean {
    const browser = BrowserDetector.detectBrowser();
    const matrix = this.getBrowserMatrix();
    const browserInfo = matrix[browser.name];
    if (!browserInfo) return false;
    if (!browserInfo.supported) return false;
    const version = parseInt(browser.version);
    return version >= browserInfo.minVersion;
  }
}
/**
 * Export default tester instance
 */
export const crossBrowserTester = CrossBrowserTester;
