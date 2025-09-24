import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';

const ForgotPassword = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Bilingual content
  const getText = (key) => {
    const translations = {
      en: {
        'page-title': 'Forgot Password - Tamil Language Society',
        'forgot-password-title': 'Forgot Password?',
        'forgot-password-subtitle': "Enter your email address and we'll send you instructions to reset your password.",
        'email-label': 'Email Address',
        'send-button': 'Send Reset Instructions',
        'back-to-login': 'Back to Login',
        'signup-prompt': "Don't have an account?",
        'signup-link': 'Sign up here',
        'email-sent-title': 'Email Sent!',
        'email-sent-subtitle': 'Check your email for password reset instructions.',
        'email-sent-message': "We've sent password reset instructions to:",
        'spam-notice': "If you don't see the email, please check your spam folder.",
        'next-steps-title': 'What to do next:',
        'step-1': 'Check your email inbox for our message',
        'step-2': 'Click the reset link in the email',
        'step-3': 'Create a new strong password',
        'step-4': 'Sign in with your new password',
        'resend-button': 'Resend Email',
        'back-to-login-button': 'Back to Login',
        'email-required': 'Email is required',
        'email-invalid': 'Please enter a valid email address',
        'email-not-found': 'No account found with this email address',
        'server-error': 'Server error. Please try again later.',
        'email-sent-success': 'Password reset instructions sent successfully'
      },
      ta: {
        'page-title': 'கடவுச்சொல் மறந்துவிட்டது - தமிழ் மொழி சங்கம்',
        'forgot-password-title': 'கடவுச்சொல் மறந்துவிட்டதா?',
        'forgot-password-subtitle': 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும், கடவுச்சொல்லை மீட்டமைக்க வழிமுறைகளை அனுப்புவோம்.',
        'email-label': 'மின்னஞ்சல் முகவரி',
        'send-button': 'மீட்டமைப்பு வழிமுறைகளை அனுப்பவும்',
        'back-to-login': 'உள்நுழைவுக்கு திரும்பு',
        'signup-prompt': 'கணக்கு இல்லையா?',
        'signup-link': 'இங்கே பதிவு செய்யுங்கள்',
        'email-sent-title': 'மின்னஞ்சல் அனுப்பப்பட்டது!',
        'email-sent-subtitle': 'கடவுச்சொல் மீட்டமைப்பு வழிமுறைகளுக்கு உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.',
        'email-sent-message': 'கடவுச்சொல் மீட்டமைப்பு வழிமுறைகளை இங்கு அனுப்பியுள்ளோம்:',
        'spam-notice': 'மின்னஞ்சல் தெரியவில்லை என்றால், உங்கள் ஸ்பேம் கோப்புறையைச் சரிபார்க்கவும்.',
        'next-steps-title': 'அடுத்து என்ன செய்ய வேண்டும்:',
        'step-1': 'எங்கள் செய்திக்காக உங்கள் மின்னஞ்சல் இன்பாக்ஸைச் சரிபார்க்கவும்',
        'step-2': 'மின்னஞ்சலில் உள்ள மீட்டமைப்பு இணைப்பைக் கிளிக் செய்யவும்',
        'step-3': 'புதிய வலுவான கடவுச்சொல்லை உருவாக்கவும்',
        'step-4': 'உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையவும்',
        'resend-button': 'மின்னஞ்சலை மீண்டும் அனுப்பவும்',
        'back-to-login-button': 'உள்நுழைவுக்கு திரும்பு',
        'email-required': 'மின்னஞ்சல் தேவை',
        'email-invalid': 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
        'email-not-found': 'இந்த மின்னஞ்சல் முகவரியுடன் கணக்கு எதுவும் கிடைக்கவில்லை',
        'server-error': 'சர்வர் பிழை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
        'email-sent-success': 'கடவுச்சொல் மீட்டமைப்பு வழிமுறைகள் வெற்றிகரமாக அனுப்பப்பட்டன'
      }
    };
    return translations[currentLanguage][key] || key;
  };

  // Initialize theme and language
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setCurrentLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email.trim()) {
      setError(getText('email-required'));
      return;
    }

    if (!validateEmail(email)) {
      setError(getText('email-invalid'));
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

      const data = await response.json();

      if (response.ok) {
        setSuccess(getText('email-sent-success'));
        setCurrentStep(2);
      } else {
        if (data.message === 'User not found') {
          setError(getText('email-not-found'));
        } else {
          setError(data.message || getText('server-error'));
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(getText('server-error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend email
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(getText('email-sent-success'));
      } else {
        setError(data.message || getText('server-error'));
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setError(getText('server-error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{getText('page-title')}</title>
        <meta name="description" content="Reset your password for Tamil Language Society" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="auth-body">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
        </button>

        {/* Language Toggle */}
        <button className="language-toggle" onClick={toggleLanguage} aria-label="Toggle language">
          <span>{currentLanguage === 'en' ? 'தமிழ்' : 'EN'}</span>
        </button>

        {/* Navigation */}
        <Navigation currentLanguage={currentLanguage} />

        {/* Forgot Password Container */}
        <div className="auth-container">
          <div className="forgot-password-card animate-fadeInUp">
            
            {/* Step 1: Email Entry */}
            {currentStep === 1 && (
              <div className="reset-step active">
                <div className="step-header">
                  <div className="header-bg-elements">
                    <div className="bg-circle-1"></div>
                    <div className="bg-circle-2"></div>
                  </div>
                  
                  <div className="header-content">
                    <div className="icon-container">
                      <i className="fas fa-key"></i>
                    </div>
                    <h3>{getText('forgot-password-title')}</h3>
                    <p>{getText('forgot-password-subtitle')}</p>
                  </div>
                </div>
                
                <div className="step-content">
                  <form onSubmit={handleSubmit} className="blue-gradient-form">
                    <div className="floating-label-group">
                      <input
                        type="email"
                        id="reset-email"
                        name="email"
                        className="floating-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label htmlFor="reset-email" className="floating-label">
                        {getText('email-label')}
                      </label>
                      <i className="fas fa-envelope input-icon"></i>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        {success}
                      </div>
                    )}
                    
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          <span>{getText('send-button')}</span>
                        </>
                      )}
                    </button>
                    
                    <div className="form-links">
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="link-button"
                      >
                        <i className="fas fa-arrow-left"></i>
                        <span>{getText('back-to-login')}</span>
                      </button>
                    </div>
                    
                    <p className="signup-prompt">
                      <span>{getText('signup-prompt')} </span>
                      <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="link-button accent"
                      >
                        {getText('signup-link')}
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            )}
            
            {/* Step 2: Email Sent Confirmation */}
            {currentStep === 2 && (
              <div className="reset-step active">
                <div className="step-header success">
                  <div className="header-bg-elements">
                    <div className="bg-circle-1"></div>
                    <div className="bg-circle-2"></div>
                  </div>
                  
                  <div className="header-content">
                    <div className="icon-container">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>{getText('email-sent-title')}</h3>
                    <p>{getText('email-sent-subtitle')}</p>
                  </div>
                </div>
                
                <div className="step-content">
                  <div className="email-confirmation">
                    <p className="confirmation-message">
                      {getText('email-sent-message')}
                    </p>
                    <p className="sent-email">{email}</p>
                    <p className="spam-notice">
                      {getText('spam-notice')}
                    </p>
                  </div>
                  
                  <div className="email-tips">
                    <h4>{getText('next-steps-title')}</h4>
                    <ul>
                      <li>{getText('step-1')}</li>
                      <li>{getText('step-2')}</li>
                      <li>{getText('step-3')}</li>
                      <li>{getText('step-4')}</li>
                    </ul>
                  </div>
                  
                  {error && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      {success}
                    </div>
                  )}
                  
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleResend}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sync-alt"></i>
                          <span>{getText('resend-button')}</span>
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => router.push('/login')}
                    >
                      <i className="fas fa-arrow-left"></i>
                      <span>{getText('back-to-login-button')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Theme Variables */
        :root {
          /* Light Theme (Default) */
          --bg-primary: #FFFEFF;
          --bg-secondary: #F2F2F2;
          --bg-gradient: linear-gradient(135deg, #F2F2F2 0%, #FFFEFF 100%);
          --bg-gradient-accent: linear-gradient(135deg, #2F3E75 0%, #A83232 100%);
          --bg-gradient-secondary: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
          
          --text-primary: #0D0D0D;
          --text-secondary: #2F3E75;
          --text-muted: #CFD0D0;
          --text-accent: #A83232;
          
          --border-color: rgba(47, 62, 117, 0.2);
          --shadow-sm: 0 2px 4px rgba(47, 62, 117, 0.1);
          --shadow-md: 0 4px 12px rgba(47, 62, 117, 0.15);
          --shadow-lg: 0 8px 24px rgba(47, 62, 117, 0.2);
          --shadow-2xl: 0 16px 32px rgba(47, 62, 117, 0.3);
          
          --overlay-light: rgba(255, 254, 255, 0.9);
          --overlay-dark: rgba(47, 62, 117, 0.1);
          
          --glass-bg: rgba(255, 254, 255, 0.8);
          --glass-border: rgba(47, 62, 117, 0.2);
          
          --transition: all 0.3s ease-in-out;
          --glow-primary: 0 0 12px rgba(168, 50, 50, 0.4);
          --glow-secondary: 0 0 8px rgba(47, 62, 117, 0.3);
          
          --status-success: #22c55e;
          --status-warning: #f59e0b;
          --status-error: #ef4444;
          --status-info: #3b82f6;
          
          --light-tertiary: #FFFEFF;
          --dark-tertiary: #EDEFEE;
        }
        
        [data-theme="dark"] {
          /* Dark Theme */
          --bg-primary: #182657;
          --bg-secondary: #0D0D0D;
          --bg-gradient: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
          --bg-gradient-accent: linear-gradient(135deg, #7A1515 0%, #EDEFEE 100%);
          --bg-gradient-secondary: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
          
          --text-primary: #EDEFEE;
          --text-secondary: #AEAEAE;
          --text-muted: #7A1515;
          --text-accent: #7A1515;
          
          --border-color: rgba(174, 174, 174, 0.3);
          --shadow-sm: 0 2px 4px rgba(174, 174, 174, 0.1);
          --shadow-md: 0 4px 12px rgba(174, 174, 174, 0.2);
          --shadow-lg: 0 8px 24px rgba(174, 174, 174, 0.3);
          --shadow-2xl: 0 16px 32px rgba(174, 174, 174, 0.4);
          
          --overlay-light: rgba(24, 38, 87, 0.9);
          --overlay-dark: rgba(174, 174, 174, 0.1);
          
          --glass-bg: rgba(24, 38, 87, 0.8);
          --glass-border: rgba(174, 174, 174, 0.3);
          
          --glow-primary: 0 0 12px rgba(237, 239, 238, 0.4);
          --glow-secondary: 0 0 8px rgba(174, 174, 174, 0.3);
          
          --light-tertiary: #EDEFEE;
          --dark-tertiary: #EDEFEE;
        }

        /* Base Styles */
        .auth-body {
          background: var(--bg-gradient);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 1rem 2rem;
          color: var(--text-primary);
          transition: var(--transition);
        }

        /* Theme Toggle */
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: var(--bg-gradient-accent);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-md);
          color: var(--light-tertiary);
        }

        .theme-toggle:hover {
          transform: scale(1.1);
          box-shadow: var(--glow-primary);
        }

        /* Language Toggle */
        .language-toggle {
          position: fixed;
          top: 20px;
          right: 80px;
          z-index: 1000;
          background: var(--bg-gradient-accent);
          border: none;
          border-radius: 25px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-md);
          color: var(--light-tertiary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .language-toggle:hover {
          transform: scale(1.05);
          box-shadow: var(--glow-primary);
        }

        /* Auth Container */
        .auth-container {
          width: 100%;
          max-width: 600px;
        }

        .forgot-password-card {
          background: var(--bg-primary);
          border-radius: 2rem;
          box-shadow: var(--shadow-2xl);
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: var(--transition);
        }

        /* Step Header */
        .step-header {
          background: var(--bg-gradient-accent);
          padding: 3rem;
          text-align: center;
          color: var(--light-tertiary);
          position: relative;
          overflow: hidden;
        }

        .step-header.success {
          background: linear-gradient(135deg, var(--status-success), #047857);
        }

        .header-bg-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .bg-circle-1 {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .bg-circle-2 {
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .icon-container {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          backdrop-filter: blur(10px);
        }

        .icon-container i {
          font-size: 3rem;
          color: var(--light-tertiary);
        }

        .step-header h3 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .step-header p {
          opacity: 0.9;
          margin: 0;
        }

        /* Step Content */
        .step-content {
          padding: 3rem;
        }

        /* Form Styles */
        .floating-label-group {
          margin-bottom: 2rem;
          position: relative;
        }

        .floating-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          font-size: 1rem;
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: var(--transition);
        }

        .floating-input:focus {
          border-color: var(--text-accent);
          box-shadow: 0 0 0 3px rgba(168, 50, 50, 0.1);
          outline: none;
        }

        [data-theme="dark"] .floating-input:focus {
          box-shadow: 0 0 0 3px rgba(122, 21, 21, 0.2);
        }

        .floating-label {
          position: absolute;
          left: 3rem;
          top: 1rem;
          color: var(--text-muted);
          pointer-events: none;
          transition: var(--transition);
          background: var(--bg-secondary);
          padding: 0 0.25rem;
        }

        .floating-input:focus + .floating-label,
        .floating-input:not(:placeholder-shown) + .floating-label {
          top: -0.5rem;
          left: 2.5rem;
          font-size: 0.8rem;
          color: var(--text-accent);
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        /* Button Styles */
        .btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--bg-gradient-accent);
          color: var(--light-tertiary);
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover:not(:disabled) {
          box-shadow: var(--glow-primary);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-accent);
          border: 2px solid var(--text-accent);
          margin-bottom: 1rem;
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--text-accent);
          color: var(--light-tertiary);
          box-shadow: var(--glow-primary);
        }

        /* Form Links */
        .form-links {
          text-align: center;
          margin-bottom: 1rem;
        }

        .link-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .link-button:hover {
          color: var(--text-accent);
        }

        .link-button.accent {
          color: var(--text-accent);
          font-weight: 600;
        }

        .signup-prompt {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        /* Messages */
        .error-message,
        .success-message {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: var(--status-error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .success-message {
          background: rgba(34, 197, 94, 0.1);
          color: var(--status-success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        /* Email Confirmation */
        .email-confirmation {
          margin-bottom: 2rem;
        }

        .confirmation-message {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .sent-email {
          color: var(--text-accent);
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .spam-notice {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        /* Email Tips */
        .email-tips {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
        }

        .email-tips h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .email-tips ul {
          color: var(--text-secondary);
          line-height: 1.8;
          padding-left: 1.5rem;
          margin: 0;
        }

        .email-tips li {
          margin-bottom: 0.5rem;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        /* Animations */
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

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

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-body {
            padding: 100px 1rem 1rem;
          }

          .step-header {
            padding: 2rem;
          }

          .step-content {
            padding: 2rem;
          }

          .icon-container {
            width: 80px;
            height: 80px;
          }

          .icon-container i {
            font-size: 2rem;
          }

          .step-header h3 {
            font-size: 1.1rem;
          }

          .language-toggle {
            right: 20px;
            top: 80px;
          }
        }
      `}</style>
    </>
  );
};

export default ForgotPassword;