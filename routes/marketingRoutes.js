const express = require('express');
const router = express.Router();
const {applyForDigitalMarketing} = require("../controller/marketingController")

router.post('/apply', applyForDigitalMarketing);

module.exports = router;
