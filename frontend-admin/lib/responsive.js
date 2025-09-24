/**
 * Mobile Responsiveness and Device Utilities
 * Comprehensive responsive design and mobile optimization tools
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Device type detection
export const DeviceDetector = {
  // Get device type based on screen width
  getDeviceType(width = typeof window !== 'undefined' ? window.innerWidth : 1024) {
    if (width < breakpoints.sm) return 'mobile';
    if (width < breakpoints.lg) return 'tablet';
    return 'desktop';
  },

  // Check if device is mobile
  isMobile(width) {
    return this.getDeviceType(width) === 'mobile';
  },

  // Check if device is tablet
  isTablet(width) {
    return this.getDeviceType(width) === 'tablet';
  },

  // Check if device is desktop
  isDesktop(width) {
    return this.getDeviceType(width) === 'desktop';
  },

  // Detect touch capability
  isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get device pixel ratio
  getPixelRatio() {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  },

  // Check if device supports hover
  supportsHover() {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover)').matches;
  },

  // Get viewport dimensions
  getViewportDimensions() {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  // Check if device is in landscape mode
  isLandscape() {
    const { width, height } = this.getViewportDimensions();
    return width > height;
  },

  // Check if device is in portrait mode
  isPortrait() {
    return !this.isLandscape();
  }
};

// Responsive hooks
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => DeviceDetector.getViewportDimensions());
  const [deviceType, setDeviceType] = useState(() => DeviceDetector.getDeviceType());
  const [orientation, setOrientation] = useState(() => 
    DeviceDetector.isLandscape() ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = DeviceDetector.getViewportDimensions();
      const newDeviceType = DeviceDetector.getDeviceType(newDimensions.width);
      const newOrientation = DeviceDetector.isLandscape() ? 'landscape' : 'portrait';
      
      setDimensions(newDimensions);
      setDeviceType(newDeviceType);
      setOrientation(newOrientation);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const breakpointMatches = useMemo(() => {
    const matches = {};
    Object.entries(breakpoints).forEach(([key, value]) => {
      matches[key] = dimensions.width >= value;
    });
    return matches;
  }, [dimensions.width]);

  return {
    dimensions,
    deviceType,
    orientation,
    breakpointMatches,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    isTouchDevice: DeviceDetector.isTouchDevice(),
    supportsHover: DeviceDetector.supportsHover(),
    pixelRatio: DeviceDetector.getPixelRatio()
  };
};

// Media query hook
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

// Breakpoint hook
export const useBreakpoint = (breakpoint) => {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`;
  return useMediaQuery(query);
};

// Container query utilities
export const ContainerQueries = {
  // Generate container query classes
  generateClasses(containerWidth, breakpoints = {}) {
    const classes = [];
    
    Object.entries(breakpoints).forEach(([breakpoint, minWidth]) => {
      if (containerWidth >= minWidth) {
        classes.push(`container-${breakpoint}`);
      }
    });
    
    return classes.join(' ');
  },

  // Container query hook
  useContainerQuery(ref, breakpoints = {}) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [activeBreakpoints, setActiveBreakpoints] = useState([]);

    useEffect(() => {
      if (!ref.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        const width = entry.contentRect.width;
        setContainerWidth(width);
        
        const active = Object.entries(breakpoints)
          .filter(([, minWidth]) => width >= minWidth)
          .map(([breakpoint]) => breakpoint);
        setActiveBreakpoints(active);
      });

      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }, [ref, breakpoints]);

    return {
      containerWidth,
      activeBreakpoints,
      classes: this.generateClasses(containerWidth, breakpoints)
    };
  }
};

// Responsive image utilities
export const ResponsiveImage = {
  // Generate responsive image props
  generateProps(src, options = {}) {
    const {
      sizes = {
        mobile: 100,
        tablet: 50,
        desktop: 33
      },
      quality = 75,
      format = 'webp'
    } = options;

    const srcSet = Object.entries(breakpoints)
      .map(([breakpoint, width]) => {
        const imageWidth = Math.round(width * (sizes[DeviceDetector.getDeviceType(width)] || 100) / 100);
        return `${src}?w=${imageWidth}&q=${quality}&f=${format} ${width}w`;
      })
      .join(', ');

    const sizesAttr = Object.entries(sizes)
      .map(([device, percentage]) => {
        const breakpoint = device === 'mobile' ? 0 : device === 'tablet' ? breakpoints.md : breakpoints.lg;
        return `(min-width: ${breakpoint}px) ${percentage}vw`;
      })
      .reverse()
      .join(', ');

    return {
      src: `${src}?w=800&q=${quality}&f=${format}`,
      srcSet,
      sizes: sizesAttr,
      loading: 'lazy',
      decoding: 'async'
    };
  },

  // Lazy loading with intersection observer
  useLazyLoading(threshold = 0.1, rootMargin = '50px') {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useCallback((node) => {
      if (node && typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          },
          { threshold, rootMargin }
        );
        observer.observe(node);
      }
    }, [threshold, rootMargin]);

    return {
      imgRef,
      isInView,
      isLoaded,
      setIsLoaded
    };
  }
};

// Touch gesture utilities
export const TouchGestures = {
  // Swipe detection
  useSwipeGesture(onSwipe, threshold = 50) {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const handleTouchStart = useCallback((e) => {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    }, []);

    const handleTouchMove = useCallback((e) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (!touchStart || !touchEnd) return;
      
      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchStart.y - touchEnd.y;
      const isLeftSwipe = distanceX > threshold;
      const isRightSwipe = distanceX < -threshold;
      const isUpSwipe = distanceY > threshold;
      const isDownSwipe = distanceY < -threshold;

      if (isLeftSwipe) onSwipe('left');
      if (isRightSwipe) onSwipe('right');
      if (isUpSwipe) onSwipe('up');
      if (isDownSwipe) onSwipe('down');
    }, [touchStart, touchEnd, threshold, onSwipe]);

    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    };
  },

  // Pinch zoom detection
  usePinchGesture(onPinch) {
    const [initialDistance, setInitialDistance] = useState(null);

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e) => {
      if (e.touches.length === 2) {
        setInitialDistance(getDistance(e.touches));
      }
    }, []);

    const handleTouchMove = useCallback((e) => {
      if (e.touches.length === 2 && initialDistance) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;
        onPinch(scale);
      }
    }, [initialDistance, onPinch]);

    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove
    };
  }
};

// Responsive typography utilities
export const ResponsiveTypography = {
  // Calculate fluid font size
  getFluidFontSize(minSize, maxSize, minViewport = 320, maxViewport = 1200) {
    return `clamp(${minSize}rem, ${minSize}rem + ${maxSize - minSize} * ((100vw - ${minViewport}px) / ${maxViewport - minViewport}), ${maxSize}rem)`;
  },

  // Generate responsive font scale
  generateFontScale(baseSize = 16, ratio = 1.25, steps = 6) {
    const scale = {};
    
    for (let i = -2; i <= steps; i++) {
      const size = baseSize * Math.pow(ratio, i);
      scale[`text-${i <= 0 ? 'xs'.repeat(Math.abs(i)) + (i === 0 ? 'base' : '') : 'xl'.repeat(i)}`] = `${size / 16}rem`;
    }
    
    return scale;
  },

  // Responsive line height calculator
  getResponsiveLineHeight(fontSize, deviceType) {
    const ratios = {
      mobile: 1.4,
      tablet: 1.5,
      desktop: 1.6
    };
    
    return fontSize * (ratios[deviceType] || ratios.desktop);
  }
};

// Layout utilities
export const ResponsiveLayout = {
  // Generate grid columns based on screen size
  getGridColumns(deviceType, contentCount) {
    const columnMap = {
      mobile: Math.min(contentCount, 1),
      tablet: Math.min(contentCount, 2),
      desktop: Math.min(contentCount, 3)
    };
    
    return columnMap[deviceType] || 1;
  },

  // Calculate container padding
  getContainerPadding(deviceType) {
    const paddingMap = {
      mobile: '1rem',
      tablet: '2rem',
      desktop: '3rem'
    };
    
    return paddingMap[deviceType] || paddingMap.desktop;
  },

  // Generate responsive spacing
  getResponsiveSpacing(base = 1, multipliers = { mobile: 0.75, tablet: 1, desktop: 1.25 }) {
    return Object.entries(multipliers).reduce((acc, [device, multiplier]) => {
      acc[device] = `${base * multiplier}rem`;
      return acc;
    }, {});
  }
};

// Performance optimization for mobile
export const MobileOptimization = {
  // Reduce animations on mobile
  shouldReduceAnimations(deviceType, userPreference = false) {
    if (userPreference) return true;
    return deviceType === 'mobile' && DeviceDetector.getPixelRatio() > 2;
  },

  // Optimize images for mobile
  getMobileImageQuality(deviceType, connection) {
    if (deviceType === 'mobile') {
      if (connection && connection.effectiveType === '2g') return 30;
      if (connection && connection.effectiveType === '3g') return 50;
      return 70;
    }
    return 85;
  },

  // Check network connection
  getNetworkInfo() {
    if (typeof navigator === 'undefined' || !navigator.connection) {
      return { effectiveType: '4g', downlink: 10 };
    }
    
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  },

  // Adaptive loading based on connection
  shouldLoadHeavyContent(connection = this.getNetworkInfo()) {
    if (connection.saveData) return false;
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') return false;
    if (connection.downlink < 1.5) return false;
    return true;
  }
};

// Accessibility utilities for mobile
export const MobileAccessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Get optimal touch target size
  getTouchTargetSize(deviceType) {
    const sizes = {
      mobile: '44px', // iOS HIG recommendation
      tablet: '48px',
      desktop: '40px'
    };
    
    return sizes[deviceType] || sizes.mobile;
  },

  // Calculate safe area insets for mobile devices
  getSafeAreaInsets() {
    if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
    
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    };
  }
};

export default {
  breakpoints,
  DeviceDetector,
  useResponsive,
  useMediaQuery,
  useBreakpoint,
  ContainerQueries,
  ResponsiveImage,
  TouchGestures,
  ResponsiveTypography,
  ResponsiveLayout,
  MobileOptimization,
  MobileAccessibility
};