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

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters'),

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

// ── Course management ──────────────────────────────────────────────────────

export const validateCreateCourse = [
  body('course_name')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Course name must be 1–150 characters'),

  body('tuition_fee')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),

  body('start_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),

  body('status')
    .optional()
    .isIn(['Wait for active', 'Active', 'Finish']).withMessage('Invalid status'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
];

export const validateUpdateCourse = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid course ID'),

  body('course_name')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Course name must be 1–150 characters'),

  body('tuition_fee')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),

  body('start_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Wait for active', 'Active', 'Finish']).withMessage('Invalid status'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
];

export const validateCourseId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid course ID'),
];

// ── Class management ───────────────────────────────────────────────────────

export const validateCreateClass = [
  body('course_id')
    .notEmpty().withMessage('Please select a course')
    .isInt({ min: 1 }).withMessage('Invalid course'),

  body('class_name')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Class name must be 2–100 characters'),

  body('teacher_name')
    .trim()
    .notEmpty().withMessage('Teacher name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Teacher name must be 2–100 characters'),

  body('start_date')
    .notEmpty().withMessage('Start date is required')
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 9999 }).withMessage('Capacity must be a number between 1 and 9999'),

  body('status')
    .optional()
    .isIn(['Waiting for Activation', 'Active', 'Finish'])
    .withMessage('Invalid status value'),
];

export const validateUpdateClass = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid class ID'),

  body('course_id')
    .notEmpty().withMessage('Please select a course')
    .isInt({ min: 1 }).withMessage('Invalid course'),

  body('class_name')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Class name must be 2–100 characters'),

  body('teacher_name')
    .trim()
    .notEmpty().withMessage('Teacher name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Teacher name must be 2–100 characters'),

  body('start_date')
    .notEmpty().withMessage('Start date is required')
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 9999 }).withMessage('Capacity must be a number between 1 and 9999'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Waiting for Activation', 'Active', 'Finish'])
    .withMessage('Invalid status value'),
];

export const validateClassId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid class ID'),
];

// ── Material management ────────────────────────────────────────────────────

export const validateCreateMaterial = [
  body('title')
    .trim()
    .notEmpty().withMessage('Material title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),

  body('course_id')
    .notEmpty().withMessage('Course is required')
    .isInt({ min: 1 }).withMessage('Invalid course'),
];

export const validateUpdateMaterial = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid material ID'),

  body('title')
    .trim()
    .notEmpty().withMessage('Material title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
];

export const validateMaterialId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid material ID'),
];
