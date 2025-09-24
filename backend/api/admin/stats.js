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

// Mock data - in a real app, this would come from a database
function getMockStats() {
  return {
    books: 156,
    ebooks: 89,
    projects: 23,
    activities: 45,
    initiatives: 12,
    users: 1247,
    totalRevenue: 45678,
    monthlyGrowth: 12.5,
    activeUsers: 892,
    pendingOrders: 34
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    verifyAdminToken(req);

    // Get stats (in a real app, this would query the database)
    const stats = getMockStats();

    res.status(200).json(stats);

  } catch (error) {
    console.error('Stats API error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (error.message === 'Insufficient permissions') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
}