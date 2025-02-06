// backend/src/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const salesRoutes = require('./routes/salesRoutes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Make io available in route handlers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/sales', salesRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});