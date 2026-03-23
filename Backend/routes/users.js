import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  setPassword,
  getPendingResetRequests,
} from '../controllers/userController.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserSearch,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

// GET  /api/users                    — paginated list with optional search
router.get('/', validateUserSearch, getUsers);

// GET  /api/users/reset-requests     — pending forgot-password requests (Admin dashboard)
router.get('/reset-requests', getPendingResetRequests);

// POST /api/users                    — create new Staff/Sale account
router.post('/', validateCreateUser, createUser);

// PUT  /api/users/:id                — update full_name, role_id, status
router.put('/:id', validateUpdateUser, updateUser);

// DELETE /api/users/:id              — remove user (cannot delete self)
router.delete('/:id', validateUserId, deleteUser);

// POST /api/users/:id/reset-password — Admin generates temp password
router.post('/:id/reset-password', validateUserId, resetPassword);

// PUT  /api/users/:id/set-password  — Admin sets a specific password
router.put('/:id/set-password', validateUserId, setPassword);

export default router;
