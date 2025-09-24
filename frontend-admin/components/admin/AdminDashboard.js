'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Mock chart component (you can replace with recharts or chart.js)
const SimpleChart = ({ data, type = 'line', color = '#3B82F6' }) => {
  const maxValue = Math.max(...data)
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (value / maxValue) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative h-24 w-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {type === 'area' && (
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${color})`}
          />
        )}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (value / maxValue) * 80
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="drop-shadow-sm"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function AdminDashboard({ stats = {} }) {
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [chartData, setChartData] = useState({
    users: [12, 19, 15, 25, 22, 30, 28],
    revenue: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
    orders: [5, 8, 6, 12, 9, 15, 11]
  })

  useEffect(() => {
    fetchRecentActivities()
    generateMockChartData()
  }, [selectedTimeframe])

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/recent-activities')
      if (response.ok) {
        const data = await response.json()
        setRecentActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      // Mock data for development
      setRecentActivities([
        { type: 'user_registration', description: 'New user registered', user: 'John Doe', createdAt: new Date().toISOString() },
        { type: 'book_purchase', description: 'Book purchased: Advanced React', user: 'Jane Smith', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { type: 'order_placed', description: 'New order placed', user: 'Mike Johnson', createdAt: new Date(Date.now() - 7200000).toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateMockChartData = () => {
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
    const users = Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10)
    const revenue = Array.from({ length: days }, () => Math.floor(Math.random() * 5000) + 1000)
    const orders = Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5)
    
    setChartData({ users, revenue, orders })
  }

  const StatCard = ({ title, value, icon, color = 'admin-primary', trend, chartData, chartType = 'area' }) => {
    const colorClasses = {
      'admin-primary': 'from-admin-primary/20 to-admin-primary/5 border-admin-primary/30 text-admin-primary',
      'admin-secondary': 'from-admin-secondary/20 to-admin-secondary/5 border-admin-secondary/30 text-admin-secondary',
      'admin-accent': 'from-admin-accent/20 to-admin-accent/5 border-admin-accent/30 text-admin-accent',
      'admin-success': 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
      'admin-warning': 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-500',
      'admin-info': 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500'
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`
          relative p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]}
          backdrop-blur-sm border shadow-lg hover:shadow-xl
          transition-all duration-300 overflow-hidden group
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-current rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-admin-text-secondary mb-1">{title}</p>
              <p className="text-3xl font-bold text-current">{value}</p>
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${
                  trend > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  <span className="mr-1">{trend > 0 ? '↗' : '↘'}</span>
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
            <motion.div 
              className="text-4xl opacity-80"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {icon}
            </motion.div>
          </div>
          
          {chartData && (
            <div className="mt-4">
              <SimpleChart 
                data={chartData} 
                type={chartType} 
                color={color === 'admin-primary' ? '#6366F1' : color === 'admin-secondary' ? '#8B5CF6' : '#10B981'} 
              />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const QuickActionCard = ({ title, icon, href, color = 'admin-primary' }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link
        href={href}
        className={`
          block p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5
          backdrop-blur-sm border border-white/20 hover:border-${color}/30
          text-center transition-all duration-300 group
          hover:shadow-lg hover:shadow-${color}/20
        `}
      >
        <motion.div 
          className="text-4xl mb-3"
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <div className="text-sm font-medium text-admin-text-primary group-hover:text-admin-primary transition-colors">
          {title}
        </div>
      </Link>
    </motion.div>
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const timeframeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ]

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-admin-primary to-admin-accent bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-admin-text-secondary mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {timeframeOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTimeframe(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedTimeframe === option.value
                  ? 'bg-admin-primary text-white shadow-lg'
                  : 'bg-white/10 text-admin-text-secondary hover:bg-white/20 hover:text-admin-text-primary'
                }
              `}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers?.toLocaleString() || '1,234'}
          icon="👥"
          color="admin-primary"
          trend={12}
          chartData={chartData.users}
        />
        <StatCard
          title="Total Books"
          value={stats.totalBooks?.toLocaleString() || '567'}
          icon="📚"
          color="admin-secondary"
          trend={8}
          chartData={chartData.orders}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || '89'}
          icon="🛒"
          color="admin-accent"
          trend={-3}
          chartData={chartData.orders}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue || 45678).toLocaleString()}`}
          icon="💰"
          color="admin-success"
          trend={15}
          chartData={chartData.revenue}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h3 className="text-xl font-semibold text-admin-text-primary mb-6 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard title="Add Book" icon="📚" href="/admin/books" color="admin-primary" />
          <QuickActionCard title="New Announcement" icon="📢" href="/admin/announcements" color="admin-secondary" />
          <QuickActionCard title="Manage Users" icon="👥" href="/admin/users" color="admin-accent" />
          <QuickActionCard title="View Reports" icon="📊" href="/admin/analytics" color="admin-info" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
        >
          <h3 className="text-xl font-semibold text-admin-text-primary mb-6 flex items-center">
            <span className="mr-2">📈</span>
            Recent Activities
          </h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"
              />
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-transparent hover:border-white/20"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="text-2xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {activity.type === 'user_registration' && '👤'}
                        {activity.type === 'book_purchase' && '📚'}
                        {activity.type === 'order_placed' && '🛒'}
                        {activity.type === 'content_update' && '📝'}
                        {activity.type === 'admin_login' && '🔐'}
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium text-admin-text-primary">
                          {activity.description || activity.message}
                        </p>
                        <p className="text-xs text-admin-text-secondary">
                          {activity.user || 'System'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-admin-text-secondary">
                      {formatDate(activity.createdAt || activity.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-admin-text-secondary"
            >
              <div className="text-6xl mb-4 opacity-50">📊</div>
              <p>No recent activities found</p>
            </motion.div>
          )}
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
        >
          <h3 className="text-xl font-semibold text-admin-text-primary mb-6 flex items-center">
            <span className="mr-2">⚙️</span>
            System Status
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Database', status: 'online', color: 'green' },
              { name: 'API Server', status: 'running', color: 'green' },
              { name: 'File Storage', status: 'available', color: 'green' },
              { name: 'Email Service', status: 'active', color: 'green' }
            ].map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-200 border border-green-500/20"
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                  />
                  <span className="text-sm font-medium text-admin-text-primary">{service.name}</span>
                </div>
                <span className="text-xs text-green-400 font-medium uppercase tracking-wider">
                  {service.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}