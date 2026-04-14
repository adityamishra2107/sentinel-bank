require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const accountRoutes = require('../routes/accountRoutes');
const transactionRoutes = require('../routes/transactionRoutes');
const adminRoutes = require('../routes/adminRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const aiRoutes = require('../routes/aiRoutes');
const cardRoutes = require('../routes/cardRoutes');
const contactRoutes = require('../routes/contactRoutes');
const qrRoutes = require('../routes/qrRoutes');

const app = express();

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://sentinel-bank-frontend.onrender.com',
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Capacitor mobile app, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/qr', qrRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Banking System API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
