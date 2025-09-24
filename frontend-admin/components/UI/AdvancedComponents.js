/**
 * Advanced Component Library Extensions
 * Enhanced glassmorphism, complex animations, and interactive elements
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ArrowUpIcon,
  BellIcon,
  CogIcon,
  UserIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import { useScreenReader, focusVisible } from '../../lib/accessibility';

// Floating Action Button with Glassmorphism
export const FloatingActionButton = ({ 
  icon: Icon = CogIcon, 
  onClick, 
  position = 'bottom-right',
  className = '',
  ...props 
}) => {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <motion.button
      className={`
        ${positions[position]} z-50 w-14 h-14 glass-morphism backdrop-blur-xl
        rounded-full shadow-2xl border border-white/30 dark:border-gray-700/50
        flex items-center justify-center text-cultural-600 dark:text-cultural-400
        hover:shadow-cultural-500/20 transition-all duration-300
        ${focusVisible.button} ${className}
      `}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      {...props}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
};

// Advanced Search Bar with Glassmorphism
export const GlassSearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  suggestions = [], 
  className = '',
  ...props 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        setQuery(suggestions[selectedIndex]);
        onSearch?.(suggestions[selectedIndex]);
      } else {
        onSearch?.(query);
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative glass-morphism backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/50">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0 && suggestions.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0 && suggestions.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-4 py-3 bg-transparent text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl
            focus:outline-none focus:ring-2 focus:ring-cultural-500/50
            ${focusVisible.input}
          `}
          {...props}
        />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-morphism backdrop-blur-xl rounded-xl border border-white/30 dark:border-gray-700/50 shadow-2xl z-50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`
                  w-full px-4 py-3 text-left hover:bg-white/10 dark:hover:bg-gray-800/50
                  transition-colors first:rounded-t-xl last:rounded-b-xl
                  ${selectedIndex === index ? 'bg-cultural-500/10 text-cultural-600 dark:text-cultural-400' : 'text-gray-700 dark:text-gray-300'}
                  ${focusVisible.button}
                `}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch?.(suggestion);
                  setIsOpen(false);
                }}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Glassmorphism Card with Hover Effects
export const InteractiveGlassCard = ({ 
  children, 
  title, 
  subtitle, 
  image, 
  actions = [], 
  className = '',
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });

  return (
    <motion.div
      ref={cardRef}
      className={`
        glass-morphism backdrop-blur-xl rounded-2xl overflow-hidden
        border border-white/20 dark:border-gray-700/50 cursor-pointer
        hover:shadow-2xl hover:shadow-cultural-500/10 transition-all duration-500
        ${className}
      `}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {image && (
        <div className="relative overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <div className="p-6">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {subtitle}
          </p>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
        
        {actions.length > 0 && (
          <motion.div 
            className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70
                  text-gray-700 dark:text-gray-300 transition-colors
                  ${focusVisible.button}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Animated Statistics Card
export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up', 
  className = '' 
}) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const animatedValue = useMotionValue(0);
  const rounded = useTransform(animatedValue, latest => Math.round(latest));

  useEffect(() => {
    if (isInView && typeof value === 'number') {
      animatedValue.set(value);
    }
  }, [isInView, value, animatedValue]);

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        glass-morphism backdrop-blur-xl rounded-2xl p-6
        border border-white/20 dark:border-gray-700/50
        hover:shadow-xl hover:shadow-cultural-500/10 transition-all duration-300
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-cultural-500/10">
          <Icon className="w-6 h-6 text-cultural-600 dark:text-cultural-400" />
        </div>
        
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
            <ArrowUpIcon 
              className={`w-4 h-4 transform ${
                trend === 'down' ? 'rotate-180' : trend === 'neutral' ? 'rotate-90' : ''
              }`} 
            />
            {change}
          </div>
        )}
      </div>
      
      <div>
        <motion.div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {typeof value === 'number' ? rounded : value}
        </motion.div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {title}
        </div>
      </div>
    </motion.div>
  );
};

// Notification Bell with Badge
export const NotificationBell = ({ 
  count = 0, 
  notifications = [], 
  onNotificationClick,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  return (
    <div className={`relative ${className}`} ref={bellRef}>
      <motion.button
        className={`
          relative p-2 glass-morphism backdrop-blur-md rounded-xl
          border border-white/20 dark:border-gray-700/50
          hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors
          ${focusVisible.button}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        
        {count > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 glass-morphism backdrop-blur-xl rounded-xl border border-white/30 dark:border-gray-700/50 shadow-2xl z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.button
                    key={index}
                    className={`
                      w-full p-4 text-left hover:bg-white/10 dark:hover:bg-gray-800/50
                      transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0
                      ${focusVisible.button}
                    `}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onNotificationClick?.(notification);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cultural-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Upload Dropzone with Glassmorphism
export const GlassDropzone = ({ 
  onDrop, 
  accept = '*', 
  multiple = false, 
  className = '' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    onDrop?.(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    onDrop?.(selectedFiles);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return PhotoIcon;
    if (file.type.startsWith('video/')) return VideoCameraIcon;
    if (file.type.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  return (
    <div className={className}>
      <motion.div
        className={`
          glass-morphism backdrop-blur-xl rounded-2xl p-8 text-center
          border-2 border-dashed transition-all duration-300
          ${isDragOver 
            ? 'border-cultural-500 bg-cultural-500/5' 
            : 'border-gray-300 dark:border-gray-600 hover:border-cultural-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        animate={{ 
          borderColor: isDragOver ? '#8B5CF6' : '#D1D5DB',
          backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <motion.div
          animate={{ scale: isDragOver ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Upload files'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or{' '}
            <button
              className="text-cultural-600 dark:text-cultural-400 hover:underline font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
        </motion.div>
      </motion.div>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 glass-morphism backdrop-blur-md rounded-xl border border-white/20 dark:border-gray-700/50"
              >
                <FileIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  className={`p-1 text-gray-400 hover:text-red-500 transition-colors ${focusVisible.button}`}
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default {
  FloatingActionButton,
  GlassSearchBar,
  InteractiveGlassCard,
  StatCard,
  NotificationBell,
  GlassDropzone
};