const express = require('express');
const router = express.Router();
const db = require('../config/db');

function generateRegNumber() {
    const date = new Date();
    return `M/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/`;
}

// Register new client
router.post('/new_client', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT reg_number FROM clients WHERE reg_number LIKE ? ORDER BY id DESC LIMIT 1',
            [generateRegNumber() + '%']
        );
        
        const nextNumber = results.length ? 
            parseInt(results[0].reg_number.split('/').pop()) + 1 : 1;
        
        const reg_number = generateRegNumber() + nextNumber;
        
        const [result] = await db.promise().query(
            'INSERT INTO clients SET ?',
            { ...req.body, reg_number, status: 'pending_exam' }
        );
        
        res.json({ id: result.insertId, reg_number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get client details
router.get('/client/:id', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            `SELECT c.*, p.prescription_details 
             FROM clients c
             LEFT JOIN prescriptions p ON c.id = p.client_id
             WHERE c.id = ?`,
            [req.params.id]
        );
        res.json(results[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/sales/:client_id', async (req, res) => {
    try {
        const reference_number = `INV-${Date.now()}`;
        const saleData = {
            client_id: req.params.client_id,
            reference_number,
            ...req.body,
            created_at: new Date()
        };

        const [result] = await db.promise().query('INSERT INTO sales SET ?', saleData);
        
        // Update client status
        await db.promise().query(
            'UPDATE clients SET status = ? WHERE id = ?',
            ['pending_collection', req.params.client_id]
        );

        res.json({ 
            success: true, 
            sales_id: result.insertId,
            reference_number
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get receipt data
router.get('/receipt/:sale_id', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            `SELECT 
                c.first_name, c.last_name, c.reg_number, c.phone,
                s.*, 
                p.prescription_details,
                p.clinical_history
             FROM sales s
             JOIN clients c ON s.client_id = c.id
             LEFT JOIN prescriptions p ON c.id = p.client_id
             WHERE s.id = ?`,
            [req.params.sale_id]
        );

        if (!results.length) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const receipt = {
            ...results[0],
            company_info: {
                name: 'OptiPlus Eye Care',
                address: '123 Vision Street',
                phone: '+254-XX-XXXXXXX',
                email: 'info@optipluscare.com'
            }
        };

        res.json(receipt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update client status
router.patch('/client/:id/status', async (req, res) => {
    try {
        await db.promise().query(
            'UPDATE clients SET status = ? WHERE id = ?',
            [req.body.status, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;