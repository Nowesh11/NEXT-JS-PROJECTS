import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const TechHubLayout = ({ children, title = "Tamil Language Society", description = "Preserving and promoting Tamil language, literature, and culture for future generations." }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigation items
  const navItems = [
    { label: 'About', href: '/about' },
    { label: 'Books', href: '/books' },
    { label: 'E-Books', href: '/ebooks' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' }
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap px-10 py-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TLS</span>
              </div>
              <h2 className="text-xl font-bold">Tamil Language Society</h2>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a 
                  key={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'text-primary' 
                      : 'hover:text-primary'
                  }`} 
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="flex items-center justify-center rounded-lg h-10 w-10 text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <button className="flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold bg-primary text-white hover:bg-opacity-90 transition-colors">
                <span>Log In</span>
              </button>
              <button className="flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <span>Sign Up</span>
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 text-gray-800 dark:text-gray-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-700">
              <nav className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <a 
                    key={item.href}
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href) 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-20">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TLS</span>
                    </div>
                    <h3 className="text-xl font-bold">Tamil Language Society</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Preserving and promoting Tamil language, literature, and culture for future generations.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                  <div className="space-y-2">
                    {navItems.slice(0, 4).map((item) => (
                      <a 
                        key={item.href}
                        href={item.href} 
                        className="block text-gray-400 hover:text-primary transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Connect</h4>
                  <div className="space-y-2 text-gray-400">
                    <p>📧 info@tamillanguagesociety.org</p>
                    <p>📞 +1 (555) 123-TAMIL</p>
                    <p>📍 Tamil Cultural Center</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Tamil Language Society. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default TechHubLayout;