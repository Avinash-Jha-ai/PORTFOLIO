require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { getSecret } = require('./src/utils/getSecret');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const contactRoutes = require('./src/routes/contactRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://assets.leetcode.com", "https://leetcode.com", "https://avatars.githubusercontent.com"],
      connectSrc: ["'self'", "https://leetcode.com", "https://api.github.com"],
      objectSrc: ["'none'"]
    }
  },
  xFrameOptions: { action: 'sameorigin' }
}));

// CORS Configuration
const clientUrl = getSecret('CLIENT_URL') || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard request body parsers and loggers
app.use(express.json({ limit: '10kb' })); // Limit body sizes to prevent crash attacks
app.use(morgan('dev'));

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve frontend static assets
const path = require('path');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback client-side router for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server - Bind strictly to loopback IP (127.0.0.1) as required
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode at http://${HOST}:${PORT}`);
});
