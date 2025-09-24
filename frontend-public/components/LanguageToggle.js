import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import LanguageContext from '../contexts/LanguageContext'

const LanguageToggle = ({ onLanguageChange, className = '' }) => {
  const router = useRouter()
  const languageContext = useContext(LanguageContext)
  const [currentLocale, setCurrentLocale] = useState('en')
  
  // Provide fallback values if context is not available (SSR)
  const language = languageContext?.language || 'en'
  const contextToggleLanguage = languageContext?.toggleLanguage || (() => {})
  const t = languageContext?.t || ((key) => key)

  useEffect(() => {
    const locale = router.locale || 'en'
    setCurrentLocale(locale)
    
    // Store in localStorage for content management system
    localStorage.setItem('selectedLanguage', locale)
    
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(locale)
    }
  }, [router.locale, onLanguageChange])

  const handleToggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'ta' : 'en'
    
    // Store language preference in localStorage
    localStorage.setItem('preferred-language', newLocale)
    localStorage.setItem('selectedLanguage', newLocale)
    
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(newLocale)
    }
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { newLanguage: newLocale, oldLanguage: currentLocale }
    }))
    
    // Use context toggle function
    contextToggleLanguage()
  }

  return (
    <motion.button
      onClick={handleToggleLanguage}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={t('switchLanguage')}
    >
      <motion.div
        className="flex items-center space-x-1"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLocale === 'en' ? 'EN' : 'தமிழ்'}
        </span>
        <motion.div
          className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          animate={{ rotate: currentLocale === 'en' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </motion.div>
      </motion.div>
    </motion.button>
  )
}

// Custom hook for language management
export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const router = useRouter()

  useEffect(() => {
    // Initialize from router locale or localStorage
    const locale = router.locale || localStorage.getItem('selectedLanguage') || 'en'
    setCurrentLanguage(locale)

    // Listen for language change events
    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail.newLanguage)
    }

    window.addEventListener('languageChanged', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [router.locale])

  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem('selectedLanguage', newLanguage)
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { newLanguage, oldLanguage: currentLanguage }
    }))
    
    // Update router locale
    router.push(router.asPath, router.asPath, { locale: newLanguage })
  }

  const getText = (englishText, tamilText) => {
    return currentLanguage === 'ta' ? tamilText : englishText
  }

  return {
    currentLanguage,
    changeLanguage,
    getText,
    isEnglish: currentLanguage === 'en',
    isTamil: currentLanguage === 'ta'
  }
}

export default LanguageToggle