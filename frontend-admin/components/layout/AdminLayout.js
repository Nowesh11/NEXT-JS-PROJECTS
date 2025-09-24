'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UserGroupIcon,
  MegaphoneIcon,
  PhotoIcon,
  UsersIcon,
  BriefcaseIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children, getText, language, theme, toggleTheme, toggleLanguage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const router = useRouter();

  const navigationItems = [
    {
      id: 'dashboard',
      name: getText('admin.nav.dashboard', 'Dashboard'),
      href: '/admin',
      icon: HomeIcon,
      current: router.pathname === '/admin',
      gradient: 'gradient-primary'
    },
    {
      id: 'books',
      name: getText('admin.nav.books', 'Books'),
      href: '/admin/books',
      icon: BookOpenIcon,
      current: router.pathname.startsWith('/admin/books'),
      gradient: 'gradient-cultural'
    },
    {
      id: 'ebooks',
      name: getText('admin.nav.ebooks', 'E-Books'),
      href: '/admin/ebooks',
      icon: DocumentTextIcon,
      current: router.pathname.startsWith('/admin/ebooks'),
      gradient: 'gradient-digital'
    },
    {
      id: 'projects',
      name: getText('admin.nav.projects', 'Projects'),
      href: '/admin/projects',
      icon: BriefcaseIcon,
      current: router.pathname.startsWith('/admin/projects'),
      gradient: 'gradient-tamil'
    },
    {
      id: 'team',
      name: getText('admin.nav.team', 'Team'),
      href: '/admin/team',
      icon: UserGroupIcon,
      current: router.pathname.startsWith('/admin/team'),
      gradient: 'gradient-emerald'
    },
    {
      id: 'announcements',
      name: getText('admin.nav.announcements', 'Announcements'),
      href: '/admin/announcements',
      icon: MegaphoneIcon,
      current: router.pathname.startsWith('/admin/announcements'),
      gradient: 'gradient-cultural'
    },
    {
      id: 'posters',
      name: getText('admin.nav.posters', 'Posters'),
      href: '/admin/posters',
      icon: PhotoIcon,
      current: router.pathname.startsWith('/admin/posters'),
      gradient: 'gradient-digital'
    },
    {
      id: 'users',
      name: getText('admin.nav.users', 'Users'),
      href: '/admin/users',
      icon: UsersIcon,
      current: router.pathname.startsWith('/admin/users'),
      gradient: 'gradient-primary'
    },
    {
      id: 'recruitment',
      name: getText('admin.nav.recruitment', 'Recruitment'),
      href: '/admin/recruitment',
      icon: BriefcaseIcon,
      current: router.pathname.startsWith('/admin/recruitment'),
      gradient: 'gradient-tamil'
    },
    {
      id: 'analytics',
      name: getText('admin.nav.analytics', 'Analytics'),
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: router.pathname.startsWith('/admin/analytics'),
      gradient: 'gradient-emerald'
    },
    {
      id: 'payments',
      name: getText('admin.nav.payments', 'Payments'),
      href: '/admin/payments',
      icon: CreditCardIcon,
      current: router.pathname.startsWith('/admin/payments'),
      gradient: 'gradient-cultural'
    },
    {
      id: 'chat',
      name: getText('admin.nav.chat', 'Chat'),
      href: '/admin/chat',
      icon: ChatBubbleLeftRightIcon,
      current: router.pathname.startsWith('/admin/chat'),
      gradient: 'gradient-digital'
    },
    {
      id: 'settings',
      name: getText('admin.nav.settings', 'Settings'),
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      current: router.pathname.startsWith('/admin/settings'),
      gradient: 'gradient-primary'
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

  const overlayVariants = {
    open: {
      opacity: 1,
      visibility: "visible"
    },
    closed: {
      opacity: 0,
      visibility: "hidden"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 z-50 w-72 lg:static lg:inset-0 lg:z-0"
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
      >
        <div className="flex h-full flex-col glass-morphism border-r border-gray-200/20 dark:border-gray-700/20">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/20 dark:border-gray-700/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cultural-500 to-digital-500 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  TLS Admin
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText('admin.subtitle', 'Management Portal')}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl glass-button text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    className={`group flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 cursor-pointer ${
                      item.current
                        ? 'glass-morphism text-cultural-600 dark:text-cultural-400 shadow-cultural'
                        : 'text-gray-600 dark:text-gray-300 hover:glass-morphism hover:text-gray-800 dark:hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background gradient for active item */}
                    {item.current && (
                      <div className={`absolute inset-0 ${item.gradient} opacity-5 rounded-2xl`} />
                    )}
                    
                    <div className={`relative z-10 p-2 rounded-xl transition-colors ${
                      item.current 
                        ? 'bg-cultural-100 dark:bg-cultural-900/50' 
                        : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <span className="relative z-10 flex-1">{item.name}</span>
                    
                    {item.current && (
                      <motion.div
                        className="w-2 h-2 bg-cultural-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="glass-morphism rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cultural-500 rounded-full flex items-center justify-center">
                  <PresentationChartLineIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {getText('admin.stats.title', 'Quick Stats')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('admin.stats.subtitle', 'Today\'s overview')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="font-bold text-cultural-600 dark:text-cultural-400">24</p>
                  <p className="text-gray-600 dark:text-gray-400">{getText('admin.stats.users', 'Users')}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="font-bold text-digital-600 dark:text-digital-400">12</p>
                  <p className="text-gray-600 dark:text-gray-400">{getText('admin.stats.projects', 'Projects')}</p>
                </div>
              </div>
            </div>
            
            <motion.button
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {getText('admin.logout', 'Logout')}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="glass-morphism border-b border-gray-200/20 dark:border-gray-700/20 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass-button text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {getText('admin.welcome', 'Welcome back!')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText('admin.welcome.subtitle', 'Manage your Tamil Language Sangam')}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={getText('admin.search.placeholder', 'Search...')}
                  className="pl-10 pr-4 py-2 w-64 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                />
              </div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-xl glass-button text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Language Toggle */}
              <motion.button
                onClick={toggleLanguage}
                className="p-2 rounded-xl glass-button text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LanguageIcon className="w-5 h-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                className="relative p-2 rounded-xl glass-button text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {notifications}
                  </motion.div>
                )}
              </motion.button>

              {/* Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cultural-500 to-digital-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {getText('admin.profile.name', 'Admin User')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('admin.profile.role', 'Administrator')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;