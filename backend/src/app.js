require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
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
