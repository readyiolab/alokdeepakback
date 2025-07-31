const express = require('express');
const router = express.Router();

const { authenticateToken, isAdmin } = require('../middleware/auth');
const { login, getContactMessages, updateContactMessageStatus, signup } = require('../controller/adminController');

// Admin login
router.post('/auth/signup', signup);
router.post('/auth/login', login);
// Get all contact messages (admin only)
router.put('/contact-messages/:id/status', authenticateToken,isAdmin, updateContactMessageStatus);
router.get('/contact-messages', authenticateToken, isAdmin, getContactMessages);
router.put('/admin/contact-messages/:id', authenticateToken, isAdmin, updateContactMessageStatus);

module.exports = router;