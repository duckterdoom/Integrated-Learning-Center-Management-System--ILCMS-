/**
 * setup.js — One-time setup script.
 * Creates the database, all tables, migrations, and seeds the Admin account.
 *
 * Run once before starting the backend:
 *   node database/setup.js
 */
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });

  console.log('Connected to MySQL...');

  // ── 1. Create database ───────────────────────────────────────────────────
  await conn.query(
    'CREATE DATABASE IF NOT EXISTS ilcms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );
  await conn.query('USE ilcms_db');
  console.log('✓ Database ready');

  // ── 2. Create tables ─────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS Role (
      role_id     INT          NOT NULL AUTO_INCREMENT,
      role_name   VARCHAR(50)  NOT NULL,
      description VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (role_id),
      UNIQUE KEY uq_role_name (role_name)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`User\` (
      user_id             INT           NOT NULL AUTO_INCREMENT,
      username            VARCHAR(50)   NOT NULL,
      full_name           VARCHAR(100)  DEFAULT NULL,
      password            VARCHAR(255)  NOT NULL,
      email               VARCHAR(100)  NOT NULL,
      role_id             INT           NOT NULL,
      status              VARCHAR(20)   NOT NULL DEFAULT 'Active',
      created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      password_changed_at DATETIME      DEFAULT NULL,
      PRIMARY KEY (user_id),
      UNIQUE KEY uq_username (username),
      UNIQUE KEY uq_email    (email),
      KEY idx_role_id (role_id),
      KEY idx_status  (status),
      CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES Role (role_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
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

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Course (
      course_id   INT            NOT NULL AUTO_INCREMENT,
      course_name VARCHAR(100)   NOT NULL,
      description TEXT           DEFAULT NULL,
      duration    INT            DEFAULT NULL,
      fee         DECIMAL(10,2)  DEFAULT NULL,
      created_by  INT            DEFAULT NULL,
      PRIMARY KEY (course_id),
      KEY idx_course_created_by (created_by),
      CONSTRAINT fk_course_user FOREIGN KEY (created_by) REFERENCES \`User\` (user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Student (
      student_id        INT          NOT NULL AUTO_INCREMENT,
      student_name      VARCHAR(100) NOT NULL,
      date_of_birth     DATE         DEFAULT NULL,
      parent_phone      VARCHAR(20)  DEFAULT NULL,
      parent_email      VARCHAR(100) DEFAULT NULL,
      external_username VARCHAR(50)  DEFAULT NULL,
      external_password VARCHAR(50)  DEFAULT NULL,
      created_by        INT          DEFAULT NULL,
      PRIMARY KEY (student_id),
      KEY idx_student_created_by (created_by),
      CONSTRAINT fk_student_user FOREIGN KEY (created_by) REFERENCES \`User\` (user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Class (
      class_id     INT          NOT NULL AUTO_INCREMENT,
      course_id    INT          NOT NULL,
      class_name   VARCHAR(100) NOT NULL,
      teacher_name VARCHAR(100) DEFAULT NULL,
      start_date   DATE         DEFAULT NULL,
      capacity     INT          DEFAULT NULL,
      status       VARCHAR(20)  NOT NULL DEFAULT 'Active',
      created_by   INT          DEFAULT NULL,
      PRIMARY KEY (class_id),
      KEY idx_class_course_id  (course_id),
      KEY idx_class_created_by (created_by),
      CONSTRAINT fk_class_course FOREIGN KEY (course_id)  REFERENCES Course (course_id),
      CONSTRAINT fk_class_user   FOREIGN KEY (created_by) REFERENCES \`User\` (user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Enrollment (
      enrollment_id INT         NOT NULL AUTO_INCREMENT,
      student_id    INT         NOT NULL,
      class_id      INT         NOT NULL,
      enroll_date   DATE        DEFAULT NULL,
      status        VARCHAR(20) NOT NULL DEFAULT 'Active',
      PRIMARY KEY (enrollment_id),
      UNIQUE KEY uq_enrollment (student_id, class_id),
      KEY idx_enrollment_class (class_id),
      CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES Student (student_id),
      CONSTRAINT fk_enroll_class   FOREIGN KEY (class_id)   REFERENCES Class   (class_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Attendance (
      attendance_id INT         NOT NULL AUTO_INCREMENT,
      enrollment_id INT         NOT NULL,
      class_date    DATE        NOT NULL,
      status        VARCHAR(20) NOT NULL DEFAULT 'Present',
      PRIMARY KEY (attendance_id),
      KEY idx_attendance_enrollment (enrollment_id),
      CONSTRAINT fk_attendance_enrollment FOREIGN KEY (enrollment_id) REFERENCES Enrollment (enrollment_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Score (
      score_id      INT            NOT NULL AUTO_INCREMENT,
      enrollment_id INT            NOT NULL,
      score_type    VARCHAR(50)    DEFAULT NULL,
      score_value   DECIMAL(5,2)   DEFAULT NULL,
      PRIMARY KEY (score_id),
      KEY idx_score_enrollment (enrollment_id),
      CONSTRAINT fk_score_enrollment FOREIGN KEY (enrollment_id) REFERENCES Enrollment (enrollment_id)
    ) ENGINE=InnoDB
  `);

  console.log('✓ Tables ready');

  // ── 3. Migration: add password_changed_at if missing ────────────────────
  const [cols] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = 'ilcms_db' AND TABLE_NAME = 'User' AND COLUMN_NAME = 'password_changed_at'`
  );
  if (cols.length === 0) {
    await conn.query('ALTER TABLE `User` ADD COLUMN password_changed_at DATETIME DEFAULT NULL');
    console.log('✓ Migration: password_changed_at column added');
  }

  // ── 4. Seed roles ────────────────────────────────────────────────────────
  await conn.query(`
    INSERT IGNORE INTO Role (role_id, role_name, description) VALUES
      (1, 'Admin', 'System administrator with full access'),
      (2, 'Staff', 'Teaching staff with class management access'),
      (3, 'Sale',  'Sales staff with student directory access')
  `);
  console.log('✓ Roles seeded');

  // ── 5. Seed Admin account ────────────────────────────────────────────────
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  const hash = await bcrypt.hash('admin123', rounds);
  await conn.query(
    `INSERT INTO \`User\` (username, full_name, password, email, role_id, status)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password = VALUES(password)`,
    ['admin', 'System Admin', hash, 'admin@ilcms.local', 1, 'Active']
  );
  console.log('✓ Admin account ready  (username: admin  /  password: admin123)');

  await conn.end();
  console.log('\n✅ Setup complete! You can now run: npm run dev');
  process.exit(0);
}

setup().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  console.error('→ Make sure Laragon MySQL is running and DB_PASSWORD in .env is correct.');
  process.exit(1);
});
