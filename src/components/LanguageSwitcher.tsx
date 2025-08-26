'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { locales, type Locale } from '@/i18n/config';

const languageNames = {
  en: 'English',
  es: 'Español',
  zh: '中文'
} as const;

const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  zh: '🇨🇳'
} as const;

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname);
      setIsOpen(false);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
      >
        <span className="text-lg">{languageFlags[locale]}</span>
        <span>{languageNames[locale]}</span>
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
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {locales.map((localeOption) => (
                <button
                  key={localeOption}
                  onClick={() => handleLanguageChange(localeOption)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    localeOption === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{languageFlags[localeOption]}</span>
                  <span>{languageNames[localeOption]}</span>
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