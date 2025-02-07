// server/routes/clients.js
import express from 'express';
import { validateAuth } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Get all clients
router.get('/', validateAuth, async (req, res) => {
    try {
        const [clients] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new client
router.post('/', validateAuth, async (req, res) => {
    try {
        const { firstName, lastName, email, phone, residence, previousRx } = req.body;
        
        // Generate registration number
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        // Get last client ID
        const [lastClient] = await pool.query(
            'SELECT reg_number FROM clients ORDER BY id DESC LIMIT 1'
        );
        
        let clientId = '001';
        if (lastClient.length > 0) {
            const lastId = parseInt(lastClient[0].reg_number.split('/')[3]);
            clientId = String(lastId + 1).padStart(3, '0');
        }
        
        const regNumber = `M/${year}/${month}/${clientId}`;
        
        const [result] = await pool.query(
            `INSERT INTO clients (
                reg_number, first_name, last_name, email, 
                phone, residence, previous_rx, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [regNumber, firstName, lastName, email, phone, residence, previousRx, 'waiting_examination']
        );
        
        res.status(201).json({
            id: result.insertId,
            reg_number: regNumber,
            firstName,
            lastName,
            email,
            phone,
            status: 'waiting_examination'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get pending clients
router.get('/pending', validateAuth, async (req, res) => {
    try {
        const [waiting] = await pool.query(
            'SELECT * FROM clients WHERE status = "waiting_examination" ORDER BY created_at ASC'
        );
        const [examined] = await pool.query(
            'SELECT * FROM clients WHERE status = "examined" ORDER BY created_at ASC'
        );
        
        res.json({ waiting, examined });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export { router as default };