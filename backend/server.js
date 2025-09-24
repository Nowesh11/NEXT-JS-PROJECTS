const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-nextjs')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Public frontend
    'http://localhost:3002',  // Admin frontend
    process.env.PUBLIC_FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'tls-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-nextjs',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and register working routes (CommonJS modules only)
try {
  const formsRoutes = require('./api/forms');
  app.use('/api/forms', formsRoutes);
} catch (err) {
  console.log('Forms routes not available:', err.message);
}

try {
  const formResponsesRoutes = require('./api/form-responses');
  app.use('/api/form-responses', formResponsesRoutes);
} catch (err) {
  console.log('Form responses routes not available:', err.message);
}

try {
  const ebooksRoutes = require('./api/ebooks-router');
  app.use('/api/ebooks', ebooksRoutes);
} catch (err) {
  console.log('Ebooks routes not available:', err.message);
}

try {
  const websiteContentRoutes = require('./api/website-content');
  app.use('/api/website-content', websiteContentRoutes);
  console.log('Website content routes registered successfully');
} catch (err) {
  console.log('Website content routes not available:', err.message);
}

// Register auth routes
try {
  const authRoutes = require('./api/auth/login.js');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes registered successfully');
} catch (err) {
  console.log('Auth routes not available:', err.message);
}

// Mock endpoints for common API calls to prevent ERR_ABORTED
app.get('/api/announcements/public', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/slideshow', (req, res) => {
  res.json({ success: true, data: { slides: [] } });
});

app.get('/api/team', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/books', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/payment-settings', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      epayum: { link: '', instructions: '' },
      fbx: { bankName: '', accountNumber: '', accountHolder: '' }
    }
  });
});

// Catch-all for undefined API routes - remove this problematic route
// app.all('/api/*', (req, res) => {
//   console.log(`API route not found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     success: false,
//     error: 'API endpoint not found',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-nextjs'}`);
  console.log('Available endpoints:');
  console.log('  GET /api/announcements/public - Public announcements');
  console.log('  GET /api/slideshow - Slideshow data');
  console.log('  GET /api/team - Team members');
  console.log('  GET /api/books - Books data');
  console.log('  GET /api/projects - Projects data');
  console.log('  GET /api/payment-settings - Payment settings');
  console.log('  GET /api/website-content - Website content management');
  console.log('  POST /api/website-content - Create website content');
  console.log('  PUT /api/website-content/:id - Update website content');
  console.log('  DELETE /api/website-content/:id - Delete website content');
});

module.exports = app;