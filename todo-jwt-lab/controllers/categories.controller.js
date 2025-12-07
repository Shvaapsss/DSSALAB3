const pool = require('../db');

const getCategories = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories');
  res.json(rows);
};
const createCategory = async (req, res) => {
  const { name } = req.body;
  const { rows } = await pool.query('INSERT INTO categories(name) VALUES($1) RETURNING *', [name]);
  res.status(201).json(rows[0]);
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { rows } = await pool.query('UPDATE categories SET name=$1, updated_at=now() WHERE id=$2 RETURNING *', [name, id]);
  res.json(rows[0]);
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
  res.status(204).send();
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
