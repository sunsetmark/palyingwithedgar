import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticateToken);

const upload = multer({ dest: '/tmp/' });

// Upload exhibit
router.post('/:filingId/upload', upload.single('file'), async (req, res) => {
  // TODO: Upload file to S3 and save metadata
  res.json({ id: 1, filename: req.file.originalname });
});

// Get exhibits for filing
router.get('/:filingId', async (req, res) => {
  // TODO: Get exhibits from database
  res.json([]);
});

// Delete exhibit
router.delete('/:id', async (req, res) => {
  // TODO: Delete exhibit from S3 and database
  res.json({ message: 'Exhibit deleted' });
});

export default router;
