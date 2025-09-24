/**
 * Accessible Navigation Component
 * Provides WCAG 2.1 AA compliant navigation with keyboard support
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useKeyboardNavigation, useFocusManagement, SkipLink } from '../../lib/accessibility';

const AccessibleNavigation = ({ getText, isOpen, onToggle, onClose }) => {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navRef = useRef(null);
  const { handleArrowNavigation } = useKeyboardNavigation();
  const { trapFocus, restoreFocus } = useFocusManagement();

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'dashboard',
      label: getText?.('nav.dashboard', 'Dashboard') || 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      exact: true
    },
    {
      id: 'books',
      label: getText?.('nav.books', 'Books') || 'Books',
      icon: BookOpenIcon,
      children: [
        {
          id: 'books-list',
          label: getText?.('nav.books.list', 'All Books') || 'All Books',
          href: '/admin/books'
        },
        {
          id: 'books-add',
          label: getText?.('nav.books.add', 'Add Book') || 'Add Book',
          href: '/admin/books/add'
        },
        {
          id: 'books-categories',
          label: getText?.('nav.books.categories', 'Categories') || 'Categories',
          href: '/admin/books/categories'
        }
      ]
    },
    {
      id: 'ebooks',
      label: getText?.('nav.ebooks', 'E-Books') || 'E-Books',
      icon: DocumentTextIcon,
      children: [
        {
          id: 'ebooks-list',
          label: getText?.('nav.ebooks.list', 'All E-Books') || 'All E-Books',
          href: '/admin/ebooks'
        },
        {
          id: 'ebooks-add',
          label: getText?.('nav.ebooks.add', 'Add E-Book') || 'Add E-Book',
          href: '/admin/ebooks/add'
        }
      ]
    },
    {
      id: 'users',
      label: getText?.('nav.users', 'Users') || 'Users',
      href: '/admin/users',
      icon: UsersIcon
    },
    {
      id: 'analytics',
      label: getText?.('nav.analytics', 'Analytics') || 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon
    },
    {
      id: 'settings',
      label: getText?.('nav.settings', 'Settings') || 'Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  // Flatten navigation items for keyboard navigation
  const flattenedItems = navigationItems.reduce((acc, item) => {
    acc.push(item);
    if (item.children && expandedMenus[item.id]) {
      acc.push(...item.children);
    }
    return acc;
  }, []);

  // Check if route is active
  const isActiveRoute = (href, exact = false) => {
    if (exact) {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  // Toggle submenu
  const toggleSubmenu = (itemId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const newIndex = handleArrowNavigation(
      e,
      flattenedItems,
      focusedIndex,
      (item) => {
        if (item.children) {
          toggleSubmenu(item.id);
        } else if (item.href) {
          router.push(item.href);
          onClose?.();
        }
      }
    );

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }

    // Handle escape key
    if (e.key === 'Escape') {
      onClose?.();
      restoreFocus();
    }

    // Handle expand/collapse with Enter or Space
    if ((e.key === 'Enter' || e.key === ' ') && focusedIndex >= 0) {
      const item = flattenedItems[focusedIndex];
      if (item.children) {
        e.preventDefault();
        toggleSubmenu(item.id);
      }
    }
  };

  // Focus management for mobile menu
  useEffect(() => {
    if (isOpen && navRef.current) {
      const cleanup = trapFocus(navRef.current);
      setFocusedIndex(0);
      return cleanup;
    }
  }, [isOpen, trapFocus]);

  // Reset focus when menu closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const NavItem = ({ item, index, level = 0 }) => {
    const Icon = item.icon;
    const isActive = item.href ? isActiveRoute(item.href, item.exact) : false;
    const isExpanded = expandedMenus[item.id];
    const isFocused = index === focusedIndex;
    const hasChildren = item.children && item.children.length > 0;

    const baseClasses = `
      flex items-center w-full px-4 py-3 text-left transition-all duration-200
      ${level > 0 ? 'pl-12' : ''}
      ${isActive 
        ? 'bg-cultural-100 dark:bg-cultural-900/50 text-cultural-700 dark:text-cultural-300 border-r-2 border-cultural-500' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }
      ${isFocused ? 'ring-2 ring-cultural-500/50 ring-inset' : ''}
      focus:outline-none focus:ring-2 focus:ring-cultural-500/50 focus:ring-inset
    `;

    if (hasChildren) {
      return (
        <div>
          <button
            className={baseClasses}
            onClick={() => toggleSubmenu(item.id)}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.id}`}
            aria-label={`${item.label} menu, ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            {Icon && (
              <Icon 
                className="w-5 h-5 mr-3 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            <span className="flex-1">{item.label}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id={`submenu-${item.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                role="menu"
                aria-label={`${item.label} submenu`}
              >
                {item.children.map((child, childIndex) => (
                  <NavItem
                    key={child.id}
                    item={child}
                    index={navigationItems.length + childIndex}
                    level={level + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={baseClasses}
        onClick={onClose}
        aria-current={isActive ? 'page' : undefined}
        role="menuitem"
      >
        {Icon && (
          <Icon 
            className="w-5 h-5 mr-3 flex-shrink-0" 
            aria-hidden="true"
          />
        )}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Skip Links */}
      <SkipLink href="#main-content" />
      <SkipLink href="#navigation" children="Skip to navigation" />
      
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Navigation Sidebar */}
      <motion.nav
        ref={navRef}
        id="navigation"
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
        `}
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Navigation Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {getText?.('nav.title', 'TLS Admin') || 'TLS Admin'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getText?.('nav.subtitle', 'Content Management') || 'Content Management'}
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4" role="menubar">
          {navigationItems.map((item, index) => (
            <NavItem
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2024 Tamil Literary Society
          </p>
        </div>
      </motion.nav>
    </>
  );
};

export default AccessibleNavigation;