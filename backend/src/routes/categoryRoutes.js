const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

router.use(protect, restrictTo('superadmin', 'host'));

router.post('/', upload.single('coverImage'), categoryController.createCategory);
router.patch('/:id', upload.single('coverImage'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
