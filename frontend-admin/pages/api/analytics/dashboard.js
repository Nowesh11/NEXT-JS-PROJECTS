import { connectToDatabase, COLLECTIONS } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Validate admin token (mock implementation)
function validateAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  // Mock validation - in production, verify JWT token
  return token && token.length > 10;
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Validate authentication
  if (!validateAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get date range from query params
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all analytics data in parallel
    const [overviewStats, userStats, bookStats, ebookStats, revenueStats, activityStats] = await Promise.all([
      getOverviewStats(db, start, end),
      getUserStats(db, start, end),
      getBookStats(db, start, end),
      getEbookStats(db, start, end),
      getRevenueStats(db, start, end),
      getActivityStats(db, start, end, period)
    ]);

    return res.status(200).json({
      overview: overviewStats,
      users: userStats,
      books: bookStats,
      ebooks: ebookStats,
      revenue: revenueStats,
      activity: activityStats,
      period: {
        startDate: start,
        endDate: end,
        period
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get overview statistics
async function getOverviewStats(db, startDate, endDate) {
  try {
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const booksCollection = db.collection(COLLECTIONS.BOOKS);
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);

    const [totalUsers, totalBooks, totalEbooks, totalOrders, activeUsers, recentOrders] = await Promise.all([
      usersCollection.countDocuments(),
      booksCollection.countDocuments({ status: { $ne: 'deleted' } }),
      ebooksCollection.countDocuments({ status: { $ne: 'deleted' } }),
      ordersCollection.countDocuments(),
      usersCollection.countDocuments({ 
        status: 'active',
        lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      ordersCollection.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);

    // Calculate growth rates (mock data for now)
    const userGrowth = Math.floor(Math.random() * 20) + 5; // 5-25%
    const bookGrowth = Math.floor(Math.random() * 15) + 2; // 2-17%
    const orderGrowth = Math.floor(Math.random() * 30) + 10; // 10-40%

    return {
      totalUsers,
      totalBooks,
      totalEbooks,
      totalOrders,
      activeUsers,
      recentOrders,
      growth: {
        users: userGrowth,
        books: bookGrowth,
        orders: orderGrowth
      }
    };
  } catch (error) {
    console.error('Overview stats error:', error);
    return null;
  }
}

// Get user statistics
async function getUserStats(db, startDate, endDate) {
  try {
    const usersCollection = db.collection(COLLECTIONS.USERS);

    const [roleDistribution, statusDistribution, newUsers, usersByMonth] = await Promise.all([
      // Role distribution
      usersCollection.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Status distribution
      usersCollection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // New users in period
      usersCollection.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Users by month (last 6 months)
      usersCollection.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]).toArray()
    ]);

    return {
      roleDistribution,
      statusDistribution,
      newUsers,
      usersByMonth
    };
  } catch (error) {
    console.error('User stats error:', error);
    return null;
  }
}

// Get book statistics
async function getBookStats(db, startDate, endDate) {
  try {
    const booksCollection = db.collection(COLLECTIONS.BOOKS);

    const [categoryDistribution, statusDistribution, newBooks, topBooks, stockStats] = await Promise.all([
      // Category distribution
      booksCollection.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Status distribution
      booksCollection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // New books in period
      booksCollection.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'deleted' }
      }),
      
      // Top books by price
      booksCollection.find(
        { status: 'active' },
        { projection: { title: 1, author: 1, price: 1, stock: 1 } }
      ).sort({ price: -1 }).limit(5).toArray(),
      
      // Stock statistics
      booksCollection.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' },
            maxPrice: { $max: '$price' },
            minPrice: { $min: '$price' }
          }
        }
      ]).toArray()
    ]);

    return {
      categoryDistribution,
      statusDistribution,
      newBooks,
      topBooks,
      stockStats: stockStats[0] || {}
    };
  } catch (error) {
    console.error('Book stats error:', error);
    return null;
  }
}

// Get e-book statistics
async function getEbookStats(db, startDate, endDate) {
  try {
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);

    const [formatDistribution, categoryDistribution, newEbooks, topEbooks, downloadStats] = await Promise.all([
      // Format distribution
      ebooksCollection.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$format', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Category distribution
      ebooksCollection.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // New e-books in period
      ebooksCollection.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'deleted' }
      }),
      
      // Top e-books by download count
      ebooksCollection.find(
        { status: 'active' },
        { projection: { title: 1, author: 1, downloadCount: 1, price: 1 } }
      ).sort({ downloadCount: -1 }).limit(5).toArray(),
      
      // Download statistics
      ebooksCollection.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloadCount' },
            avgPrice: { $avg: '$price' },
            avgFileSize: { $avg: '$fileSize' }
          }
        }
      ]).toArray()
    ]);

    return {
      formatDistribution,
      categoryDistribution,
      newEbooks,
      topEbooks,
      downloadStats: downloadStats[0] || {}
    };
  } catch (error) {
    console.error('E-book stats error:', error);
    return null;
  }
}

// Get revenue statistics (mock data)
async function getRevenueStats(db, startDate, endDate) {
  try {
    // Mock revenue data - in a real app, this would come from orders/payments collections
    const mockRevenue = {
      totalRevenue: Math.floor(Math.random() * 50000) + 10000, // $10k-$60k
      monthlyRevenue: Math.floor(Math.random() * 8000) + 2000, // $2k-$10k
      averageOrderValue: Math.floor(Math.random() * 100) + 25, // $25-$125
      revenueGrowth: Math.floor(Math.random() * 30) + 5, // 5-35%
      revenueByMonth: [
        { month: 'Jan', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { month: 'Feb', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { month: 'Mar', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { month: 'Apr', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { month: 'May', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { month: 'Jun', revenue: Math.floor(Math.random() * 5000) + 1000 }
      ]
    };

    return mockRevenue;
  } catch (error) {
    console.error('Revenue stats error:', error);
    return null;
  }
}

// Get activity statistics
async function getActivityStats(db, startDate, endDate, period) {
  try {
    // Mock activity data - in a real app, this would come from activity logs
    const activities = [
      { type: 'user_registration', count: Math.floor(Math.random() * 50) + 10 },
      { type: 'book_purchase', count: Math.floor(Math.random() * 100) + 20 },
      { type: 'ebook_download', count: Math.floor(Math.random() * 200) + 50 },
      { type: 'admin_login', count: Math.floor(Math.random() * 30) + 5 }
    ];

    const recentActivities = [
      {
        id: '1',
        type: 'user_registration',
        description: 'New user registered: john.doe@example.com',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'book_added',
        description: 'New book added: "Advanced JavaScript Concepts"',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'ebook_download',
        description: 'E-book downloaded: "React Best Practices"',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        type: 'payment_received',
        description: 'Payment received: $45.99',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }
    ].sort((a, b) => b.timestamp - a.timestamp);

    return {
      activities,
      recentActivities
    };
  } catch (error) {
    console.error('Activity stats error:', error);
    return null;
  }
}

// Export helper functions for testing
export { validateAdminToken, getOverviewStats, getUserStats, getBookStats, getEbookStats };