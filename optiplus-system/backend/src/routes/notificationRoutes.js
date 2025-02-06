// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get all notifications
router.get('/', (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    
    try {
        const notifications = db.prepare(`
            SELECT *
            FROM notifications
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);

        const total = db.prepare(`
            SELECT COUNT(*) as count
            FROM notifications
        `).get().count;

        res.json({
            success: true,
            notifications,
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get unread notifications count
router.get('/unread/count', (req, res) => {
    try {
        const count = db.prepare(`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE isRead = 0
        `).get().count;

        res.json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark notification as read
router.patch('/:id/read', (req, res) => {
    try {
        db.prepare(`
            UPDATE notifications
            SET isRead = 1
            WHERE id = ?
        `).run(req.params.id);

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

// Mark all notifications as read
router.post('/mark-all-read', (req, res) => {
    try {
        db.prepare(`
            UPDATE notifications
            SET isRead = 1
            WHERE isRead = 0
        `).run();

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

// Delete notification
router.delete('/:id', (req, res) => {
    try {
        db.prepare(`
            DELETE FROM notifications
            WHERE id = ?
        `).run(req.params.id);

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

// Clear all notifications
router.delete('/clear-all', (req, res) => {
    try {
        db.prepare(`
            DELETE FROM notifications
            WHERE isRead = 1
        `).run();

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