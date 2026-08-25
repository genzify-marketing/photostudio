require('dotenv').config();

const bcrypt = require('bcryptjs');
const adminModel = require('../models/adminModel');
const pool = require('../config/db');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running npm run create-admin.');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  if (await adminModel.findByEmail(email)) throw new Error('An admin with that email already exists.');
  const passwordHash = await bcrypt.hash(password, 12);
  await adminModel.createAdmin(email, passwordHash);
  console.log(`Admin created for ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
