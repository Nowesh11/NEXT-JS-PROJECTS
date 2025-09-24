import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalVisitors: 0,
      pageViews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      conversionRate: 0
    },
    visitors: [],
    pageViews: [],
    topPages: [],
    referrers: [],
    devices: [],
    countries: []
  });
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  const dateRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'traffic', label: 'Traffic', icon: 'fa-users' },
    { id: 'content', label: 'Content', icon: 'fa-file-alt' },
    { id: 'sources', label: 'Sources', icon: 'fa-external-link-alt' },
    { id: 'devices', label: 'Devices', icon: 'fa-mobile-alt' },
    { id: 'geography', label: 'Geography', icon: 'fa-globe' }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || generateMockData());
      } else {
        // Fallback to mock data if API fails
        setAnalytics(generateMockData());
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(generateMockData());
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = dateRange === '1d' ? 24 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const labels = [];
    const visitors = [];
    const pageViews = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (dateRange === '1d') {
        date.setHours(date.getHours() - i);
        labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      
      visitors.push(Math.floor(Math.random() * 100) + 50);
      pageViews.push(Math.floor(Math.random() * 200) + 100);
    }
    
    return {
      overview: {
        totalVisitors: visitors.reduce((a, b) => a + b, 0),
        pageViews: pageViews.reduce((a, b) => a + b, 0),
        bounceRate: Math.floor(Math.random() * 30) + 40,
        avgSessionDuration: Math.floor(Math.random() * 180) + 120,
        conversionRate: (Math.random() * 5 + 2).toFixed(2)
      },
      visitors: labels.map((label, index) => ({ date: label, count: visitors[index] })),
      pageViews: labels.map((label, index) => ({ date: label, count: pageViews[index] })),
      topPages: [
        { page: '/home', views: 1250, percentage: 35 },
        { page: '/about', views: 890, percentage: 25 },
        { page: '/services', views: 650, percentage: 18 },
        { page: '/contact', views: 420, percentage: 12 },
        { page: '/blog', views: 350, percentage: 10 }
      ],
      referrers: [
        { source: 'Google', visits: 1200, percentage: 45 },
        { source: 'Direct', visits: 800, percentage: 30 },
        { source: 'Facebook', visits: 400, percentage: 15 },
        { source: 'Twitter', visits: 200, percentage: 7 },
        { source: 'LinkedIn', visits: 80, percentage: 3 }
      ],
      devices: [
        { device: 'Desktop', count: 1500, percentage: 55 },
        { device: 'Mobile', count: 1000, percentage: 37 },
        { device: 'Tablet', count: 220, percentage: 8 }
      ],
      countries: [
        { country: 'United States', visits: 1200, percentage: 40 },
        { country: 'United Kingdom', visits: 600, percentage: 20 },
        { country: 'Canada', visits: 450, percentage: 15 },
        { country: 'Germany', visits: 300, percentage: 10 },
        { country: 'France', visits: 240, percentage: 8 },
        { country: 'Others', visits: 210, percentage: 7 }
      ]
    };
  };

  const exportData = async (format) => {
    try {
      setExporting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/analytics/export?format=${format}&range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Analytics exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Error exporting analytics');
    } finally {
      setExporting(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  const renderOverview = () => {
    const visitorsData = {
      labels: analytics.visitors.map(v => v.date),
      datasets: [
        {
          label: 'Visitors',
          data: analytics.visitors.map(v => v.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Page Views',
          data: analytics.pageViews.map(v => v.count),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalVisitors)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.pageViews)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-eye text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.bounceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.overview.avgSessionDuration)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-percentage text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
          <div className="h-80">
            <Line data={visitorsData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  const renderTraffic = () => {
    const trafficData = {
      labels: analytics.visitors.map(v => v.date),
      datasets: [
        {
          label: 'Unique Visitors',
          data: analytics.visitors.map(v => v.count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Traffic</h3>
          <div className="h-80">
            <Bar data={trafficData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {analytics.referrers.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-external-link-alt text-blue-600 text-sm"></i>
                  </div>
                  <span className="font-medium text-gray-900">{referrer.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{referrer.visits} visits</span>
                  <span className="text-sm font-medium text-gray-900">{referrer.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
        <div className="space-y-3">
          {analytics.topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-file-alt text-green-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-900">{page.page}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{page.views} views</span>
                <span className="text-sm font-medium text-gray-900">{page.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSources = () => {
    const sourcesData = {
      labels: analytics.referrers.map(r => r.source),
      datasets: [
        {
          data: analytics.referrers.map(r => r.visits),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="h-80">
            <Doughnut data={sourcesData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    );
  };

  const renderDevices = () => {
    const devicesData = {
      labels: analytics.devices.map(d => d.device),
      datasets: [
        {
          data: analytics.devices.map(d => d.count),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <div className="h-80">
            <Doughnut data={devicesData} options={doughnutOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {analytics.devices.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className={`fas ${
                      device.device === 'Desktop' ? 'fa-desktop' :
                      device.device === 'Mobile' ? 'fa-mobile-alt' : 'fa-tablet-alt'
                    } text-blue-600 text-sm`}></i>
                  </div>
                  <span className="font-medium text-gray-900">{device.device}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{device.count} visits</span>
                  <span className="text-sm font-medium text-gray-900">{device.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGeography = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitors by Country</h3>
        <div className="space-y-3">
          {analytics.countries.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-globe text-purple-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{country.visits} visits</span>
                <span className="text-sm font-medium text-gray-900">{country.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'traffic': return renderTraffic();
      case 'content': return renderContent();
      case 'sources': return renderSources();
      case 'devices': return renderDevices();
      case 'geography': return renderGeography();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i className="fas fa-chart-bar text-blue-600"></i>
          Analytics
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData('csv')}
              disabled={exporting}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <i className="fas fa-file-csv"></i>
              CSV
            </button>
            <button
              onClick={() => exportData('pdf')}
              disabled={exporting}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              PDF
            </button>
          </div>
          
          <button
            onClick={loadAnalytics}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className={`fas ${tab.icon} text-sm`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Analytics;