import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

const ThemeObserver: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const applyTheme = () => {
      const theme = settings.appearance.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    const applyPrimaryColor = () => {
      document.documentElement.style.setProperty('--primary-color', settings.appearance.primaryColor);
      // Calculate hover color (darker by 10%)
      const color = settings.appearance.primaryColor;
      document.documentElement.style.setProperty('--primary-hover', color);
    };

    applyTheme();
    applyPrimaryColor();
  }, [settings.appearance.theme, settings.appearance.primaryColor]);

  return null;
};

export default ThemeObserver;
