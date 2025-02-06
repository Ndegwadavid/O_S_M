const express = require('express');
const router = express.Router();
const { validateAuth } = require('../middleware/auth');
const {
    getWaitingClients,
    updateExamination
} = require('../controllers/examinationController');

router.get('/waiting', validateAuth, getWaitingClients);
router.put('/:id', validateAuth, updateExamination);

module.exports = router;