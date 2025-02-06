// backend/src/routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Create new sale
router.post('/', (req, res) => {
    const sale = req.body;
    
    try {
        // Generate reference number (e.g., SALE/2025/02/001)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const lastSale = db.prepare(`
            SELECT referenceNumber FROM sales 
            WHERE referenceNumber LIKE ? 
            ORDER BY referenceNumber DESC LIMIT 1
        `).get(`SALE/${year}/${month}/%`);

        let saleNumber = '001';
        if (lastSale) {
            const lastNumber = parseInt(lastSale.referenceNumber.split('/')[3]);
            saleNumber = String(lastNumber + 1).padStart(3, '0');
        }

        const referenceNumber = `SALE/${year}/${month}/${saleNumber}`;

        const stmt = db.prepare(`
            INSERT INTO sales (
                clientId, prescriptionId, brand, model, color,
                quantity, amount, total, advance, balance,
                fittingInstructions, orderBookedBy, deliveryDate,
                referenceNumber, status, orderDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            sale.clientId,
            sale.prescriptionId,
            sale.brand,
            sale.model,
            sale.color,
            sale.quantity,
            sale.amount,
            sale.total,
            sale.advance,
            sale.balance,
            sale.fittingInstructions,
            sale.orderBookedBy,
            sale.deliveryDate,
            referenceNumber,
            'pending_collection',
            new Date().toISOString()
        );

        // Notify through Socket.IO
        req.io.emit('newSale', {
            id: result.lastInsertRowid,
            referenceNumber,
            clientId: sale.clientId
        });

        res.json({
            success: true,
            id: result.lastInsertRowid,
            referenceNumber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get pending collections
router.get('/pending-collections', (req, res) => {
    try {
        const sales = db.prepare(`
            SELECT s.*, c.firstName, c.lastName, c.phone
            FROM sales s
            JOIN clients c ON s.clientId = c.id
            WHERE s.status = 'pending_collection'
            ORDER BY s.orderDate DESC
        `).all();

        res.json({
            success: true,
            sales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get pending jobs
router.get('/pending-jobs', (req, res) => {
    try {
        const sales = db.prepare(`
            SELECT s.*, c.firstName, c.lastName, c.phone
            FROM sales s
            JOIN clients c ON s.clientId = c.id
            WHERE s.status = 'pending_job'
            ORDER BY s.orderDate DESC
        `).all();

        res.json({
            success: true,
            sales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update order status
router.patch('/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        db.prepare('UPDATE sales SET status = ? WHERE id = ?').run(status, id);

        res.json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;