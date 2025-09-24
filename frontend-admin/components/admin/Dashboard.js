import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useRouter } from 'next/router';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalEbooks: 0,
    totalProjects: 0,
    totalActivities: 0,
    totalInitiatives: 0,
    totalTeams: 0,
    totalAnnouncements: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartTheme, setChartTheme] = useState('light');
  const [apiCache, setApiCache] = useState(new Map());
  const router = useRouter();
  const CACHE_DURATION = 30000; // 30 seconds

  useEffect(() => {
    loadDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Enhanced API call with caching
  const cachedApiCall = async (endpoint) => {
    const now = Date.now();
    const cached = apiCache.get(endpoint);
    
    // Return cached response if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }
    
    // Make fresh API call
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const newCache = new Map(apiCache);
        newCache.set(endpoint, {
          data: data,
          timestamp: now
        });
        setApiCache(newCache);
        return data;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel with fallback handling
      const [booksResponse, ebooksResponse, projectsResponse, usersResponse, 
             teamsResponse, announcementsResponse, activitiesResponse, 
             initiativesResponse, recentActivitiesResponse] = await Promise.allSettled([
        cachedApiCall('/api/books'),
        cachedApiCall('/api/ebooks'),
        cachedApiCall('/api/projects'),
        cachedApiCall('/api/users'),
        cachedApiCall('/api/team'),
        cachedApiCall('/api/announcements'),
        cachedApiCall('/api/activities'),
        cachedApiCall('/api/initiatives'),
        cachedApiCall('/api/admin/dashboard/recent-activities')
      ]);
      
      // Process responses with fallback values
      const newStats = {
        totalBooks: getCountFromResponse(booksResponse),
        totalEbooks: getCountFromResponse(ebooksResponse),
        totalProjects: getCountFromResponse(projectsResponse),
        totalUsers: getCountFromResponse(usersResponse),
        totalTeams: getCountFromResponse(teamsResponse),
        totalAnnouncements: getCountFromResponse(announcementsResponse),
        totalActivities: getCountFromResponse(activitiesResponse),
        totalInitiatives: getCountFromResponse(initiativesResponse)
      };
      
      setStats(newStats);
      
      // Process recent activities
      if (recentActivitiesResponse.status === 'fulfilled') {
        const activitiesData = recentActivitiesResponse.value;
        setRecentActivities(Array.isArray(activitiesData?.data) ? activitiesData.data : 
                           Array.isArray(activitiesData) ? activitiesData : []);
      } else {
        // Generate fallback activities from recent data
        generateFallbackActivities(newStats);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to extract count from API response
  const getCountFromResponse = (response) => {
    if (response.status !== 'fulfilled') return 0;
    const data = response.value;
    if (Array.isArray(data?.data)) return data.data.length;
    if (Array.isArray(data)) return data.length;
    if (typeof data?.count === 'number') return data.count;
    if (typeof data?.total === 'number') return data.total;
    return 0;
  };
  
  // Generate fallback activities when API is not available
  const generateFallbackActivities = (stats) => {
    const activities = [];
    const now = new Date();
    
    if (stats.totalUsers > 0) {
      activities.push({
        type: 'user',
        title: 'User Management',
        description: `${stats.totalUsers} users in system`,
        time: new Date(now - Math.random() * 86400000).toISOString()
      });
    }
    
    if (stats.totalBooks > 0) {
      activities.push({
        type: 'book',
        title: 'Book Collection',
        description: `${stats.totalBooks} books available`,
        time: new Date(now - Math.random() * 86400000).toISOString()
      });
    }
    
    setRecentActivities(activities.slice(0, 5));
  };

  // Enhanced chart data for overview pie chart
  const pieChartData = {
    labels: ['Books', 'E-books', 'Projects', 'Users', 'Activities', 'Teams', 'Announcements', 'Initiatives'],
    datasets: [{
      data: [
        stats.totalBooks || 0,
        stats.totalEbooks || 0,
        stats.totalProjects || 0,
        Math.min(stats.totalUsers || 0, 50), // Cap users for better visualization
        stats.totalActivities || 0,
        stats.totalTeams || 0,
        stats.totalAnnouncements || 0,
        stats.totalInitiatives || 0
      ],
      backgroundColor: [
        '#3b82f6', // Blue for books
        '#10b981', // Green for ebooks
        '#f59e0b', // Yellow for projects
        '#ef4444', // Red for users
        '#8b5cf6', // Purple for activities
        '#f97316', // Orange for teams
        '#06b6d4', // Cyan for announcements
        '#84cc16'  // Lime for initiatives
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3,
      hoverBorderColor: '#374151'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    },
    cutout: '60%'
  };

  // Enhanced helper function to get activity icon with proper styling
  const getActivityIcon = (type) => {
    const iconMap = {
      'user': { icon: 'fas fa-user', color: 'text-blue-600', bg: 'bg-blue-100' },
      'book': { icon: 'fas fa-book', color: 'text-green-600', bg: 'bg-green-100' },
      'ebook': { icon: 'fas fa-tablet-alt', color: 'text-emerald-600', bg: 'bg-emerald-100' },
      'project': { icon: 'fas fa-project-diagram', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      'activity': { icon: 'fas fa-calendar-alt', color: 'text-red-600', bg: 'bg-red-100' },
      'team': { icon: 'fas fa-users', color: 'text-purple-600', bg: 'bg-purple-100' },
      'announcement': { icon: 'fas fa-bullhorn', color: 'text-orange-600', bg: 'bg-orange-100' },
      'initiative': { icon: 'fas fa-lightbulb', color: 'text-cyan-600', bg: 'bg-cyan-100' },
      'login': { icon: 'fas fa-sign-in-alt', color: 'text-indigo-600', bg: 'bg-indigo-100' },
      'logout': { icon: 'fas fa-sign-out-alt', color: 'text-gray-600', bg: 'bg-gray-100' },
      'edit': { icon: 'fas fa-edit', color: 'text-amber-600', bg: 'bg-amber-100' },
      'delete': { icon: 'fas fa-trash', color: 'text-red-600', bg: 'bg-red-100' },
      'create': { icon: 'fas fa-plus', color: 'text-green-600', bg: 'bg-green-100' },
      'update': { icon: 'fas fa-sync', color: 'text-blue-600', bg: 'bg-blue-100' },
      'content': { icon: 'fas fa-file-alt', color: 'text-slate-600', bg: 'bg-slate-100' },
      'default': { icon: 'fas fa-info-circle', color: 'text-gray-600', bg: 'bg-gray-100' }
    };
    
    return iconMap[type] || iconMap['default'];
  };
  
  // Enhanced activity type detection
  const getActivityType = (activity) => {
    if (!activity.type && activity.title) {
      const title = activity.title.toLowerCase();
      if (title.includes('user')) return 'user';
      if (title.includes('book') && !title.includes('ebook')) return 'book';
      if (title.includes('ebook') || title.includes('e-book')) return 'ebook';
      if (title.includes('project')) return 'project';
      if (title.includes('activity')) return 'activity';
      if (title.includes('team')) return 'team';
      if (title.includes('announcement')) return 'announcement';
      if (title.includes('initiative')) return 'initiative';
      if (title.includes('login')) return 'login';
      if (title.includes('logout')) return 'logout';
      if (title.includes('edit') || title.includes('update')) return 'edit';
      if (title.includes('delete') || title.includes('remove')) return 'delete';
      if (title.includes('create') || title.includes('add')) return 'create';
    }
    return activity.type || 'default';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading && !stats.totalUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back! Here's what's happening.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button 
                onClick={loadDashboardData}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Books Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Books</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBooks}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-book text-blue-600 dark:text-blue-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* E-books Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total E-books</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEbooks}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-tablet-alt text-green-600 dark:text-green-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Projects</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-project-diagram text-yellow-600 dark:text-yellow-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Activities Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Activities</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-calendar-alt text-red-600 dark:text-red-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Teams Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Teams</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTeams}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-users text-purple-600 dark:text-purple-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Announcements Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Announcements</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAnnouncements}</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-bullhorn text-orange-600 dark:text-orange-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Initiatives Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Initiatives</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalInitiatives}</p>
                </div>
                <div className="bg-cyan-100 dark:bg-cyan-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-lightbulb text-cyan-600 dark:text-cyan-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-lime-100 dark:bg-lime-900 p-2 sm:p-3 rounded-full">
                  <i className="fas fa-user-friends text-lime-600 dark:text-lime-400 text-lg sm:text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Overview Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
              <div className="h-48 sm:h-64 relative">
                <Doughnut data={pieChartData} options={chartOptions} />
              </div>
              {/* Custom Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {pieChartData.labels.map((label, index) => {
                  const value = pieChartData.datasets[0].data[index];
                  const color = pieChartData.datasets[0].backgroundColor[index];
                  const total = pieChartData.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-300 truncate">
                        {label}: {value} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
              <div className="space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const activityType = getActivityType(activity);
                const iconConfig = getActivityIcon(activityType);
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className={`${iconConfig.bg} dark:bg-opacity-20 p-2 rounded-full flex-shrink-0`}>
                      <i className={`${iconConfig.icon} ${iconConfig.color} dark:text-opacity-80`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title || activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(activity.time || activity.createdAt)}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          by {activity.user}
                        </p>
                      )}
                    </div>
                    {activity.status && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'success' ? 'bg-green-100 text-green-700' :
                        activity.status === 'error' ? 'bg-red-100 text-red-700' :
                        activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
                <p>No recent activities</p>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <button 
                onClick={() => router.push('/admin/books/add')}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                  <i className="fas fa-book text-blue-600 dark:text-blue-400"></i>
                </div>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Add Book</span>
              </button>
          <button 
            onClick={() => router.push('/admin/ebooks/add')}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
              <i className="fas fa-tablet-alt text-green-600"></i>
            </div>
            <span className="text-sm font-medium text-green-700">Add E-book</span>
          </button>
          <button 
            onClick={() => router.push('/admin/projects/add')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
              <i className="fas fa-project-diagram text-purple-600"></i>
            </div>
            <span className="text-sm font-medium text-purple-700">Add Project</span>
          </button>
          <button 
            onClick={() => router.push('/admin/activities/add')}
            className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
              <i className="fas fa-calendar-alt text-yellow-600"></i>
            </div>
            <span className="text-sm font-medium text-yellow-700">Add Activity</span>
          </button>
          <button 
            onClick={() => router.push('/admin/initiatives/add')}
            className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
              <i className="fas fa-lightbulb text-red-600"></i>
            </div>
            <span className="text-sm font-medium text-red-700">Add Initiative</span>
          </button>
          <button 
            onClick={() => router.push('/admin/settings')}
            className="flex flex-col items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
              <i className="fas fa-cog text-indigo-600"></i>
            </div>
            <span className="text-sm font-medium text-indigo-700">Settings</span>
          </button>
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;