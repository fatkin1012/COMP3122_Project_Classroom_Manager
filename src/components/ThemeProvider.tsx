'use client';

import { useEffect } from 'react';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Get saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') || 'system';
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Listen for system theme changes if using system theme
    if (savedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Handle system theme changes
      const handleChange = () => {
        document.documentElement.setAttribute('data-theme', 'system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return <>{children}</>;
} 