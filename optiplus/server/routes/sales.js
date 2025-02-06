const express = require('express');
const router = express.Router();
const { validateAuth } = require('../middleware/auth');
const { createSale } = require('../controllers/salesController');

router.post('/:id', validateAuth, createSale);

module.exports = router;