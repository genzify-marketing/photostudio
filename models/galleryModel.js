const pool = require('../config/db');

const fields = 'id, cloudinary_url AS url, public_id AS publicId, title, category, description, upload_date AS uploadDate';

async function list(category) {
  if (category && category !== 'all') {
    const [rows] = await pool.execute(`SELECT ${fields} FROM gallery_images WHERE category = ? ORDER BY upload_date DESC`, [category]);
    return rows;
  }
  const [rows] = await pool.execute(`SELECT ${fields} FROM gallery_images ORDER BY upload_date DESC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${fields} FROM gallery_images WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ url, publicId, title, category, description }) {
  const [result] = await pool.execute(
    'INSERT INTO gallery_images (cloudinary_url, public_id, title, category, description) VALUES (?, ?, ?, ?, ?)',
    [url, publicId, title, category, description || null]
  );
  return findById(result.insertId);
}

async function update(id, { title, category, description }) {
  await pool.execute(
    'UPDATE gallery_images SET title = ?, category = ?, description = ? WHERE id = ?',
    [title, category, description || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM gallery_images WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
