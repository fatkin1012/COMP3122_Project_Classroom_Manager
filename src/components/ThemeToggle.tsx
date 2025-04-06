'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check local storage first
    const savedTheme = localStorage.getItem('darkMode');
    
    // If we have a saved preference, use it
    if (savedTheme !== null) {
      const isDark = savedTheme === 'true';
      setDarkMode(isDark);
      applyTheme(isDark);
    } else {
      // Otherwise check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      applyTheme(prefersDark);
      localStorage.setItem('darkMode', prefersDark.toString());
    }

    // Add event listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't set their own preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (isDark: boolean) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');

      // Apply all CSS variables
      root.style.setProperty('--background', '#111827');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--card-background', '#1f2937');
      root.style.setProperty('--card-foreground', '#f3f4f6');
      root.style.setProperty('--button-background', '#374151');
      root.style.setProperty('--button-hover', '#4b5563');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--highlight', '#60a5fa');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#e5e7eb'); 
      root.style.setProperty('--text-muted', '#9ca3af');
      
      // Force body background
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#ffffff';

      // Refresh all elements with theme classes
      document.querySelectorAll('.theme-card, .theme-heading, .theme-text, .theme-muted, .theme-button, .theme-input')
        .forEach(el => {
          el.classList.remove('light-theme');
          el.classList.add('dark-theme');
        });
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      
      // Apply all CSS variables
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--card-foreground', '#333333');
      root.style.setProperty('--button-background', '#f3f4f6');
      root.style.setProperty('--button-hover', '#e5e7eb');
      root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--highlight', '#3b82f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4b5563');
      root.style.setProperty('--text-muted', '#6b7280');
      
      // Force body background
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';

      // Refresh all elements with theme classes
      document.querySelectorAll('.theme-card, .theme-heading, .theme-text, .theme-muted, .theme-button, .theme-input')
        .forEach(el => {
          el.classList.remove('dark-theme');
          el.classList.add('light-theme');
        });
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyTheme(newDarkMode);
    
    // Force apply styles to all frames
    const styleOverrideScript = document.createElement('script');
    styleOverrideScript.textContent = `
      setTimeout(() => {
        document.querySelectorAll('iframe').forEach(iframe => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.documentElement.classList.${newDarkMode ? 'add' : 'remove'}('dark');
            iframeDoc.documentElement.classList.${!newDarkMode ? 'add' : 'remove'}('light');
            iframeDoc.body.style.backgroundColor = '${newDarkMode ? '#111827' : '#ffffff'}';
            iframeDoc.body.style.color = '${newDarkMode ? '#ffffff' : '#000000'}';
          } catch (e) {}
        });
      }, 100);
    `;
    document.head.appendChild(styleOverrideScript);
    
    // Force a refresh if needed to ensure all styles apply correctly
    setTimeout(() => {
      if (document.body.style.backgroundColor !== (newDarkMode ? '#111827' : '#ffffff')) {
        window.location.reload();
      }
    }, 300);
  };

  // Avoid rendering the toggle before we know the theme to prevent flash
  if (!mounted) {
    return <div className="w-10 h-10"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
} 