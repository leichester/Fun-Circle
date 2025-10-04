import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguagePreference } from './utils/cookies';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import zhTranslations from './locales/zh.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  zh: {
    translation: zhTranslations,
  },
};

// Get saved language preference or fall back to browser language or default
const getSavedOrBrowserLanguage = (): string => {
  // First, try to get saved preference from cookie
  const savedLanguage = getLanguagePreference();
  if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
    return savedLanguage;
  }

  // Fall back to browser language
  const browserLanguage = navigator.language.split('-')[0]; // Get language code without region
  if (Object.keys(resources).includes(browserLanguage)) {
    return browserLanguage;
  }

  // Final fallback to English
  return 'en';
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getSavedOrBrowserLanguage(), // Use saved preference or browser language
    fallbackLng: 'en', // fallback language
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    debug: false, // set to true for debugging
  });

export default i18n;
