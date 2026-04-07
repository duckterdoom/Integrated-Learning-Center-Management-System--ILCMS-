import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import classRoutes from './routes/classes.js';
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

// Course & Class management — Admin + Staff
app.use('/api/courses', verifyToken, requireRole(['Admin', 'Staff']), courseRoutes);
app.use('/api/classes', verifyToken, requireRole(['Admin', 'Staff']), classRoutes);

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
    // Migration: password_changed_at column
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'password_changed_at'`
    );
    if (cols.length === 0) {
      await pool.query('ALTER TABLE `User` ADD COLUMN password_changed_at DATETIME DEFAULT NULL');
    }
    console.log('Database migration: password_changed_at column ready');

    // Migration: PasswordResetRequest table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS PasswordResetRequest (
        request_id   INT         NOT NULL AUTO_INCREMENT,
        user_id      INT         NOT NULL,
        status       VARCHAR(20) NOT NULL DEFAULT 'Pending',
        requested_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (request_id),
        KEY idx_prr_user_id (user_id),
        KEY idx_prr_status  (status),
        CONSTRAINT fk_prr_user FOREIGN KEY (user_id) REFERENCES \`User\` (user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Database migration: PasswordResetRequest table ready');

    // Migration: Course table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Course (
        course_id   INT          NOT NULL AUTO_INCREMENT,
        course_name VARCHAR(150) NOT NULL,
        description VARCHAR(500) DEFAULT NULL,
        created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (course_id),
        UNIQUE KEY uq_course_name (course_name)
      ) ENGINE=InnoDB
    `);
    console.log('Database migration: Course table ready');

    // Migration: Course — add new columns if missing
    const courseColsToAdd = [
      { name: 'tuition_fee', ddl: 'DECIMAL(15,2) DEFAULT NULL' },
      { name: 'start_date',  ddl: 'DATE DEFAULT NULL' },
      { name: 'end_date',    ddl: 'DATE DEFAULT NULL' },
      { name: 'status',      ddl: "VARCHAR(30) NOT NULL DEFAULT 'Wait for active'" },
    ];
    for (const col of courseColsToAdd) {
      const [colCheck] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Course' AND COLUMN_NAME = ?`,
        [col.name]
      );
      if (colCheck.length === 0) {
        await pool.query(`ALTER TABLE Course ADD COLUMN ${col.name} ${col.ddl}`);
        console.log(`Database migration: Course.${col.name} column added`);
      }
    }

    // Migration: Class table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`Class\` (
        class_id     INT          NOT NULL AUTO_INCREMENT,
        course_id    INT          NOT NULL,
        class_name   VARCHAR(150) NOT NULL,
        teacher_name VARCHAR(100) NOT NULL,
        start_date   DATE         NOT NULL,
        end_date     DATE         DEFAULT NULL,
        capacity     INT          NOT NULL DEFAULT 30,
        status       VARCHAR(30)  NOT NULL DEFAULT 'Waiting for Activation',
        created_by   INT          DEFAULT NULL,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (class_id),
        KEY idx_class_course (course_id),
        CONSTRAINT fk_class_course FOREIGN KEY (course_id) REFERENCES Course (course_id),
        CONSTRAINT fk_class_creator FOREIGN KEY (created_by) REFERENCES \`User\` (user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('Database migration: Class table ready');
  } catch (err) {
    console.error('Migration warning:', err.message);
  }
});
