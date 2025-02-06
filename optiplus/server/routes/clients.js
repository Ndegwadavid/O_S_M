const express = require('express');
const router = express.Router();
const { validateAuth } = require('../middleware/auth');
const { 
    getClients, 
    createClient, 
    getClientById 
} = require('../controllers/clientController');

router.get('/', validateAuth, getClients);
router.post('/', validateAuth, createClient);
router.get('/:id', validateAuth, getClientById);

module.exports = router;
