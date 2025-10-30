import express from 'express';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticateToken);

// Search issuers
router.get('/search', async (req, res) => {
  // TODO: Implement issuer search
  res.json({ results: [] });
});

// Get issuer info
router.get('/:cik', async (req, res) => {
  // TODO: Implement issuer info lookup
  res.json({ cik: req.params.cik });
});

export default router;
