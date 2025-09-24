import { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Lazy loaded components for code splitting
const LazyHero = lazy(() => import('./Hero'));
const LazyFeatures = lazy(() => import('./ContentRenderer'));
const LazyNavigation = lazy(() => import('./Navigation'));

// Dynamic imports with loading states
const DynamicMicroInteractions = dynamic(
  () => import('./MicroInteractions'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    ),
    ssr: false // Client-side only for interactive components
  }
);

// Memoized loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[200px]">
    <motion.div
      className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <span className="ml-3 text-text-secondary">Loading...</span>
  </div>
));

// Optimized image component with lazy loading
const OptimizedImage = memo(({ src, alt, className, priority = false, ...props }) => {
  const imageProps = useMemo(() => ({
    src,
    alt,
    className,
    loading: priority ? 'eager' : 'lazy',
    quality: 85,
    placeholder: 'blur',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    ...props
  }), [src, alt, className, priority, props]);

  return <Image {...imageProps} />;
});

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const logPerformance = useCallback((label, startTime) => {
    if (typeof window !== 'undefined' && window.performance) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }
  }, []);

  const measureRender = useCallback((componentName) => {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = performance.now();
      return () => logPerformance(`${componentName} render`, startTime);
    }
    return () => {};
  }, [logPerformance]);

  return { measureRender, logPerformance };
};

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (callback, options = {}) => {
  const [ref, setRef] = useState(null);
  const optionsRef = useRef(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...optionsRef.current
    });
    
    observer.observe(ref);
    
    return () => observer.disconnect();
  }, [ref, callback]);
  
  return setRef;
};

// Optimized section wrapper
const LazySection = memo(({ children, className, fallback = <LoadingSpinner /> }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { measureRender } = usePerformanceMonitor();
  
  const handleIntersection = useCallback(([entry]) => {
    if (entry.isIntersecting) {
      const endMeasure = measureRender('LazySection');
      setIsVisible(true);
      endMeasure();
    }
  }, [measureRender]);
  
  const ref = useIntersectionObserver(handleIntersection);
  
  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      )}
    </div>
  );
});

// Bundle size analyzer (development only)
const BundleAnalyzer = memo(() => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Bundle loaded: {typeof window !== 'undefined' ? 'Client' : 'Server'}</div>
      <div>Hydrated: {typeof window !== 'undefined' && window.React ? 'Yes' : 'No'}</div>
    </div>
  );
});

export {
  LazyHero,
  LazyFeatures,
  LazyNavigation,
  DynamicMicroInteractions,
  LoadingSpinner,
  OptimizedImage,
  LazySection,
  BundleAnalyzer,
  usePerformanceMonitor,
  useIntersectionObserver
};

export default {
  LazyHero,
  LazyFeatures,
  LazyNavigation,
  DynamicMicroInteractions,
  LoadingSpinner,
  OptimizedImage,
  LazySection,
  BundleAnalyzer
};