import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import classRoutes from './routes/classes.js';
import materialRoutes from './routes/materials.js';
import { verifyToken, requireRole } from './middleware/authMiddleware.js';
import pool from './config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// ── Static files — uploaded materials ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Course & Class management — Admin + Staff + Sale (Sale has read-only access via their Academy page)
app.use('/api/courses',   verifyToken, requireRole(['Admin', 'Staff', 'Sale']), courseRoutes);
app.use('/api/classes',   verifyToken, requireRole(['Admin', 'Staff', 'Sale']), classRoutes);
app.use('/api/materials', verifyToken, requireRole(['Admin', 'Staff', 'Sale']), materialRoutes);

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

    // Migration: Material table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Material (
        material_id   INT          NOT NULL AUTO_INCREMENT,
        course_id     INT          NOT NULL,
        title         VARCHAR(200) NOT NULL,
        file_url      VARCHAR(500) DEFAULT NULL,
        link_url      VARCHAR(500) DEFAULT NULL,
        file_name     VARCHAR(255) DEFAULT NULL,
        file_size     BIGINT       DEFAULT NULL,
        created_by    INT          DEFAULT NULL,
        created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (material_id),
        KEY idx_material_course (course_id),
        CONSTRAINT fk_material_course  FOREIGN KEY (course_id)  REFERENCES Course (\`course_id\`) ON DELETE CASCADE,
        CONSTRAINT fk_material_creator FOREIGN KEY (created_by) REFERENCES \`User\` (user_id)    ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('Database migration: Material table ready');

    // ── Seed: insert sample data if tables are empty ───────────────────────
    const [[{ courseCount }]] = await pool.query('SELECT COUNT(*) AS courseCount FROM Course');
    if (courseCount === 0) {
      await pool.query(`
        INSERT INTO Course (course_name, tuition_fee, start_date, end_date, status, description) VALUES
        ('English for Beginners',      3500000,  '2026-01-10', '2026-06-10', 'Active',         'Foundation English course covering basic grammar, vocabulary, and everyday conversation. Suitable for those starting from scratch.'),
        ('Advanced Mathematics',       4200000,  '2026-02-01', '2026-08-01', 'Active',         'In-depth mathematics covering calculus, linear algebra, and statistics for university preparation.'),
        ('Programming Fundamentals',   5000000,  '2026-03-01', '2026-09-01', 'Active',         'Introduction to programming using Python. Covers variables, loops, functions, and basic data structures.'),
        ('Data Science & AI',          7500000,  '2026-04-15', '2026-10-15', 'Wait for active','Comprehensive course on data analysis, machine learning, and AI fundamentals using Python and real-world datasets.'),
        ('EOB - English for Business', 4800000,  '2026-03-20', '2026-09-20', 'Active',         'Business English course focusing on professional communication, report writing, and presentation skills.'),
        ('IELTS Preparation',          6000000,  '2026-05-01', '2026-11-01', 'Wait for active','Intensive IELTS preparation covering all four skills: Listening, Reading, Writing, and Speaking. Target band 6.5+.'),
        ('Web Development Bootcamp',   8000000,  '2026-06-01', '2026-12-01', 'Wait for active','Full-stack web development with HTML, CSS, JavaScript, React, and Node.js. Includes real project portfolio.'),
        ('Communication Skills',       3000000,  '2025-09-01', '2026-03-01', 'Finish',         'Practical course to develop interpersonal communication, public speaking, and team collaboration skills.')
      `);
      console.log('Database seed: Course sample data inserted');
    }

    // Migration: Class.schedule_info column
    const [[scheduleInfoCol]] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Class' AND COLUMN_NAME = 'schedule_info'`
    );
    if (!scheduleInfoCol) {
      await pool.query("ALTER TABLE `Class` ADD COLUMN schedule_info VARCHAR(20) DEFAULT NULL AFTER capacity");
      console.log('Database migration: Class.schedule_info column added');
    }

    // Migration: fix any schedule_info values that are not in the allowed set
    const [fixedRows] = await pool.query(`
      UPDATE \`Class\`
      SET schedule_info = CASE
        WHEN (class_id % 2) = 1 THEN 'MON-WED-FRI'
        ELSE 'TUE-THUR-SAT'
      END
      WHERE schedule_info NOT IN ('MON-WED-FRI', 'TUE-THUR-SAT')
         OR schedule_info IS NULL
    `);
    if (fixedRows.affectedRows > 0) {
      console.log(`Database migration: ${fixedRows.affectedRows} Class row(s) schedule_info corrected`);
    }

    const [[{ classCount }]] = await pool.query('SELECT COUNT(*) AS classCount FROM `Class`');
    if (classCount === 0) {
      await pool.query(`
        INSERT INTO \`Class\` (course_id, class_name, teacher_name, start_date, end_date, capacity, schedule_info, status) VALUES
        (1, 'ENG-2026-01',  'Nguyen Thi Lan',  '2026-01-10', '2026-04-10', 25, 'MON-WED-FRI', 'Active'),
        (1, 'ENG-2026-02',  'Tran Van Minh',   '2026-02-15', '2026-05-15', 20, 'TUE-THUR-SAT', 'Active'),
        (1, 'ENG-2026-03',  'Le Thi Hoa',      '2026-04-20', '2026-07-20', 30, 'TUE-THUR-SAT', 'Waiting for Activation'),
        (2, 'MATH-2026-01', 'Pham Van Duc',    '2026-02-01', '2026-05-01', 20, 'MON-WED-FRI', 'Active'),
        (2, 'MATH-2026-02', 'Hoang Thi Mai',   '2026-04-10', '2026-07-10', 25, 'TUE-THUR-SAT', 'Waiting for Activation'),
        (3, 'PROG-2026-01', 'Nguyen Van Khoa', '2026-03-01', '2026-06-01', 30, 'TUE-THUR-SAT', 'Active'),
        (3, 'PROG-2026-02', 'Bui Thi Thu',     '2026-05-01', '2026-08-01', 28, 'MON-WED-FRI', 'Waiting for Activation'),
        (4, 'DSA-2026-01',  'Vo Minh Tuan',    '2026-05-01', '2026-08-01', 20, 'TUE-THUR-SAT', 'Waiting for Activation'),
        (5, 'EOB-2026-01',  'Nguyen Thi Lan',  '2026-03-20', '2026-06-20', 20, 'MON-WED-FRI', 'Active'),
        (5, 'EOB-2026-02',  'Tran Thi Bich',   '2026-05-10', '2026-08-10', 18, 'TUE-THUR-SAT', 'Waiting for Activation'),
        (8, 'COM-2025-01',  'Le Van Phong',    '2025-09-01', '2026-01-01', 30, 'TUE-THUR-SAT', 'Finish'),
        (8, 'COM-2025-02',  'Pham Thi Ngoc',   '2025-10-01', '2026-02-01', 25, 'MON-WED-FRI', 'Finish')
      `);
      console.log('Database seed: Class sample data inserted');
    }
    // ── End seed ───────────────────────────────────────────────────────────

  } catch (err) {
    console.error('Migration warning:', err.message);
  }
});
