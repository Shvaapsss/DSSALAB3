const pool = require('../db');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};

const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query('SELECT user_id FROM todos WHERE id=$1', [id]);
    const todo = rows[0];
    if (!todo) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'admin' || req.user.userId === todo.user_id) return next();
    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAdmin, isOwnerOrAdmin };
