import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const { setTheme, getCurrentTheme } = useTheme();

  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
    
    const handleThemeChange = () => {
      setCurrentTheme(getCurrentTheme());
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const themes = [
    { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, color: 'text-yellow-500' },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, color: 'text-gray-700 dark:text-gray-300' },
    { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" />, color: 'text-blue-500' },
  ];

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as 'light' | 'dark' | 'system');
    setCurrentTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <span className={currentThemeData.color}>{currentThemeData.icon}</span>
        <span className="text-sm font-medium hidden sm:inline text-gray-700 dark:text-gray-300">{currentThemeData.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform text-gray-600 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  currentTheme === theme.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <span className={theme.color}>{theme.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{theme.label}</span>
                {currentTheme === theme.id && (
                  <span className="ml-auto text-green-500 text-xs">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
