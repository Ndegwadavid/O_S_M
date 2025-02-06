const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get client by name
router.get('/client/:name', async (req, res) => {
    const [firstName, lastName] = req.params.name.split('_');
    try {
        const [results] = await db.promise().query(
            'SELECT * FROM clients WHERE first_name = ? AND last_name = ? ORDER BY id DESC LIMIT 1',
            [firstName, lastName]
        );
        res.json(results[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save prescription
router.post('/prescription/:client_id', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            'INSERT INTO prescriptions SET ?',
            {
                client_id: req.params.client_id,
                prescription_details: JSON.stringify(req.body),
                created_at: new Date()
            }
        );
        
        await db.promise().query(
            'UPDATE clients SET status = ? WHERE id = ?',
            ['prescription_ready', req.params.client_id]
        );
        
        res.json({ success: true, prescription_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;