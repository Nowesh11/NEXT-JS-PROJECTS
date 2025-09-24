/**
 * Responsive Component Library
 * Glassmorphism, animations, and interactive elements
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/outline';
import { useScreenReader, focusVisible } from '../../lib/accessibility';

// Glass Morphism Card
export const GlassCard = ({ 
  children, 
  className = '', 
  hover = true, 
  blur = 'backdrop-blur-md',
  ...props 
}) => {
  return (
    <motion.div
      className={`
        glass-morphism ${blur} rounded-2xl p-6 
        border border-white/20 dark:border-gray-700/50
        ${hover ? 'hover:shadow-xl hover:shadow-cultural-500/10' : ''}
        transition-all duration-300
        ${className}
      `}
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Button
export const AnimatedButton = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '', 
  onClick,
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cultural-500 to-cultural-600 text-white hover:from-cultural-600 hover:to-cultural-700',
    secondary: 'bg-white/10 backdrop-blur-md text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-white/20',
    outline: 'border-2 border-cultural-500 text-cultural-500 hover:bg-cultural-500 hover:text-white',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  return (
    <motion.button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${focusVisible.button}
        transition-all duration-200
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

// Modal Component
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  className = '' 
}) => {
  const { announce } = useScreenReader();
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      announce(`${title || 'Modal'} opened`, 'polite');
      
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length > 0) {
        focusableElements[0].focus();
      }
    } else if (previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [isOpen, title, announce]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`
              relative w-full ${sizes[size]} glass-morphism backdrop-blur-xl 
              rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50
              ${className}
            `}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className={`
                    p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                    rounded-lg transition-colors ${focusVisible.button}
                  `}
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Notification
export const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  const { announce } = useScreenReader();

  const types = {
    success: {
      icon: CheckIcon,
      className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
    },
    error: {
      icon: ExclamationTriangleIcon,
      className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    },
    info: {
      icon: InformationCircleIcon,
      className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
  };

  const { icon: Icon, className } = types[type];

  useEffect(() => {
    if (isVisible) {
      announce(`${type}: ${title || message}`, type === 'error' ? 'assertive' : 'polite');
      
      if (duration > 0) {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, type, title, message, duration, onClose, announce]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            glass-morphism backdrop-blur-md rounded-xl p-4 border shadow-lg
            ${className}
          `}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="alert"
          aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            
            <div className="flex-1 min-w-0">
              {title && (
                <p className="font-medium">{title}</p>
              )}
              {message && (
                <p className={title ? 'text-sm mt-1' : ''}>{message}</p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className={`
                flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 
                transition-colors ${focusVisible.button}
              `}
              aria-label="Close notification"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Accordion Component
export const Accordion = ({ items = [], className = '' }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const headingId = `accordion-heading-${index}`;
        const panelId = `accordion-panel-${index}`;
        
        return (
          <div key={index} className="glass-morphism backdrop-blur-md rounded-xl border border-white/20 dark:border-gray-700/50">
            <button
              id={headingId}
              className={`
                w-full flex items-center justify-between p-4 text-left 
                hover:bg-white/10 dark:hover:bg-gray-800/50 
                transition-colors rounded-xl ${focusVisible.button}
              `}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-gray-600 dark:text-gray-300">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// Tabs Component
export const Tabs = ({ tabs = [], defaultTab = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      {/* Tab List */}
      <div 
        className="flex space-x-1 glass-morphism backdrop-blur-md rounded-xl p-1 border border-white/20 dark:border-gray-700/50"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const tabId = `tab-${index}`;
          const panelId = `tabpanel-${index}`;
          
          return (
            <button
              key={index}
              id={tabId}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-white dark:bg-gray-800 text-cultural-600 dark:text-cultural-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
                ${focusVisible.button}
              `}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const tabId = `tab-${index}`;
          const panelId = `tabpanel-${index}`;
          
          return (
            <div
              key={index}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
              className={isActive ? 'block' : 'hidden'}
            >
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Progress Bar
export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  label, 
  showValue = true, 
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const progressRef = useRef(null);
  const isInView = useInView(progressRef);
  
  const progress = useMotionValue(0);
  const animatedProgress = useSpring(progress, { stiffness: 100, damping: 30 });
  
  useEffect(() => {
    if (isInView) {
      progress.set(percentage);
    }
  }, [isInView, percentage, progress]);

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
          )}
          {showValue && (
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        ref={progressRef}
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-cultural-500 to-cultural-600 rounded-full"
          style={{ width: `${animatedProgress.get()}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Loading Spinner
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'cultural', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    cultural: 'border-cultural-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div
      className={`
        ${sizes[size]} border-2 ${colors[color]} border-t-transparent 
        rounded-full animate-spin ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton Loader
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  className = '', 
  variant = 'rectangular' 
}) => {
  const variants = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded'
  };

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 animate-pulse ${variants[variant]} ${className}
      `}
      style={{ width, height }}
      aria-label="Loading content"
    />
  );
};

// Tooltip Component
export const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const showTooltip = isVisible || isFocused;

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            ref={tooltipRef}
            className={`
              absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 dark:bg-gray-700 
              rounded shadow-lg whitespace-nowrap ${positions[position]}
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default {
  GlassCard,
  AnimatedButton,
  Modal,
  Toast,
  Accordion,
  Tabs,
  ProgressBar,
  LoadingSpinner,
  Skeleton,
  Tooltip
};