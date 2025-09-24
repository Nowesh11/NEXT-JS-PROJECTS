import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';

export default function DetailPage() {
  const router = useRouter();
  const { type, id } = router.query;
  
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize theme and language from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (type && id) {
      fetchItemDetails();
    }
  }, [type, id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use unified API endpoint
      const endpoint = `/api/unified/${id}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} details`);
      }
      
      const data = await response.json();
      setItem(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const getText = (key) => {
    const texts = {
      'detail.section.goals': {
        en: 'Project Goals',
        ta: 'திட்ட இலக்குகள்'
      },
      'detail.section.description': {
        en: 'Detailed Description',
        ta: 'விரிவான விளக்கம்'
      },
      'detail.section.achievements': {
        en: 'Achievements & Milestones',
        ta: 'சாதனைகள் & மைல்கற்கள்'
      },
      'detail.sidebar.info': {
        en: 'Information',
        ta: 'தகவல்'
      },
      'detail.sidebar.progress': {
        en: 'Progress',
        ta: 'முன்னேற்றம்'
      },
      'detail.sidebar.share': {
        en: 'Share This',
        ta: 'இதைப் பகிரவும்'
      },
      'detail.share.facebook': {
        en: 'Facebook',
        ta: 'பேஸ்புக்'
      },
      'detail.share.twitter': {
        en: 'Twitter',
        ta: 'ட்விட்டர்'
      },
      'detail.share.linkedin': {
        en: 'LinkedIn',
        ta: 'லிங்க்ட்இன்'
      },
      'back.to.list': {
        en: 'Back to List',
        ta: 'பட்டியலுக்குத் திரும்பு'
      }
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const getTypeDisplayName = () => {
    const typeNames = {
      projects: { en: 'Project', ta: 'திட்டம்' },
      activities: { en: 'Activity', ta: 'செயல்பாடு' },
      initiatives: { en: 'Initiative', ta: 'முன்முயற்சி' }
    };
    return typeNames[type]?.[language] || typeNames[type]?.en || type;
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${getTypeDisplayName()}: ${item?.title || ''}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - Tamil Language Society</title>
        </Head>
        <Navigation theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Tamil Language Society</title>
        </Head>
        <Navigation theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
        <div className="error-container">
          <h1>Error</h1>
          <p>{error}</p>
          <Link href={`/${type}`} className="btn btn-primary">
            {getText('back.to.list')}
          </Link>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Head>
          <title>Not Found - Tamil Language Society</title>
        </Head>
        <Navigation theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
        <div className="error-container">
          <h1>Not Found</h1>
          <p>{getTypeDisplayName()} not found.</p>
          <Link href={`/${type}`} className="btn btn-primary">
            {getText('back.to.list')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${item?.title || 'Detail'} - Tamil Language Society`}</title>
        <meta name="description" content={item?.description || item?.shortDescription || 'Tamil Language Society'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <Navigation theme={theme} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />

      <div className="detail-page">
        {/* Hero Section */}
        <div className="detail-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span> / </span>
              <Link href={`/${type}`}>{getTypeDisplayName()}s</Link>
              <span> / </span>
              <span>{item.title}</span>
            </div>
            <h1>{item.title}</h1>
            <p className="hero-description">{item.shortDescription || item.description}</p>
          </div>
        </div>

        {/* Main Content */}
        <section className="detail-content-section">
          <div className="container">
            {/* Image Gallery */}
            {item.images && item.images.length > 0 && (
              <div className="detail-image-gallery">
                <div className="main-image">
                  <img src={item.images[0]} alt={item.title} />
                </div>
                {item.images.length > 1 && (
                  <div className="thumbnail-images">
                    {item.images.slice(1, 5).map((image, index) => (
                      <img key={index} src={image} alt={`${item.title} ${index + 2}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Content Grid */}
            <div className="detail-content">
              {/* Main Content */}
              <div className="main-content">
                {/* Goals Section */}
                {item.goals && (
                  <div className="content-section">
                    <h3>
                      <i className="fas fa-bullseye"></i>
                      <span>{getText('detail.section.goals')}</span>
                    </h3>
                    <div className="goals-content">
                      {Array.isArray(item.goals) ? (
                        <ul>
                          {item.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{item.goals}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Detailed Description */}
                <div className="content-section">
                  <h3>
                    <i className="fas fa-info-circle"></i>
                    <span>{getText('detail.section.description')}</span>
                  </h3>
                  <div className="detailed-description">
                    <p>{item.description || item.longDescription}</p>
                  </div>
                </div>
                
                {/* Achievements Section */}
                {item.achievements && (
                  <div className="content-section">
                    <h3>
                      <i className="fas fa-trophy"></i>
                      <span>{getText('detail.section.achievements')}</span>
                    </h3>
                    <div className="achievements-content">
                      {Array.isArray(item.achievements) ? (
                        <ul>
                          {item.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{item.achievements}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="sidebar">
                {/* Item Info */}
                <div className="sidebar-section">
                  <h4>{getText('detail.sidebar.info')}</h4>
                  <div className="item-info">
                    {item.bureau && (
                      <div className="info-item">
                        <strong>Bureau:</strong>
                        <span>{item.bureau}</span>
                      </div>
                    )}
                    {item.director && (
                      <div className="info-item">
                        <strong>Director:</strong>
                        <div className="director-info">
                          <div>{item.director.name || item.director}</div>
                          {item.director.email && <div>{item.director.email}</div>}
                          {item.director.phone && <div>{item.director.phone}</div>}
                        </div>
                      </div>
                    )}
                    {item.status && (
                      <div className="info-item">
                        <strong>Status:</strong>
                        <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                      </div>
                    )}
                    {item.startDate && (
                      <div className="info-item">
                        <strong>Start Date:</strong>
                        <span>{new Date(item.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {item.endDate && (
                      <div className="info-item">
                        <strong>End Date:</strong>
                        <span>{new Date(item.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress */}
                {item.progress !== undefined && (
                  <div className="sidebar-section">
                    <h4>{getText('detail.sidebar.progress')}</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <p className="progress-text">{item.progress}%</p>
                  </div>
                )}
                
                {/* Share Section */}
                <div className="sidebar-section">
                  <h4>{getText('detail.sidebar.share')}</h4>
                  <div className="share-buttons">
                    <button className="share-btn facebook" onClick={shareOnFacebook}>
                      <i className="fab fa-facebook-f"></i>
                      <span>{getText('detail.share.facebook')}</span>
                    </button>
                    <button className="share-btn twitter" onClick={shareOnTwitter}>
                      <i className="fab fa-twitter"></i>
                      <span>{getText('detail.share.twitter')}</span>
                    </button>
                    <button className="share-btn linkedin" onClick={shareOnLinkedIn}>
                      <i className="fab fa-linkedin-in"></i>
                      <span>{getText('detail.share.linkedin')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .detail-page {
          min-height: 100vh;
        }

        .detail-hero {
          background: var(--bg-gradient-accent);
          color: var(--text-inverse);
          padding: 6rem 0 4rem;
          position: relative;
          overflow: hidden;
        }

        .detail-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-light);
          z-index: 1;
        }

        .detail-hero .container {
          position: relative;
          z-index: 2;
        }

        .breadcrumb {
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .breadcrumb a {
          color: var(--text-inverse);
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .detail-hero h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .hero-description {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 800px;
        }

        .detail-content-section {
          padding: 4rem 0;
        }

        .detail-image-gallery {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .main-image img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: var(--radius-lg);
        }

        .thumbnail-images {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .thumbnail-images img {
          width: 100%;
          height: 95px;
          object-fit: cover;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .thumbnail-images img:hover {
          transform: scale(1.05);
        }

        .detail-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .content-section {
          margin-bottom: 3rem;
        }

        .content-section h3 {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
        }

        .content-section h3 i {
          color: var(--text-accent);
        }

        .goals-content ul,
        .achievements-content ul {
          list-style: none;
          padding: 0;
        }

        .goals-content li,
        .achievements-content li {
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-primary);
          position: relative;
          padding-left: 1.5rem;
        }

        .goals-content li::before,
        .achievements-content li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--text-accent);
          font-weight: bold;
        }

        .sidebar-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .sidebar-section h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.2rem;
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

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status.active {
          background: var(--status-success);
          color: white;
        }

        .status.completed {
          background: var(--status-info);
          color: white;
        }

        .status.pending {
          background: var(--status-warning);
          color: white;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--bg-gradient-accent);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .share-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-normal);
          font-weight: 500;
        }

        .share-btn.facebook {
          background: #1877f2;
          color: white;
        }

        .share-btn.twitter {
          background: #1da1f2;
          color: white;
        }

        .share-btn.linkedin {
          background: #0077b5;
          color: white;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-primary);
          border-top: 4px solid var(--text-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-primary {
          background: var(--bg-gradient-accent);
          color: var(--text-inverse);
          padding: 0.75rem 2rem;
          border: none;
          border-radius: var(--radius-lg);
          text-decoration: none;
          display: inline-block;
          transition: var(--transition-normal);
          font-weight: 500;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          text-decoration: none;
          color: var(--text-inverse);
        }

        @media (max-width: 768px) {
          .detail-image-gallery,
          .detail-content {
            grid-template-columns: 1fr;
          }

          .detail-hero h1 {
            font-size: 2rem;
          }

          .thumbnail-images {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  );
}

// This function gets called at build time
export async function getStaticPaths() {
  // Return empty paths for now - pages will be generated on-demand
  return {
    paths: [],
    fallback: 'blocking' // Enable ISR (Incremental Static Regeneration)
  };
}

// This function gets called at build time on server-side
export async function getStaticProps({ params }) {
  const { type, id } = params;
  
  try {
    // For now, just return the params - the component will handle data fetching
    return {
      props: {
        type,
        id
      },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
}