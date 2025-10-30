import jwt from 'jsonwebtoken';
import { config } from '../../config/config.mjs';
import mysql from 'mysql2/promise';

// Database connection
let dbConnection = null;

async function getDbConnection() {
  if (!dbConnection) {
    dbConnection = await mysql.createPool({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return dbConnection;
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      cik: user.cik,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(403).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    req.user = user;
    next();
  });
}

export function requireCCC(req, res, next) {
  const ccc = req.body.ccc;

  if (!ccc) {
    return res.status(401).json({
      error: 'CCC verification required',
      code: 'CCC_REQUIRED',
    });
  }

  // Verify CCC matches user's stored CCC
  verifyCCC(req.user.id, ccc)
    .then((valid) => {
      if (!valid) {
        return res.status(403).json({
          error: 'Invalid CCC',
          code: 'INVALID_CCC',
        });
      }
      next();
    })
    .catch((error) => {
      console.error('CCC verification error:', error);
      res.status(500).json({
        error: 'CCC verification failed',
        code: 'VERIFICATION_ERROR',
      });
    });
}

async function verifyCCC(userId, providedCCC) {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query(
      'SELECT AES_DECRYPT(ccc_encrypted, ?) as ccc FROM users WHERE id = ?',
      [config.jwt.secret, userId]
    );

    if (rows.length === 0) {
      return false;
    }

    // Compare decrypted CCC with provided CCC
    const storedCCC = rows[0].ccc?.toString();
    return storedCCC === providedCCC;
  } catch (error) {
    console.error('Error verifying CCC:', error);
    return false;
  }
}

export function authorizeOwnership(resourceTable) {
  return async (req, res, next) => {
    const resourceId = req.params.id || req.params.filingId;

    try {
      const isOwner = await checkOwnership(req.user.id, resourceTable, resourceId);

      if (!isOwner) {
        return res.status(403).json({
          error: 'Access denied',
          code: 'NOT_AUTHORIZED',
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        error: 'Authorization check failed',
        code: 'AUTHORIZATION_ERROR',
      });
    }
  };
}

async function checkOwnership(userId, resourceTable, resourceId) {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM ${resourceTable} WHERE id = ? AND user_id = ?`,
      [resourceId, userId]
    );
    return rows[0].count > 0;
  } catch (error) {
    console.error('Error checking ownership:', error);
    return false;
  }
}


