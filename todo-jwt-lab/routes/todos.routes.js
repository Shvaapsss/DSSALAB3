const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/todos.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isOwnerOrAdmin, isAdmin } = require('../middlewares/role.middleware');

router.get('/', authenticate, ctrl.getTodos);
router.post('/', authenticate, ctrl.createTodo);
router.put('/:id', authenticate, isOwnerOrAdmin, ctrl.updateTodo);
router.delete('/:id', authenticate, isOwnerOrAdmin, ctrl.deleteTodo);

module.exports = router;
