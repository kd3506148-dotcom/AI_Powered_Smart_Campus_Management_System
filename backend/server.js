/**
 * SmartCampus AI - Express Server Entry Point
 * Sets up Express app, Socket.IO, CORS, Rate Limiting, and MongoDB connection
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const aiRoutes = require('./routes/aiRoutes');

if (process.env.NODE_ENV === 'production') {
  const requiredProductionEnv = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const missingEnv = requiredProductionEnv.filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingEnv.join(', ')}`);
  }
}

// Initialize Express app & HTTP Server
const app = express();
app.disable('x-powered-by');
app.use(helmet());
const server = http.createServer(app);

// Initialize Socket.IO with CORS (used across real-time phases)
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO instance to app for controller access (req.app.get('io'))
app.set('io', io);

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`⚡ [Socket.IO] Client ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`⚡ [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middleware configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting for API endpoints (prevent abuse & brute force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth/login', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartCampus AI Backend is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Not Found handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`🚀 [SmartCampus Backend] Server running on port ${PORT}`);
        console.log(`🌐 [REST API]: http://localhost:${PORT}/api`);
        console.log(`⚡ [Socket.IO]: Ready on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('[Startup Error]: Unable to connect to MongoDB.', error.message);
      process.exit(1);
    });
}

module.exports = { app, server };

