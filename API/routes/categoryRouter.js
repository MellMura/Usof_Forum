const express = require('express');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:category_id', categoryController.getCategoryById);
router.get('/:category_id/posts', categoryController.getCategoryPosts);
router.post('/', requireAdmin, categoryController.createCategory);
router.patch('/:category_id', requireAdmin, categoryController.updateCategory);
router.delete('/:category_id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
