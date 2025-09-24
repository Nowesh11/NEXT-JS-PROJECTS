import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  themes: {}
});

// Default context value to prevent undefined errors
const defaultThemeValue = {
  theme: 'light',
  toggleTheme: () => {},
  themes: {
    light: {
      name: 'light',
      colors: {
        primary: { solid: '#2563eb' },
        secondary: { solid: '#4f46e5' },
        background: { primary: '#ffffff' },
        text: { primary: '#0f172a' }
      }
    }
  }
};

// Modern dual theme configurations as per brief
const themes = {
  light: {
    name: 'light',
    colors: {
      // Primary gradients (Blue to Cyan)
      primary: {
        from: '#2563eb',
        to: '#06b6d4',
        gradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        solid: '#2563eb'
      },
      // Secondary gradients (Indigo to Blue)
      secondary: {
        from: '#4f46e5',
        to: '#3b82f6',
        gradient: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        solid: '#4f46e5'
      },
      // Background colors
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(37, 99, 235, 0.05)',
        mesh: 'radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
      },
      // Text colors
      text: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#475569',
        inverse: '#ffffff',
        gradient: 'linear-gradient(90deg, #2563eb, #06b6d4)'
      },
      // Surface colors for glassmorphism
      surface: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        tertiary: '#e2e8f0',
        glass: 'rgba(255, 255, 255, 0.1)',
        glassStrong: 'rgba(255, 255, 255, 0.2)',
        glassBorder: 'rgba(255, 255, 255, 0.3)'
      },
      // Border colors
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        accent: 'rgba(37, 99, 235, 0.2)',
        gradient: 'linear-gradient(90deg, rgba(37, 99, 235, 0.3), rgba(6, 182, 212, 0.3))'
      },
      // Shadow colors
      shadow: {
        primary: 'rgba(15, 23, 42, 0.1)',
        secondary: 'rgba(15, 23, 42, 0.05)',
        colored: 'rgba(37, 99, 235, 0.2)',
        glow: 'rgba(37, 99, 235, 0.4)'
      },
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      // Primary gradients (Red to Pink)
      primary: {
        from: '#dc2626',
        to: '#ec4899',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #ec4899 100%)',
        solid: '#dc2626'
      },
      // Secondary gradients (Rose to Red)
      secondary: {
        from: '#f43f5e',
        to: '#dc2626',
        gradient: 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
        solid: '#f43f5e'
      },
      // Background colors
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        overlay: 'rgba(220, 38, 38, 0.05)',
        mesh: 'radial-gradient(circle at 25% 25%, rgba(220, 38, 38, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
      },
      // Text colors
      text: {
        primary: '#f8fafc',
        secondary: '#e2e8f0',
        tertiary: '#cbd5e1',
        inverse: '#0f172a',
        gradient: 'linear-gradient(90deg, #dc2626, #ec4899)'
      },
      // Surface colors for glassmorphism
      surface: {
        primary: '#334155',
        secondary: '#475569',
        tertiary: '#64748b',
        glass: 'rgba(15, 23, 42, 0.3)',
        glassStrong: 'rgba(15, 23, 42, 0.5)',
        glassBorder: 'rgba(255, 255, 255, 0.1)'
      },
      // Border colors
      border: {
        primary: '#475569',
        secondary: '#64748b',
        accent: 'rgba(220, 38, 38, 0.3)',
        gradient: 'linear-gradient(90deg, rgba(220, 38, 38, 0.3), rgba(236, 72, 153, 0.3))'
      },
      // Shadow colors
      shadow: {
        primary: 'rgba(0, 0, 0, 0.3)',
        secondary: 'rgba(0, 0, 0, 0.2)',
        colored: 'rgba(220, 38, 38, 0.3)',
        glow: 'rgba(220, 38, 38, 0.5)'
      },
      // Status colors
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('tls-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;
        
        setCurrentTheme(initialTheme);
        applyThemeToDocument(initialTheme);
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
        setCurrentTheme('light');
        applyThemeToDocument('light');
      }
    };

    initializeTheme();
  }, []);

  // Apply theme to document with CSS custom properties and smooth transitions
  const applyThemeToDocument = (themeName) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      const theme = themes[themeName];
      const root = document.documentElement;
      
      // Ensure document.head exists for style injection
      if (!document.head) {
        console.warn('Document head not available for theme application');
        return;
      }
      
      // Set data attribute for CSS selectors
      root.setAttribute('data-theme', themeName);
      
      // Apply CSS custom properties for the new gradient system
      const { colors } = theme;
    
    // Primary gradient colors
    root.style.setProperty('--color-primary-from', colors.primary.from);
    root.style.setProperty('--color-primary-to', colors.primary.to);
    root.style.setProperty('--gradient-primary', colors.primary.gradient);
    root.style.setProperty('--color-primary-solid', colors.primary.solid);
    
    // Secondary gradient colors
    root.style.setProperty('--color-secondary-from', colors.secondary.from);
    root.style.setProperty('--color-secondary-to', colors.secondary.to);
    root.style.setProperty('--gradient-secondary', colors.secondary.gradient);
    root.style.setProperty('--color-secondary-solid', colors.secondary.solid);
    
    // Background colors
    root.style.setProperty('--bg-primary', colors.background.primary);
    root.style.setProperty('--bg-secondary', colors.background.secondary);
    root.style.setProperty('--bg-tertiary', colors.background.tertiary);
    root.style.setProperty('--bg-overlay', colors.background.overlay);
    root.style.setProperty('--bg-mesh', colors.background.mesh);
    
    // Text colors
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);
    root.style.setProperty('--text-inverse', colors.text.inverse);
    root.style.setProperty('--text-gradient', colors.text.gradient);
    
    // Surface colors for glassmorphism
    root.style.setProperty('--surface-primary', colors.surface.primary);
    root.style.setProperty('--surface-secondary', colors.surface.secondary);
    root.style.setProperty('--surface-tertiary', colors.surface.tertiary);
    root.style.setProperty('--surface-glass', colors.surface.glass);
    root.style.setProperty('--surface-glass-strong', colors.surface.glassStrong);
    root.style.setProperty('--surface-glass-border', colors.surface.glassBorder);
    
    // Border colors
    root.style.setProperty('--border-primary', colors.border.primary);
    root.style.setProperty('--border-secondary', colors.border.secondary);
    root.style.setProperty('--border-accent', colors.border.accent);
    root.style.setProperty('--border-gradient', colors.border.gradient);
    
    // Shadow colors
    root.style.setProperty('--shadow-primary', colors.shadow.primary);
    root.style.setProperty('--shadow-secondary', colors.shadow.secondary);
    root.style.setProperty('--shadow-colored', colors.shadow.colored);
    root.style.setProperty('--shadow-glow', colors.shadow.glow);
    
    // Status colors
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);
    } catch (error) {
      console.warn('Failed to apply theme to document:', error);
    }
  };

  // Toggle theme with smooth 500ms transition
  const toggleTheme = () => {
    if (isTransitioning || typeof window === 'undefined') return;
    
    setIsTransitioning(true);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    try {
      // Add transition class to body for smooth color interpolation
      if (document.body) {
        document.body.classList.add('theme-transitioning');
      }
      
      // Apply new theme after a brief delay for smooth transition
      setTimeout(() => {
        setCurrentTheme(newTheme);
        applyThemeToDocument(newTheme);
        
        try {
          localStorage.setItem('tls-theme', newTheme);
        } catch (storageError) {
          console.warn('Failed to save theme to localStorage:', storageError);
        }
        
        // Remove transition class after transition completes
        setTimeout(() => {
          if (document.body) {
            document.body.classList.remove('theme-transitioning');
          }
          setIsTransitioning(false);
        }, 500);
      }, 50);
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
      setIsTransitioning(false);
    }
  };

  // Set specific theme
  const setTheme = (themeName) => {
    if (themes[themeName] && themeName !== currentTheme && !isTransitioning) {
      setIsTransitioning(true);
      document.body.classList.add('theme-transitioning');
      
      setTimeout(() => {
        setCurrentTheme(themeName);
        applyThemeToDocument(themeName);
        localStorage.setItem('tls-theme', themeName);
        
        setTimeout(() => {
          document.body.classList.remove('theme-transitioning');
          setIsTransitioning(false);
        }, 500);
      }, 50);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    toggleTheme,
    setTheme,
    isTransitioning,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
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
    console.warn('useTheme must be used within a ThemeProvider, returning default values');
    return defaultThemeValue;
  }
  return context;
};

export default ThemeContext;