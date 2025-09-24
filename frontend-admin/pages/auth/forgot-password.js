'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Verification, 3: Success
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [resendTimer, setResendTimer] = useState(0);
  
  const emailRef = useRef(null);
  const codeRefs = useRef([]);
  const errorRef = useRef(null);
  const announcementRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (currentStep === 1 && emailRef.current) {
      emailRef.current.focus();
    } else if (currentStep === 2 && codeRefs.current[0]) {
      codeRefs.current[0].focus();
    }
  }, [currentStep]);

  // Error announcement for screen readers
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
      setAnnouncements(prev => [...prev, error]);
    }
  }, [error]);

  // Resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnnouncements(prev => [...prev, 'Verification code sent to your email']);
      setCurrentStep(2);
      setResendTimer(60); // 60 seconds countdown
      
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleCodeSubmit(newCode.join(''));
    }
    
    if (error) setError('');
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = async (code = verificationCode.join('')) => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnnouncements(prev => [...prev, 'Code verified successfully']);
      setCurrentStep(3);
      
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnnouncements(prev => [...prev, 'New verification code sent']);
      setResendTimer(60);
      
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep(1);
    setVerificationCode(['', '', '', '', '', '']);
    setError('');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Tamil Language Society Admin</title>
        <meta name="description" content="Reset your admin account password" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Screen reader announcements */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-w-md w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <KeyIcon className="w-8 h-8 text-blue-400" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-300 text-sm">
                {currentStep === 1 && "Enter your email to receive a reset code"}
                {currentStep === 2 && "Enter the 6-digit code sent to your email"}
                {currentStep === 3 && "Password reset instructions sent!"}
              </p>
            </div>

            {error && (
              <motion.div 
                ref={errorRef}
                className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Step 1: Email Input */}
            {currentStep === 1 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Code'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Verification Code */}
            {currentStep === 2 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-300 text-sm mb-4">
                      Code sent to <span className="font-semibold text-white">{email}</span>
                    </p>
                  </div>

                  <div className="flex justify-center gap-3">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => codeRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ))}
                  </div>

                  <div className="text-center space-y-4">
                    <button
                      onClick={handleResendCode}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>

                    <button
                      onClick={handleBackToEmail}
                      className="flex items-center justify-center gap-2 w-full text-gray-300 hover:text-white transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Back to email
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    We've sent password reset instructions to <span className="font-semibold text-white">{email}</span>
                  </p>
                  <p className="text-gray-400 text-xs">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setEmail('');
                      setVerificationCode(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Try Different Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Remember your password?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;