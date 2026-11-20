'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BACKEND_ERROR_KEYS, CATEGORY_KEYS, DEFAULT_LANGUAGE, STATUS_KEYS, translations } from '../lib/translations';

const STORAGE_KEY = 'gramaseva-language';
const LanguageContext = createContext(null);

function isSupported(language) {
  return language === 'en' || language === 'mr';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isSupported(saved)) setLanguage(saved);
    } catch {
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
    }
    document.documentElement.lang = language === 'mr' ? 'ml' : 'en';
  }, [language, ready]);

  const t = useCallback((key, values) => {
    let text = translations[language]?.[key] ?? translations.en[key] ?? key;
    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
      });
    }
    return text;
  }, [language]);

  const translateValue = useCallback((value, keys, fallback, empty = '—') => {
    if (!value) return empty;
    return keys[value] ? t(keys[value]) : (value || fallback || empty);
  }, [t]);

  const tCategory = useCallback((value) => translateValue(value, CATEGORY_KEYS, 'common.notSpecified'), [translateValue]);
  const tStatus = useCallback((value) => translateValue(value, STATUS_KEYS, 'common.status'), [translateValue]);

  const tError = useCallback((message) => {
    if (!message) return '';
    const text = String(message);
    if (Object.prototype.hasOwnProperty.call(translations.en, text)) return t(text);
    const key = BACKEND_ERROR_KEYS[text.trim()];
    if (key) return t(key);
    return t('errors.backendFallback');
  }, [t]);

  const toggleLanguage = useCallback(() => {
    setLanguage(current => (current === 'mr' ? 'en' : 'mr'));
  }, []);

  const value = useMemo(() => ({
    language,
    dateLocale: language === 'mr' ? 'ml-IN' : 'en-IN',
    t,
    tCategory,
    tStatus,
    tError,
    toggleLanguage,
  }), [language, t, tCategory, tStatus, tError, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
