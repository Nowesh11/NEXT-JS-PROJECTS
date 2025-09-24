import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

const AdminLayout = ({ children, activeSection, setActiveSection, onLogout, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getText, toggleLanguage, language } = useLanguage();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { 
      id: 'dashboard', 
      icon: 'fas fa-tachometer-alt', 
      label: getText('dashboard', 'Dashboard', 'டாஷ்போர்டு'),
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'website-content', 
      icon: 'fas fa-globe', 
      label: getText('website_content', 'Website Content', 'வலைத்தள உள்ளடக்கம்'),
      gradient: 'from-green-500 to-teal-600'
    },
    { 
      id: 'books', 
      icon: 'fas fa-book', 
      label: getText('books_management', 'Books Management', 'புத்தக மேலாண்மை'),
      gradient: 'from-orange-500 to-red-600'
    },
    { 
      id: 'ebooks', 
      icon: 'fas fa-tablet-alt', 
      label: getText('ebooks_management', 'E-books Management', 'மின்னூல் மேலாண்மை'),
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'projects', 
      icon: 'fas fa-project-diagram', 
      label: getText('projects_activities', 'Projects & Activities', 'திட்டங்கள் & செயல்பாடுகள்'),
      gradient: 'from-indigo-500 to-blue-600'
    },
    { 
      id: 'team', 
      icon: 'fas fa-users', 
      label: getText('team_management', 'Team Management', 'குழு மேலாண்மை'),
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      id: 'recruitment', 
      icon: 'fas fa-user-plus', 
      label: getText('recruitment_management', 'Recruitment Management', 'ஆட்சேர்ப்பு மேலாண்மை'),
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'chats', 
      icon: 'fas fa-comments', 
      label: getText('chats', 'Chats', 'அரட்டைகள்'),
      gradient: 'from-pink-500 to-rose-600'
    },
    { 
      id: 'users', 
      icon: 'fas fa-users', 
      label: getText('users', 'Users', 'பயனர்கள்'),
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      id: 'announcements', 
      icon: 'fas fa-bullhorn', 
      label: getText('announcements', 'Announcements', 'அறிவிப்புகள்'),
      gradient: 'from-yellow-500 to-orange-600'
    },
    { 
      id: 'purchased-books', 
      icon: 'fas fa-shopping-cart', 
      label: getText('purchased_books', 'Purchased Books', 'வாங்கிய புத்தகங்கள்'),
      gradient: 'from-teal-500 to-cyan-600'
    },
    { 
      id: 'payment-settings', 
      icon: 'fas fa-credit-card', 
      label: getText('payment_settings', 'Payment Settings', 'கட்டண அமைப்புகள்'),
      gradient: 'from-rose-500 to-pink-600'
    },
    { 
      id: 'posters', 
      icon: 'fas fa-image', 
      label: getText('posters', 'Posters', 'சுவரொட்டிகள்'),
      gradient: 'from-amber-500 to-yellow-600'
    },
    { 
      id: 'slideshow', 
      icon: 'fas fa-play-circle', 
      label: getText('slideshow', 'Slideshow', 'ஸ்லைடுஷோ'),
      gradient: 'from-lime-500 to-green-600'
    },
    { 
      id: 'file-storage', 
      icon: 'fas fa-hdd', 
      label: getText('file_storage', 'File Storage', 'கோப்பு சேமிப்பு'),
      gradient: 'from-slate-500 to-gray-600'
    }
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="admin-container">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div 
          className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
          variants={sidebarVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
        >
          <div className="sidebar-content">
            <div className="sidebar-header">
              <motion.div 
                className="admin-logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="logo-icon">
                  <i className="fas fa-crown"></i>
                </div>
                <div className="logo-text">
                  <h2>TLS Admin</h2>
                  <span>Management Portal</span>
                </div>
              </motion.div>
              <button 
                className="sidebar-toggle md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <nav className="sidebar-nav">
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <div className={`nav-icon bg-gradient-to-r ${item.gradient}`}>
                    <i className={item.icon}></i>
                  </div>
                  <span className="nav-label">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.button>
              ))}
              
              <motion.button 
                className="nav-item logout-btn"
                onClick={onLogout}
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navigationItems.length * 0.1 + 0.2 }}
              >
                <div className="nav-icon bg-gradient-to-r from-red-500 to-pink-600">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <span className="nav-label">{getText('logout', 'Logout', 'வெளியேறு')}</span>
              </motion.button>
            </nav>
            
            {/* Language Toggle */}
            <motion.div 
              className="language-toggle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button onClick={toggleLanguage} className="lang-btn">
                <div className="lang-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="admin-main">
          {/* Mobile Header */}
          <motion.div 
            className={`mobile-header md:hidden ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1>{title || getText('admin_dashboard', 'Admin Dashboard', 'நிர்வாக டாஷ்போர்டு')}</h1>
          </motion.div>
          
          {/* Content */}
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        .admin-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 320px;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar.open {
          transform: translateX(0);
        }

        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0);
            position: relative;
            height: 100vh;
            flex-shrink: 0;
          }
        }

        .sidebar-content {
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .logo-text h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo-text span {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          display: block;
          margin-top: 2px;
        }

        .sidebar-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.75rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .nav-item {
          width: 100%;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: 16px;
          margin-bottom: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }

        .nav-item:hover::before {
          opacity: 1;
        }

        .nav-item:hover {
          color: white;
          transform: translateX(8px);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .nav-item.active::before {
          opacity: 1;
        }

        .nav-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
          font-weight: 500;
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: white;
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
        }

        .logout-btn {
          margin-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .language-toggle {
          padding: 1.5rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lang-btn {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .lang-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 768px) {
          .admin-main {
            margin-left: 0;
          }
        }

        .mobile-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }

        .mobile-header.scrolled {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .mobile-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .mobile-header .sidebar-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.75rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .admin-content {
          flex: 1;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 24px 0 0 0;
          margin-top: 1rem;
          position: relative;
          z-index: 1;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        @media (max-width: 767px) {
          .admin-content {
            padding: 1rem;
            margin-top: 0;
            border-radius: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .admin-sidebar {
            width: 280px;
          }
          
          .sidebar-header {
            padding: 1.5rem 1rem;
          }
          
          .admin-content {
            padding: 1rem;
          }
        }

        /* Performance Optimizations */
        .nav-item,
        .sidebar-toggle,
        .lang-btn {
          will-change: transform;
          transform: translateZ(0);
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .nav-item,
          .sidebar-toggle,
          .lang-btn,
          .mobile-header {
            transition: none;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .sidebar-content {
            background: rgba(0, 0, 0, 0.9);
            border-right: 2px solid #fff;
          }
          
          .nav-item {
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
          .nav-item.active {
            background: #fff;
            color: #000;
          }
        }
      `}</style>
    </>
  );
};

export default AdminLayout;