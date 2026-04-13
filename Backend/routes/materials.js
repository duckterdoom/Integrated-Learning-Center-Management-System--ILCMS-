import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materialController.js';

import {
  validateCreateMaterial,
  validateUpdateMaterial,
  validateMaterialId,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'materials'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX files are allowed'));
    }
  },
});

// Multer error handler
function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size must not exceed 20 MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}

router.get('/', getMaterials);
router.post('/', handleUpload, validateCreateMaterial, createMaterial);
router.get('/:id', validateMaterialId, getMaterial);
router.put('/:id', handleUpload, validateUpdateMaterial, updateMaterial);
router.delete('/:id', validateMaterialId, deleteMaterial);

export default router;
