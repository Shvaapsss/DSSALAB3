const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categories.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/', authenticate, ctrl.getCategories);
router.post('/', authenticate, isAdmin, ctrl.createCategory);
router.put('/:id', authenticate, isAdmin, ctrl.updateCategory);
router.delete('/:id', authenticate, isAdmin, ctrl.deleteCategory);

module.exports = router;
