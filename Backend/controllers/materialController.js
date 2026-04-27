import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

// GET /api/materials?course_id=X  (course_id optional — omit to get all)
export async function getMaterials(req, res) {
  const { course_id } = req.query;

  try {
    let rows;
    if (course_id) {
      [rows] = await pool.query(
        `SELECT m.*, u.username AS created_by_name
         FROM Material m
         LEFT JOIN \`User\` u ON m.created_by = u.user_id
         WHERE m.course_id = ?
         ORDER BY m.created_at DESC`,
        [course_id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT m.*, u.username AS created_by_name, c.course_name
         FROM Material m
         LEFT JOIN \`User\` u ON m.created_by = u.user_id
         LEFT JOIN Course c ON m.course_id = c.course_id
         ORDER BY m.created_at DESC`
      );
    }
    res.json({ data: rows });
  } catch (err) {
    console.error('[getMaterials]', err);
    res.status(500).json({ message: 'Failed to load materials' });
  }
}

// GET /api/materials/:id
export async function getMaterial(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const [[row]] = await pool.query('SELECT * FROM Material WHERE material_id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Material not found' });
    res.json(row);
  } catch (err) {
    console.error('[getMaterial]', err);
    res.status(500).json({ message: 'Failed to load material' });
  }
}

// POST /api/materials
export async function createMaterial(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { title, course_id, link_url } = req.body;
  const created_by = req.user?.userId || null;

  let file_url = null;
  let file_name = null;
  let file_size = null;

  if (req.file) {
    file_url = `/uploads/materials/${req.file.filename}`;
    file_name = req.file.originalname;
    file_size = req.file.size;
  }

  if (!file_url && (!link_url || !link_url.trim())) {
    return res.status(400).json({ message: 'Please provide a file or a link URL' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Material (course_id, title, file_url, link_url, file_name, file_size, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [course_id, title.trim(), file_url, link_url?.trim() || null, file_name, file_size, created_by]
    );
    res.status(201).json({ message: 'Material created', material_id: result.insertId });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[createMaterial]', err);
    res.status(500).json({ message: 'Failed to create material' });
  }
}

// PUT /api/materials/:id
export async function updateMaterial(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const [[existing]] = await pool.query('SELECT * FROM Material WHERE material_id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Material not found' });

    const { title, link_url } = req.body;

    let file_url = existing.file_url;
    let file_name = existing.file_name;
    let file_size = existing.file_size;
    let oldFilePath = null;

    if (req.file) {
      if (existing.file_url && existing.file_url.startsWith('/uploads/')) {
        oldFilePath = path.join(process.cwd(), existing.file_url);
      }
      file_url = `/uploads/materials/${req.file.filename}`;
      file_name = req.file.originalname;
      file_size = req.file.size;
    }

    const newLinkUrl = link_url !== undefined ? (link_url?.trim() || null) : existing.link_url;

    await pool.query(
      'UPDATE Material SET title = ?, file_url = ?, link_url = ?, file_name = ?, file_size = ? WHERE material_id = ?',
      [title.trim(), file_url, newLinkUrl, file_name, file_size, req.params.id]
    );

    if (oldFilePath) fs.unlink(oldFilePath, () => {});

    res.json({ message: 'Material updated' });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[updateMaterial]', err);
    res.status(500).json({ message: 'Failed to update material' });
  }
}

// DELETE /api/materials/:id
export async function deleteMaterial(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const [[existing]] = await pool.query('SELECT * FROM Material WHERE material_id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Material not found' });

    await pool.query('DELETE FROM Material WHERE material_id = ?', [req.params.id]);

    if (existing.file_url && existing.file_url.startsWith('/uploads/')) {
      fs.unlink(path.join(process.cwd(), existing.file_url), () => {});
    }

    res.json({ message: 'Material deleted' });
  } catch (err) {
    console.error('[deleteMaterial]', err);
    res.status(500).json({ message: 'Failed to delete material' });
  }
}
