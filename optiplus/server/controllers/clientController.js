const db = require('../config/database');
const { generateRegNumber } = require('../utils/helpers');

const getClients = async (req, res) => {
    try {
        const [clients] = await db.query(
            'SELECT * FROM clients ORDER BY created_at DESC'
        );
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createClient = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, residence, previousRx } = req.body;
        
        // Generate registration number
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        // Get last client ID
        const [lastClient] = await db.query(
            'SELECT reg_number FROM clients ORDER BY id DESC LIMIT 1'
        );
        
        let clientId = '001';
        if (lastClient.length > 0) {
            const lastId = parseInt(lastClient[0].reg_number.split('/')[3]);
            clientId = String(lastId + 1).padStart(3, '0');
        }
        
        const regNumber = `M/${year}/${month}/${clientId}`;
        
        const [result] = await db.query(
            `INSERT INTO clients (
                reg_number, first_name, last_name, email, phone, 
                residence, previous_rx, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [regNumber, firstName, lastName, email, phone, residence, previousRx, 'waiting_examination']
        );
        
        const [newClient] = await db.query(
            'SELECT * FROM clients WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json(newClient[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getClientById = async (req, res) => {
    try {
        const [client] = await db.query(
            'SELECT * FROM clients WHERE id = ?',
            [req.params.id]
        );
        
        if (client.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        // Get prescription if exists
        const [prescription] = await db.query(
            'SELECT * FROM prescriptions WHERE client_id = ? ORDER BY examination_date DESC LIMIT 1',
            [req.params.id]
        );
        
        // Get sales if exists
        const [sales] = await db.query(
            'SELECT * FROM sales WHERE client_id = ?',
            [req.params.id]
        );
        
        res.json({
            ...client[0],
            prescription: prescription[0] || null,
            sales: sales[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClients,
    createClient,
    getClientById
};