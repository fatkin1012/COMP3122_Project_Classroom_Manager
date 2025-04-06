'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage, Language } from '@/context/LanguageContext';

const SettingsPage = () => {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    // Force reload to apply translations throughout the app
    window.location.reload();
  };

  // Avoid hydration issues by not rendering theme-dependent content until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
          <div className="text-2xl font-bold mb-10">{t('app.title')}</div>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <HomeIcon className="h-6 w-6" />
              <span>{t('nav.home')}</span>
            </Link>
            <Link href="/assignment" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6" />
              <span>{t('nav.assignments')}</span>
            </Link>
            <Link
              href="https://classroom.github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg"
            >
              <CodeBracketIcon className="h-6 w-6" />
              <span>{t('nav.goToClassroom')}</span>
            </Link>
          </nav>

          {/* Sidebar Buttons */}
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <button 
              onClick={() => window.open('/help', '_blank')}
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <QuestionMarkCircleIcon className="h-6 w-6" />
              <span>{t('nav.help')}</span>
            </button>
            <button 
              onClick={() => router.push('/notifications')}
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <BellIcon className="h-6 w-6" />
              <span>{t('nav.notifications')}</span>
            </button>
            <button 
              onClick={() => router.push('/settings')} 
              className="flex items-center space-x-3 p-2 w-full text-left bg-gray-700 rounded-lg"
            >
              <Cog6ToothIcon className="h-6 w-6" />
              <span>{t('nav.settings')}</span>
            </button>
            <button 
              onClick={() => window.location.href = '/api/auth/logout'}
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-8 ${isSidebarOpen ? 'ml-64' : ''} bg-[var(--background)]`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-8">{t('settings.title')}</h1>
          
          {/* Theme Setting */}
          <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-6 mb-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{t('settings.theme')}</h2>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">{t('settings.theme.dark')}</span>
              <ThemeToggle />
            </div>
            <p className="mt-4 text-[var(--text-muted)] text-sm">
              {language === 'en' ? 
                'Changes the appearance of the application. You can choose between light and dark mode.' : 
                '更改應用程式的外觀。您可以在亮色和暗色模式之間選擇。'}
            </p>
          </div>
          
          {/* Language Setting */}
          <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-6 border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{t('settings.language')}</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <LanguageIcon className="h-6 w-6 text-[var(--text-secondary)] mr-3" />
                <span className="text-[var(--text-secondary)]">
                  {language === 'en' ? 'Select Language' : '選擇語言'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    language === 'en'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('settings.language.english')}
                </button>
                <button
                  onClick={() => changeLanguage('zh-TW')}
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    language === 'zh-TW'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('settings.language.chinese')}
                </button>
              </div>
              <p className="mt-2 text-[var(--text-muted)] text-sm">
                {language === 'en' ? 
                  'Changes the language of the user interface. Currently supports English and Traditional Chinese.' : 
                  '更改用戶界面的語言。目前支持英文和繁體中文。'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 