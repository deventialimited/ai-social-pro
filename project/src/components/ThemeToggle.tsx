import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md bg-light-hover dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};