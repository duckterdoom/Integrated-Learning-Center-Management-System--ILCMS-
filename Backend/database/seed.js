/**
 * seed.js — Creates the default Admin account with a bcrypt-hashed password.
 * Run once after importing schema.sql:
 *   node database/seed.js
 */
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN = {
  username:  'admin',
  full_name: 'System Admin',
  password:  'admin123',
  email:     'admin@ilcms.local',
  role_id:   1,
  status:    'Active',
};

async function seed() {
  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hash = await bcrypt.hash(ADMIN.password, rounds);

    await pool.query(
      `INSERT INTO \`User\` (username, full_name, password, email, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [ADMIN.username, ADMIN.full_name, hash, ADMIN.email, ADMIN.role_id, ADMIN.status]
    );

    console.log(`✓ Admin account seeded (username: ${ADMIN.username})`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
