const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const voteController = require('./controllers/voteController');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const contestantRoutes = require('./routes/contestantRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const voteRoutes = require('./routes/voteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(compression());

// Paystack webhook needs the RAW body for signature verification,
// so it must be registered BEFORE express.json() and use its own parser.
app.post(
  '/api/votes/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body; // Buffer
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      req.body = {};
    }
    next();
  },
  voteController.paystackWebhook
);

// Standard body parsing for everything else
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize against NoSQL injection & XSS
app.use(mongoSanitize());
app.use(xss());

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contestants', contestantRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sponsors', sponsorRoutes);

// 404 + global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
