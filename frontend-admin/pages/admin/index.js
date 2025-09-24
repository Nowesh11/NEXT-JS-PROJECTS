'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ModernLayout from '../../components/ModernLayout';
import { AuthGuard } from '../../middleware/auth';
import {
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  DownloadIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);
  
  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cultural-600"></div>
      </div>
    );
  }
  
  // Don't render if not authenticated
  if (!session) {
    return null;
  }
  
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalBooks: 89,
    totalEbooks: 156,
    totalProjects: 23,
    totalRevenue: 45670,
    monthlyGrowth: 12.5,
    activeUsers: 892,
    downloads: 3456
  });

  // Sample data for charts
  const userGrowthData = [
    { month: 'Jan', users: 400, books: 240, projects: 12 },
    { month: 'Feb', users: 500, books: 300, projects: 15 },
    { month: 'Mar', users: 650, books: 380, projects: 18 },
    { month: 'Apr', users: 800, books: 450, projects: 20 },
    { month: 'May', users: 950, books: 520, projects: 22 },
    { month: 'Jun', users: 1100, books: 600, projects: 23 },
    { month: 'Jul', users: 1247, books: 689, projects: 25 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9000 },
    { month: 'Mar', revenue: 18000, expenses: 10000 },
    { month: 'Apr', revenue: 22000, expenses: 11000 },
    { month: 'May', revenue: 28000, expenses: 12000 },
    { month: 'Jun', revenue: 35000, expenses: 13000 },
    { month: 'Jul', revenue: 45670, expenses: 14000 }
  ];

  const categoryData = [
    { name: 'Tamil Literature', value: 35, color: '#F59E0B' },
    { name: 'Cultural Studies', value: 25, color: '#EF4444' },
    { name: 'Digital Resources', value: 20, color: '#3B82F6' },
    { name: 'Educational', value: 15, color: '#10B981' },
    { name: 'Others', value: 5, color: '#8B5CF6' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'New user registration: Priya Sharma',
      time: '2 minutes ago',
      icon: UserPlusIcon,
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'book',
      message: 'New book added: "Tamil Poetry Collection"',
      time: '15 minutes ago',
      icon: BookOpenIcon,
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'download',
      message: 'E-book downloaded: "Modern Tamil Grammar"',
      time: '1 hour ago',
      icon: DownloadIcon,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'project',
      message: 'Project updated: "Digital Tamil Dictionary"',
      time: '2 hours ago',
      icon: BriefcaseIcon,
      color: 'text-orange-500'
    }
  ];

  const statCards = [
    {
      id: 'users',
      title: getText ? getText('admin.stats.totalUsers', 'Total Users') : 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase',
      icon: UsersIcon,
      gradient: 'gradient-primary',
      bgColor: 'bg-blue-500'
    },
    {
      id: 'books',
      title: getText ? getText('admin.stats.totalBooks', 'Total Books') : 'Total Books',
      value: stats.totalBooks.toLocaleString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: BookOpenIcon,
      gradient: 'gradient-cultural',
      bgColor: 'bg-orange-500'
    },
    {
      id: 'ebooks',
      title: getText ? getText('admin.stats.totalEbooks', 'E-Books') : 'E-Books',
      value: stats.totalEbooks.toLocaleString(),
      change: '+15.3%',
      changeType: 'increase',
      icon: DocumentTextIcon,
      gradient: 'gradient-digital',
      bgColor: 'bg-purple-500'
    },
    {
      id: 'projects',
      title: getText ? getText('admin.stats.totalProjects', 'Active Projects') : 'Active Projects',
      value: stats.totalProjects.toLocaleString(),
      change: '+4.1%',
      changeType: 'increase',
      icon: BriefcaseIcon,
      gradient: 'gradient-tamil',
      bgColor: 'bg-green-500'
    },
    {
      id: 'revenue',
      title: getText ? getText('admin.stats.totalRevenue', 'Total Revenue') : 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+18.7%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      gradient: 'gradient-emerald',
      bgColor: 'bg-emerald-500'
    },
    {
      id: 'downloads',
      title: getText ? getText('admin.stats.totalDownloads', 'Downloads') : 'Downloads',
      value: stats.downloads.toLocaleString(),
      change: '+22.1%',
      changeType: 'increase',
      icon: DownloadIcon,
      gradient: 'gradient-cultural',
      bgColor: 'bg-pink-500'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout 
        getText={getText} 
        language={language} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage}
      >
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="w-16 h-16 border-4 border-cultural-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      getText={getText} 
      language={language} 
      theme={theme} 
      toggleTheme={toggleTheme} 
      toggleLanguage={toggleLanguage}
    >
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getText ? getText('admin.dashboard.title', 'Dashboard Overview') : 'Dashboard Overview'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.dashboard.subtitle', 'Monitor your Tamil Language Sangam performance') : 'Monitor your Tamil Language Sangam performance'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              <option value="7d">{getText ? getText('admin.timeRange.7d', 'Last 7 days') : 'Last 7 days'}</option>
              <option value="30d">{getText ? getText('admin.timeRange.30d', 'Last 30 days') : 'Last 30 days'}</option>
              <option value="90d">{getText ? getText('admin.timeRange.90d', 'Last 90 days') : 'Last 90 days'}</option>
              <option value="1y">{getText ? getText('admin.timeRange.1y', 'Last year') : 'Last year'}</option>
            </select>
            
            <motion.button
              className="px-4 py-2 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getText ? getText('admin.export', 'Export Report') : 'Export Report'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
        >
          {statCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                className="glass-morphism rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${card.bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {card.changeType === 'increase' ? (
                      <ArrowUpIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4" />
                    )}
                    {card.change}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {card.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                </div>
                
                {/* Background gradient */}
                <div className={`absolute inset-0 ${card.gradient} opacity-5 rounded-2xl`} />
              </motion.div>
            );
          })}
        </motion.div>
                 {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {getText ? getText('admin.charts.userGrowth', 'User Growth') : 'User Growth'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText ? getText('admin.charts.userGrowth.subtitle', 'Monthly user registration trends') : 'Monthly user registration trends'}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-cultural-500" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fill="url(#userGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {getText ? getText('admin.charts.revenue', 'Revenue & Expenses') : 'Revenue & Expenses'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText ? getText('admin.charts.revenue.subtitle', 'Monthly financial overview') : 'Monthly financial overview'}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-emerald-500" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Distribution */}
          <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {getText ? getText('admin.charts.categories', 'Content Categories') : 'Content Categories'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText ? getText('admin.charts.categories.subtitle', 'Distribution by type') : 'Distribution by type'}
                </p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {getText ? getText('admin.activities.title', 'Recent Activities') : 'Recent Activities'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getText ? getText('admin.activities.subtitle', 'Latest system activities') : 'Latest system activities'}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-digital-500" />
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.01, x: 4 }}
                  >
                    <div className={`p-2 rounded-xl ${activity.color} bg-opacity-10`}>
                      <IconComponent className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                    
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                  </motion.div>
                );
              })}
            </div>
            
            <motion.button
              className="w-full mt-4 py-3 text-cultural-600 dark:text-cultural-400 hover:bg-cultural-50 dark:hover:bg-cultural-900/20 rounded-xl font-medium transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {getText ? getText('admin.activities.viewAll', 'View All Activities') : 'View All Activities'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </ModernLayout>
  );
};

// Wrap with AuthGuard for authentication
const ProtectedAdminDashboard = (props) => (
  <AuthGuard>
    <AdminDashboard {...props} />
  </AuthGuard>
);

export default ProtectedAdminDashboard;