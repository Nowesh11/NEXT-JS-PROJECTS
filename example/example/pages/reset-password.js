import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';

const ResetPassword = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const router = useRouter();

  // Bilingual content
  const getText = (key) => {
    const translations = {
      en: {
        'page-title': 'Reset Password - Tamil Language Society',
        'reset-password-title': 'Create New Password',
        'reset-password-subtitle': 'Enter your new password below.',
        'new-password-label': 'New Password',
        'confirm-password-label': 'Confirm New Password',
        'update-button': 'Update Password',
        'back-to-login': 'Back to Login',
        'signup-prompt': "Don't have an account?",
        'signup-link': 'Sign up here',
        'password-updated-title': 'Password Updated!',
        'password-updated-subtitle': 'Your password has been successfully updated.',
        'password-updated-message': 'You can now sign in with your new password.',
        'signin-button': 'Sign In Now',
        'password-requirements-title': 'Password Requirements:',
        'req-length': 'At least 8 characters long',
        'req-uppercase': 'Contains uppercase and lowercase letters',
        'req-number': 'Contains at least one number',
        'req-special': 'Contains at least one special character',
        'password-required': 'Password is required',
        'password-confirm-required': 'Please confirm your password',
        'password-mismatch': 'Passwords do not match',
        'password-weak': 'Password does not meet requirements',
        'token-invalid': 'Invalid or expired reset token',
        'token-expired': 'Reset link has expired. Please request a new one.',
        'server-error': 'Server error. Please try again later.',
        'password-updated-success': 'Password updated successfully!'
      },
      ta: {
        'page-title': 'கடவுச்சொல் மீட்டமைப்பு - தமிழ் மொழி சங்கம்',
        'reset-password-title': 'புதிய கடவுச்சொல்லை உருவாக்கவும்',
        'reset-password-subtitle': 'கீழே உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்.',
        'new-password-label': 'புதிய கடவுச்சொல்',
        'confirm-password-label': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
        'update-button': 'கடவுச்சொல்லை புதுப்பிக்கவும்',
        'back-to-login': 'உள்நுழைவுக்கு திரும்பு',
        'signup-prompt': 'கணக்கு இல்லையா?',
        'signup-link': 'இங்கே பதிவு செய்யுங்கள்',
        'password-updated-title': 'கடவுச்சொல் புதுப்பிக்கப்பட்டது!',
        'password-updated-subtitle': 'உங்கள் கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.',
        'password-updated-message': 'இப்போது உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.',
        'signin-button': 'இப்போது உள்நுழையவும்',
        'password-requirements-title': 'கடவுச்சொல் தேவைகள்:',
        'req-length': 'குறைந்தது 8 எழுத்துகள் நீளம்',
        'req-uppercase': 'பெரிய மற்றும் சிறிய எழுத்துகள் உள்ளன',
        'req-number': 'குறைந்தது ஒரு எண் உள்ளது',
        'req-special': 'குறைந்தது ஒரு சிறப்பு எழுத்து உள்ளது',
        'password-required': 'கடவுச்சொல் தேவை',
        'password-confirm-required': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
        'password-mismatch': 'கடவுச்சொற்கள் பொருந்தவில்லை',
        'password-weak': 'கடவுச்சொல் தேவைகளை பூர்த்தி செய்யவில்லை',
        'token-invalid': 'தவறான அல்லது காலாவதியான மீட்டமைப்பு டோக்கன்',
        'token-expired': 'மீட்டமைப்பு இணைப்பு காலாவதியாகிவிட்டது. புதியதை கோரவும்.',
        'server-error': 'சர்வர் பிழை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
        'password-updated-success': 'கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'
      }
    };
    return translations[currentLanguage][key] || key;
  };

  // Initialize theme, language, and token
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setCurrentLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Get token from URL
    const { token: urlToken } = router.query;
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else if (router.isReady) {
      // If no token and router is ready, redirect to forgot password
      router.push('/forgot-password');
    }
  }, [router.query, router.isReady]);

  // Validate reset token
  const validateToken = async (resetToken) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken }),
      });

      const data = await response.json();
      setTokenValid(response.ok);
      
      if (!response.ok) {
        setError(data.message === 'Token expired' ? getText('token-expired') : getText('token-invalid'));
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenValid(false);
      setError(getText('server-error'));
    }
  };

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

  // Validate password strength
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.newPassword.trim()) {
      setError(getText('password-required'));
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setError(getText('password-confirm-required'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(getText('password-mismatch'));
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError(getText('password-weak'));
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
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(getText('password-updated-success'));
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        if (data.message === 'Token expired') {
          setError(getText('token-expired'));
        } else if (data.message === 'Invalid token') {
          setError(getText('token-invalid'));
        } else {
          setError(data.message || getText('server-error'));
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(getText('server-error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (fieldId) => {
    const field = document.getElementById(fieldId);
    const toggle = field.parentElement.querySelector('.password-toggle i');
    
    if (field.type === 'password') {
      field.type = 'text';
      toggle.className = 'fas fa-eye-slash';
    } else {
      field.type = 'password';
      toggle.className = 'fas fa-eye';
    }
  };

  // Show loading or invalid token state
  if (tokenValid === null) {
    return (
      <div className="auth-body">
        <div className="auth-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
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
          <div className="auth-container">
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Invalid Reset Link</h3>
              <p>{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/forgot-password')}
              >
                <i className="fas fa-arrow-left"></i>
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

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

        {/* Reset Password Container */}
        <div className="auth-container">
          <div className="reset-password-card animate-fadeInUp">
            <div className="step-header">
              <div className="header-bg-elements">
                <div className="bg-circle-1"></div>
                <div className="bg-circle-2"></div>
              </div>
              
              <div className="header-content">
                <div className="icon-container">
                  <i className="fas fa-lock"></i>
                </div>
                <h3>{getText('reset-password-title')}</h3>
                <p>{getText('reset-password-subtitle')}</p>
              </div>
            </div>
            
            <div className="step-content">
              <form onSubmit={handleSubmit} className="reset-form">
                <div className="floating-label-group">
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    className="floating-input"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="new-password" className="floating-label">
                    {getText('new-password-label')}
                  </label>
                  <i className="fas fa-lock input-icon"></i>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new-password')}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
                
                <div className="floating-label-group">
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    className="floating-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="confirm-password" className="floating-label">
                    {getText('confirm-password-label')}
                  </label>
                  <i className="fas fa-lock input-icon"></i>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm-password')}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="password-requirements">
                  <h5>{getText('password-requirements-title')}</h5>
                  <ul>
                    <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                      {getText('req-length')}
                    </li>
                    <li className={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                      {getText('req-uppercase')}
                    </li>
                    <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                      {getText('req-number')}
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                      {getText('req-special')}
                    </li>
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
                
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>{getText('update-button')}</span>
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

        .reset-password-card {
          background: var(--bg-primary);
          border-radius: 2rem;
          box-shadow: var(--shadow-2xl);
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: var(--transition);
        }

        /* Loading Container */
        .loading-container {
          text-align: center;
          padding: 3rem;
          color: var(--text-primary);
        }

        .loading-container i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: var(--text-accent);
        }

        /* Error Container */
        .error-container {
          text-align: center;
          padding: 3rem;
          color: var(--text-primary);
        }

        .error-icon {
          width: 100px;
          height: 100px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        }

        .error-icon i {
          font-size: 3rem;
          color: var(--status-error);
        }

        .error-container h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .error-container p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
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
          padding: 1rem 3rem 1rem 3rem;
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

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.1rem;
          transition: var(--transition);
        }

        .password-toggle:hover {
          color: var(--text-accent);
        }

        /* Password Requirements */
        .password-requirements {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
        }

        .password-requirements h5 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 1rem;
        }

        .password-requirements ul {
          color: var(--text-secondary);
          line-height: 1.6;
          padding-left: 1.5rem;
          font-size: 0.9rem;
          margin: 0;
        }

        .password-requirements li {
          margin-bottom: 0.5rem;
          transition: var(--transition);
        }

        .password-requirements li.valid {
          color: var(--status-success);
          font-weight: 500;
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

export default ResetPassword;