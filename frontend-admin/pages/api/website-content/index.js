import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized. Admin access required.' 
      });
    }

    const { method, query, body } = req;
    
    // Build query string
    const queryString = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/website-content${queryString ? `?${queryString}` : ''}`;
    
    // Prepare request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || session.user.id}`,
      },
    };
    
    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      options.body = JSON.stringify(body);
    }
    
    // Make request to backend
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Return response with same status code
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Website content API proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}