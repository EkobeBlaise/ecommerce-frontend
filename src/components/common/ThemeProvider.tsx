import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem('user_theme');
    if (saved && saved !== 'undefined') {
      applyTheme(saved);
    } else {
      applyTheme(settings.appearance.theme);
    }
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem('user_theme');
      if (saved && saved !== 'undefined') {
        applyTheme(saved);
      }
    };
    
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Apply primary color
  useEffect(() => {
    const color = settings.appearance.primaryColor;
    document.documentElement.style.setProperty('--primary-color', color);
    
    const adjustColor = (col: string, percent: number): string => {
      if (!col || !col.startsWith('#')) return '#3b82f6';
      let r = parseInt(col.slice(1, 3), 16);
      let g = parseInt(col.slice(3, 5), 16);
      let b = parseInt(col.slice(5, 7), 16);
      r = Math.max(0, Math.min(255, r + (r * percent) / 100));
      g = Math.max(0, Math.min(255, g + (g * percent) / 100));
      b = Math.max(0, Math.min(255, b + (b * percent) / 100));
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    };
    
    document.documentElement.style.setProperty('--primary-hover', adjustColor(color, -20));
  }, [settings.appearance.primaryColor]);

  return <>{children}</>;
};

export const useTheme = () => {
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    localStorage.setItem('user_theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    window.dispatchEvent(new Event('themeChanged'));
  };

  const getCurrentTheme = (): string => {
    const saved = localStorage.getItem('user_theme');
    if (saved && saved !== 'undefined') return saved;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  };

  return { setTheme, getCurrentTheme };
};

export default ThemeProvider;
