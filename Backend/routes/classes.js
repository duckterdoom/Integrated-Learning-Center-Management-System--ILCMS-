import express from 'express';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';
import {
  validateCreateClass,
  validateUpdateClass,
  validateClassId,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

// GET    /api/classes        — list all classes
router.get('/', getClasses);

// POST   /api/classes        — create a new class
router.post('/', validateCreateClass, createClass);

// PUT    /api/classes/:id    — update a class
router.put('/:id', validateUpdateClass, updateClass);

// DELETE /api/classes/:id    — delete a class
router.delete('/:id', validateClassId, deleteClass);

export default router;
