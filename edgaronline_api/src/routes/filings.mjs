import express from 'express';
import mysql from 'mysql2/promise';
import { config } from '../../config/config.mjs';
import { authenticateToken, authorizeOwnership } from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticateToken);

let dbPool = null;

function getDbPool() {
  if (!dbPool) {
    dbPool = mysql.createPool({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return dbPool;
}

// Get all drafts for current user
router.get('/drafts', async (req, res, next) => {
  try {
    const db = getDbPool();
    const [drafts] = await db.query(
      'SELECT id, form_type, draft_name, created_at, updated_at FROM filing_drafts WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(drafts);
  } catch (error) {
    next(error);
  }
});

// Get specific draft
router.get('/drafts/:id', authorizeOwnership('filing_drafts'), async (req, res, next) => {
  try {
    const db = getDbPool();
    const [drafts] = await db.query(
      'SELECT * FROM filing_drafts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json(drafts[0]);
  } catch (error) {
    next(error);
  }
});

// Create new draft
router.post('/drafts', async (req, res, next) => {
  try {
    const { form_type, draft_name, json_data } = req.body;

    const db = getDbPool();
    const [result] = await db.query(
      'INSERT INTO filing_drafts (user_id, form_type, draft_name, json_data) VALUES (?, ?, ?, ?)',
      [req.user.id, form_type, draft_name, JSON.stringify(json_data)]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Draft created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Update draft
router.put('/drafts/:id', authorizeOwnership('filing_drafts'), async (req, res, next) => {
  try {
    const { draft_name, json_data, xml_content } = req.body;

    const db = getDbPool();
    await db.query(
      'UPDATE filing_drafts SET draft_name = ?, json_data = ?, xml_content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [draft_name, JSON.stringify(json_data), xml_content, req.params.id, req.user.id]
    );

    res.json({ message: 'Draft updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete draft
router.delete('/drafts/:id', authorizeOwnership('filing_drafts'), async (req, res, next) => {
  try {
    const db = getDbPool();
    await db.query(
      'DELETE FROM filing_drafts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get XML preview
router.get('/drafts/:id/xml', authorizeOwnership('filing_drafts'), async (req, res, next) => {
  try {
    const db = getDbPool();
    const [drafts] = await db.query(
      'SELECT xml_content FROM filing_drafts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (drafts.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.set('Content-Type', 'application/xml');
    res.send(drafts[0].xml_content || '<!-- XML not yet generated -->');
  } catch (error) {
    next(error);
  }
});

export default router;


