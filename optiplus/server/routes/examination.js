// server/routes/examination.js
import express from 'express';
import { validateAuth } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Get waiting patients
router.get('/waiting', validateAuth, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT * FROM clients WHERE status = "waiting_examination" ORDER BY created_at ASC'
        );
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update examination
router.put('/:id', validateAuth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { prescription } = req.body;
        
        // Add prescription
        await connection.query(
            `INSERT INTO prescriptions (
                client_id, right_eye_sph, right_eye_cyl, right_eye_axis,
                right_eye_va, right_eye_add, right_eye_ipd,
                left_eye_sph, left_eye_cyl, left_eye_axis,
                left_eye_va, left_eye_add, left_eye_ipd,
                clinical_history, examined_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.params.id,
                prescription.rightEye.sph,
                prescription.rightEye.cyl,
                prescription.rightEye.axis,
                prescription.rightEye.va,
                prescription.rightEye.add,
                prescription.rightEye.ipd,
                prescription.leftEye.sph,
                prescription.leftEye.cyl,
                prescription.leftEye.axis,
                prescription.leftEye.va,
                prescription.leftEye.add,
                prescription.leftEye.ipd,
                prescription.clinicalHistory,
                req.user.username
            ]
        );

        // Update client status
        await connection.query(
            'UPDATE clients SET status = "examined" WHERE id = ?',
            [req.params.id]
        );

        await connection.commit();
        res.json({ message: 'Examination updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

export { router as default };