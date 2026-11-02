require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const emotionRoutes = require('./routes/emotion');
const moodRoutes = require('./routes/mood');
const therapyRoutes = require('./routes/therapy');
const analyticsRoutes = require('./routes/analytics');
const crisisRoutes = require('./routes/crisis');
const voiceRoutes = require('./routes/voice');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const journalRoutes = require('./routes/journal');
const companionRoutes = require('./routes/companion');
const wellnessRoutes = require('./routes/wellness');
const dreamsRoutes = require('./routes/dreams');
const therapistsRoutes = require('./routes/therapists');
const musicRoutes = require('./routes/music');

const app = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ─── Connect to MongoDB (non-blocking) ───────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));

// ─── CORS — allow all origins in development ─────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.options('*', cors());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Attach Socket.IO to requests ────────────────────────────────────────────
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const { getConnectionStatus } = require('./config/database');
  const dbConnected = getConnectionStatus();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    server: 'running',
    database: dbConnected ? 'connected' : 'disconnected — whitelist your IP in MongoDB Atlas',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/dreams', dreamsRoutes);
app.use('/api/therapists', therapistsRoutes);
app.use('/api/music', musicRoutes);

// ─── Socket.IO Handler ────────────────────────────────────────────────────────
require('./socket/socketHandler')(io);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('');
  console.log('🧠 ================================');
  console.log(`🧠  MindCare AI Backend`);
  console.log(`🧠  Port    : ${PORT}`);
  console.log(`🧠  Mode    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧠  Health  : http://localhost:${PORT}/health`);
  console.log('🧠 ================================');
  console.log('');
});

module.exports = { app, io };
