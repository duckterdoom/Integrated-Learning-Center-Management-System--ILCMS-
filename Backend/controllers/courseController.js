import { validationResult } from 'express-validator';
import pool from '../config/db.js';

function validationFail(res, errors) {
  return res.status(400).json({ message: errors.array()[0].msg });
}

// ── GET /api/courses ───────────────────────────────────────────────────────
export const getCourses = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT course_id, course_name, tuition_fee, start_date, end_date, status, description, created_at
       FROM Course ORDER BY course_name ASC`
    );
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('[getCourses]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── POST /api/courses ──────────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const { course_name, tuition_fee, start_date, end_date, status, description } = req.body;

  try {
    const [[dup]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_name = ?', [course_name.trim()]
    );
    if (dup) {
      return res.status(409).json({ message: 'Course name already exists.' });
    }

    const [result] = await pool.query(
      `INSERT INTO Course (course_name, tuition_fee, start_date, end_date, status, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        course_name.trim(),
        tuition_fee || null,
        start_date || null,
        end_date || null,
        status || 'Wait for active',
        description || null,
      ]
    );
    return res.status(201).json({ message: 'Course created successfully.', course_id: result.insertId });
  } catch (err) {
    console.error('[createCourse]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── PUT /api/courses/:id ───────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const courseId = parseInt(req.params.id, 10);
  const { course_name, tuition_fee, start_date, end_date, status, description } = req.body;

  try {
    const [[existing]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_id = ?', [courseId]
    );
    if (!existing) return res.status(404).json({ message: 'Course not found.' });

    // Check duplicate name (excluding itself)
    const [[dup]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_name = ? AND course_id != ?',
      [course_name.trim(), courseId]
    );
    if (dup) return res.status(409).json({ message: 'Course name already exists.' });

    await pool.query(
      `UPDATE Course
       SET course_name=?, tuition_fee=?, start_date=?, end_date=?, status=?, description=?
       WHERE course_id=?`,
      [
        course_name.trim(),
        tuition_fee || null,
        start_date || null,
        end_date || null,
        status,
        description || null,
        courseId,
      ]
    );
    return res.status(200).json({ message: 'Course updated successfully.' });
  } catch (err) {
    console.error('[updateCourse]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── DELETE /api/courses/:id ────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  try {
    const [[existing]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_id = ?', [courseId]
    );
    if (!existing) return res.status(404).json({ message: 'Course not found.' });

    // Prevent delete if classes exist under this course
    const [[cls]] = await pool.query(
      'SELECT class_id FROM `Class` WHERE course_id = ? LIMIT 1', [courseId]
    );
    if (cls) {
      return res.status(409).json({ message: 'Cannot delete a course that has existing classes.' });
    }

    await pool.query('DELETE FROM Course WHERE course_id = ?', [courseId]);
    return res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('[deleteCourse]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
