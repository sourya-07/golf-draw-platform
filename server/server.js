require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const drawRoutes = require('./routes/drawRoutes');
const charityRoutes = require('./routes/charityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const winnerRoutes = require('./routes/winnerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Stripe webhook needs raw body — mount before json parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: (origin, callback) => {
    // Strip trailing slash from CLIENT_URL if present
    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    const allowed = [
      clientUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    // Strip trailing slash from incoming origin for comparison
    const normalizedOrigin = (origin || '').replace(/\/$/, '');
    if (!origin || allowed.includes(normalizedOrigin) || /\.vercel\.app$/.test(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏌️  Digital Heroes Golf Club API running on port ${PORT}`);
});
