import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function ForgotPassword() {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError(language === 'ta' ? 'மின்னஞ்சல் தேவை' : 'Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(language === 'ta' ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsEmailSent(true);
      } else {
        const data = await response.json();
        setError(data.message || (language === 'ta' ? 'மீட்டமைப்பு மின்னஞ்சல் அனுப்புவதில் பிழை' : 'Failed to send reset email'));
      }
    } catch (error) {
      setError(language === 'ta' ? 'மீட்டமைப்பு மின்னஞ்சல் அனுப்புவதில் பிழை ஏற்பட்டது' : 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || (language === 'ta' ? 'மின்னஞ்சல் மீண்டும் அனுப்புவதில் பிழை' : 'Failed to resend email'));
      }
    } catch (error) {
      setError(language === 'ta' ? 'மின்னஞ்சல் மீண்டும் அனுப்புவதில் பிழை ஏற்பட்டது' : 'Failed to resend email. Please try again.');
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

  return (
    <>
      <Head>
        <title>{language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா - தமிழ் இலக்கிய சங்கம்' : 'Forgot Password - Tamil Literary Society'}</title>
        <meta name="description" content={language === 'ta' ? 'உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset your password'} />
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
            {!isEmailSent ? (
              <>
                <div>
                  <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot your password?'}
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'ta' ? 'கவலைப்பட வேண்டாம். உங்கள் மின்னஞ்சல் முகவரியை உள்ளிட்டு மீட்டமைப்பு இணைப்பைப் பெறுங்கள்.' : "Don't worry. Enter your email address and we'll send you a reset link."}
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email address'}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter your email address'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

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
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      {isLoading 
                        ? (language === 'ta' ? 'அனுப்புகிறது...' : 'Sending...') 
                        : (language === 'ta' ? 'மீட்டமைப்பு இணைப்பை அனுப்பவும்' : 'Send reset link')
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {language === 'ta' ? 'மின்னஞ்சல் அனுப்பப்பட்டது!' : 'Email sent!'}
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'ta' 
                      ? `${email} க்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பை அனுப்பியுள்ளோம். உங்கள் இன்பாக்ஸைச் சரிபார்க்கவும்.`
                      : `We've sent a password reset link to ${email}. Please check your inbox.`
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {language === 'ta' ? 'மின்னஞ்சலை மீண்டும் அனுப்பவும்' : 'Resend email'}
                  </button>

                  <div className="text-center">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பவும்' : 'Back to sign in'}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
