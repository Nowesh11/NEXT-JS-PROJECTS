import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, isDark, toggleTheme, availableThemes } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-10 h-10 rounded-full p-2
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
};

// Advanced theme toggle with dropdown
export const ThemeToggleDropdown = ({ className = '' }) => {
  const { theme, setThemePreference, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.theme-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  const currentTheme = availableThemes.find(t => t.key === theme) || availableThemes[0];

  return (
    <div className={`relative theme-dropdown ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative w-10 h-10 rounded-full p-2
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow-md
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Theme selector"
        title="Select theme"
      >
        <i className={`fas ${currentTheme.icon} text-gray-700 dark:text-gray-300`} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="
            absolute right-0 mt-2 w-32 py-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            z-50
          "
        >
          {availableThemes.map((themeOption) => (
            <button
              key={themeOption.key}
              onClick={() => {
                setThemePreference(themeOption.key);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-150
                flex items-center space-x-2
                ${
                  theme === themeOption.key
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <i className={`fas ${themeOption.icon} w-4`} />
              <span>{themeOption.name}</span>
              {theme === themeOption.key && (
                <i className="fas fa-check ml-auto text-xs" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ThemeToggle;