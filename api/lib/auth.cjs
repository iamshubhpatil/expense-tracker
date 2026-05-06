const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('./database.cjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
}

async function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function getUserById(userId) {
  const result = await query(
    'SELECT id, email, first_name, last_name, role, email_verified, is_active, created_at FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );
  return result.rows[0] || null;
}

async function getUserByEmail(email) {
  const result = await query(
    'SELECT id, email, password_hash, role, email_verified, is_active FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function createUser(email, password, firstName = '', lastName = '') {
  const id = uuidv4();
  const passwordHash = hashPassword(password);
  
  const result = await query(
    'INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, false, true) RETURNING id, email, role',
    [id, email, passwordHash, firstName, lastName, 'user']
  );
  
  return result.rows[0];
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  getUserById,
  getUserByEmail,
  createUser,
};
