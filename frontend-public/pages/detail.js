import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Detail from '../components/Detail';
import RecruitmentSection from '../components/RecruitmentSection';

export default function Detail() {
  const router = useRouter();
  const { id, type } = router.query;
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Recruitment form state removed - now handled by RecruitmentSection component
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Initialize theme and language
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id, type]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const loadItemData = async () => {
    if (!id) {
      setError('No item ID provided');
      setLoading(false);
      return;
    }

    try {
      const endpoint = `/api/unified/${id}`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch item data');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setItemData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch item data');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching unified item data:', error);
      setError('Failed to load item data');
      setLoading(false);
    }
  };

  // Recruitment form handlers removed - now handled by RecruitmentSection component

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(itemData?.title || 'Check out this project');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('success', 'Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading project details...</span>
        </div>
      </div>
    );
  }

  if (error || !itemData) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Project Not Found</h2>
          <p>{error || 'The requested project could not be found.'}</p>
          <Link href="/projects" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const images = itemData.images || [];
  const relatedProjects = itemData.relatedProjects || [];
  const volunteerOpportunities = [
    {
      id: 'developer',
      title: 'Software Developer',
      description: 'Help build and maintain our digital platforms using modern web technologies and frameworks.',
      icon: 'fas fa-code',
      time: '10-15 hours/week',
      level: 'Intermediate'
    },
    {
      id: 'designer',
      title: 'UI/UX Designer',
      description: 'Create beautiful and user-friendly interfaces for our applications and digital resources.',
      icon: 'fas fa-paint-brush',
      time: '8-12 hours/week',
      level: 'Intermediate'
    },
    {
      id: 'translator',
      title: 'Content Translator',
      description: 'Help translate content between Tamil and English to reach wider audiences and communities.',
      icon: 'fas fa-language',
      time: '5-10 hours/week',
      level: 'Beginner'
    },
    {
      id: 'marketing',
      title: 'Marketing Specialist',
      description: 'Promote our projects and engage with the community through various digital channels and platforms.',
      icon: 'fas fa-bullhorn',
      time: '6-10 hours/week',
      level: 'Intermediate'
    }
  ];

  return (
    <>
      <Head>
        <title>{`${itemData?.title || 'Detail'} - Tamil Language Society`}</title>
        <meta name="description" content={itemData?.description || 'Tamil Language Society'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        
      </Head>

      <div className="detail-page">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
        </button>

        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="nav-logo">
              <img src="/assets/logo.png" alt="Tamil Language Society" className="logo-img" />
              <span className="logo-text">Tamil Language Society</span>
            </Link>
            
            <div className="nav-menu">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/about" className="nav-link">About Us</Link>
              <Link href="/projects" className="nav-link">Projects</Link>
              <Link href="/ebooks" className="nav-link">Ebooks</Link>
              <Link href="/books" className="nav-link">Book Store</Link>
              <Link href="/contact" className="nav-link">Contact Us</Link>
              <Link href="/notifications" className="nav-link notification-icon">
                <i className="fas fa-bell"></i>
              </Link>
              <Link href="/login" className="nav-link btn-glass">Login</Link>
              <Link href="/signup" className="nav-link signup-btn btn-neon">Sign Up</Link>
            </div>
          </div>
        </nav>

        {/* Detail Hero Section */}
        <section className="detail-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/projects" className="back-link">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Projects</span>
              </Link>
            </div>
            
            <div className="hero-badges">
              <div className={`status-badge ${itemData.status}`}>
                {itemData.status || 'Active'}
              </div>
              <div className="category-badge">
                <i className="fas fa-tag"></i>
                <span>{itemData.category || 'Project'}</span>
              </div>
            </div>
            
            <h1 className="hero-title">{itemData.title}</h1>
            {itemData.titleTamil && (
              <h2 className="hero-title-tamil">{itemData.titleTamil}</h2>
            )}
            <p className="hero-description">{itemData.description}</p>
          </div>
        </section>

        {/* Main Content */}
        <Detail 
          itemData={itemData}
          theme={theme}
          language={language}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          shareOnFacebook={shareOnFacebook}
          shareOnTwitter={shareOnTwitter}
          shareOnLinkedIn={shareOnLinkedIn}
          copyToClipboard={copyToClipboard}
        />

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <section className="related-projects-section">
            <div className="container">
              <div className="section-header">
                <h2>Related Projects</h2>
                <p>Explore other initiatives in Tamil cultural preservation</p>
              </div>
              <div className="related-projects-grid">
                {relatedProjects.map((project, index) => (
                  <div key={index} className="related-project-card">
                    <div className="project-image">
                      {project.image ? (
                        <img src={project.image} alt={project.title} />
                      ) : (
                        <i className="fas fa-project-diagram"></i>
                      )}
                    </div>
                    <div className="project-info">
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <Link href={`/detail?id=${project.id}`} className="view-project-btn">
                        <span>View Project</span>
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Volunteer Opportunities Section */}
        <RecruitmentSection 
           entityId={id}
           entityType={itemData?.type || 'project'}
           language={language}
         />



        {/* Notification */}
        {notification.show && (
          <div className={`notification show notification-${notification.type}`}>
            <div className="notification-content">
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Theme Variables */
        :root {
          /* Light Theme (Default) */
          --bg-primary: #FFFEFF;
          --bg-secondary: #F2F2F2;
          --bg-gradient: linear-gradient(135deg, #F2F2F2 0%, #FFFEFF 100%);
          --bg-gradient-accent: linear-gradient(135deg, #2F3E75 0%, #A83232 100%);
          --bg-hero: linear-gradient(135deg, #2F3E75 0%, #A83232 100%);
          
          --text-primary: #0D0D0D;
          --text-secondary: #2F3E75;
          --text-muted: #CFD0D0;
          --text-accent: #A83232;
          --text-inverse: #FFFEFF;
          --text-light: #FFFEFF;
          
          --border-color: rgba(47, 62, 117, 0.2);
          --shadow-sm: 0 2px 4px rgba(47, 62, 117, 0.1);
          --shadow-md: 0 4px 12px rgba(47, 62, 117, 0.15);
          --shadow-lg: 0 8px 24px rgba(47, 62, 117, 0.2);
          --shadow-xl: 0 12px 32px rgba(47, 62, 117, 0.25);
          
          --glass-bg: rgba(255, 254, 255, 0.8);
          --glass-border: rgba(47, 62, 117, 0.2);
          --card-bg: var(--bg-primary);
          --input-bg: var(--bg-primary);
          
          --transition: all 0.3s ease-in-out;
          --transition-fast: all 0.2s ease;
          --transition-normal: all 0.3s ease;
          
          --primary-color: #2F3E75;
          --primary-blue: #2F3E75;
          --primary-blue-dark: #1e2a4a;
          --success-color: #22c55e;
          --error-color: #ef4444;
          --danger-color: #ef4444;
          
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-900: #111827;
          
          --radius-sm: 0.25rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
        }
        
        [data-theme="dark"] {
          /* Dark Theme */
          --bg-primary: #182657;
          --bg-secondary: #0D0D0D;
          --bg-gradient: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
          --bg-gradient-accent: linear-gradient(135deg, #7A1515 0%, #EDEFEE 100%);
          --bg-hero: linear-gradient(135deg, #0D0D0D 0%, #182657 100%);
          
          --text-primary: #EDEFEE;
          --text-secondary: #AEAEAE;
          --text-muted: #7A1515;
          --text-accent: #7A1515;
          --text-inverse: #0D0D0D;
          --text-light: #EDEFEE;
          
          --border-color: rgba(174, 174, 174, 0.3);
          --shadow-sm: 0 2px 4px rgba(174, 174, 174, 0.1);
          --shadow-md: 0 4px 12px rgba(174, 174, 174, 0.2);
          --shadow-lg: 0 8px 24px rgba(174, 174, 174, 0.3);
          --shadow-xl: 0 12px 32px rgba(174, 174, 174, 0.4);
          
          --glass-bg: rgba(24, 38, 87, 0.8);
          --glass-border: rgba(174, 174, 174, 0.3);
          --card-bg: var(--bg-primary);
          --input-bg: var(--bg-secondary);
          
          --primary-color: #AEAEAE;
          --primary-blue: #AEAEAE;
          --primary-blue-dark: #8a8a8a;
          
          --gray-100: rgba(174, 174, 174, 0.1);
          --gray-200: rgba(174, 174, 174, 0.2);
          --gray-300: rgba(174, 174, 174, 0.3);
        }

        .detail-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: var(--text-primary);
          background: var(--bg-gradient);
          min-height: 100vh;
          margin: 0;
          padding: 0;
          transition: var(--transition);
        }

        /* Theme Toggle Button */
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--glass-bg);
          border: 2px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: var(--transition);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: var(--shadow-md);
        }

        .theme-toggle:hover {
          transform: scale(1.05);
        }

        /* Navigation */
        .navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
        }

        .logo-img {
          width: 40px;
          height: 40px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: var(--transition-fast);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--gray-100);
        }

        .btn-glass {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
        }

        .btn-neon {
          background: var(--bg-gradient-accent);
          color: var(--text-inverse);
        }

        .notification-icon {
          position: relative;
        }

        /* Detail Hero Section */
        .detail-hero {
          background: var(--bg-hero);
          color: var(--text-inverse);
          padding: 4rem 0 2rem;
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .breadcrumb {
          margin-bottom: 2rem;
        }

        .back-link {
          color: var(--text-light);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--transition-fast);
        }

        .back-link:hover {
          opacity: 0.8;
        }

        .hero-badges {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: var(--success-color);
          color: white;
        }

        .status-badge.inactive {
          background: var(--gray-300);
          color: var(--text-primary);
        }

        .category-badge {
          background: var(--glass-bg);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .hero-title-tamil {
          font-family: 'Noto Sans Tamil', sans-serif;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.25rem;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 800px;
        }

        /* Main Content */
        .main-content {
          padding: 3rem 0;
        }

        /* Image Gallery */
        .detail-image-gallery {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .main-image {
          border-radius: var(--radius-lg);
          overflow: hidden;
          aspect-ratio: 16/10;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-images {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .thumbnail {
          border-radius: var(--radius-md);
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
          transition: var(--transition-fast);
          border: 2px solid transparent;
        }

        .thumbnail:hover,
        .thumbnail.active {
          border-color: var(--text-accent);
          transform: scale(1.05);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Content Grid */
        .detail-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .content-section {
          margin-bottom: 3rem;
        }

        .content-section h3 {
          color: var(--primary-blue);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .content-section p,
        .content-section ul {
          color: var(--text-secondary);
          line-height: 1.8;
        }

        .content-section ul {
          padding-left: 1.5rem;
        }

        .content-section li {
          margin-bottom: 0.5rem;
        }

        /* Sidebar */
        .sidebar-section {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .sidebar-section h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .info-item {
          margin-bottom: 1rem;
        }

        .info-item strong {
          color: var(--text-primary);
          display: block;
          margin-bottom: 0.25rem;
        }

        .info-item span {
          color: var(--text-secondary);
        }

        .director-info {
          color: var(--text-secondary);
        }

        .director-contact {
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        /* Progress Bar */
        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--gray-200);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--bg-gradient-accent);
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Share Buttons */
        .share-buttons {
          display: grid;
          gap: 0.75rem;
        }

        .share-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          text-decoration: none;
          color: white;
        }

        .share-btn.facebook {
          background: #1877f2;
        }

        .share-btn.twitter {
          background: #1da1f2;
        }

        .share-btn.linkedin {
          background: #0077b5;
        }

        .share-btn.copy {
          background: var(--gray-300);
          color: var(--text-primary);
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* Related Projects Section */
        .related-projects-section {
          padding: 4rem 0;
          background: var(--bg-secondary);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          color: var(--text-primary);
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .section-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .related-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .related-project-card {
          background: var(--bg-primary);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          transition: var(--transition-normal);
        }

        .related-project-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }

        .project-image {
          height: 200px;
          background: var(--bg-gradient-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          font-size: 3rem;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-info {
          padding: 1.5rem;
        }

        .project-info h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .project-info p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .view-project-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-accent);
          text-decoration: none;
          font-weight: 600;
          transition: var(--transition-fast);
        }

        .view-project-btn:hover {
          color: var(--text-primary);
        }

        /* Volunteer Opportunities Section */
        .volunteer-opportunities-section {
          padding: 4rem 0;
        }

        .opportunities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .opportunity-card {
          background: var(--bg-primary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          transition: var(--transition-normal);
        }

        .opportunity-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }

        .opportunity-icon {
          width: 80px;
          height: 80px;
          background: var(--bg-gradient-accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--text-inverse);
          font-size: 2rem;
        }

        .opportunity-card h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .opportunity-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .opportunity-details {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .time-commitment,
        .skill-level {
          background: var(--bg-secondary);
          color: var(--text-accent);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .apply-btn {
          background: var(--bg-gradient-accent);
          color: var(--text-inverse);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          width: 100%;
        }

        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* Recruitment Modal */
        .recruitment-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recruitment-modal.show {
          opacity: 1;
          visibility: visible;
        }

        .recruitment-modal-content {
          background: var(--card-bg);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .recruitment-modal.show .recruitment-modal-content {
          transform: scale(1);
        }

        .recruitment-modal-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recruitment-modal-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
        }

        .close-btn:hover {
          background: var(--gray-100);
          color: var(--text-primary);
        }

        .recruitment-modal-body {
          padding: 1.5rem;
        }

        .recruitment-modal-footer {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .required {
          color: var(--danger-color);
          margin-left: 0.25rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: var(--transition-fast);
          background: var(--input-bg);
          color: var(--text-primary);
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(47, 62, 117, 0.1);
        }

        [data-theme="dark"] .form-control:focus {
          box-shadow: 0 0 0 3px rgba(174, 174, 174, 0.2);
        }

        /* Button Styles */
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--bg-gradient-accent);
          color: var(--text-inverse);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        /* Notification */
        .notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 1rem 1.5rem;
          z-index: 10001;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s ease;
          max-width: 400px;
        }

        .notification.show {
          transform: translateX(0);
          opacity: 1;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .notification-success {
          border-left: 4px solid var(--success-color);
        }

        .notification-success .notification-content i {
          color: var(--success-color);
        }

        .notification-error {
          border-left: 4px solid var(--error-color);
        }

        .notification-error .notification-content i {
          color: var(--error-color);
        }

        /* Loading and Error States */
        .loading-container,
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-gradient);
        }

        .loading,
        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          text-align: center;
        }

        .loading i {
          font-size: 2rem;
          color: var(--text-accent);
        }

        .error-content i {
          font-size: 3rem;
          color: var(--error-color);
        }

        .error-content h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .error-content p {
          margin: 0;
          color: var(--text-secondary);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .nav-menu {
            display: none;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-title-tamil {
            font-size: 1.5rem;
          }

          .detail-image-gallery {
            grid-template-columns: 1fr;
          }

          .thumbnail-images {
            grid-template-columns: repeat(3, 1fr);
          }

          .detail-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .related-projects-grid,
          .opportunities-grid {
            grid-template-columns: 1fr;
          }

          .recruitment-modal-content {
            width: 95%;
            max-height: 95vh;
          }

          .recruitment-modal-header,
          .recruitment-modal-body {
            padding: 1rem;
          }

          .recruitment-modal-footer {
            flex-direction: column;
          }

          .notification {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }

          .theme-toggle {
            top: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .sidebar-section {
            padding: 1rem;
          }

          .opportunity-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
