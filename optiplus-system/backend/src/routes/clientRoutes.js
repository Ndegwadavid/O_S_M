// backend/src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get next client ID
router.get('/next-id', (req, res) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    try {
        const lastClient = db.prepare(`
            SELECT id FROM clients 
            WHERE id LIKE ? 
            ORDER BY id DESC LIMIT 1
        `).get(`M/${year}/${month}/%`);

        let nextNumber = 1;
        if (lastClient) {
            const lastNumber = parseInt(lastClient.id.split('/')[3]);
            nextNumber = lastNumber + 1;
        }

        res.json({
            success: true,
            nextId: `M/${year}/${month}/${nextNumber}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Register new client
router.post('/', (req, res) => {
    const client = req.body;
    
    try {
        const stmt = db.prepare(`
            INSERT INTO clients (
                id, firstName, lastName, email, dateOfBirth, 
                phone, areaOfResidence, previousRx, registrationDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            client.id,
            client.firstName,
            client.lastName,
            client.email,
            client.dateOfBirth,
            client.phone,
            client.areaOfResidence,
            client.previousRx,
            new Date().toISOString()
        );

        // Notify through Socket.IO
        req.io.emit('newClient', {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName
        });

        res.json({
            success: true,
            id: client.id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search clients
router.get('/search', (req, res) => {
    const { query } = req.query;
    
    try {
        const clients = db.prepare(`
            SELECT * FROM clients 
            WHERE firstName LIKE ? 
            OR lastName LIKE ? 
            OR phone LIKE ?
            OR id LIKE ?
            ORDER BY registrationDate DESC
            LIMIT 10
        `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);

        res.json({
            success: true,
            clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get client by ID
router.get('/:id', (req, res) => {
    try {
        const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
        
        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        res.json({
            success: true,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;