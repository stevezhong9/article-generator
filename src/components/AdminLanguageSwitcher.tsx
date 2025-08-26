'use client';

import { useState, useEffect } from 'react';

type AdminLocale = 'en' | 'zh';

const adminLanguageNames = {
  en: 'English',
  zh: '中文'
} as const;

const adminLanguageFlags = {
  en: '🇺🇸',
  zh: '🇨🇳'
} as const;

export default function AdminLanguageSwitcher({ className = '' }: { className?: string }) {
  const [locale, setLocale] = useState<AdminLocale>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const savedLocale = localStorage.getItem('admin-language') as AdminLocale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocale(savedLocale);
    }
  }, []);

  const handleLanguageChange = (newLocale: AdminLocale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    setLocale(newLocale);
    localStorage.setItem('admin-language', newLocale);
    setIsOpen(false);
    
    // Reload the page to apply language changes
    window.location.reload();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <span className="text-lg">{adminLanguageFlags[locale]}</span>
        <span>{adminLanguageNames[locale]}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {(Object.keys(adminLanguageNames) as AdminLocale[]).map((localeOption) => (
                <button
                  key={localeOption}
                  onClick={() => handleLanguageChange(localeOption)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    localeOption === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{adminLanguageFlags[localeOption]}</span>
                  <span>{adminLanguageNames[localeOption]}</span>
                  {localeOption === locale && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}