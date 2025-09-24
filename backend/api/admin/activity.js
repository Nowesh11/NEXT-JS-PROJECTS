import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify admin token
function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Mock activity data - in a real app, this would come from a database
function getMockActivity() {
  const now = new Date();
  const activities = [
    {
      id: 1,
      icon: 'fa-book',
      text: 'New book "Tamil Literature Classics" was added',
      time: new Date(now - 5 * 60 * 1000).toLocaleString(), // 5 minutes ago
      type: 'book',
      user: 'Admin'
    },
    {
      id: 2,
      icon: 'fa-user-plus',
      text: 'New user registered: john.doe@email.com',
      time: new Date(now - 15 * 60 * 1000).toLocaleString(), // 15 minutes ago
      type: 'user',
      user: 'System'
    },
    {
      id: 3,
      icon: 'fa-tablet-alt',
      text: 'E-book "Digital Tamil Grammar" was published',
      time: new Date(now - 30 * 60 * 1000).toLocaleString(), // 30 minutes ago
      type: 'ebook',
      user: 'Admin'
    },
    {
      id: 4,
      icon: 'fa-project-diagram',
      text: 'Project "Tamil Language App" status updated to In Progress',
      time: new Date(now - 45 * 60 * 1000).toLocaleString(), // 45 minutes ago
      type: 'project',
      user: 'Admin'
    },
    {
      id: 5,
      icon: 'fa-shopping-cart',
      text: 'New order received for "Tamil Poetry Collection"',
      time: new Date(now - 60 * 60 * 1000).toLocaleString(), // 1 hour ago
      type: 'order',
      user: 'System'
    },
    {
      id: 6,
      icon: 'fa-calendar-alt',
      text: 'Activity "Tamil Cultural Workshop" scheduled for next week',
      time: new Date(now - 90 * 60 * 1000).toLocaleString(), // 1.5 hours ago
      type: 'activity',
      user: 'Admin'
    },
    {
      id: 7,
      icon: 'fa-lightbulb',
      text: 'Initiative "Digital Tamil Library" proposal submitted',
      time: new Date(now - 120 * 60 * 1000).toLocaleString(), // 2 hours ago
      type: 'initiative',
      user: 'Admin'
    },
    {
      id: 8,
      icon: 'fa-edit',
      text: 'Website content updated: About page Tamil translation',
      time: new Date(now - 150 * 60 * 1000).toLocaleString(), // 2.5 hours ago
      type: 'content',
      user: 'Admin'
    },
    {
      id: 9,
      icon: 'fa-envelope',
      text: 'New contact form submission received',
      time: new Date(now - 180 * 60 * 1000).toLocaleString(), // 3 hours ago
      type: 'contact',
      user: 'System'
    },
    {
      id: 10,
      icon: 'fa-star',
      text: 'Book "Modern Tamil Literature" received 5-star review',
      time: new Date(now - 240 * 60 * 1000).toLocaleString(), // 4 hours ago
      type: 'review',
      user: 'System'
    }
  ];

  return activities;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    verifyAdminToken(req);

    // Get query parameters
    const { limit = 10, offset = 0, type } = req.query;

    // Get activity data (in a real app, this would query the database)
    let activities = getMockActivity();

    // Filter by type if specified
    if (type && type !== 'all') {
      activities = activities.filter(activity => activity.type === type);
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedActivities = activities.slice(startIndex, endIndex);

    res.status(200).json({
      activities: paginatedActivities,
      total: activities.length,
      hasMore: endIndex < activities.length
    });

  } catch (error) {
    console.error('Activity API error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (error.message === 'Insufficient permissions') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
}