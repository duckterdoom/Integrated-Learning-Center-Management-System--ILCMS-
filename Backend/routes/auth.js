import express from 'express';
import { login, logout, refresh, forgotPassword } from '../controllers/authController.js';
import { validateLogin, validateForgotPassword } from '../middleware/validateMiddleware.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh  — issues new access token via HTTP-only refresh cookie
router.post('/refresh', refresh);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, forgotPassword);

export default router;
