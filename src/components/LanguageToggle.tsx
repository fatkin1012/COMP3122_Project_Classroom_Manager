'use client';

import { useEffect, useState } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage, Language } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Only run on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
    
    // Force the page to reload to ensure all translations are applied
    window.location.reload();
  };

  // Avoid rendering before client-side mount to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-10 h-10"></div>;
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle language"
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
            <button
              onClick={() => changeLanguage('en')}
              className={`${
                language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              <span className={language === 'en' ? 'font-medium' : ''}>
                English
              </span>
              {language === 'en' && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
            <button
              onClick={() => changeLanguage('zh-TW')}
              className={`${
                language === 'zh-TW' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              <span className={language === 'zh-TW' ? 'font-medium' : ''}>
                繁體中文
              </span>
              {language === 'zh-TW' && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 