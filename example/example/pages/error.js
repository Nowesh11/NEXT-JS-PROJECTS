import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';

export default function ErrorPage() {
  const [theme, setTheme] = useState('light');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const router = useRouter();
  
  // Get error details from query parameters
  const { message, code, error, statusCode, hasGetInitialPropsRun, err } = router.query;
  const errorCode = statusCode || code || error || '500';
  const errorType = err || 'server-error';

  // Bilingual content
  const getText = (key) => {
    const translations = {
      en: {
        'page-title': 'Error | Tamil Language Society',
        'error-title': 'Something went wrong',
        'error-subtitle': 'We encountered an unexpected error.',
        'error-description': 'An error occurred while processing your request. Please try again later or contact support if the problem persists.',
        'server-error-title': 'Server Error',
        'server-error-description': 'Our servers are experiencing some issues. Please try again in a few moments.',
        'client-error-title': 'Request Error',
        'client-error-description': 'There was an issue with your request. Please check your input and try again.',
        'network-error-title': 'Network Error',
        'network-error-description': 'Unable to connect to our servers. Please check your internet connection.',
        'validation-error-title': 'Validation Error',
        'validation-error-description': 'The information provided is invalid. Please correct the errors and try again.',
        'auth-error-title': 'Authentication Error',
        'auth-error-description': 'You need to be logged in to access this resource.',
        'permission-error-title': 'Permission Denied',
        'permission-error-description': 'You do not have permission to access this resource.',
        'page-not-found-title': 'Page Not Found',
        'page-not-found-description': "The page you're looking for doesn't exist or has been moved.",
        'go-home': 'Go to Homepage',
        'go-back': 'Go Back',
        'try-again': 'Try Again',
        'contact-support': 'Contact Support',
        'refresh-page': 'Refresh Page',
        'error-code': 'Error Code',
        'error-details': 'Error Details',
        'what-happened': 'What happened?',
        'what-can-do': 'What can you do?',
        'suggestions': {
          'refresh': 'Refresh the page and try again',
          'check-url': 'Check if the URL is correct',
          'go-back': 'Go back to the previous page',
          'contact': 'Contact our support team if the issue persists',
          'try-later': 'Try again after some time'
        }
      },
      ta: {
        'page-title': 'பிழை | தமிழ் மொழி சங்கம்',
        'error-title': 'ஏதோ தவறு நடந்துள்ளது',
        'error-subtitle': 'எதிர்பாராத பிழை ஏற்பட்டுள்ளது.',
        'error-description': 'உங்கள் கோரிக்கையை செயல்படுத்தும் போது பிழை ஏற்பட்டது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும் அல்லது சிக்கல் தொடர்ந்தால் ஆதரவைத் தொடர்பு கொள்ளவும்.',
        'server-error-title': 'சேவையக பிழை',
        'server-error-description': 'எங்கள் சேவையகங்கள் சில சிக்கல்களை எதிர்கொள்கின்றன. தயவுசெய்து சில நிமிடங்களில் மீண்டும் முயற்சிக்கவும்.',
        'client-error-title': 'கோரிக்கை பிழை',
        'client-error-description': 'உங்கள் கோரிக்கையில் சிக்கல் இருந்தது. தயவுசெய்து உங்கள் உள்ளீட்டைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
        'network-error-title': 'நெட்வொர்க் பிழை',
        'network-error-description': 'எங்கள் சேவையகங்களுடன் இணைக்க முடியவில்லை. தயவுசெய்து உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்.',
        'validation-error-title': 'சரிபார்ப்பு பிழை',
        'validation-error-description': 'வழங்கப்பட்ட தகவல் தவறானது. தயவுசெய்து பிழைகளைச் சரிசெய்து மீண்டும் முயற்சிக்கவும்.',
        'auth-error-title': 'அங்கீகார பிழை',
        'auth-error-description': 'இந்த வளத்தை அணுக நீங்கள் உள்நுழைந்திருக்க வேண்டும்.',
        'permission-error-title': 'அனுமति மறுக்கப்பட்டது',
        'permission-error-description': 'இந்த வளத்தை அணுக உங்களுக்கு அனுமति இல்லை.',
        'page-not-found-title': 'பக்கம் கிடைக்கவில்லை',
        'page-not-found-description': 'நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுள்ளது.',
        'go-home': 'முகப்புப் பக்கத்திற்கு செல்லுங்கள்',
        'go-back': 'திரும்பிச் செல்லுங்கள்',
        'try-again': 'மீண்டும் முயற்சிக்கவும்',
        'contact-support': 'ஆதரவைத் தொடர்பு கொள்ளுங்கள்',
        'refresh-page': 'பக்கத்தை புதுப்பிக்கவும்',
        'error-code': 'பிழை குறியீடு',
        'error-details': 'பிழை விவரங்கள்',
        'what-happened': 'என்ன நடந்தது?',
        'what-can-do': 'நீங்கள் என்ன செய்யலாம்?',
        'suggestions': {
          'refresh': 'பக்கத்தை புதுப்பித்து மீண்டும் முயற்சிக்கவும்',
          'check-url': 'URL சரியானதா என்று சரிபார்க்கவும்',
          'go-back': 'முந்தைய பக்கத்திற்குத் திரும்பவும்',
          'contact': 'சிக்கல் தொடர்ந்தால் எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளுங்கள்',
          'try-later': 'சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்'
        }
      }
    };
    return translations[currentLanguage][key] || key;
  };

  // Get error-specific content
  const getErrorContent = () => {
    const code = parseInt(errorCode);
    
    if (code === 404) {
      return {
        title: getText('page-not-found-title'),
        description: getText('page-not-found-description'),
        icon: 'fas fa-search',
        color: 'info'
      };
    } else if (code >= 500) {
      return {
        title: getText('server-error-title'),
        description: getText('server-error-description'),
        icon: 'fas fa-server',
        color: 'error'
      };
    } else if (code >= 400) {
      if (code === 401) {
        return {
          title: getText('auth-error-title'),
          description: getText('auth-error-description'),
          icon: 'fas fa-lock',
          color: 'warning'
        };
      } else if (code === 403) {
        return {
          title: getText('permission-error-title'),
          description: getText('permission-error-description'),
          icon: 'fas fa-ban',
          color: 'error'
        };
      } else {
        return {
          title: getText('client-error-title'),
          description: getText('client-error-description'),
          icon: 'fas fa-exclamation-circle',
          color: 'warning'
        };
      }
    } else {
      // Handle specific error types
      switch (errorType) {
        case 'network-error':
          return {
            title: getText('network-error-title'),
            description: getText('network-error-description'),
            icon: 'fas fa-wifi',
            color: 'info'
          };
        case 'validation-error':
          return {
            title: getText('validation-error-title'),
            description: getText('validation-error-description'),
            icon: 'fas fa-exclamation-triangle',
            color: 'warning'
          };
        default:
          return {
            title: getText('error-title'),
            description: message || getText('error-description'),
            icon: 'fas fa-bug',
            color: 'error'
          };
      }
    }
  };

  const errorContent = getErrorContent();

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

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>{getText('page-title')}</title>
        <meta name="description" content="Error page - Tamil Language Society" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="error-page">
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

        {/* Error Content */}
        <div className="error-container">
          <div className="error-content animate-fadeInUp">
            {/* Error Icon and Code */}
            <div className="error-icon-section">
              <div className={`error-icon ${errorContent.color}`}>
                <i className={errorContent.icon}></i>
              </div>
              {errorCode && (
                <div className="error-code">
                  {getText('error-code')}: {errorCode}
                </div>
              )}
            </div>

            {/* Error Text */}
            <div className="error-text">
              <h1>{errorContent.title}</h1>
              <p className="error-subtitle">{getText('error-subtitle')}</p>
              <p className="error-description">{errorContent.description}</p>
            </div>

            {/* Error Details */}
            {(error || err || message) && (
              <div className="error-details">
                <h3>{getText('error-details')}</h3>
                <div className="error-info">
                  <code>{error || err || message}</code>
                </div>
              </div>
            )}

            {/* What Happened Section */}
            <div className="error-explanation">
              <div className="explanation-section">
                <h3>
                  <i className="fas fa-question-circle"></i>
                  {getText('what-happened')}
                </h3>
                <p>{errorContent.description}</p>
              </div>

              <div className="explanation-section">
                <h3>
                  <i className="fas fa-lightbulb"></i>
                  {getText('what-can-do')}
                </h3>
                <ul className="suggestions-list">
                  <li>{getText('suggestions.refresh')}</li>
                  <li>{getText('suggestions.check-url')}</li>
                  <li>{getText('suggestions.go-back')}</li>
                  <li>{getText('suggestions.contact')}</li>
                  <li>{getText('suggestions.try-later')}</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={handleRefresh}
              >
                <i className="fas fa-redo"></i>
                <span>{getText('refresh-page')}</span>
              </button>
              <Link href="/" className="btn btn-secondary">
                <i className="fas fa-home"></i>
                <span>{getText('go-home')}</span>
              </Link>
              <button
                className="btn btn-outline"
                onClick={() => router.back()}
              >
                <i className="fas fa-arrow-left"></i>
                <span>{getText('go-back')}</span>
              </button>
              <Link href="/contact" className="btn btn-outline">
                <i className="fas fa-envelope"></i>
                <span>{getText('contact-support')}</span>
              </Link>
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
        .error-page {
          background: var(--bg-gradient);
          min-height: 100vh;
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

        /* Error Container */
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 120px 1rem 2rem;
        }

        .error-content {
          max-width: 900px;
          width: 100%;
          text-align: center;
          background: var(--bg-primary);
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: var(--shadow-2xl);
          border: 1px solid var(--border-color);
        }

        /* Error Icon Section */
        .error-icon-section {
          margin-bottom: 2rem;
        }

        .error-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          position: relative;
          overflow: hidden;
        }

        .error-icon.error {
          background: linear-gradient(135deg, var(--status-error), #dc2626);
        }

        .error-icon.warning {
          background: linear-gradient(135deg, var(--status-warning), #d97706);
        }

        .error-icon.info {
          background: linear-gradient(135deg, var(--status-info), #2563eb);
        }

        .error-icon::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shimmer 2s infinite;
        }

        .error-icon i {
          font-size: 3.5rem;
          color: white;
          z-index: 1;
        }

        .error-code {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-accent);
          margin: 0;
          background: var(--bg-secondary);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          display: inline-block;
        }

        /* Error Text */
        .error-text {
          margin-bottom: 2rem;
        }

        .error-text h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .error-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .error-description {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* Error Details */
        .error-details {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .error-details h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .error-info {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: var(--text-accent);
          overflow-x: auto;
        }

        /* Error Explanation */
        .error-explanation {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          text-align: left;
        }

        .explanation-section {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .explanation-section h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .explanation-section h3 i {
          color: var(--text-accent);
        }

        .explanation-section p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .suggestions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .suggestions-list li {
          color: var(--text-secondary);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
          position: relative;
          padding-left: 1.5rem;
        }

        .suggestions-list li:last-child {
          border-bottom: none;
        }

        .suggestions-list li::before {
          content: '•';
          color: var(--text-accent);
          position: absolute;
          left: 0;
          font-weight: bold;
        }

        /* Action Buttons */
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--transition);
          min-width: 160px;
          justify-content: center;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--bg-gradient-accent);
          color: var(--light-tertiary);
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover {
          box-shadow: var(--glow-primary);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--text-accent);
          color: var(--light-tertiary);
          border-color: var(--text-accent);
          transform: translateY(-2px);
          text-decoration: none;
        }

        .btn-outline {
          background: transparent;
          color: var(--text-secondary);
          border: 2px solid var(--border-color);
        }

        .btn-outline:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--text-secondary);
          transform: translateY(-2px);
          text-decoration: none;
        }

        /* Animations */
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .error-container {
            padding: 100px 1rem 1rem;
          }

          .error-content {
            padding: 2rem;
          }

          .error-icon {
            width: 100px;
            height: 100px;
          }

          .error-icon i {
            font-size: 2.5rem;
          }

          .error-text h1 {
            font-size: 2rem;
          }

          .error-subtitle {
            font-size: 1.1rem;
          }

          .error-explanation {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }

          .language-toggle {
            right: 20px;
            top: 80px;
          }
        }

        @media (max-width: 480px) {
          .error-content {
            padding: 1.5rem;
          }

          .error-text h1 {
            font-size: 1.75rem;
          }

          .explanation-section {
            padding: 1rem;
          }

          .explanation-section h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
}

// Custom error page for Next.js
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};