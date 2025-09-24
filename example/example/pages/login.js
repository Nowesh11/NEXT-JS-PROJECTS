import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';

export default function Login() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [resetEmail, setResetEmail] = useState('');
  const router = useRouter();

  // Translations
  const translations = {
    en: {
      // Meta
      title: 'Sign In - Tamil Language Society',
      description: 'Sign in to access your Tamil Language Society account',
      
      // Navigation
      home: 'Home',
      about: 'About Us',
      projects: 'Projects',
      ebooks: 'Ebooks',
      bookstore: 'Book Store',
      contact: 'Contact Us',
      notifications: 'Notifications',
      login: 'Login',
      signup: 'Sign Up',
      language: 'தமிழ்',
      
      // Welcome Section
      welcomeTitle: 'Welcome Back',
      welcomeSubtitle: 'Sign in to continue your Tamil language journey',
      featureLibrary: 'Access your library',
      featureFavorites: 'Track your favorites',
      featureCommunity: 'Connect with community',
      
      // Form
      formTitle: 'Sign In',
      formSubtitle: 'Enter your credentials to access your account',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      signinButton: 'Sign In',
      googleButton: 'Google',
      facebookButton: 'Facebook',
      noAccount: "Don't have an account?",
      signupLink: 'Sign up here',
      
      // Modals
      resetPasswordTitle: 'Reset Password',
      resetPasswordDesc: "Enter your email address and we'll send you a link to reset your password.",
      sendResetLink: 'Send Reset Link',
      twoFactorTitle: 'Two-Factor Authentication',
      twoFactorDesc: 'Enter the 6-digit code from your authenticator app',
      verify: 'Verify',
      cancel: 'Cancel',
      
      // Recovery
      recoveryTitle: 'Account Recovery',
      recoveryDesc: 'Choose how you\'d like to recover your account',
      emailRecovery: 'Email Recovery',
      emailRecoveryDesc: 'Reset password via email',
      smsRecovery: 'SMS Recovery',
      smsRecoveryDesc: 'Reset password via SMS',
      securityQuestions: 'Security Questions',
      securityQuestionsDesc: 'Answer security questions',
      
      // Security Panel
      securityCenter: 'Security Center',
      twoFactorAuth: 'Two-Factor Authentication',
      twoFactorAuthDesc: 'Add an extra layer of security to your account',
      enable2FA: 'Enable 2FA',
      passwordStrength: 'Password Strength',
      passwordStrengthDesc: 'Check and improve your password security',
      checkStrength: 'Check Strength',
      loginHistory: 'Login History',
      loginHistoryDesc: 'View your recent login activity',
      viewHistory: 'View History',
      
      // Messages
      loginSuccess: 'Login successful!',
      loginError: 'Login failed. Please try again.',
      resetLinkSent: 'Password reset link sent to your email',
      twoFactorSuccess: '2FA verification successful!',
      enterAllDigits: 'Please enter all 6 digits',
      googleLoginSoon: 'Google login functionality coming soon!',
      facebookLoginSoon: 'Facebook login functionality coming soon!'
    },
    ta: {
      // Meta
      title: 'உள்நுழைவு - தமிழ் மொழி சங்கம்',
      description: 'உங்கள் தமிழ் மொழி சங்க கணக்கை அணுக உள்நுழையவும்',
      
      // Navigation
      home: 'முகப்பு',
      about: 'எங்களைப் பற்றி',
      projects: 'திட்டங்கள்',
      ebooks: 'மின்னூல்கள்',
      bookstore: 'புத்தக கடை',
      contact: 'தொடர்பு',
      notifications: 'அறிவிப்புகள்',
      login: 'உள்நுழைவு',
      signup: 'பதிவு செய்யவும்',
      language: 'English',
      
      // Welcome Section
      welcomeTitle: 'மீண்டும் வரவேற்கிறோம்',
      welcomeSubtitle: 'உங்கள் தமிழ் மொழி பயணத்தைத் தொடர உள்நுழையவும்',
      featureLibrary: 'உங்கள் நூலகத்தை அணுகவும்',
      featureFavorites: 'உங்கள் விருப்பங்களைக் கண்காணிக்கவும்',
      featureCommunity: 'சமூகத்துடன் இணைக்கவும்',
      
      // Form
      formTitle: 'உள்நுழைவு',
      formSubtitle: 'உங்கள் கணக்கை அணுக உங்கள் விவரங்களை உள்ளிடவும்',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      passwordLabel: 'கடவுச்சொல்',
      rememberMe: 'என்னை நினைவில் வைத்துக் கொள்ளுங்கள்',
      forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
      signinButton: 'உள்நுழைவு',
      googleButton: 'கூகிள்',
      facebookButton: 'பேஸ்புக்',
      noAccount: 'கணக்கு இல்லையா?',
      signupLink: 'இங்கே பதிவு செய்யவும்',
      
      // Modals
      resetPasswordTitle: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
      resetPasswordDesc: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும், கடவுச்சொல்லை மீட்டமைக்க இணைப்பை அனுப்புவோம்.',
      sendResetLink: 'மீட்டமைப்பு இணைப்பை அனுப்பவும்',
      twoFactorTitle: 'இரு-காரணி அங்கீகாரம்',
      twoFactorDesc: 'உங்கள் அங்கீகார பயன்பாட்டிலிருந்து 6-இலக்க குறியீட்டை உள்ளிடவும்',
      verify: 'சரிபார்க்கவும்',
      cancel: 'ரத்து செய்யவும்',
      
      // Recovery
      recoveryTitle: 'கணக்கு மீட்பு',
      recoveryDesc: 'உங்கள் கணக்கை எவ்வாறு மீட்க விரும்புகிறீர்கள் என்பதைத் தேர்ந்தெடுக்கவும்',
      emailRecovery: 'மின்னஞ்சல் மீட்பு',
      emailRecoveryDesc: 'மின்னஞ்சல் வழியாக கடவுச்சொல்லை மீட்டமைக்கவும்',
      smsRecovery: 'SMS மீட்பு',
      smsRecoveryDesc: 'SMS வழியாக கடவுச்சொல்லை மீட்டமைக்கவும்',
      securityQuestions: 'பாதுகாப்பு கேள்விகள்',
      securityQuestionsDesc: 'பாதுகாப்பு கேள்விகளுக்கு பதிலளிக்கவும்',
      
      // Security Panel
      securityCenter: 'பாதுகாப்பு மையம்',
      twoFactorAuth: 'இரு-காரணி அங்கீகாரம்',
      twoFactorAuthDesc: 'உங்கள் கணக்கிற்கு கூடுதல் பாதுகாப்பு அடுக்கைச் சேர்க்கவும்',
      enable2FA: '2FA ஐ இயக்கவும்',
      passwordStrength: 'கடவுச்சொல் வலிமை',
      passwordStrengthDesc: 'உங்கள் கடவுச்சொல் பாதுகாப்பைச் சரிபார்த்து மேம்படுத்தவும்',
      checkStrength: 'வலிமையைச் சரிபார்க்கவும்',
      loginHistory: 'உள்நுழைவு வரலாறு',
      loginHistoryDesc: 'உங்கள் சமீபத்திய உள்நுழைவு செயல்பாட்டைக் காண்க',
      viewHistory: 'வரலாற்றைக் காண்க',
      
      // Messages
      loginSuccess: 'உள்நுழைவு வெற்றிகரமாக!',
      loginError: 'உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      resetLinkSent: 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது',
      twoFactorSuccess: '2FA சரிபார்ப்பு வெற்றிகரமாக!',
      enterAllDigits: 'தயவுசெய்து அனைத்து 6 இலக்கங்களையும் உள்ளிடவும்',
      googleLoginSoon: 'கூகிள் உள்நுழைவு செயல்பாடு விரைவில் வரும்!',
      facebookLoginSoon: 'பேஸ்புக் உள்நுழைவு செயல்பாடு விரைவில் வரும்!'
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Initialize theme and language from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check for redirect parameter
    const { redirect } = router.query;
    if (redirect) {
      sessionStorage.setItem('redirect_after_login', redirect);
    }
  }, [router.query]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok && !result?.error) {
        showNotification(t.loginSuccess, 'success');
        
        // Redirect
        const storedRedirect = sessionStorage.getItem('redirect_after_login');
        const redirectUrl = storedRedirect || '/';
        sessionStorage.removeItem('redirect_after_login');
        
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        showNotification(result?.error || t.loginError, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification(t.loginError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    showNotification(t.resetLinkSent, 'success');
    setShowForgotModal(false);
    setResetEmail('');
  };

  const handle2FAVerification = () => {
    const code = twoFactorCode.join('');
    if (code.length === 6) {
      showNotification(t.twoFactorSuccess, 'success');
      setShow2FAModal(false);
      setTwoFactorCode(['', '', '', '', '', '']);
    } else {
      showNotification(t.enterAllDigits, 'error');
    }
  };

  const handle2FAInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...twoFactorCode];
      newCode[index] = value;
      setTwoFactorCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSocialLogin = (provider) => {
    const message = provider === 'google' ? t.googleLoginSoon : t.facebookLoginSoon;
    showNotification(message, 'info');
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="auth-body">
        {/* Navigation */}
        <nav className="navbar" id="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <img src="/assets/logo.png" alt="Tamil Language Society" className="logo-img" />
              <span className="logo-text">Tamil Language Society</span>
            </div>
            
            <div className="nav-menu" id="nav-menu">
              <Link href="/" className="nav-link">{t.home}</Link>
              <Link href="/about" className="nav-link">{t.about}</Link>
              <Link href="/projects" className="nav-link">{t.projects}</Link>
              <Link href="/ebooks" className="nav-link">{t.ebooks}</Link>
              <Link href="/books" className="nav-link">{t.bookstore}</Link>
              <Link href="/contact" className="nav-link">{t.contact}</Link>
              <Link href="/notifications" className="nav-link notification-icon">
                <i className="fas fa-bell"></i>
                <span className="notification-dot" id="notification-dot"></span>
              </Link>
              <Link href="/login" className="nav-link active">{t.login}</Link>
              <Link href="/signup" className="nav-link signup-btn">{t.signup}</Link>
            </div>
            
            <div className="nav-controls">
              <button onClick={toggleLanguage} className="language-toggle-btn">
                <i className="fas fa-language"></i>
                <span>{t.language}</span>
              </button>
              <button onClick={toggleTheme} className="theme-toggle-btn">
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
            
            <div className="hamburger" id="hamburger">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        </nav>

        {/* Login Container */}
        <div className="auth-container">
          <div className="auth-card animate-fadeInUp">
            {/* Welcome Section */}
            <div className="auth-welcome">
              <div className="welcome-content">
                <h1>{t.welcomeTitle}</h1>
                <p>{t.welcomeSubtitle}</p>
                
                <div className="features-list">
                  <div className="feature-item">
                    <i className="fas fa-book"></i>
                    <span>{t.featureLibrary}</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-heart"></i>
                    <span>{t.featureFavorites}</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-users"></i>
                    <span>{t.featureCommunity}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="auth-form-container">
              <div className="form-header">
                <h2>{t.formTitle}</h2>
                <p>{t.formSubtitle}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="login-email">{t.emailLabel}</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="auth-input"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="login-password">{t.passwordLabel}</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                    />
                    <span>{t.rememberMe}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="forgot-password-link"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      {t.signinButton}
                    </>
                  )}
                </button>
                
                <div className="social-login">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="social-btn"
                  >
                    <i className="fab fa-google"></i>
                    <span>{t.googleButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="social-btn"
                  >
                    <i className="fab fa-facebook"></i>
                    <span>{t.facebookButton}</span>
                  </button>
                </div>
                
                <div className="form-footer">
                  <p>
                    <span>{t.noAccount}</span>{' '}
                    <Link href="/signup" className="auth-link">
                      {t.signupLink}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
              <h2>{t.resetPasswordTitle}</h2>
              <p>{t.resetPasswordDesc}</p>
              <form onSubmit={handleForgotPassword}>
                <div className="input-group">
                  <label htmlFor="reset-email">{t.emailLabel}</label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="auth-input"
                  />
                </div>
                <button type="submit" className="auth-submit-btn">
                  <i className="fas fa-paper-plane"></i>
                  {t.sendResetLink}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t.twoFactorTitle}</h2>
              <p>{t.twoFactorDesc}</p>
              <div className="code-input-container">
                {twoFactorCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handle2FAInput(index, e.target.value)}
                    className="code-digit"
                  />
                ))}
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="btn btn-secondary"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handle2FAVerification}
                  className="btn btn-primary"
                >
                  {t.verify}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Options Modal */}
        {showRecoveryModal && (
          <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t.recoveryTitle}</h2>
              <p>{t.recoveryDesc}</p>
              <div className="recovery-options">
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setShowForgotModal(true);
                  }}
                  className="recovery-option"
                >
                  <div className="recovery-option-content">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <h3>{t.emailRecovery}</h3>
                      <p>{t.emailRecoveryDesc}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    showNotification('SMS recovery functionality coming soon!');
                    setShowRecoveryModal(false);
                  }}
                  className="recovery-option"
                >
                  <div className="recovery-option-content">
                    <i className="fas fa-phone"></i>
                    <div>
                      <h3>{t.smsRecovery}</h3>
                      <p>{t.smsRecoveryDesc}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    showNotification('Security questions recovery coming soon!');
                    setShowRecoveryModal(false);
                  }}
                  className="recovery-option"
                >
                  <div className="recovery-option-content">
                    <i className="fas fa-question-circle"></i>
                    <div>
                      <h3>{t.securityQuestions}</h3>
                      <p>{t.securityQuestionsDesc}</p>
                    </div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="btn btn-secondary"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Security Panel */}
        <div className={`security-panel ${showSecurityPanel ? 'open' : ''}`}>
          <div className="security-panel-content">
            <div className="security-panel-header">
              <h3>{t.securityCenter}</h3>
              <button
                onClick={() => setShowSecurityPanel(false)}
                className="security-panel-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="security-features">
              <div className="security-item">
                <h4>
                  <i className="fas fa-shield-alt"></i>
                  {t.twoFactorAuth}
                </h4>
                <p>{t.twoFactorAuthDesc}</p>
                <button
                  onClick={() => showNotification('2FA setup functionality coming soon!')}
                  className="btn btn-primary"
                >
                  {t.enable2FA}
                </button>
              </div>
              <div className="security-item">
                <h4>
                  <i className="fas fa-key"></i>
                  {t.passwordStrength}
                </h4>
                <p>{t.passwordStrengthDesc}</p>
                <button
                  onClick={() => {
                    const password = formData.password;
                    if (!password) {
                      showNotification('Please enter a password first', 'warning');
                      return;
                    }
                    let strength = 0;
                    if (password.length >= 8) strength++;
                    if (/[A-Z]/.test(password)) strength++;
                    if (/[a-z]/.test(password)) strength++;
                    if (/[0-9]/.test(password)) strength++;
                    if (/[^A-Za-z0-9]/.test(password)) strength++;
                    
                    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
                    showNotification(`Password strength: ${strengthText}`);
                  }}
                  className="btn btn-secondary"
                >
                  {t.checkStrength}
                </button>
              </div>
              <div className="security-item">
                <h4>
                  <i className="fas fa-history"></i>
                  {t.loginHistory}
                </h4>
                <p>{t.loginHistoryDesc}</p>
                <button
                  onClick={() => showNotification('Login history functionality coming soon!')}
                  className="btn btn-secondary"
                >
                  {t.viewHistory}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification.show && (
          <div className={`notification-toast ${notification.type}`}>
            <div className="toast-content">
              <i className={`fas ${
                notification.type === 'success' ? 'fa-check-circle' :
                notification.type === 'error' ? 'fa-exclamation-circle' :
                notification.type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
              }`}></i>
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="toast-close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-body {
          min-height: 100vh;
          background: var(--gradient-bg);
          font-family: 'Poppins', 'Noto Sans Tamil', sans-serif;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--surface-color);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          padding: var(--space-4) 0;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .logo-img {
          width: 40px;
          height: 40px;
        }

        .logo-text {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: var(--font-size-lg);
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: var(--font-medium);
          transition: var(--transition-all);
          position: relative;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--primary-color);
        }

        .nav-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .language-toggle-btn,
        .theme-toggle-btn {
          background: none;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--space-2) var(--space-3);
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-all);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .language-toggle-btn:hover,
        .theme-toggle-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--space-4);
          padding-top: calc(var(--space-8) + 80px);
        }

        .auth-card {
          background: var(--surface-color);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          max-width: 1000px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 600px;
        }

        .auth-welcome {
          background: var(--gradient-primary);
          padding: var(--space-12);
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: var(--text-inverse);
        }

        .welcome-content h1 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--space-4);
        }

        .welcome-content p {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-8);
          opacity: 0.9;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .feature-item i {
          font-size: var(--font-size-xl);
          color: var(--accent-secondary);
        }

        .auth-form-container {
          padding: var(--space-12);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .form-header h2 {
          color: var(--text-primary);
          font-size: var(--font-size-3xl);
          margin-bottom: var(--space-2);
        }

        .form-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .input-group label {
          color: var(--text-primary);
          font-weight: var(--font-medium);
        }

        .auth-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-xl);
          font-size: var(--font-size-base);
          background: var(--surface-color);
          color: var(--text-primary);
          transition: var(--transition-all);
        }

        .auth-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: var(--glow-primary);
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: var(--font-size-lg);
        }

        .password-toggle:hover {
          color: var(--primary-color);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
          color: var(--text-secondary);
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: var(--primary-color);
          font-weight: var(--font-medium);
          cursor: pointer;
          text-decoration: none;
        }

        .forgot-password-link:hover {
          text-decoration: underline;
        }

        .auth-submit-btn {
          width: 100%;
          padding: var(--space-3);
          background: var(--gradient-primary);
          color: var(--text-inverse);
          border: none;
          border-radius: var(--radius-xl);
          font-size: var(--font-size-base);
          font-weight: var(--font-semibold);
          cursor: pointer;
          transition: var(--transition-all);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .social-btn {
          padding: var(--space-3);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-xl);
          background: var(--surface-color);
          color: var(--text-primary);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: var(--transition-all);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
        }

        .social-btn:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .form-footer {
          text-align: center;
        }

        .form-footer p {
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--primary-color);
          font-weight: var(--font-semibold);
          text-decoration: none;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--surface-color);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          max-width: 500px;
          width: 90%;
          box-shadow: var(--shadow-xl);
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          background: none;
          border: none;
          font-size: var(--font-size-xl);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .modal-content h2 {
          color: var(--text-primary);
          margin-bottom: var(--space-4);
          text-align: center;
        }

        .modal-content p {
          color: var(--text-secondary);
          margin-bottom: var(--space-6);
          text-align: center;
        }

        .code-input-container {
          display: flex;
          gap: var(--space-2);
          justify-content: center;
          margin-bottom: var(--space-6);
        }

        .code-digit {
          width: 3rem;
          height: 3rem;
          text-align: center;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xl);
          font-weight: var(--font-bold);
          background: var(--surface-color);
          color: var(--text-primary);
        }

        .code-digit:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .modal-actions {
          display: flex;
          gap: var(--space-4);
        }

        .btn {
          flex: 1;
          padding: var(--space-3);
          border-radius: var(--radius-xl);
          cursor: pointer;
          font-weight: var(--font-medium);
          transition: var(--transition-all);
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: var(--text-inverse);
          border: none;
        }

        .btn-secondary {
          border: 2px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
        }

        .recovery-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .recovery-option {
          padding: var(--space-4);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-xl);
          background: var(--surface-color);
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
          transition: var(--transition-all);
        }

        .recovery-option:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }

        .recovery-option-content {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .recovery-option-content i {
          color: var(--primary-color);
          font-size: var(--font-size-xl);
        }

        .recovery-option-content h3 {
          margin: 0;
          font-size: var(--font-size-lg);
        }

        .recovery-option-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .security-panel {
          position: fixed;
          top: 100px;
          right: -400px;
          width: 350px;
          height: calc(100vh - 200px);
          background: var(--surface-color);
          border-radius: var(--radius-2xl) 0 0 var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          z-index: 999;
          transition: right var(--transition-duration) ease;
          overflow-y: auto;
        }

        .security-panel.open {
          right: 0;
        }

        .security-panel-content {
          padding: var(--space-6);
        }

        .security-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .security-panel-header h3 {
          color: var(--text-primary);
          margin: 0;
        }

        .security-panel-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: var(--font-size-xl);
        }

        .security-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .security-item {
          padding: var(--space-4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .security-item h4 {
          color: var(--text-primary);
          margin: 0 0 var(--space-2) 0;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .security-item p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          margin: 0 0 var(--space-4) 0;
        }

        .notification-toast {
          position: fixed;
          top: var(--space-5);
          right: var(--space-5);
          background: var(--surface-color);
          color: var(--text-primary);
          padding: var(--space-4) var(--space-6);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: 1001;
          border-left: 4px solid var(--success-color);
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .notification-toast.error {
          border-left-color: var(--error-color);
        }

        .notification-toast.warning {
          border-left-color: var(--warning-color);
        }

        .notification-toast.info {
          border-left-color: var(--info-color);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .toast-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          margin-left: var(--space-4);
        }

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

        @media (max-width: 768px) {
          .auth-card {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: var(--space-4);
          }
          
          .auth-welcome {
            padding: var(--space-8);
            min-height: auto;
          }
          
          .auth-form-container {
            padding: var(--space-8);
          }
          
          .social-login {
            grid-template-columns: 1fr;
          }

          .nav-menu {
            display: none;
          }

          .hamburger {
            display: flex;
            flex-direction: column;
            cursor: pointer;
          }

          .bar {
            width: 25px;
            height: 3px;
            background-color: var(--text-primary);
            margin: 3px 0;
            transition: 0.3s;
          }
        }
      `}</style>
    </>
  );
}