// API route for user registration
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, password, interest, terms, newsletter, notifications } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, email, and password are required' 
      });
    }

    if (!terms) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must accept the terms and conditions' 
      });
    }

    // Prepare user data for backend
    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone: phone || '',
      primaryInterest: interest || 'general',
      preferences: {
        newsletter: newsletter || false,
        notifications: notifications !== false, // default to true
        language: 'en'
      }
    };

    // Call backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok && backendData.success) {
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: backendData.user.id,
          name: backendData.user.name,
          email: backendData.user.email,
          role: backendData.user.role
        },
        token: backendData.token
      });
    } else {
      return res.status(backendResponse.status).json({
        success: false,
        message: backendData.error || 'Registration failed'
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
