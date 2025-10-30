import express from 'express';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { config } from '../../config/config.mjs';
import { generateToken, authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

// Database connection pool
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

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, cik, ccc } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    const db = getDbPool();

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Encrypt CCC if provided
    let cccEncrypted = null;
    if (ccc) {
      // Store encrypted CCC using AES encryption
      cccEncrypted = await db.query(
        'SELECT AES_ENCRYPT(?, ?) as encrypted',
        [ccc, config.jwt.secret]
      ).then(([rows]) => rows[0].encrypted);
    }

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, name, cik, ccc_encrypted) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, name || null, cik || null, cccEncrypted]
    );

    // Generate token
    const user = {
      id: result.insertId,
      email,
      name,
      cik,
    };

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        cik: user.cik,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    const db = getDbPool();

    // Get user
    const [users] = await db.query(
      'SELECT id, email, password_hash, name, cik, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        cik: user.cik,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const db = getDbPool();

    const [users] = await db.query(
      'SELECT id, email, name, cik, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

// Logout (optional - mainly for session cleanup)
router.post('/logout', authenticateToken, async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint is mainly for audit/logging purposes
  res.json({ message: 'Logged out successfully' });
});

// Change password
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current and new passwords are required',
        code: 'MISSING_FIELDS',
      });
    }

    const db = getDbPool();

    // Get current password hash
    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD',
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


