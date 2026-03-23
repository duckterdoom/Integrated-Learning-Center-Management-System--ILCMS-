import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function validationFail(res, errors) {
  const first = errors.array()[0];
  return res.status(400).json({ message: first.msg });
}

function generateTempPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  // Vary length between 8 and 12
  const len = Math.floor(Math.random() * 5) + 8; // 8–12
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ── GET /api/users ─────────────────────────────────────────────────────────
// Paginated list with optional search. AC3, AC4

export const getUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const page   = parseInt(req.query.page  || '1',  10);
  const limit  = parseInt(req.query.limit || '10', 10);
  const search = req.query.search?.trim() || '';
  const offset = (page - 1) * limit;

  try {
    const likeParam = `%${search}%`;

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.email,
              r.role_id, r.role_name, u.status, u.created_at
       FROM \`User\` u
       JOIN Role r ON u.role_id = r.role_id
       WHERE (u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [likeParam, likeParam, likeParam, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`User\` u
       WHERE (u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)`,
      [likeParam, likeParam, likeParam]
    );

    return res.status(200).json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[getUsers]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── POST /api/users ────────────────────────────────────────────────────────
// AC1 Create User, AC2 Duplicate Validation

export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const { username, full_name, email, role_id, password, status = 'Active' } = req.body;

  // Only Staff (2) and Sale (3) accounts can be created
  if (parseInt(role_id, 10) === 1) {
    return res.status(403).json({ message: 'Cannot create an Admin account' });
  }

  try {
    // AC2: Check uniqueness
    const [existing] = await pool.query(
      'SELECT user_id FROM `User` WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(password, rounds);

    const [result] = await pool.query(
      `INSERT INTO \`User\` (username, full_name, password, email, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, full_name, hashed, email, role_id, status]
    );

    return res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('[createUser]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────────────────
// AC5 Update User — only full_name, role_id, status are editable (AC6)

export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const userId = parseInt(req.params.id, 10);
  const { full_name, role_id, status } = req.body;

  // Build dynamic SET clause from provided fields only
  const fields = [];
  const values = [];

  if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name); }
  if (role_id   !== undefined) { fields.push('role_id = ?');   values.push(role_id);   }
  if (status    !== undefined) { fields.push('status = ?');    values.push(status);    }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  // Cannot change role to Admin
  if (role_id !== undefined && parseInt(role_id, 10) === 1) {
    return res.status(403).json({ message: 'Cannot assign Admin role' });
  }

  values.push(userId);

  try {
    // Cannot edit the Admin account
    const [[target]] = await pool.query('SELECT role_id FROM `User` WHERE user_id = ?', [userId]);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role_id === 1) {
      return res.status(403).json({ message: 'Cannot edit the Admin account' });
    }

    const [result] = await pool.query(
      `UPDATE \`User\` SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('[updateUser]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── DELETE /api/users/:id ──────────────────────────────────────────────────
// AC8 Delete User — cannot delete self

export const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const userId = parseInt(req.params.id, 10);

  // Cannot delete self (Business rule)
  if (req.user.userId === userId) {
    return res.status(403).json({ message: 'Action prohibited: cannot delete your own account' });
  }

  try {
    // Cannot delete the Admin account
    const [[target]] = await pool.query('SELECT role_id FROM `User` WHERE user_id = ?', [userId]);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role_id === 1) {
      return res.status(403).json({ message: 'Cannot delete the Admin account' });
    }

    const [result] = await pool.query(
      'DELETE FROM `User` WHERE user_id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('[deleteUser]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── POST /api/users/:id/reset-password ─────────────────────────────────────
// Admin Reset Password — AC1–AC5 from User Story 3

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const userId = parseInt(req.params.id, 10);

  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, status FROM `User` WHERE user_id = ? AND role_id != 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found or cannot reset Admin password' });
    }

    const user = rows[0];
    const tempPassword = generateTempPassword();
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(tempPassword, rounds);

    await pool.query(
      'UPDATE `User` SET password = ? WHERE user_id = ?',
      [hashed, userId]
    );

    // Mark any pending reset requests for this user as resolved
    await pool.query(
      "UPDATE PasswordResetRequest SET status = 'Resolved' WHERE user_id = ? AND status = 'Pending'",
      [userId]
    );

    const warning = user.status !== 'Active'
      ? ' Note: User is currently inactive. They must be set to Active to log in.'
      : '';

    return res.status(200).json({
      message: `Password reset successful. Please share the temporary password with the user.${warning}`,
      tempPassword, // Admin copies and shares this manually
    });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ message: 'Unable to reset password. Please check your connection.' });
  }
};

// ── PUT /api/users/:id/set-password ────────────────────────────────────────
// Admin sets a specific password for a Staff/Sale account (no temp generation)

export const setPassword = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { password } = req.body;

  if (!password || password.trim().length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const [[target]] = await pool.query(
      'SELECT role_id FROM `User` WHERE user_id = ?', [userId]
    );
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role_id === 1) {
      return res.status(403).json({ message: 'Cannot change Admin password' });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(password.trim(), rounds);
    await pool.query('UPDATE `User` SET password = ? WHERE user_id = ?', [hashed, userId]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[setPassword]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── GET /api/users/reset-requests ─────────────────────────────────────────
// Admin dashboard — pending forgot-password requests (AC5 from User Story 2)

export const getPendingResetRequests = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pr.request_id, pr.requested_at, pr.status,
              u.user_id, u.username, u.full_name, u.email
       FROM PasswordResetRequest pr
       JOIN \`User\` u ON pr.user_id = u.user_id
       WHERE pr.status = 'Pending'
       ORDER BY pr.requested_at DESC`
    );

    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('[getPendingResetRequests]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
