import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { verifyToken, requireRole } from './middleware/authMiddleware.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // required for HTTP-only refresh token cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body & Cookie parsers ──────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Rate limiting — login endpoint only ───────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter); // apply limiter before auth router
app.use('/api/auth', authRoutes);

// Admin-only user management — protected by JWT + role check
app.use('/api/users', verifyToken, requireRole(['Admin']), userRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'ILCMS API is running' });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled]', err);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'password_changed_at'`
    );
    if (cols.length === 0) {
      await pool.query('ALTER TABLE `User` ADD COLUMN password_changed_at DATETIME DEFAULT NULL');
    }
    console.log('Database migration: password_changed_at column ready');
  } catch (err) {
    console.error('Migration warning:', err.message);
  }
});
