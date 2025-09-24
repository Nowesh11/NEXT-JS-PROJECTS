'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', category: 'main' },
  { href: '/admin/users', label: 'Users', icon: '👥', category: 'management' },
  { href: '/admin/books', label: 'Books', icon: '📚', category: 'content' },
  { href: '/admin/ebooks', label: 'E-books', icon: '📱', category: 'content' },
  { href: '/admin/projects', label: 'Projects', icon: '🚀', category: 'content' },
  { href: '/admin/posters', label: 'Posters', icon: '🖼️', category: 'content' },
  { href: '/admin/announcements', label: 'Announcements', icon: '📢', category: 'communication' },
  { href: '/admin/chat', label: 'Chat System', icon: '💬', category: 'communication' },
  { href: '/admin/slideshow', label: 'Slideshow', icon: '🎬', category: 'content' },
  { href: '/admin/file-storage', label: 'File Storage', icon: '📁', category: 'management' },
  { href: '/admin/content', label: 'Content', icon: '📝', category: 'content' },
  { href: '/admin/website-content', label: 'Website Content', icon: '🌐', category: 'content' },
  { href: '/admin/payment-settings', label: 'Payment Settings', icon: '💳', category: 'settings' },
  { href: '/admin/purchased-books', label: 'Purchased Books', icon: '🛒', category: 'management' },
  { href: '/admin/recruitment', label: 'Recruitment', icon: '👔', category: 'management' },
]

const categories = {
  main: { label: 'Dashboard', color: 'admin-primary' },
  content: { label: 'Content Management', color: 'admin-secondary' },
  management: { label: 'User Management', color: 'admin-accent' },
  communication: { label: 'Communication', color: 'admin-info' },
  settings: { label: 'Settings', color: 'admin-warning' }
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved sidebar state
    const savedState = localStorage.getItem('admin-sidebar-collapsed')
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState))
  }

  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  if (!mounted) {
    return (
      <div className="w-64 h-screen bg-white/10 backdrop-blur-md border-r border-white/20 animate-pulse" />
    )
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        ${isCollapsed ? 'w-20' : 'w-64'} 
        h-screen bg-gradient-to-b from-admin-primary/20 via-admin-secondary/10 to-admin-accent/20
        backdrop-blur-xl border-r border-white/20 shadow-2xl
        transition-all duration-300 ease-in-out
        flex flex-col relative overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-br 
        before:from-white/5 before:to-transparent before:pointer-events-none
      `}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-admin-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-admin-accent rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <motion.div 
        className="p-6 border-b border-white/10 relative z-10"
        layout
      >
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.h2
                key="full-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold bg-gradient-to-r from-admin-primary to-admin-accent bg-clip-text text-transparent"
              >
                TLS Admin Panel
              </motion.h2>
            ) : (
              <motion.div
                key="collapsed-title"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-admin-primary"
              >
                T
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="
              p-2 rounded-xl bg-white/10 hover:bg-white/20 
              border border-white/20 hover:border-white/30
              text-admin-text-primary transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-admin-primary/50
            "
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              →
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([categoryKey, items]) => {
            const category = categories[categoryKey]
            return (
              <div key={categoryKey}>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mb-3"
                    >
                      <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider px-3">
                        {category.label}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <ul className="space-y-1">
                  {items.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onMouseEnter={() => setHoveredItem(item.href)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`
                            group relative flex items-center p-3 rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-admin-primary/20 to-admin-accent/20 text-admin-primary border border-admin-primary/30 shadow-lg' 
                              : 'text-admin-text-primary hover:bg-white/10 hover:text-admin-primary border border-transparent hover:border-white/20'
                            }
                            focus:outline-none focus:ring-2 focus:ring-admin-primary/50
                          `}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-admin-primary to-admin-accent rounded-r-full"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          
                          {/* Icon */}
                          <motion.span 
                            className="text-xl flex-shrink-0"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            {item.icon}
                          </motion.span>
                          
                          {/* Label */}
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="ml-3 font-medium"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          
                          {/* Hover tooltip for collapsed state */}
                          <AnimatePresence>
                            {isCollapsed && hoveredItem === item.href && (
                              <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -10, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="
                                  absolute left-full ml-2 px-3 py-2 bg-admin-dark/90 backdrop-blur-sm
                                  text-white text-sm rounded-lg shadow-xl border border-white/20
                                  whitespace-nowrap z-50
                                "
                              >
                                {item.label}
                                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-admin-dark/90 rotate-45 border-l border-b border-white/20" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <motion.div 
        className="p-4 border-t border-white/10 relative z-10"
        layout
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="
            w-full flex items-center p-3 rounded-xl
            bg-gradient-to-r from-red-500/20 to-red-600/20
            hover:from-red-500/30 hover:to-red-600/30
            text-red-400 hover:text-red-300
            border border-red-500/30 hover:border-red-400/50
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-red-500/50
          "
        >
          <motion.span 
            className="text-xl flex-shrink-0"
            whileHover={{ scale: 1.2 }}
          >
            🚪
          </motion.span>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}