// server/routes/sales.js
import express from 'express';
import { validateAuth } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Process sale
router.post('/:id', validateAuth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const {
            brand, model, color, quantity, amount,
            total, advance, balance, fittingInstructions,
            deliveryDate
        } = req.body;
        
        // Create reference number
        const referenceNumber = `REF${Date.now()}`;
        
        // Add sale
        await connection.query(
            `INSERT INTO sales (
                client_id, brand, model, color, quantity,
                amount, total, advance, balance,
                fitting_instructions, delivery_date,
                reference_number, order_booked_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.params.id, brand, model, color, quantity,
                amount, total, advance, balance,
                fittingInstructions, deliveryDate,
                referenceNumber, req.user.username
            ]
        );

        // Update client status
        await connection.query(
            'UPDATE clients SET status = "completed" WHERE id = ?',
            [req.params.id]
        );

        await connection.commit();
        res.json({ 
            message: 'Sale processed successfully',
            referenceNumber 
        });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

export { router as default };