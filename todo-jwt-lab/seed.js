require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // create tables if not exist (simple)
    const initSql = require('fs').readFileSync('./migrations/init.sql', 'utf8');
    await pool.query(initSql);

    const adminPass = await bcrypt.hash('AdminPass123', 10);
    const userPass = await bcrypt.hash('UserPass123', 10);

    await pool.query(
      `INSERT INTO users(username, email, password, role)
       VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO NOTHING`,
      ['admin', 'admin@example.com', adminPass]
    );
    await pool.query(
      `INSERT INTO users(username, email, password, role)
       VALUES ($1,$2,$3,'user') ON CONFLICT (email) DO NOTHING`,
      ['user', 'user@example.com', userPass]
    );
    console.log('Seed completed: admin@example.com / AdminPass123  and user@example.com / UserPass123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
