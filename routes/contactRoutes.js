const express = require('express');
const router = express.Router();
const {submitContactForm} = require('../controller/contactController');
const { validateContactForm } = require('../middleware/validate');

// Create a new contact message
router.post('/contact-messages', validateContactForm, submitContactForm);

module.exports = router;