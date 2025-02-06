// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./config/db');
const queries = require('./models/queries');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

// Make io available in route handlers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reception.html'));
});

app.get('/reception', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reception.html'));
});

app.get('/doctor', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/doctor.html'));
});

app.get('/sales', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sales.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/receipt', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/receipt.html'));
});

app.get('/all_clients', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/all_clients.html'));
});

// API Routes

// Client Routes
app.get('/api/clients/next-id', async (req, res) => {
    try {
        const nextId = await queries.getNextClientId();
        res.json({ success: true, nextId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const result = await queries.registerClient(req.body);
        req.io.emit('newClient', {
            id: result.id,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/clients/search', async (req, res) => {
    try {
        const clients = await queries.searchClients(req.query.query);
        res.json({ success: true, clients });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Prescription Routes
app.post('/api/prescriptions', async (req, res) => {
    try {
        const result = await queries.createPrescription(req.body);
        req.io.emit('newPrescription', {
            id: result.id,
            clientId: req.body.clientId
        });
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/prescriptions/client/:clientId', async (req, res) => {
    try {
        const prescriptions = await queries.getClientPrescriptions(req.params.clientId);
        res.json({ success: true, prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sales Routes
app.post('/api/sales', async (req, res) => {
    try {
        const result = await queries.createSalesOrder(req.body);
        req.io.emit('newSale', {
            id: result.id,
            referenceNumber: result.referenceNumber,
            clientId: req.body.clientId
        });
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/sales/:id/status', async (req, res) => {
    try {
        const result = await queries.updateOrderStatus(req.params.id, req.body.status);
        req.io.emit('statusUpdate', {
            id: req.params.id,
            status: req.body.status
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Routes
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await queries.getAdminStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/pending-orders', async (req, res) => {
    try {
        const orders = await queries.getPendingOrders();
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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