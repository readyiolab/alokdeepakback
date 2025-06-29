const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateBlog } = require('../middleware/validate');
const { upload } = require('../middleware/upload');
const { createBlog, updateBlog, deleteBlog, getAllBlogs, getBlogById } = require('../controller/blogController');

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', authenticateToken, isAdmin, upload.single('featured_image'), validateBlog, createBlog);
router.put('/:id', authenticateToken, isAdmin, upload.single('featured_image'), validateBlog, updateBlog);
router.delete('/:id', authenticateToken, isAdmin, deleteBlog);

module.exports = router;