import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${isDarkMode 
          ? 'bg-primary-600 hover:bg-primary-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
        ${className}
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <span
        className={`
          absolute inline-block w-5 h-5 rounded-full bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          flex items-center justify-center
          ${isDarkMode ? 'translate-x-3' : '-translate-x-3'}
        `}
      >
        {/* Icon */}
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-primary-600" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </span>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${
          isDarkMode ? 'opacity-30 text-white' : 'opacity-0'
        }`} />
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${
          isDarkMode ? 'opacity-0' : 'opacity-30 text-gray-600'
        }`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
