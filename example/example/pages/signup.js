import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../components/Navigation';

export default function Signup() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationTimer, setVerificationTimer] = useState(300); // 5 minutes

  // Bilingual content
  const getText = (key) => {
    const content = {
      en: {
        'signup-page-title': 'Sign Up - Tamil Language Society',
        'signup-welcome-title': 'Join Tamil Language Society',
        'signup-welcome-description': 'Create your account to access our rich collection of Tamil literature, connect with fellow enthusiasts, and contribute to preserving our cultural heritage.',
        'signup-feature-books': 'Access thousands of Tamil books',
        'signup-feature-community': 'Connect with Tamil community',
        'signup-feature-support': 'Support Tamil literature',
        'signup-form-title': 'Create Account',
        'signup-form-subtitle': 'Fill in your details to get started',
        'signup-firstname-placeholder': 'First Name',
        'signup-lastname-placeholder': 'Last Name',
        'signup-email-placeholder': 'Email Address',
        'signup-phone-placeholder': 'Phone Number (Optional)',
        'signup-password-placeholder': 'Password',
        'signup-confirm-password-placeholder': 'Confirm Password',
        'signup-interest-placeholder': 'Select your primary interest',
        'signup-interest-learning': 'Learning Tamil',
        'signup-interest-literature': 'Tamil Literature',
        'signup-interest-culture': 'Cultural Heritage',
        'signup-interest-teaching': 'Teaching Tamil',
        'signup-interest-research': 'Academic Research',
        'signup-interest-community': 'Community Building',
        'signup-terms-label': 'I agree to the Terms of Service and Privacy Policy',
        'signup-newsletter-label': 'I would like to receive newsletters and updates about Tamil language and culture',
        'signup-notifications-label': 'Send me notifications about new content and community updates',
        'signup-create-button': 'Create Account',
        'signup-google-button': 'Google',
        'signup-facebook-button': 'Facebook',
        'signup-login-prompt': 'Already have an account?',
        'signup-login-link': 'Sign in here',
        'email-verification-title': 'Verify Your Email',
        'email-verification-description': "We've sent a verification code to your email address. Please enter the 6-digit code below to continue.",
        'verify-code-button': 'Verify Code',
        'resend-code-button': 'Resend Code',
        'profile-setup-title': 'Complete Your Profile',
        'wizard-step-profile': 'Profile',
        'wizard-step-interests': 'Interests',
        'wizard-step-skills': 'Skills',
        'wizard-step-preferences': 'Preferences',
        'password-mismatch': 'Passwords do not match',
        'terms-required': 'Please accept the terms and conditions'
      },
      ta: {
        'signup-page-title': 'பதிவு - தமிழ் மொழி சங்கம்',
        'signup-welcome-title': 'தமிழ் மொழி சங்கத்தில் சேருங்கள்',
        'signup-welcome-description': 'தமிழ் இலக்கியத்தின் வளமான தொகுப்பை அணுக, சக ஆர்வலர்களுடன் இணைக்க மற்றும் நமது கலாச்சார பாரம்பரியத்தைப் பாதுகாக்க பங்களிக்க உங்கள் கணக்கை உருவாக்கவும்.',
        'signup-feature-books': 'ஆயிரக்கணக்கான தமிழ் புத்தகங்களை அணுகவும்',
        'signup-feature-community': 'தமிழ் சமூகத்துடன் இணையுங்கள்',
        'signup-feature-support': 'தமிழ் இலக்கியத்தை ஆதரிக்கவும்',
        'signup-form-title': 'கணக்கை உருவாக்கவும்',
        'signup-form-subtitle': 'தொடங்க உங்கள் விவரங்களை நிரப்பவும்',
        'signup-firstname-placeholder': 'முதல் பெயர்',
        'signup-lastname-placeholder': 'கடைசி பெயர்',
        'signup-email-placeholder': 'மின்னஞ்சல் முகவரி',
        'signup-phone-placeholder': 'தொலைபேசி எண் (விருப்பம்)',
        'signup-password-placeholder': 'கடவுச்சொல்',
        'signup-confirm-password-placeholder': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
        'signup-interest-placeholder': 'உங்கள் முதன்மை ஆர்வத்தைத் தேர்ந்தெடுக்கவும்',
        'signup-interest-learning': 'தமிழ் கற்றல்',
        'signup-interest-literature': 'தமிழ் இலக்கியம்',
        'signup-interest-culture': 'கலாச்சார பாரம்பரியம்',
        'signup-interest-teaching': 'தமிழ் கற்பித்தல்',
        'signup-interest-research': 'கல்வி ஆராய்ச்சி',
        'signup-interest-community': 'சமூக கட்டமைப்பு',
        'signup-terms-label': 'சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஒப்புக்கொள்கிறேன்',
        'signup-newsletter-label': 'தமிழ் மொழி மற்றும் கலாச்சாரம் பற்றிய செய்திமடல்கள் மற்றும் புதுப்பிப்புகளைப் பெற விரும்புகிறேன்',
        'signup-notifications-label': 'புதிய உள்ளடக்கம் மற்றும் சமூக புதுப்பிப்புகள் பற்றிய அறிவிப்புகளை எனக்கு அனுப்பவும்',
        'signup-create-button': 'கணக்கை உருவாக்கவும்',
        'signup-google-button': 'கூகிள்',
        'signup-facebook-button': 'பேஸ்புக்',
        'signup-login-prompt': 'ஏற்கனவே கணக்கு உள்ளதா?',
        'signup-login-link': 'இங்கே உள்நுழையவும்',
        'email-verification-title': 'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்',
        'email-verification-description': 'உங்கள் மின்னஞ்சல் முகவரிக்கு சரிபார்ப்பு குறியீட்டை அனுப்பியுள்ளோம். தொடர கீழே 6-இலக்க குறியீட்டை உள்ளிடவும்.',
        'verify-code-button': 'குறியீட்டை சரிபார்க்கவும்',
        'resend-code-button': 'குறியீட்டை மீண்டும் அனுப்பவும்',
        'profile-setup-title': 'உங்கள் சுயவிவரத்தை முடிக்கவும்',
        'wizard-step-profile': 'சுயவிவரம்',
        'wizard-step-interests': 'ஆர்வங்கள்',
        'wizard-step-skills': 'திறன்கள்',
        'wizard-step-preferences': 'விருப்பத்தேர்வுகள்',
        'password-mismatch': 'கடவுச்சொற்கள் பொருந்தவில்லை',
        'terms-required': 'தயவுசெய்து விதிமுறைகளை ஏற்றுக்கொள்ளுங்கள்'
      }
    };
    return content[language]?.[key] || content.en[key] || key;
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Number');

    if (/[^\w\s]/.test(password)) score += 1;
    else feedback.push('Special character');

    const strengthLevels = [
      { text: 'Very Weak', color: '#ff4444' },
      { text: 'Weak', color: '#ff8800' },
      { text: 'Fair', color: '#ffaa00' },
      { text: 'Good', color: '#88cc00' },
      { text: 'Strong', color: '#00cc44' }
    ];

    return {
      score,
      text: strengthLevels[score]?.text || 'Very Weak',
      color: strengthLevels[score]?.color || '#ff4444',
      feedback
    };
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Language toggle
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Handle signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(getText('password-mismatch') || 'Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate terms acceptance
    if (!formData.terms) {
      setError(getText('terms-required') || 'Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user data temporarily for email verification
        sessionStorage.setItem('pendingUser', JSON.stringify(data.user));
        setShowEmailVerification(true);
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleVerificationInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-verification-index="${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Verify email code
  const verifyEmailCode = async () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowEmailVerification(false);
        setShowProfileWizard(true);
      } catch (err) {
        setError('Invalid verification code');
      } finally {
        setLoading(false);
      }
    }
  };

  // Complete profile setup
  const completeProfileSetup = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/');
    } catch (err) {
      setError('Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  // Social signup handlers
  const signupWithGoogle = () => {
    console.log('Signup with Google');
  };

  const signupWithFacebook = () => {
    console.log('Signup with Facebook');
  };

  // Timer effect for verification
  useEffect(() => {
    let interval;
    if (showEmailVerification && verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showEmailVerification, verificationTimer]);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>{`${getText('signup-page-title')}`}</title>
        <meta name="description" content="Join Tamil Language Society" />
      </Head>

      <div className="auth-body">
        {/* Navigation Bar */}
        <Navigation 
          theme={theme} 
          toggleTheme={toggleTheme} 
          language={language} 
          toggleLanguage={toggleLanguage} 
        />

        {/* Signup Container */}
        <div className="auth-container">
          <div className="auth-card animate-fadeInUp">
            {/* Welcome Section */}
            <div className="auth-welcome">
              <div className="welcome-content">
                <h1>{getText('signup-welcome-title')}</h1>
                <p>{getText('signup-welcome-description')}</p>
                
                <div className="features-list">
                  <div className="feature-item">
                    <i className="fas fa-book"></i>
                    <span>{getText('signup-feature-books')}</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-users"></i>
                    <span>{getText('signup-feature-community')}</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-heart"></i>
                    <span>{getText('signup-feature-support')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="auth-form-container">
              <div className="form-header">
                <h2>{getText('signup-form-title')}</h2>
                <p>{getText('signup-form-subtitle')}</p>
              </div>
              
              <form onSubmit={handleSignup} className="auth-form">
                {error && (
                  <div className="error-message" style={{ color: 'var(--error-color)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                
                <div className="form-row">
                  <div className="input-group">
                    <input
                      type="text"
                      name="firstName"
                      placeholder={getText('signup-firstname-placeholder')}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="auth-input"
                    />
                    <i className="fas fa-user auth-input-icon"></i>
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      name="lastName"
                      placeholder={getText('signup-lastname-placeholder')}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="auth-input"
                    />
                    <i className="fas fa-user auth-input-icon"></i>
                  </div>
                </div>
                
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder={getText('signup-email-placeholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="auth-input"
                  />
                  <i className="fas fa-envelope auth-input-icon"></i>
                </div>
                
                <div className="input-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder={getText('signup-phone-placeholder')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="auth-input"
                  />
                  <i className="fas fa-phone auth-input-icon"></i>
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder={getText('signup-password-placeholder')}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="auth-input"
                    />
                    <i className="fas fa-lock auth-input-icon"></i>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder={getText('signup-confirm-password-placeholder')}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="auth-input"
                    />
                    <i className="fas fa-lock auth-input-icon"></i>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-label">Password Strength:</div>
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <div className="strength-text" style={{ color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </div>
                  </div>
                )}
                
                <div className="input-group">
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="auth-select"
                  >
                    <option value="">{getText('signup-interest-placeholder')}</option>
                    <option value="learning">{getText('signup-interest-learning')}</option>
                    <option value="literature">{getText('signup-interest-literature')}</option>
                    <option value="culture">{getText('signup-interest-culture')}</option>
                    <option value="teaching">{getText('signup-interest-teaching')}</option>
                    <option value="research">{getText('signup-interest-research')}</option>
                    <option value="community">{getText('signup-interest-community')}</option>
                  </select>
                  <i className="fas fa-heart auth-input-icon"></i>
                </div>
                
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      required
                      className="auth-checkbox"
                    />
                    <span>{getText('signup-terms-label')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="auth-checkbox"
                    />
                    <span>{getText('signup-newsletter-label')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleInputChange}
                      className="auth-checkbox"
                    />
                    <span>{getText('signup-notifications-label')}</span>
                  </label>
                </div>
                
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  <i className="fas fa-user-plus auth-btn-icon"></i>
                  {loading ? 'Creating Account...' : getText('signup-create-button')}
                </button>
                
                <div className="auth-divider">
                  <hr className="divider-line" />
                  <span className="divider-text">Or sign up with</span>
                </div>
                
                <div className="social-login">
                  <button type="button" className="social-btn" onClick={signupWithGoogle}>
                    <i className="fab fa-google social-icon-google"></i>
                    <span>{getText('signup-google-button')}</span>
                  </button>
                  <button type="button" className="social-btn" onClick={signupWithFacebook}>
                    <i className="fab fa-facebook social-icon-facebook"></i>
                    <span>{getText('signup-facebook-button')}</span>
                  </button>
                </div>
                
                <p className="auth-footer-text">
                  <span>{getText('signup-login-prompt')} </span>
                  <Link href="/login" className="auth-link-bold">
                    {getText('signup-login-link')}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Email Verification Modal */}
        {showEmailVerification && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="verification-icon">
                <i className="fas fa-envelope-open"></i>
              </div>
              <h3>{getText('email-verification-title')}</h3>
              <p>{getText('email-verification-description')}</p>
              
              <div className="verification-code-input">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleVerificationInput(index, e.target.value)}
                    data-verification-index={index}
                    className="code-digit"
                  />
                ))}
              </div>
              
              <div className="verification-timer">
                <span>Code expires in: </span>
                <span className="timer-countdown">{formatTime(verificationTimer)}</span>
              </div>
              
              <div className="verification-actions">
                <button 
                  onClick={verifyEmailCode} 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : getText('verify-code-button')}
                </button>
                <button 
                  onClick={() => setVerificationTimer(300)} 
                  className="btn btn-secondary"
                  disabled={verificationTimer > 0}
                >
                  {getText('resend-code-button')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Setup Wizard */}
        {showProfileWizard && (
          <div className="modal-overlay">
            <div className="modal-content wizard-content-large">
              <div className="wizard-progress">
                <div className="progress-steps">
                  <div className={`step ${currentStep >= 1 ? 'step-active' : 'step-inactive'}`}>
                    {getText('wizard-step-profile')}
                  </div>
                  <div className={`step ${currentStep >= 2 ? 'step-active' : 'step-inactive'}`}>
                    {getText('wizard-step-interests')}
                  </div>
                  <div className={`step ${currentStep >= 3 ? 'step-active' : 'step-inactive'}`}>
                    {getText('wizard-step-skills')}
                  </div>
                  <div className={`step ${currentStep >= 4 ? 'step-active' : 'step-inactive'}`}>
                    {getText('wizard-step-preferences')}
                  </div>
                </div>
              </div>
              
              <h3>{getText('profile-setup-title')}</h3>
              <p>Complete your profile to get personalized recommendations</p>
              
              <div className="wizard-actions">
                {currentStep > 1 && (
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={completeProfileSetup}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Completing...' : 'Complete Setup'}
                  </button>
                )}
                <button 
                  onClick={() => router.push('/')}
                  className="btn btn-ghost"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="language-toggle"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          {language === 'en' ? 'த' : 'EN'}
        </button>
      </div>
    </>
  );
}