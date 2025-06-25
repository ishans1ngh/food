import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import priceRoutes from './routes/prices.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Track database connection status
let isDBConnected = false;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with graceful fallback
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartbasket';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    isDBConnected = true;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed - running in demo mode without database');
    console.warn('   To enable full functionality, ensure MongoDB is running or provide a valid MONGODB_URI');
    isDBConnected = false;
    // Don't exit the process - continue running without database
  }
};

// Middleware to check database connection for routes that need it
const requireDB = (req, res, next) => {
  if (!isDBConnected) {
    return res.status(503).json({ 
      message: 'Database not available - running in demo mode',
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
};

// Routes - some require database, others can work without
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/users', requireDB, userRoutes);
app.use('/api/prices', priceRoutes); // Price comparison can work without database

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDBConnected ? 'connected' : 'disconnected',
    mode: isDBConnected ? 'full' : 'demo'
  });
});

// Demo mode info endpoint
app.get('/api/status', (req, res) => {
  res.json({
    database: isDBConnected,
    mode: isDBConnected ? 'full' : 'demo',
    message: isDBConnected 
      ? 'All features available' 
      : 'Running in demo mode - some features may be limited'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB(); // This won't crash the app anymore
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    if (!isDBConnected) {
      console.log('🔄 Running in demo mode - database features disabled');
    }
  });
};

startServer().catch(console.error);