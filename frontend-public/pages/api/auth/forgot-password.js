// API route for forgot password
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, language } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Prepare request data for backend
    const requestData = {
      email: email.toLowerCase().trim(),
      language: language || 'en',
      clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'
    };

    // Call backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok && backendData.success) {
      return res.status(200).json({
        success: true,
        message: backendData.message || 'Password reset instructions have been sent to your email',
        data: {
          email: requestData.email,
          resetTokenSent: true,
          expiresIn: backendData.expiresIn || '1 hour'
        }
      });
    } else {
      // Handle specific error cases
      let statusCode = backendResponse.status;
      let errorMessage = backendData.error || backendData.message || 'Failed to send password reset email';
      
      // Map backend errors to appropriate status codes
      if (backendData.error === 'USER_NOT_FOUND') {
        statusCode = 404;
        errorMessage = 'No account found with this email address';
      } else if (backendData.error === 'EMAIL_SEND_FAILED') {
        statusCode = 500;
        errorMessage = 'Failed to send email. Please try again later';
      } else if (backendData.error === 'RATE_LIMITED') {
        statusCode = 429;
        errorMessage = 'Too many requests. Please wait before trying again';
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: backendData.error
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later.',
        error: 'BACKEND_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: 'INTERNAL_ERROR'
    });
  }
}

// Rate limiting helper (can be enhanced with Redis in production)
const rateLimitMap = new Map();

function checkRateLimit(email, maxAttempts = 3, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = email.toLowerCase();
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  const record = rateLimitMap.get(key);
  
  if (now > record.resetTime) {
    // Reset the window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  if (record.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: record.resetTime 
    };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: maxAttempts - record.count 
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
