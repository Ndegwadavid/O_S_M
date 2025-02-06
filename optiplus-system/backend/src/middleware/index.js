// backend/src/middleware/index.js
const morgan = require('morgan');
const db = require('../db/database');

// Custom logging middleware
const logActivity = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

// Notification middleware
const createNotification = (type, message, relatedId) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO notifications (type, message, relatedId, createdAt)
            VALUES (?, ?, ?, ?)
        `);
        
        stmt.run(type, message, relatedId, new Date().toISOString());
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Socket.IO middleware
const socketMiddleware = (io) => (req, res, next) => {
    req.io = io;
    next();
};

module.exports = {
    logActivity,
    errorHandler,
    createNotification,
    socketMiddleware
};