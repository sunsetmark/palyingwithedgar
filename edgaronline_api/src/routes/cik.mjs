import express from 'express';
import mysql from 'mysql2/promise';
import { config } from '../../config/config.mjs';
import { authenticateToken } from '../middleware/auth.mjs';
import { formatCIK } from '../../../server/common.mjs';

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

// Validate CIK format
router.get('/validate/:cik', async (req, res, next) => {
  try {
    const { cik } = req.params;

    // Basic validation
    const cikNumber = parseInt(cik, 10);
    if (isNaN(cikNumber) || cikNumber < 0 || cikNumber > 9999999999) {
      return res.json({
        valid: false,
        error: 'Invalid CIK format',
      });
    }

    // Format CIK with leading zeros
    const formattedCIK = formatCIK(cikNumber);

    res.json({
      valid: true,
      cik: formattedCIK,
    });
  } catch (error) {
    next(error);
  }
});

// Get reporter info by CIK
router.get('/info/:cik', async (req, res, next) => {
  try {
    const { cik } = req.params;
    const formattedCIK = formatCIK(parseInt(cik, 10));

    const db = getDbPool();

    // First check cache
    const [cached] = await db.query(
      'SELECT * FROM reporters_cache WHERE cik = ?',
      [formattedCIK]
    );

    if (cached.length > 0) {
      return res.json(cached[0]);
    }

    // If not in cache, try to fetch from submission table
    const [submissions] = await db.query(
      `SELECT DISTINCT 
        fc.cik,
        fc.entity_name as name
      FROM feeds_file_cik fc
      WHERE fc.cik = ?
      AND fc.filer_type = 'R'
      ORDER BY fc.feeds_date DESC
      LIMIT 1`,
      [BigInt(formattedCIK)]
    );

    if (submissions.length > 0) {
      const info = {
        cik: formattedCIK,
        name: submissions[0].name,
      };

      // Cache the result
      await db.query(
        `INSERT INTO reporters_cache (cik, name) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), last_updated = NOW()`,
        [formattedCIK, info.name]
      );

      return res.json(info);
    }

    // Not found
    res.status(404).json({
      error: 'Reporter not found',
      code: 'REPORTER_NOT_FOUND',
    });
  } catch (error) {
    next(error);
  }
});

// Verify CIK/CCC pair
router.post('/verify', async (req, res, next) => {
  try {
    const { cik, ccc } = req.body;

    if (!cik || !ccc) {
      return res.status(400).json({
        error: 'CIK and CCC are required',
        code: 'MISSING_FIELDS',
      });
    }

    // Format CIK
    const formattedCIK = formatCIK(parseInt(cik, 10));

    // In a real implementation, you would validate with SEC's system
    // For now, we'll just check format
    if (ccc.length !== 8) {
      return res.json({
        valid: false,
        error: 'Invalid CCC format (must be 8 characters)',
      });
    }

    // TODO: Implement actual SEC CIK/CCC verification
    // This would involve calling SEC's EDGAR system

    res.json({
      valid: true,
      cik: formattedCIK,
      message: 'CIK/CCC verification successful',
    });
  } catch (error) {
    next(error);
  }
});

export default router;


