import { body, param, query } from 'express-validator';

// ── Auth ───────────────────────────────────────────────────────────────────

export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Field username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),

  body('password')
    .notEmpty().withMessage('Field password is required')
    .isLength({ min: 6, max: 50 }).withMessage('Password must be 6–50 characters'),
];

export const validateForgotPassword = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
];

// ── User management ────────────────────────────────────────────────────────

export const validateCreateUser = [
  body('username')
    .trim()
    .notEmpty().withMessage('Field username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers and underscores'),

  body('full_name')
    .trim()
    .notEmpty().withMessage('Field full_name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Field email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters'),

  body('role_id')
    .notEmpty().withMessage('Please select a role')
    .isInt({ min: 1 }).withMessage('Invalid role'),

  body('password')
    .notEmpty().withMessage('Field password is required')
    .isLength({ min: 6, max: 50 }).withMessage('Password must be 6–50 characters'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

export const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),

  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters'),

  body('role_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid role'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

export const validateUserId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),
];

export const validateUserSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),
];
