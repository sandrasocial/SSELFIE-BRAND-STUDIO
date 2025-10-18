import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// Editorial Theme Toggle Component
export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('sselfie-theme');
    const prefersLight = savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches);
    setIsLight(prefersLight);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight;
    setIsLight(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'light' : 'dark');
    localStorage.setItem('sselfie-theme', newTheme ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="editorial-button-secondary p-3 rounded-lg transition-all duration-300 hover:scale-105"
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {isLight ? (
        <Moon size={18} className="text-neutral-600" strokeWidth={1.5} />
      ) : (
        <Sun size={18} className="text-neutral-300" strokeWidth={1.5} />
      )}
    </button>
  );
}

