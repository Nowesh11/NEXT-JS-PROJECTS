import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const getText = (key, englishText, tamilText) => {
    if (language === 'ta' && tamilText) {
      return tamilText;
    }
    return englishText;
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return {
    language,
    getText,
    toggleLanguage,
    setLanguage
  };
};

export default useLanguage;