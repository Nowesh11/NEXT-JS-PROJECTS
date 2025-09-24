import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme configurations
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceSecondary: '#f1f5f9',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        inverse: '#ffffff'
      },
      border: {
        light: 'rgba(148, 163, 184, 0.2)',
        medium: 'rgba(148, 163, 184, 0.4)',
        dark: 'rgba(148, 163, 184, 0.6)'
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)'
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e3a8a',
      accent: '#a855f7',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceSecondary: '#334155',
      text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        inverse: '#1e293b'
      },
      border: {
        light: 'rgba(148, 163, 184, 0.1)',
        medium: 'rgba(148, 163, 184, 0.2)',
        dark: 'rgba(148, 163, 184, 0.3)'
      },
      glass: {
        bg: 'rgba(0, 0, 0, 0.2)',
        border: 'rgba(255, 255, 255, 0.1)'
      },
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');
  const [userPreference, setUserPreference] = useState(null);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('tls-theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setUserPreference(savedTheme);
    }
  }, []);

  // Apply theme based on user preference or system preference
  useEffect(() => {
    let activeTheme;
    
    if (userPreference === 'system' || userPreference === null) {
      activeTheme = systemPreference;
    } else {
      activeTheme = userPreference;
    }
    
    setTheme(activeTheme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    const themeColors = themes[activeTheme].colors;
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-secondary', themeColors.secondary);
    root.style.setProperty('--color-accent', themeColors.accent);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--surface-primary', themeColors.surface);
    root.style.setProperty('--surface-secondary', themeColors.surfaceSecondary);
    root.style.setProperty('--text-primary', themeColors.text.primary);
    root.style.setProperty('--text-secondary', themeColors.text.secondary);
    root.style.setProperty('--text-inverse', themeColors.text.inverse);
    root.style.setProperty('--border-light', themeColors.border.light);
    root.style.setProperty('--border-medium', themeColors.border.medium);
    root.style.setProperty('--border-dark', themeColors.border.dark);
    root.style.setProperty('--glass-bg', themeColors.glass.bg);
    root.style.setProperty('--glass-border', themeColors.glass.border);
    root.style.setProperty('--success-color', themeColors.success);
    root.style.setProperty('--warning-color', themeColors.warning);
    root.style.setProperty('--error-color', themeColors.error);
    root.style.setProperty('--info-color', themeColors.info);
    
    // Set theme class on body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${activeTheme}`);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors.primary);
    }
  }, [userPreference, systemPreference]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setUserPreference(newTheme);
    localStorage.setItem('tls-theme', newTheme);
  };

  const setThemePreference = (preference) => {
    if (['light', 'dark', 'system'].includes(preference)) {
      setUserPreference(preference);
      localStorage.setItem('tls-theme', preference);
    }
  };

  const getThemeColors = (themeName = theme) => {
    return themes[themeName]?.colors || themes.light.colors;
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const value = {
    theme,
    isDark,
    isLight,
    systemPreference,
    userPreference,
    toggleTheme,
    setThemePreference,
    getThemeColors,
    themes,
    availableThemes: [
      { key: 'light', name: 'Light', icon: 'fa-sun' },
      { key: 'dark', name: 'Dark', icon: 'fa-moon' },
      { key: 'system', name: 'System', icon: 'fa-desktop' }
    ]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;