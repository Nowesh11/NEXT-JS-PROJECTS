/**
 * Accessibility utilities for the TLS Admin Frontend
 * Provides WCAG 2.1 AA compliant features and utilities
 */

import { useEffect, useRef, useState } from 'react';

// Screen reader announcement hook
export const useScreenReader = () => {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const announce = (text, priority = 'polite') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setMessage('');
    timeoutRef.current = setTimeout(() => {
      setMessage(text);
    }, 100);
  };

  const clear = () => {
    setMessage('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { message, announce, clear };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusRef = useRef(null);
  const previousFocusRef = useRef(null);

  const setFocus = (element) => {
    if (element && element.focus) {
      previousFocusRef.current = document.activeElement;
      element.focus();
    }
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  };

  const trapFocus = (container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        restoreFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { setFocus, restoreFocus, trapFocus, focusRef };
};

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const handleArrowNavigation = (e, items, currentIndex, onSelect) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) onSelect(items[currentIndex]);
        return currentIndex;
      default:
        return currentIndex;
    }
    
    return newIndex;
  };

  const handleTabNavigation = (e, nextElement, prevElement) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && prevElement) {
        e.preventDefault();
        prevElement.focus();
      } else if (!e.shiftKey && nextElement) {
        e.preventDefault();
        nextElement.focus();
      }
    }
  };

  return { handleArrowNavigation, handleTabNavigation };
};

// Color contrast utilities
export const colorContrast = {
  // Check if color meets WCAG AA contrast ratio (4.5:1)
  meetsAA: (foreground, background) => {
    const ratio = getContrastRatio(foreground, background);
    return ratio >= 4.5;
  },
  
  // Check if color meets WCAG AAA contrast ratio (7:1)
  meetsAAA: (foreground, background) => {
    const ratio = getContrastRatio(foreground, background);
    return ratio >= 7;
  },
  
  // Get contrast ratio between two colors
  getRatio: getContrastRatio
};

function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Reduced motion utilities
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// High contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Skip link component
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cultural-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
      onFocus={(e) => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      {children}
    </a>
  );
};

// Screen reader only text component
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

// Live region component for announcements
export const LiveRegion = ({ message, priority = 'polite', atomic = true }) => {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
};

// Focus visible utility
export const focusVisible = {
  // Add focus-visible polyfill classes
  className: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-cultural-500/50 focus-visible:ring-offset-2',
  
  // Custom focus styles for different components
  button: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-cultural-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800',
  input: 'focus:outline-none focus:ring-2 focus:ring-cultural-500/50 focus:border-cultural-500',
  link: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-cultural-500/50 focus-visible:rounded'
};

// ARIA utilities
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Common ARIA attributes
  expanded: (isExpanded) => ({
    'aria-expanded': isExpanded.toString()
  }),
  
  selected: (isSelected) => ({
    'aria-selected': isSelected.toString()
  }),
  
  pressed: (isPressed) => ({
    'aria-pressed': isPressed.toString()
  }),
  
  invalid: (isInvalid) => ({
    'aria-invalid': isInvalid.toString()
  }),
  
  required: (isRequired) => ({
    'aria-required': isRequired.toString()
  }),
  
  hidden: (isHidden) => ({
    'aria-hidden': isHidden.toString()
  })
};

// Form validation utilities
export const formValidation = {
  // Get validation message for screen readers
  getValidationMessage: (field, errors) => {
    if (!errors[field]) return '';
    return Array.isArray(errors[field]) ? errors[field].join(', ') : errors[field];
  },
  
  // Get ARIA attributes for form fields
  getFieldAttributes: (field, errors, descriptions = {}) => {
    const hasError = errors[field];
    const hasDescription = descriptions[field];
    
    let describedBy = [];
    if (hasError) describedBy.push(`${field}-error`);
    if (hasDescription) describedBy.push(`${field}-description`);
    
    return {
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined
    };
  }
};

// Table accessibility utilities
export const tableA11y = {
  // Get table headers for screen readers
  getHeaders: (rowIndex, colIndex, headers) => {
    const rowHeaders = headers.rows?.[rowIndex] || [];
    const colHeaders = headers.columns?.[colIndex] || [];
    return [...rowHeaders, ...colHeaders].join(' ');
  },
  
  // Sort announcement for screen readers
  getSortAnnouncement: (column, direction) => {
    const directionText = direction === 'asc' ? 'ascending' : 'descending';
    return `Table sorted by ${column} in ${directionText} order`;
  }
};

export default {
  useScreenReader,
  useFocusManagement,
  useKeyboardNavigation,
  useReducedMotion,
  useHighContrast,
  colorContrast,
  focusVisible,
  aria,
  formValidation,
  tableA11y,
  SkipLink,
  ScreenReaderOnly,
  LiveRegion
};