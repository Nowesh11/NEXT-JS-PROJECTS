/**
 * Internationalization Configuration
 * Bilingual support for English and Tamil using next-intl
 */

import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['en', 'ta'];
export const defaultLocale = 'en';

// Locale configuration
export const localeConfig = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    font: 'Inter, system-ui, sans-serif'
  },
  ta: {
    name: 'தமிழ்',
    flag: '🇮🇳',
    dir: 'ltr',
    font: 'Noto Sans Tamil, Tamil Sangam MN, system-ui, sans-serif'
  }
};

// Navigation with shared pathnames
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/users': '/users',
    '/books': '/books',
    '/ebooks': '/ebooks',
    '/analytics': '/analytics',
    '/settings': '/settings',
    '/auth/login': '/auth/login'
  }
});

// Request configuration for next-intl
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));

// Utility functions
export const getLocaleDirection = (locale) => {
  return localeConfig[locale]?.dir || 'ltr';
};

export const getLocaleFont = (locale) => {
  return localeConfig[locale]?.font || 'Inter, system-ui, sans-serif';
};

export const formatNumber = (number, locale) => {
  return new Intl.NumberFormat(locale).format(number);
};

export const formatCurrency = (amount, locale, currency = 'INR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date, locale, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
};

export const formatRelativeTime = (date, locale) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  
  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }
  
  return rtf.format(0, 'second');
};

// Tamil text utilities
export const tamilUtils = {
  // Check if text contains Tamil characters
  isTamil: (text) => {
    const tamilRegex = /[\u0B80-\u0BFF]/;
    return tamilRegex.test(text);
  },
  
  // Convert English numbers to Tamil numbers
  toTamilNumbers: (text) => {
    const tamilNumbers = ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'];
    return text.replace(/[0-9]/g, (digit) => tamilNumbers[parseInt(digit)]);
  },
  
  // Convert Tamil numbers to English numbers
  toEnglishNumbers: (text) => {
    const tamilToEnglish = {
      '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4',
      '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9'
    };
    return text.replace(/[௦-௯]/g, (digit) => tamilToEnglish[digit]);
  },
  
  // Format Tamil text with proper line breaks
  formatTamilText: (text) => {
    // Add zero-width space after certain Tamil characters for better line breaking
    return text.replace(/([்])/g, '$1\u200B');
  }
};

// Language detection
export const detectLanguage = (text) => {
  if (tamilUtils.isTamil(text)) {
    return 'ta';
  }
  return 'en';
};

// Pluralization rules for Tamil
export const tamilPluralization = {
  cardinal: (count) => {
    if (count === 1) return 'one';
    return 'other';
  },
  ordinal: (count) => {
    return 'other';
  }
};

// Text direction utilities
export const getTextDirection = (text, locale) => {
  // Tamil is LTR, but we might want to handle mixed content
  if (locale === 'ta' || tamilUtils.isTamil(text)) {
    return 'ltr';
  }
  return 'ltr';
};

// Font loading utilities
export const loadTamilFonts = () => {
  if (typeof window !== 'undefined') {
    // Load Tamil fonts dynamically
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

// Locale switching utilities
export const switchLocale = (newLocale, pathname, router) => {
  const segments = pathname.split('/');
  
  // Remove current locale from path if present
  if (locales.includes(segments[1])) {
    segments.splice(1, 1);
  }
  
  // Add new locale to path
  const newPath = `/${newLocale}${segments.join('/') || ''}`;
  
  router.push(newPath);
};

// Validation for bilingual forms
export const bilingualValidation = {
  required: (value, locale) => {
    if (!value || value.trim() === '') {
      return locale === 'ta' ? 'இந்த புலம் தேவை' : 'This field is required';
    }
    return null;
  },
  
  email: (value, locale) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return locale === 'ta' ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address';
    }
    return null;
  },
  
  minLength: (value, minLength, locale) => {
    if (value && value.length < minLength) {
      return locale === 'ta' 
        ? `குறைந்தது ${minLength} எழுத்துகள் இருக்க வேண்டும்`
        : `Must be at least ${minLength} characters`;
    }
    return null;
  },
  
  maxLength: (value, maxLength, locale) => {
    if (value && value.length > maxLength) {
      return locale === 'ta'
        ? `அதிகபட்சம் ${maxLength} எழுத்துகள் மட்டுமே அனுமதிக்கப்படும்`
        : `Must be no more than ${maxLength} characters`;
    }
    return null;
  }
};

// Common translations for quick access
export const commonTranslations = {
  en: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },
  ta: {
    loading: 'ஏற்றுகிறது...',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    add: 'சேர்',
    search: 'தேடு',
    filter: 'வடிகட்டு',
    sort: 'வரிசைப்படுத்து',
    export: 'ஏற்றுமதி',
    import: 'இறக்குமதி',
    refresh: 'புதுப்பி',
    close: 'மூடு',
    open: 'திற',
    yes: 'ஆம்',
    no: 'இல்லை',
    ok: 'சரி',
    error: 'பிழை',
    success: 'வெற்றி',
    warning: 'எச்சரிக்கை',
    info: 'தகவல்'
  }
};

// Get common translation
export const getCommonTranslation = (key, locale) => {
  return commonTranslations[locale]?.[key] || commonTranslations.en[key] || key;
};

export default {
  locales,
  defaultLocale,
  localeConfig,
  getLocaleDirection,
  getLocaleFont,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  tamilUtils,
  detectLanguage,
  tamilPluralization,
  getTextDirection,
  loadTamilFonts,
  switchLocale,
  bilingualValidation,
  commonTranslations,
  getCommonTranslation
};