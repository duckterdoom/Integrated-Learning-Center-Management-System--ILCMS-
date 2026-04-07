import { validationResult } from 'express-validator';
import pool from '../config/db.js';

function validationFail(res, errors) {
  return res.status(400).json({ message: errors.array()[0].msg });
}

// ── GET /api/classes ───────────────────────────────────────────────────────
export const getClasses = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.class_id, c.class_name, c.teacher_name,
              c.start_date, c.end_date, c.capacity, c.status,
              co.course_id, co.course_name
       FROM \`Class\` c
       JOIN Course co ON c.course_id = co.course_id
       ORDER BY c.class_id ASC`
    );
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('[getClasses]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── POST /api/classes ──────────────────────────────────────────────────────
export const createClass = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const { course_id, class_name, teacher_name, start_date, end_date, capacity, status } = req.body;
  const createdBy = req.user?.userId || null;

  try {
    // AC: course must exist
    const [[course]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_id = ?', [course_id]
    );
    if (!course) {
      return res.status(400).json({ message: 'Selected course does not exist.' });
    }

    // AC: class name must be unique within same course
    const [[dup]] = await pool.query(
      'SELECT class_id FROM `Class` WHERE course_id = ? AND class_name = ?',
      [course_id, class_name.trim()]
    );
    if (dup) {
      return res.status(409).json({ message: 'Class name already exists for this course.' });
    }

    // AC: start date must be today or future
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(start_date);
    if (start < today) {
      return res.status(400).json({ message: 'Start date must be today or a future date.' });
    }

    const finalStatus = status || 'Waiting for Activation';

    const [result] = await pool.query(
      `INSERT INTO \`Class\` (course_id, class_name, teacher_name, start_date, end_date, capacity, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_id, class_name.trim(), teacher_name.trim(), start_date, end_date || null, capacity, finalStatus, createdBy]
    );

    return res.status(201).json({ message: 'Class created successfully.', class_id: result.insertId });
  } catch (err) {
    console.error('[createClass]', err);
    return res.status(500).json({ message: 'Unable to create class.' });
  }
};

// ── PUT /api/classes/:id ───────────────────────────────────────────────────
export const updateClass = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationFail(res, errors);

  const classId = parseInt(req.params.id, 10);
  const { course_id, class_name, teacher_name, start_date, end_date, capacity, status } = req.body;

  try {
    const [[existing]] = await pool.query(
      'SELECT class_id FROM `Class` WHERE class_id = ?', [classId]
    );
    if (!existing) return res.status(404).json({ message: 'Class not found.' });

    // Check course exists
    const [[course]] = await pool.query(
      'SELECT course_id FROM Course WHERE course_id = ?', [course_id]
    );
    if (!course) return res.status(400).json({ message: 'Selected course does not exist.' });

    // Check duplicate class name (excluding itself)
    const [[dup]] = await pool.query(
      'SELECT class_id FROM `Class` WHERE course_id = ? AND class_name = ? AND class_id != ?',
      [course_id, class_name.trim(), classId]
    );
    if (dup) return res.status(409).json({ message: 'Class name already exists for this course.' });

    await pool.query(
      `UPDATE \`Class\`
       SET course_id=?, class_name=?, teacher_name=?, start_date=?, end_date=?, capacity=?, status=?
       WHERE class_id=?`,
      [course_id, class_name.trim(), teacher_name.trim(), start_date, end_date || null, capacity, status, classId]
    );

    return res.status(200).json({ message: 'Class updated successfully.' });
  } catch (err) {
    console.error('[updateClass]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ── DELETE /api/classes/:id ────────────────────────────────────────────────
export const deleteClass = async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  try {
    const [[existing]] = await pool.query(
      'SELECT class_id FROM `Class` WHERE class_id = ?', [classId]
    );
    if (!existing) return res.status(404).json({ message: 'Class not found.' });

    await pool.query('DELETE FROM `Class` WHERE class_id = ?', [classId]);
    return res.status(200).json({ message: 'Class deleted successfully.' });
  } catch (err) {
    console.error('[deleteClass]', err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
