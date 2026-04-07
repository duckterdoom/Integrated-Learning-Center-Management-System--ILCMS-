import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { validateCreateCourse, validateUpdateCourse, validateCourseId } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/',        getCourses);
router.post('/',       validateCreateCourse, createCourse);
router.put('/:id',    validateUpdateCourse, updateCourse);
router.delete('/:id', validateCourseId,     deleteCourse);

export default router;
