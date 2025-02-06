// backend/src/routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Create new prescription
router.post('/', (req, res) => {
    const prescription = req.body;
    
    try {
        const stmt = db.prepare(`
            INSERT INTO prescriptions (
                clientId, 
                rightSph, rightCyl, rightAxi, rightAdd, rightVa,
                leftSph, leftCyl, leftAxi, leftAdd, leftVa,
                ipd, clinicalHistory, examDate, examinedBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            prescription.clientId,
            prescription.right.sph,
            prescription.right.cyl,
            prescription.right.axi,
            prescription.right.add,
            prescription.right.va,
            prescription.left.sph,
            prescription.left.cyl,
            prescription.left.axi,
            prescription.left.add,
            prescription.left.va,
            prescription.ipd,
            prescription.clinicalHistory,
            new Date().toISOString(),
            prescription.examinedBy
        );

        // Notify through Socket.IO
        req.io.emit('newPrescription', {
            id: result.lastInsertRowid,
            clientId: prescription.clientId
        });

        res.json({
            success: true,
            id: result.lastInsertRowid
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get prescription by ID
router.get('/:id', (req, res) => {
    try {
        const prescription = db.prepare(`
            SELECT * FROM prescriptions WHERE id = ?
        `).get(req.params.id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get latest prescription for client
router.get('/client/:clientId/latest', (req, res) => {
    try {
        const prescription = db.prepare(`
            SELECT * FROM prescriptions 
            WHERE clientId = ?
            ORDER BY examDate DESC 
            LIMIT 1
        `).get(req.params.clientId);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'No prescription found for this client'
            });
        }

        res.json({
            success: true,
            prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;