// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients.js';
import examinationRoutes from './routes/examination.js';
import salesRoutes from './routes/sales.js';
import pool from './config/database.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
} catch (error) {
    console.error('Database connection failed:', error);
}

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/examination', examinationRoutes);
app.use('/api/sales', salesRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});