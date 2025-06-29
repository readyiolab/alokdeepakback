const express = require('express');
const router = express.Router();

const { validateNewsletter } = require('../middleware/validate');
const { subscribeNewsletter, unsubscribeNewsletter } = require('../controller/newsletterController');

// Subscribe to newsletter
router.post('/subscriptions', validateNewsletter, subscribeNewsletter);
// Unsubscribe from newsletter
router.delete('/subscriptions', validateNewsletter, unsubscribeNewsletter);

module.exports = router;