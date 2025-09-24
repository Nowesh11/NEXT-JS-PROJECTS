import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken }),
      });

      if (response.ok) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError(language === 'ta' ? 'தவறான அல்லது காலாவதியான மீட்டமைப்பு டோக்கன்' : 'Invalid or expired reset token');
      }
    } catch (error) {
      setTokenValid(false);
      setError(language === 'ta' ? 'டோக்கன் சரிபார்ப்பில் பிழை' : 'Error validating token');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.newPassword || !formData.confirmPassword) {
      setError(language === 'ta' ? 'அனைத்து புலங்களும் தேவை' : 'All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError(language === 'ta' ? 'கடவுச்சொல் தேவைகளை பூர்த்தி செய்யவில்லை' : 'Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        setIsPasswordReset(true);
      } else {
        const data = await response.json();
        setError(data.message || (language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பில் பிழை' : 'Failed to reset password'));
      }
    } catch (error) {
      setError(language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பில் பிழை ஏற்பட்டது' : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <>
        <Head>
          <title>{language === 'ta' ? 'தவறான டோக்கன் - தமிழ் இலக்கிய சங்கம்' : 'Invalid Token - Tamil Literary Society'}</title>
          <meta name="description" content={language === 'ta' ? 'தவறான அல்லது காலாவதியான மீட்டமைப்பு டோக்கன்' : 'Invalid or expired reset token'} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-display flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full text-center"
          >
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              {language === 'ta' ? 'தவறான டோக்கன்' : 'Invalid Token'}
            </h2>
            <p className="text-gray-600 mb-8">
              {language === 'ta' ? 'இந்த மீட்டமைப்பு இணைப்பு தவறானது அல்லது காலாவதியானது. புதிய மீட்டமைப்பு இணைப்பைக் கோரவும்.' : 'This reset link is invalid or has expired. Please request a new reset link.'}
            </p>
            <Link href="/forgot-password" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-block">
              {language === 'ta' ? 'புதிய இணைப்பைக் கோரவும்' : 'Request New Link'}
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பு - தமிழ் இலக்கிய சங்கம்' : 'Reset Password - Tamil Literary Society'}</title>
        <meta name="description" content={language === 'ta' ? 'உங்கள் புதிய கடவுச்சொல்லை அமைக்கவும்' : 'Set your new password'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-display">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TLS</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  {language === 'ta' ? 'தமிழ் இலக்கிய சங்கம்' : 'Tamil Literary Society'}
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  {language === 'ta' ? 'உள்நுழைக' : 'Sign In'}
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  {language === 'ta' ? 'பதிவு செய்க' : 'Sign Up'}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full space-y-8"
          >
            {!isPasswordReset ? (
              <>
                <div>
                  <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {language === 'ta' ? 'புதிய கடவுச்சொல் அமைக்கவும்' : 'Set new password'}
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'ta' ? 'உங்கள் கணக்கிற்கான புதிய, பாதுகாப்பான கடவுச்சொல்லை உருவாக்கவும்' : 'Create a new, secure password for your account'}
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        {language === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'}
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder={language === 'ta' ? 'புதிய கடவுச்சொல்லை உள்ளிடவும்' : 'Enter new password'}
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        {language === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்தவும்' : 'Confirm Password'}
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          placeholder={language === 'ta' ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Confirm your password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showConfirmPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {language === 'ta' ? 'கடவுச்சொல் தேவைகள்:' : 'Password requirements:'}
                      </h4>
                      <div className="space-y-1 text-xs">
                        {(() => {
                          const validation = validatePassword(formData.newPassword);
                          return (
                            <>
                              <div className={`flex items-center ${validation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={validation.minLength ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                                </svg>
                                {language === 'ta' ? 'குறைந்தது 8 எழுத்துக்கள்' : 'At least 8 characters'}
                              </div>
                              <div className={`flex items-center ${validation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={validation.hasUppercase ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                                </svg>
                                {language === 'ta' ? 'ஒரு பெரிய எழுத்து' : 'One uppercase letter'}
                              </div>
                              <div className={`flex items-center ${validation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={validation.hasLowercase ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                                </svg>
                                {language === 'ta' ? 'ஒரு சிறிய எழுத்து' : 'One lowercase letter'}
                              </div>
                              <div className={`flex items-center ${validation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={validation.hasNumber ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                                </svg>
                                {language === 'ta' ? 'ஒரு எண்' : 'One number'}
                              </div>
                              <div className={`flex items-center ${validation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={validation.hasSpecialChar ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                                </svg>
                                {language === 'ta' ? 'ஒரு சிறப்பு எழுத்து' : 'One special character'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {error}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || tokenValid === null}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      {isLoading 
                        ? (language === 'ta' ? 'மீட்டமைக்கிறது...' : 'Resetting...') 
                        : (language === 'ta' ? 'கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset password')
                      }
                    </button>
                  </div>

                  <div className="text-center">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பவும்' : 'Back to sign in'}
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div>
                  <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {language === 'ta' ? 'கடவுச்சொல் மீட்டமைக்கப்பட்டது!' : 'Password reset successful!'}
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'ta' ? 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது. இப்போது உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.' : 'Your password has been successfully reset. You can now sign in with your new password.'}
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-block">
                    {language === 'ta' ? 'உள்நுழைக' : 'Sign In'}
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
