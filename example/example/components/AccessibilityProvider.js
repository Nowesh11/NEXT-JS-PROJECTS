'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider Component
export const AccessibilityProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [focusVisible, setFocusVisible] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Check for user's motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Check for high contrast preference - prioritize saved preference over system preference
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    if (savedHighContrast !== null) {
      setHighContrast(savedHighContrast === 'true');
    } else {
      setHighContrast(contrastQuery.matches);
    }

    // Set up contrast media query listener
    const handleContrastChange = (e) => {
      // Only update if no saved preference exists
      if (localStorage.getItem('accessibility-high-contrast') === null) {
        setHighContrast(e.matches);
      }
    };
    contrastQuery.addEventListener('change', handleContrastChange);

    // Load saved font size preference
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    if (savedFontSize) setFontSize(savedFontSize);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Announce to screen readers
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    }, 1000);
  };

  // Toggle high contrast
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    announce(newValue ? 'High contrast enabled' : 'High contrast disabled');
  };

  // Change font size
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
    announce(`Font size changed to ${size}`);
  };

  // Skip to main content
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const value = {
    reducedMotion,
    highContrast,
    fontSize,
    focusVisible,
    announce,
    toggleHighContrast,
    changeFontSize,
    skipToMain,
    setFocusVisible
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div 
        className={`
          ${highContrast ? 'accessibility-high-contrast' : ''}
          ${fontSize === 'large' ? 'accessibility-large-text' : ''}
          ${fontSize === 'extra-large' ? 'accessibility-extra-large-text' : ''}
        `}
      >
        {children}
        
        {/* Screen Reader Announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcements
            .filter(ann => ann.priority === 'polite')
            .map(ann => (
              <div key={ann.id}>{ann.message}</div>
            ))
          }
        </div>
        
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {announcements
            .filter(ann => ann.priority === 'assertive')
            .map(ann => (
              <div key={ann.id}>{ann.message}</div>
            ))
          }
        </div>
      </div>
    </AccessibilityContext.Provider>
  );
};

// Skip Link Component
export const SkipLink = () => {
  const { skipToMain } = useAccessibility();
  
  return (
    <button
      onClick={skipToMain}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-primary-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-primary-300
      "
    >
      Skip to main content
    </button>
  );
};

// Accessible Button Component
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  ariaLabel, 
  ariaDescribedBy,
  className = '',
  variant = 'primary',
  ...props 
}) => {
  const { announce, reducedMotion } = useAccessibility();
  
  const handleClick = (e) => {
    if (disabled) return;
    
    if (onClick) {
      onClick(e);
    }
    
    // Announce button action to screen readers
    if (ariaLabel) {
      announce(`${ariaLabel} activated`);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        ${className}
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'primary' ? 'focus:ring-primary-500' : 'focus:ring-secondary-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${reducedMotion ? '' : 'transition-all duration-200'}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible Link Component
export const AccessibleLink = ({ 
  children, 
  href, 
  external = false, 
  ariaLabel,
  className = '',
  ...props 
}) => {
  const { reducedMotion } = useAccessibility();
  
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`
        ${className}
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${reducedMotion ? '' : 'transition-all duration-200'}
      `}
      {...props}
    >
      {children}
      {external && (
        <span className="sr-only"> (opens in new tab)</span>
      )}
    </a>
  );
};

// Focus Trap Component
export const FocusTrap = ({ children, active = true }) => {
  useEffect(() => {
    if (!active) return;
    
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector('[data-focus-trap]');
    
    if (!modal) return;
    
    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);
  
  return (
    <div data-focus-trap={active}>
      {children}
    </div>
  );
};

// Accessible Heading Component
export const AccessibleHeading = ({ 
  level = 1, 
  children, 
  className = '',
  id,
  ...props 
}) => {
  const Tag = `h${level}`;
  
  return (
    <Tag
      id={id}
      className={`${className} focus:outline-none`}
      tabIndex={-1}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default AccessibilityProvider;