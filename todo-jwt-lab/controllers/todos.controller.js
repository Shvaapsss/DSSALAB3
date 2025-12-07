const pool = require('../db');

const getTodos = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const { rows } = await pool.query('SELECT * FROM todos');
      return res.json(rows);
    } else {
      const { rows } = await pool.query('SELECT * FROM todos WHERE user_id=$1', [req.user.userId]);
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO todos(title, description, category_id, user_id) VALUES($1,$2,$3,$4) RETURNING *',
      [title, description || null, category_id || null, req.user.userId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, category_id } = req.body;
    const { rows } = await pool.query(
      'UPDATE todos SET title=$1, description=$2, category_id=$3, updated_at=now() WHERE id=$4 RETURNING *',
      [title, description, category_id, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM todos WHERE id=$1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
