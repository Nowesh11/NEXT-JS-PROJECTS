import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

const LanguageContext = createContext();

// Default translations
const translations = {
  en: {
    'global.logo.text': 'Tamil Language Society',
    'global.menu.home': 'Home',
    'global.menu.about': 'About Us',
    'global.menu.projects': 'Projects',
    'global.menu.ebooks': 'Ebooks',
    'global.menu.bookstore': 'Book Store',
    'global.menu.contact': 'Contact Us',
    'global.menu.login': 'Login',
    'global.menu.signup': 'Sign Up',
    'hero.title': 'Welcome to Tamil Language Society',
    'hero.subtitle': 'Preserving and promoting Tamil language and culture through modern digital initiatives',
    'hero.cta': 'Explore Our Programs',
    'features.title': 'Our Services',
    'features.ebooks.title': 'Digital Library',
    'features.ebooks.description': 'Access thousands of Tamil books, literature, and educational resources in our comprehensive digital collection.',
    'features.ebooks.linkText': 'Explore Library',
    'features.projects.title': 'Cultural Projects',
    'features.projects.description': 'Join our initiatives, workshops, and events that celebrate Tamil heritage and traditions.',
    'features.projects.linkText': 'View Projects',
    'features.bookstore.title': 'Book Store',
    'features.bookstore.description': 'Purchase authentic Tamil books, manuscripts, and educational materials from our curated collection.',
    'features.bookstore.linkText': 'Shop Now',
    'footer.about.title': 'About TLS',
    'footer.about.description': 'Tamil Language Society is dedicated to preserving and promoting Tamil language and culture through modern digital initiatives.',
    'footer.links.title': 'Quick Links',
    'footer.contact.title': 'Contact Info',
    'footer.rights': 'All rights reserved.'
  },
  ta: {
    'global.logo.text': 'தமிழ் மொழி சங்கம்',
    'global.menu.home': 'முகப்பு',
    'global.menu.about': 'எங்களைப் பற்றி',
    'global.menu.projects': 'திட்டங்கள்',
    'global.menu.ebooks': 'மின்னூல்கள்',
    'global.menu.bookstore': 'புத்தக கடை',
    'global.menu.contact': 'தொடர்பு',
    'global.menu.login': 'உள்நுழைவு',
    'global.menu.signup': 'பதிவு செய்யுங்கள்',
    'hero.title': 'தமிழ் மொழி சங்கத்திற்கு வரவேற்கிறோம்',
    'hero.subtitle': 'நவீன டிஜிட்டல் முயற்சிகள் மூலம் தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துதல்',
    'hero.cta': 'எங்கள் திட்டங்களை ஆராயுங்கள்',
    'features.title': 'எங்கள் சேவைகள்',
    'features.ebooks.title': 'டிஜிட்டல் நூலகம்',
    'features.ebooks.description': 'எங்கள் விரிவான டிஜிட்டல் தொகுப்பில் ஆயிரக்கணக்கான தமிழ் புத்தகங்கள், இலக்கியம் மற்றும் கல்வி வளங்களை அணுகவும்.',
    'features.ebooks.linkText': 'நூலகத்தை ஆராயுங்கள்',
    'features.projects.title': 'கலாச்சார திட்டங்கள்',
    'features.projects.description': 'தமிழ் பாரம்பரியம் மற்றும் மரபுகளை கொண்டாடும் எங்கள் முயற்சிகள், பட்டறைகள் மற்றும் நிகழ்வுகளில் சேருங்கள்.',
    'features.projects.linkText': 'திட்டங்களைப் பார்க்கவும்',
    'features.bookstore.title': 'புத்தக கடை',
    'features.bookstore.description': 'எங்கள் தேர்ந்தெடுக்கப்பட்ட தொகுப்பிலிருந்து உண்மையான தமிழ் புத்தகங்கள், கையெழுத்துப் பிரதிகள் மற்றும் கல்வி பொருட்களை வாங்கவும்.',
    'features.bookstore.linkText': 'இப்போது வாங்கவும்',
    'footer.about.title': 'TLS பற்றி',
    'footer.about.description': 'தமிழ் மொழி சங்கம் நவீன டிஜிட்டல் முயற்சிகள் மூலம் தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துவதற்கு அர்ப்பணிக்கப்பட்டுள்ளது.',
    'footer.links.title': 'விரைவு இணைப்புகள்',
    'footer.contact.title': 'தொடர்பு தகவல்',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
  }
};

export const LanguageProvider = ({ children }) => {
  const router = useRouter();
  const [language, setLanguage] = useState(router.locale || 'en');
  const [customTranslations, setCustomTranslations] = useState({});

  // Load saved language preference and sync with router
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tls-language');
    if (savedLanguage && ['en', 'ta'].includes(savedLanguage) && savedLanguage !== router.locale) {
      // Update router locale if different from saved preference
      router.push(router.asPath, router.asPath, { locale: savedLanguage });
    } else if (router.locale) {
      setLanguage(router.locale);
    }
  }, [router.locale]);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('tls-language', language);
    
    // Update document language
    document.documentElement.lang = language;
    
    // Update document direction for Tamil
    document.documentElement.dir = language === 'ta' ? 'ltr' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('tls-language', newLanguage);
    router.push(router.asPath, router.asPath, { locale: newLanguage });
  };

  const setLanguagePreference = (lang) => {
    if (['en', 'ta'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('tls-language', lang);
      router.push(router.asPath, router.asPath, { locale: lang });
    }
  };

  const t = (key, fallback = '') => {
    // Check custom translations first
    if (customTranslations[language] && customTranslations[language][key]) {
      return customTranslations[language][key];
    }
    
    // Check default translations
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Return fallback or key
    return fallback || key;
  };

  const addTranslations = (lang, newTranslations) => {
    setCustomTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        ...newTranslations
      }
    }));
  };

  const getBilingualContent = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content.en || content.ta || '';
    }
    return content || '';
  };

  const formatDate = (date, options = {}) => {
    const dateObj = new Date(date);
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString(locale, defaultOptions);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    const currencyCode = currency === 'INR' ? 'INR' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  const value = {
    language,
    toggleLanguage,
    setLanguagePreference,
    t,
    addTranslations,
    getBilingualContent,
    formatDate,
    formatCurrency,
    isRTL: false, // Tamil is LTR
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;