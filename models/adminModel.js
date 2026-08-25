const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function createAdmin(email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );
  return { id: result.insertId, email };
}

module.exports = { findByEmail, createAdmin };
