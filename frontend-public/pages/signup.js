import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Signup = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, getText } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    interest: '',
    terms: false,
    newsletter: false,
    notifications: true
  });
  const [profileData, setProfileData] = useState({
    birthDate: '',
    gender: '',
    location: '',
    bio: '',
    interests: [],
    readingLevel: '',
    writingLevel: '',
    speakingLevel: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationTimer, setVerificationTimer] = useState(300);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Fetch website content for signup page
    const fetchWebsiteContent = async () => {
      try {
        const response = await fetch('/api/website-content/sections/signup');
        if (response.ok) {
          const content = await response.json();
          setWebsiteContent(content);
        }
      } catch (error) {
        console.error('Error fetching website content:', error);
      }
    };
    
    fetchWebsiteContent();
  }, []);

  useEffect(() => {
    if (verificationTimer > 0 && showEmailVerification) {
      const timer = setTimeout(() => setVerificationTimer(verificationTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationTimer, showEmailVerification]);

  // Helper function to get website content text with fallback
  const getWebsiteText = (path, fallback) => {
    if (!websiteContent) return fallback;
    
    const keys = path.split('.');
    let value = websiteContent;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    
    // If value is an object with language keys, get the current language
    if (value && typeof value === 'object' && (value.en || value.ta)) {
      return value[language] || value.en || fallback;
    }
    
    return value || fallback;
  };

  // Fallback function for server-side rendering
  const safeGetText = (key, fallback) => {
    if (typeof getText === 'function') {
      return getText(key, fallback);
    }
    return fallback;
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let text = '';
    let color = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        text = getWebsiteText('passwordStrength.veryWeak', 'Very Weak');
        color = 'bg-red-500';
        break;
      case 2:
        text = getWebsiteText('passwordStrength.weak', 'Weak');
        color = 'bg-orange-500';
        break;
      case 3:
        text = getWebsiteText('passwordStrength.fair', 'Fair');
        color = 'bg-yellow-500';
        break;
      case 4:
        text = getWebsiteText('passwordStrength.good', 'Good');
        color = 'bg-blue-500';
        break;
      case 5:
        text = getWebsiteText('passwordStrength.strong', 'Strong');
        color = 'bg-green-500';
        break;
      default:
        text = '';
        color = '';
    }

    return { score, text, color };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (currentStep === 1) {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInterestChange = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!profileData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!profileData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!profileData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (profileData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowEmailVerification(true);
      setNotification({
        show: true,
        message: 'Verification code sent to your email',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        message: 'Registration failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setNotification({
        show: true,
        message: 'Please enter the complete 6-digit code',
        type: 'error'
      });
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        show: true,
        message: 'Account created successfully! Redirecting...',
        type: 'success'
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Invalid verification code',
        type: 'error'
      });
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`verify-code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const interests = [
    'Classical Literature', 'Modern Poetry', 'Historical Texts', 'Religious Texts',
    'Folk Tales', 'Drama & Theatre', 'Language Learning', 'Translation',
    'Research & Academia', 'Cultural Studies'
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{getWebsiteText('meta.title', 'Sign Up')} - Tamil Literary Society</title>
        <meta name="description" content={getWebsiteText('meta.description', 'Join the Tamil Literary Society and explore the rich world of Tamil literature.')} />
        <meta name="keywords" content="Tamil signup, literary society registration, Tamil account, join community" />
        <meta property="og:title" content={`${getWebsiteText('meta.title', 'Sign Up')} - Tamil Literary Society`} />
        <meta property="og:description" content={getWebsiteText('meta.description', 'Join the Tamil Literary Society and explore the rich world of Tamil literature.')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/signup" />
      </Head>

      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">


          {/* Notification */}
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button
                  onClick={() => setNotification({ ...notification, show: false })}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          <Layout>
            {/* Main Content */}
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-2xl w-full space-y-8">
              
              {!showEmailVerification ? (
                <>
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {getWebsiteText('header.welcome', 'Join Tamil Literary Society')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {getWebsiteText('header.subtitle', 'Create your account to explore Tamil literature and connect with fellow enthusiasts')}
                    </p>
                  </motion.div>

                  {/* Progress Bar */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        1
                      </div>
                      <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        2
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8"
                  >
                    {currentStep === 1 ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                          {getWebsiteText('form.step1.title', 'Personal Information')}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step1.fields.firstName.label', 'First Name')}
                            </label>
                            <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder={getWebsiteText('form.step1.fields.firstName.placeholder', 'Enter your first name')}
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>}
                          </div>

                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step1.fields.lastName.label', 'Last Name')}
                            </label>
                            <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder={getWebsiteText('form.step1.fields.lastName.placeholder', 'Enter your last name')}
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step1.fields.email.label', 'Email Address')}
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder={getWebsiteText('form.step1.fields.email.placeholder', 'Enter your email')}
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step1.fields.phone.label', 'Phone Number')}
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder={getWebsiteText('form.step1.fields.phone.placeholder', 'Enter your phone number')}
                          />
                          {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                        </div>

                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step1.fields.password.label', 'Password')}
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder={getWebsiteText('form.step1.fields.password.placeholder', 'Enter your password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPassword ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {formData.password && (
                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {passwordStrength.text}
                                </span>
                              </div>
                            </div>
                          )}
                          {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step1.fields.confirmPassword.label', 'Confirm Password')}
                          </label>
                          <div className="relative">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder={getWebsiteText('form.step1.fields.confirmPassword.placeholder', 'Confirm your password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showConfirmPassword ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              checked={formData.terms}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {getWebsiteText('form.step1.terms.text', 'I agree to the')}{' '}
                              <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                {getWebsiteText('form.step1.terms.termsLink', 'Terms and Conditions')}
                              </Link>{' '}
                              {getWebsiteText('form.step1.terms.and', 'and')}{' '}
                              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                {getWebsiteText('form.step1.terms.privacyLink', 'Privacy Policy')}
                              </Link>
                            </label>
                          </div>
                          {errors.terms && <p className="text-sm text-red-600 dark:text-red-400">{errors.terms}</p>}

                          <div className="flex items-start">
                            <input
                              id="newsletter"
                              name="newsletter"
                              type="checkbox"
                              checked={formData.newsletter}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {getWebsiteText('form.step1.newsletter.text', 'Subscribe to our newsletter for updates on Tamil literature and events')}
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                          {getWebsiteText('form.step2.title', 'Profile Information')}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step2.fields.birthDate.label', 'Birth Date')}
                            </label>
                            <input
                              id="birthDate"
                              name="birthDate"
                              type="date"
                              value={profileData.birthDate}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                errors.birthDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            {errors.birthDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthDate}</p>}
                          </div>

                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step2.fields.gender.label', 'Gender')}
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={profileData.gender}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              <option value="">{getWebsiteText('form.step2.fields.gender.placeholder', 'Select Gender')}</option>
                              <option value="male">{getWebsiteText('form.step2.fields.gender.options.male', 'Male')}</option>
                              <option value="female">{getWebsiteText('form.step2.fields.gender.options.female', 'Female')}</option>
                              <option value="other">{getWebsiteText('form.step2.fields.gender.options.other', 'Other')}</option>
                              <option value="prefer-not-to-say">{getWebsiteText('form.step2.fields.gender.options.preferNotToSay', 'Prefer not to say')}</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step2.fields.location.label', 'Location')}
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={profileData.location}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder={getWebsiteText('form.step2.fields.location.placeholder', 'Enter your location')}
                          />
                          {errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
                        </div>

                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {getWebsiteText('form.step2.fields.bio.label', 'Bio (Optional)')}
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={profileData.bio}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            placeholder={getWebsiteText('form.step2.fields.bio.placeholder', 'Tell us about yourself and your interest in Tamil literature')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {getWebsiteText('form.step2.fields.interests.label', 'Interests')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {interests.map((interest) => (
                              <label key={interest} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={profileData.interests.includes(interest)}
                                  onChange={() => handleInterestChange(interest)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {getWebsiteText(`form.step2.fields.interests.options.${interest.toLowerCase().replace(/\s+/g, '')}`, interest)}
                                </span>
                              </label>
                            ))}
                          </div>
                          {errors.interests && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.interests}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step2.fields.readingLevel.label', 'Tamil Reading Level')}
                            </label>
                            <select
                              id="readingLevel"
                              name="readingLevel"
                              value={profileData.readingLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                              <option value="">{getWebsiteText('form.step2.fields.readingLevel.placeholder', 'Select Level')}</option>
                              <option value="beginner">{getWebsiteText('form.step2.fields.readingLevel.options.beginner', 'Beginner')}</option>
                              <option value="intermediate">{getWebsiteText('form.step2.fields.readingLevel.options.intermediate', 'Intermediate')}</option>
                              <option value="advanced">{getWebsiteText('form.step2.fields.readingLevel.options.advanced', 'Advanced')}</option>
                              <option value="native">{getWebsiteText('form.step2.fields.readingLevel.options.native', 'Native')}</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="writingLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step2.fields.writingLevel.label', 'Tamil Writing Level')}
                            </label>
                            <select
                              id="writingLevel"
                              name="writingLevel"
                              value={profileData.writingLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                              <option value="">{getWebsiteText('form.step2.fields.writingLevel.placeholder', 'Select Level')}</option>
                              <option value="beginner">{getWebsiteText('form.step2.fields.writingLevel.options.beginner', 'Beginner')}</option>
                              <option value="intermediate">{getWebsiteText('form.step2.fields.writingLevel.options.intermediate', 'Intermediate')}</option>
                              <option value="advanced">{getWebsiteText('form.step2.fields.writingLevel.options.advanced', 'Advanced')}</option>
                              <option value="native">{getWebsiteText('form.step2.fields.writingLevel.options.native', 'Native')}</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="speakingLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {getWebsiteText('form.step2.fields.speakingLevel.label', 'Tamil Speaking Level')}
                            </label>
                            <select
                              id="speakingLevel"
                              name="speakingLevel"
                              value={profileData.speakingLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                              <option value="">{getWebsiteText('form.step2.fields.speakingLevel.placeholder', 'Select Level')}</option>
                              <option value="beginner">{getWebsiteText('form.step2.fields.speakingLevel.options.beginner', 'Beginner')}</option>
                              <option value="intermediate">{getWebsiteText('form.step2.fields.speakingLevel.options.intermediate', 'Intermediate')}</option>
                              <option value="advanced">{getWebsiteText('form.step2.fields.speakingLevel.options.advanced', 'Advanced')}</option>
                              <option value="native">{getWebsiteText('form.step2.fields.speakingLevel.options.native', 'Native')}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      {currentStep > 1 && (
                        <motion.button
                          type="button"
                          onClick={handlePrevStep}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {getWebsiteText('buttons.previous', 'Previous')}
                        </motion.button>
                      )}
                      
                      <motion.button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {getWebsiteText('buttons.creatingAccount', 'Creating Account...')}
                          </div>
                        ) : (
                          currentStep === 1 ? getWebsiteText('buttons.next', 'Next') : getWebsiteText('buttons.createAccount', 'Create Account')
                        )}
                      </motion.button>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getWebsiteText('links.alreadyHaveAccount', 'Already have an account?')}{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          {getWebsiteText('links.signInHere', 'Sign in here')}
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                </>
              ) : (
                /* Email Verification */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {getWebsiteText('verification.title', 'Verify Your Email')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {getWebsiteText('verification.description', "We've sent a 6-digit verification code to")} <strong>{formData.email}</strong>
                  </p>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                    <form onSubmit={handleVerificationSubmit}>
                      <div className="flex space-x-2 mb-6 justify-center">
                        {verificationCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`verify-code-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            className="w-12 h-12 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                            maxLength={1}
                          />
                        ))}
                      </div>

                      <div className="text-center mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Code expires in: <span className="font-semibold text-red-600">{formatTime(verificationTimer)}</span>
                        </p>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300"
                      >
                        {getWebsiteText('verification.button', 'Verify Email')}
                      </motion.button>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setVerificationTimer(300);
                            setNotification({
                              show: true,
                              message: getWebsiteText('verification.resent_message', 'Verification code resent'),
                              type: 'success'
                            });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {getWebsiteText('verification.resend_button', 'Resend Code')}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
            </div>
          </Layout>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #ffffff;
        }

        .dark body {
          background-color: #111827;
          color: #f9fafb;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Focus styles */
        .focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Animation utilities */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Glass morphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .dark .glass {
          background: rgba(17, 24, 39, 0.25);
          border: 1px solid rgba(75, 85, 99, 0.18);
        }

        /* Button hover effects */
        .btn-hover {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-hover:hover::before {
          left: 100%;
        }

        /* Card hover effects */
        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .dark .card-hover:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        }

        /* Loading spinner */
        .spinner {
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive utilities */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Signup;
