const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Public frontend
    'http://localhost:3002',  // Admin frontend
  ],
  credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' });
});

// Auth routes for NextAuth
app.post('/api/auth/login', (req, res) => {
  // Mock authentication for now
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      user: {
        id: '1',
        email: email,
        name: 'Test User',
        role: 'user'
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;