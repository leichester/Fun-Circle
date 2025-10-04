import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { saveLanguagePreference, getLanguagePreference } from '../utils/cookies';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'es', name: 'ES' },
    { code: 'fr', name: 'FR' },
    { code: 'zh', name: '中文' },
  ];

  // Sync language preference on component mount (for client-side hydration)
  useEffect(() => {
    const savedLanguage = getLanguagePreference();
    if (savedLanguage && savedLanguage !== i18n.language && languages.some(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n, languages]);

  const changeLanguage = (lng: string) => {
    // Change the language in i18n
    i18n.changeLanguage(lng);
    
    // Save the preference to cookies for future visits
    saveLanguagePreference(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-700 font-medium">{t('language')}</span>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
