import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';

const Custom404 = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  // Bilingual content
  const getText = (key) => {
    const translations = {
      en: {
        'page-title': '404 - Page Not Found | Tamil Language Society',
        'error-code': '404',
        'error-title': 'Page Not Found',
        'error-subtitle': 'Oops! The page you are looking for does not exist.',
        'error-description': 'The page you requested could not be found. It might have been moved, deleted, or you entered the wrong URL.',
        'go-home': 'Go to Homepage',
        'go-back': 'Go Back',
        'search-placeholder': 'Search our website...',
        'search-button': 'Search',
        'helpful-links': 'Helpful Links',
        'home-link': 'Home',
        'about-link': 'About Us',
        'books-link': 'Books',
        'ebooks-link': 'E-Books',
        'projects-link': 'Projects',
        'contact-link': 'Contact Us',
        'login-link': 'Login',
        'signup-link': 'Sign Up'
      },
      ta: {
        'page-title': '404 - பக்கம் கிடைக்கவில்லை | தமிழ் மொழி சங்கம்',
        'error-code': '404',
        'error-title': 'பக்கம் கிடைக்கவில்லை',
        'error-subtitle': 'ஓஹோ! நீங்கள் தேடும் பக்கம் இல்லை.',
        'error-description': 'நீங்கள் கோரிய பக்கம் கிடைக்கவில்லை. அது நகர்த்தப்பட்டிருக்கலாம், நீக்கப்பட்டிருக்கலாம், அல்லது நீங்கள் தவறான URL ஐ உள்ளிட்டிருக்கலாம்.',
        'go-home': 'முகப்புப் பக்கத்திற்கு செல்லுங்கள்',
        'go-back': 'திரும்பிச் செல்லுங்கள்',
        'search-placeholder': 'எங்கள் வலைத்தளத்தில் தேடுங்கள்...',
        'search-button': 'தேடுங்கள்',
        'helpful-links': 'உதவிகரமான இணைப்புகள்',
        'home-link': 'முகப்பு',
        'about-link': 'எங்களைப் பற்றி',
        'books-link': 'புத்தகங்கள்',
        'ebooks-link': 'மின்னூல்கள்',
        'projects-link': 'திட்டங்கள்',
        'contact-link': 'தொடர்பு கொள்ளுங்கள்',
        'login-link': 'உள்நுழைவு',
        'signup-link': 'பதிவு செய்யுங்கள்'
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    if (searchTerm) {
      // Redirect to search page or homepage with search query
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <Head>
        <title>{getText('page-title')}</title>
        <meta name="description" content="Page not found - Tamil Language Society" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="error-code">{getText('error-code')}</div>
            </div>

            {/* Error Text */}
            <div className="error-text">
              <h1>{getText('error-title')}</h1>
              <p className="error-subtitle">{getText('error-subtitle')}</p>
              <p className="error-description">{getText('error-description')}</p>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={() => router.push('/')}
              >
                <i className="fas fa-home"></i>
                <span>{getText('go-home')}</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => router.back()}
              >
                <i className="fas fa-arrow-left"></i>
                <span>{getText('go-back')}</span>
              </button>
            </div>

            {/* Search Section */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    name="search"
                    placeholder={getText('search-placeholder')}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    <i className="fas fa-search"></i>
                    <span>{getText('search-button')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Helpful Links */}
            <div className="helpful-links">
              <h3>{getText('helpful-links')}</h3>
              <div className="links-grid">
                <button
                  className="link-item"
                  onClick={() => router.push('/')}
                >
                  <i className="fas fa-home"></i>
                  <span>{getText('home-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/about')}
                >
                  <i className="fas fa-info-circle"></i>
                  <span>{getText('about-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/books')}
                >
                  <i className="fas fa-book"></i>
                  <span>{getText('books-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/ebooks')}
                >
                  <i className="fas fa-tablet-alt"></i>
                  <span>{getText('ebooks-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/projects')}
                >
                  <i className="fas fa-project-diagram"></i>
                  <span>{getText('projects-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/contact')}
                >
                  <i className="fas fa-envelope"></i>
                  <span>{getText('contact-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/login')}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>{getText('login-link')}</span>
                </button>
                <button
                  className="link-item"
                  onClick={() => router.push('/signup')}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>{getText('signup-link')}</span>
                </button>
              </div>
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
          max-width: 800px;
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
          background: var(--bg-gradient-accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          position: relative;
          overflow: hidden;
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
          color: var(--light-tertiary);
          z-index: 1;
        }

        .error-code {
          font-size: 4rem;
          font-weight: 700;
          color: var(--text-accent);
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Error Text */
        .error-text {
          margin-bottom: 3rem;
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

        /* Action Buttons */
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
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
        }

        /* Search Section */
        .search-section {
          margin-bottom: 3rem;
        }

        .search-form {
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input-group {
          display: flex;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 2px solid var(--border-color);
        }

        .search-input {
          flex: 1;
          padding: 1rem;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-btn {
          background: var(--bg-gradient-accent);
          color: var(--light-tertiary);
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .search-btn:hover {
          background: var(--text-accent);
        }

        /* Helpful Links */
        .helpful-links {
          text-align: center;
        }

        .helpful-links h3 {
          color: var(--text-primary);
          margin-bottom: 2rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .link-item {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-primary);
          font-weight: 500;
          text-decoration: none;
        }

        .link-item:hover {
          background: var(--text-accent);
          color: var(--light-tertiary);
          border-color: var(--text-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .link-item i {
          font-size: 1.2rem;
          width: 20px;
          text-align: center;
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

          .error-code {
            font-size: 3rem;
          }

          .error-text h1 {
            font-size: 2rem;
          }

          .error-subtitle {
            font-size: 1.1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }

          .search-input-group {
            flex-direction: column;
          }

          .search-btn {
            justify-content: center;
          }

          .links-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
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

          .error-code {
            font-size: 2.5rem;
          }

          .error-text h1 {
            font-size: 1.75rem;
          }

          .helpful-links h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default Custom404;