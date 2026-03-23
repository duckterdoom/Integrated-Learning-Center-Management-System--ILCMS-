import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function issueTokens(res, payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return accessToken;
}

// ── POST /api/auth/login ───────────────────────────────────────────────────

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ message: first.msg });
  }

  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.password, u.status,
              r.role_id, r.role_name
       FROM \`User\` u
       JOIN Role r ON u.role_id = r.role_id
       WHERE u.username = ?`,
      [username]
    );

    // Generic message — prevents username harvesting (AC8)
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Check account status before comparing password (AC7 / Inactive Block)
    if (user.status !== 'Active') {
      return res.status(403).json({
        message: 'Your account is disabled. Please contact Admin',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = {
      userId:   user.user_id,
      username: user.username,
      roleId:   user.role_id,
      roleName: user.role_name,
    };

    const accessToken = issueTokens(res, payload);

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        userId:   user.user_id,
        username: user.username,
        fullName: user.full_name,
        roleName: user.role_name,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── POST /api/auth/logout ──────────────────────────────────────────────────

export const logout = (_req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
  return res.status(200).json({ message: 'Logged out successfully' });
};

// ── POST /api/auth/refresh ─────────────────────────────────────────────────

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.status, u.password_changed_at,
              r.role_id, r.role_name
       FROM \`User\` u
       JOIN Role r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [decoded.userId]
    );

    if (rows.length === 0 || rows[0].status !== 'Active') {
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
      return res.status(403).json({ message: 'Account not found or disabled' });
    }

    // If password was changed after this token was issued, force re-login
    const { password_changed_at } = rows[0];
    if (password_changed_at) {
      const changedAtSec = Math.floor(new Date(password_changed_at).getTime() / 1000);
      if (decoded.iat < changedAtSec) {
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
        return res.status(401).json({ message: 'Password has been changed. Please log in again.' });
      }
    }

    const user = rows[0];
    const payload = {
      userId:   user.user_id,
      username: user.username,
      roleId:   user.role_id,
      roleName: user.role_name,
    };

    const accessToken = issueTokens(res, payload);
    return res.status(200).json({ accessToken });
  } catch (err) {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────
// User Story 2: User submits username → Admin is flagged in dashboard

export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ message: first.msg });
  }

  const { username } = req.body;

  try {
    // AC3: Verify username exists
    const [users] = await pool.query(
      'SELECT user_id FROM `User` WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Username does not exist in the system' });
    }

    const userId = users[0].user_id;

    // A1: Prevent duplicate pending request
    const [existing] = await pool.query(
      "SELECT request_id FROM PasswordResetRequest WHERE user_id = ? AND status = 'Pending'",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'A request is already pending for this account',
      });
    }

    await pool.query(
      'INSERT INTO PasswordResetRequest (user_id) VALUES (?)',
      [userId]
    );

    return res.status(200).json({
      message: 'Request submitted successfully. Please contact your Admin for your new password.',
    });
  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
