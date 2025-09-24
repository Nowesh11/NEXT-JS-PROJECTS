import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';

const LoginPage = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');
  
  // Refs for accessibility
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const submitButtonRef = useRef(null);
  const errorRef = useRef(null);
  
  // Focus management
  useEffect(() => {
    // Focus on email input when component mounts
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);
  
  // Announce errors to screen readers
  useEffect(() => {
    if (error) {
      setAnnounceMessage(error);
      if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnnounceMessage('Signing in, please wait...');

    try {
      // Use NextAuth signIn instead of custom auth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.ok && !result?.error) {
        setAnnounceMessage('Login successful. Redirecting to admin dashboard...');
        // Get the session to ensure it's properly set
        const session = await getSession();
        if (session) {
          router.push('/admin');
        } else {
          setError('Session creation failed. Please try again.');
        }
      } else {
        const errorMessage = result?.error || 'Invalid email or password. Please check your credentials and try again.';
        setError(errorMessage);
        setAnnounceMessage(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = 'Login failed. Please check your connection and try again.';
      setError(errorMessage);
      setAnnounceMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter' && nextRef && nextRef.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <Head>
        <title>{getText ? getText('admin.login.title', 'Admin Login - TLS') : 'Admin Login - TLS'}</title>
        <meta name="description" content="Admin login for TLS platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>
      
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>

      <div 
        className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-digital-50 dark:from-gray-900 dark:via-gray-800 dark:to-cultural-900 flex items-center justify-center p-4 relative overflow-hidden"
        role="main"
        aria-label="Admin login page"
      >
        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-cultural-200/20 dark:bg-cultural-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-digital-200/20 dark:bg-digital-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo and Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 bg-cultural-500 rounded-2xl mb-4"
              role="img"
              aria-label="TLS Admin Portal Logo"
            >
              <UserIcon className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 
              className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
              id="login-heading"
            >
              {getText ? getText('admin.login.welcome', 'Admin Portal') : 'Admin Portal'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.login.subtitle', 'Sign in to manage your platform') : 'Sign in to manage your platform'}
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            variants={itemVariants}
            className="glass-morphism rounded-2xl p-8 shadow-xl"
          >
            <form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              role="form"
              aria-labelledby="login-heading"
              noValidate
            >
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    ref={errorRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                    role="alert"
                    aria-live="assertive"
                    tabIndex="-1"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm" id="error-message">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {getText ? getText('admin.login.email', 'Email Address') : 'Email Address'}
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <UserIcon 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                    aria-hidden="true"
                  />
                  <input
                    ref={emailInputRef}
                    id="email-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, passwordInputRef)}
                    required
                    autoComplete="email"
                    aria-describedby={error ? "error-message" : undefined}
                    aria-invalid={error ? "true" : "false"}
                    className="w-full pl-10 pr-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {getText ? getText('admin.login.password', 'Password') : 'Password'}
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                    aria-hidden="true"
                  />
                  <input
                    ref={passwordInputRef}
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, submitButtonRef)}
                    required
                    autoComplete="current-password"
                    aria-describedby={error ? "error-message password-toggle-desc" : "password-toggle-desc"}
                    aria-invalid={error ? "true" : "false"}
                    className="w-full pl-10 pr-12 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-describedby="password-toggle-desc"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cultural-500/50 rounded"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                  <div id="password-toggle-desc" className="sr-only">
                    {showPassword ? 'Password is currently visible' : 'Password is currently hidden'}
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    id="remember-me"
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cultural-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-cultural-500 focus:ring-2"
                    aria-describedby="remember-me-desc"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {getText ? getText('admin.login.remember', 'Remember me') : 'Remember me'}
                  </span>
                  <div id="remember-me-desc" className="sr-only">
                    Keep me signed in on this device
                  </div>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-cultural-600 dark:text-cultural-400 hover:text-cultural-700 dark:hover:text-cultural-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cultural-500/50 rounded px-1 py-1"
                  aria-label="Reset your password"
                >
                  {getText ? getText('admin.login.forgot', 'Forgot password?') : 'Forgot password?'}
                </Link>
              </div>

              {/* Login Button */}
              <motion.button
                ref={submitButtonRef}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cultural-500 to-cultural-600 text-white font-medium rounded-xl hover:from-cultural-600 hover:to-cultural-700 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                aria-describedby="login-button-desc"
              >
                {loading ? (
                  <div 
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                )}
                {loading 
                  ? (getText ? getText('admin.login.signing', 'Signing in...') : 'Signing in...')
                  : (getText ? getText('admin.login.signin', 'Sign In') : 'Sign In')
                }
              </motion.button>
              <div id="login-button-desc" className="sr-only">
                {loading ? 'Please wait while we sign you in' : 'Click to sign in to the admin portal'}
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                Demo Credentials:
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Email: admin@tls.com<br />
                Password: admin123
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 Tamil Literary Society. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;