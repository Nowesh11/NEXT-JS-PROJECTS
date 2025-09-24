/**
 * Performance Optimization Utilities
 * Comprehensive performance monitoring and optimization tools
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isSupported = typeof window !== 'undefined' && 'performance' in window;
  }

  // Start performance measurement
  startMeasure(name) {
    if (!this.isSupported) return;
    performance.mark(`${name}-start`);
  }

  // End performance measurement
  endMeasure(name) {
    if (!this.isSupported) return;
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    this.metrics.set(name, measure.duration);
    
    // Clean up marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
    
    return measure.duration;
  }

  // Get all metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Monitor Core Web Vitals
  monitorWebVitals(callback) {
    if (!this.isSupported) return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      callback({ name: 'LCP', value: lcp.startTime, rating: this.getRating('LCP', lcp.startTime) });
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const fid = entries[0];
      callback({ name: 'FID', value: fid.processingStart - fid.startTime, rating: this.getRating('FID', fid.processingStart - fid.startTime) });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      callback({ name: 'CLS', value: clsValue, rating: this.getRating('CLS', clsValue) });
    });
  }

  // Observe specific metrics
  observeMetric(type, callback) {
    if (!this.isSupported || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  // Get performance rating
  getRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Image optimization utilities
export const ImageOptimizer = {
  // Generate responsive image sources
  generateSrcSet(src, sizes = [320, 640, 768, 1024, 1280, 1920]) {
    return sizes.map(size => `${src}?w=${size} ${size}w`).join(', ');
  },

  // Generate sizes attribute
  generateSizes(breakpoints = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw'
  }) {
    return Object.entries(breakpoints)
      .map(([bp, size]) => `(min-width: ${this.getBreakpointValue(bp)}) ${size}`)
      .join(', ');
  },

  // Get breakpoint values
  getBreakpointValue(breakpoint) {
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    };
    return breakpoints[breakpoint] || '100vw';
  },

  // Lazy loading with Intersection Observer
  createLazyLoader(threshold = 0.1, rootMargin = '50px') {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) img.src = src;
          if (srcset) img.srcset = srcset;

          img.classList.remove('lazy');
          img.classList.add('loaded');
          
          this.unobserve(img);
        }
      });
    }, { threshold, rootMargin });
  }
};

// Memory management utilities
export const MemoryManager = {
  // Monitor memory usage
  getMemoryInfo() {
    if (typeof window === 'undefined' || !performance.memory) {
      return null;
    }

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    };
  },

  // Cleanup function for components
  createCleanup() {
    const cleanupTasks = [];

    return {
      add: (task) => cleanupTasks.push(task),
      execute: () => {
        cleanupTasks.forEach(task => {
          try {
            task();
          } catch (error) {
            console.warn('Cleanup task failed:', error);
          }
        });
        cleanupTasks.length = 0;
      }
    };
  }
};

// Bundle optimization utilities
export const BundleOptimizer = {
  // Dynamic import with error handling
  async dynamicImport(importFn, fallback = null) {
    try {
      const module = await importFn();
      return module.default || module;
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return fallback;
    }
  },

  // Preload critical resources
  preloadResource(href, as = 'script', crossorigin = 'anonymous') {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    
    document.head.appendChild(link);
  },

  // Prefetch resources
  prefetchResource(href) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
  }
};

// React performance hooks
export const usePerformance = () => {
  const monitor = useRef(new PerformanceMonitor());
  const [metrics, setMetrics] = useState({});

  const startMeasure = useCallback((name) => {
    monitor.current.startMeasure(name);
  }, []);

  const endMeasure = useCallback((name) => {
    const duration = monitor.current.endMeasure(name);
    setMetrics(prev => ({ ...prev, [name]: duration }));
    return duration;
  }, []);

  const measureAsync = useCallback(async (name, asyncFn) => {
    startMeasure(name);
    try {
      const result = await asyncFn();
      endMeasure(name);
      return result;
    } catch (error) {
      endMeasure(name);
      throw error;
    }
  }, [startMeasure, endMeasure]);

  useEffect(() => {
    return () => {
      monitor.current.disconnect();
    };
  }, []);

  return {
    startMeasure,
    endMeasure,
    measureAsync,
    metrics,
    monitor: monitor.current
  };
};

// Debounce hook for performance
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Intersection Observer hook
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isIntersecting, entry];
};

// Virtual scrolling hook
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

// Memoization utilities
export const createMemoizedSelector = (selector, equalityFn = Object.is) => {
  let lastArgs = [];
  let lastResult;

  return (...args) => {
    if (args.length !== lastArgs.length || !args.every((arg, i) => equalityFn(arg, lastArgs[i]))) {
      lastArgs = args;
      lastResult = selector(...args);
    }
    return lastResult;
  };
};

// Resource preloading
export const ResourcePreloader = {
  // Preload images
  preloadImages(urls) {
    return Promise.all(
      urls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      })
    );
  },

  // Preload fonts
  preloadFonts(fonts) {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();

    return Promise.all(
      fonts.map(font => {
        const fontFace = new FontFace(font.family, `url(${font.url})`, font.descriptors);
        document.fonts.add(fontFace);
        return fontFace.load();
      })
    );
  },

  // Preload critical CSS
  preloadCSS(href) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }
};

// Performance optimization recommendations
export const PerformanceAnalyzer = {
  // Analyze component render performance
  analyzeRenderPerformance(componentName, renderCount, renderTime) {
    const avgRenderTime = renderTime / renderCount;
    const recommendations = [];

    if (avgRenderTime > 16) {
      recommendations.push('Consider memoizing this component with React.memo()');
    }
    if (renderCount > 10) {
      recommendations.push('High render count detected. Check for unnecessary re-renders.');
    }
    if (avgRenderTime > 50) {
      recommendations.push('Consider code splitting or lazy loading for this component.');
    }

    return {
      componentName,
      avgRenderTime,
      renderCount,
      recommendations,
      score: this.calculatePerformanceScore(avgRenderTime, renderCount)
    };
  },

  // Calculate performance score
  calculatePerformanceScore(avgRenderTime, renderCount) {
    let score = 100;
    
    if (avgRenderTime > 16) score -= 20;
    if (avgRenderTime > 50) score -= 30;
    if (renderCount > 10) score -= 15;
    if (renderCount > 20) score -= 25;
    
    return Math.max(0, score);
  },

  // Generate performance report
  generateReport(metrics) {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations: [],
      overallScore: 0
    };

    // Analyze metrics and generate recommendations
    Object.entries(metrics).forEach(([name, value]) => {
      if (name.includes('render') && value > 16) {
        report.recommendations.push(`Optimize ${name} - current: ${value.toFixed(2)}ms`);
      }
    });

    // Calculate overall score
    const scores = Object.values(metrics).map(value => 
      Math.max(0, 100 - (value > 16 ? (value - 16) * 2 : 0))
    );
    report.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return report;
  }
};

export default {
  PerformanceMonitor,
  ImageOptimizer,
  MemoryManager,
  BundleOptimizer,
  ResourcePreloader,
  PerformanceAnalyzer,
  usePerformance,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useVirtualScroll,
  createMemoizedSelector
};