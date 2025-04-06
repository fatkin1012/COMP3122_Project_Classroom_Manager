import React, { useState, useEffect } from 'react';
import { XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useLanguage, Language } from '@/components/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Get language context
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState('system');

  // Load saved preferences on mount
  useEffect(() => {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Apply theme on initial load
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme changes to the document
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save the preference to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t.settings}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">{t.colorTheme}</h3>
            <div className="flex gap-4">
              <button
                className={`flex flex-col items-center p-3 rounded-lg border ${
                  theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleThemeChange('light')}
              >
                <SunIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-sm font-medium">{t.light}</span>
              </button>
              
              <button
                className={`flex flex-col items-center p-3 rounded-lg border ${
                  theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleThemeChange('dark')}
              >
                <MoonIcon className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium">{t.dark}</span>
              </button>
              
              <button
                className={`flex flex-col items-center p-3 rounded-lg border ${
                  theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleThemeChange('system')}
              >
                <svg className="h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">{t.system}</span>
              </button>
            </div>
          </div>
          
          {/* Language Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">{t.languageSettings}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'en', name: 'English' },
                { code: 'zh-TW', name: 'Traditional Chinese' },
                { code: 'zh-CN', name: 'Simplified Chinese' },
                { code: 'ja', name: 'Japanese' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  className={`p-2 rounded-lg border text-left ${
                    language === lang.code ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleLanguageChange(lang.code as Language)}
                >
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Other Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">{t.otherSettings}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t.emailNotifications}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t.autoRefreshData}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t.cancel}
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 