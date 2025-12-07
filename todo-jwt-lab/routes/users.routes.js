const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// only admin can list users
router.get('/', authenticate, isAdmin, async (req, res) => {
  const { rows } = await pool.query('SELECT id, username, email, role, created_at FROM users');
  res.json(rows);
});

module.exports = router;
