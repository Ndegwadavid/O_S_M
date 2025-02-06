const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const clientRoutes = require('./routes/clients');
const examinationRoutes = require('./routes/examination');
const salesRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./config/database');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/examination', examinationRoutes);
app.use('/api/sales', salesRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});