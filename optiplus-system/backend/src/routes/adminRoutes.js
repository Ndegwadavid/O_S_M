// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get registration trends
router.get('/trends/registration', (req, res) => {
    try {
        const trends = db.prepare(`
            SELECT 
                strftime('%Y-%m', registrationDate) as month,
                COUNT(*) as count
            FROM clients
            GROUP BY strftime('%Y-%m', registrationDate)
            ORDER BY month DESC
            LIMIT 12
        `).all();

        res.json({
            success: true,
            trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sales summary
router.get('/summary/sales', (req, res) => {
    try {
        const summary = db.prepare(`
            SELECT 
                strftime('%Y-%m', orderDate) as month,
                COUNT(*) as orderCount,
                SUM(total) as totalSales,
                AVG(total) as averageOrder,
                SUM(balance) as outstandingBalance
            FROM sales
            GROUP BY strftime('%Y-%m', orderDate)
            ORDER BY month DESC
            LIMIT 12
        `).all();

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get status summary
router.get('/summary/status', (req, res) => {
    try {
        const summary = db.prepare(`
            SELECT 
                status,
                COUNT(*) as count
            FROM sales
            GROUP BY status
        `).all();

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get daily activity
router.get('/activity/daily', (req, res) => {
    try {
        const date = new Date();
        const today = date.toISOString().split('T')[0];

        const activities = {
            newClients: db.prepare(`
                SELECT COUNT(*) as count
                FROM clients
                WHERE date(registrationDate) = ?
            `).get(today).count,

            newPrescriptions: db.prepare(`
                SELECT COUNT(*) as count
                FROM prescriptions
                WHERE date(examDate) = ?
            `).get(today).count,

            newSales: db.prepare(`
                SELECT COUNT(*) as count
                FROM sales
                WHERE date(orderDate) = ?
            `).get(today).count,

            collections: db.prepare(`
                SELECT COUNT(*) as count
                FROM sales
                WHERE status = 'collected'
                AND date(orderDate) = ?
            `).get(today).count
        };

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get pending deliveries
router.get('/pending/deliveries', (req, res) => {
    try {
        const deliveries = db.prepare(`
            SELECT s.*, c.firstName, c.lastName, c.phone
            FROM sales s
            JOIN clients c ON s.clientId = c.id
            WHERE s.status = 'pending_collection'
            AND date(s.deliveryDate) <= date('now')
            ORDER BY s.deliveryDate ASC
        `).all();

        res.json({
            success: true,
            deliveries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get overdue balances
router.get('/overdue/balances', (req, res) => {
    try {
        const overdueBalances = db.prepare(`
            SELECT s.*, c.firstName, c.lastName, c.phone
            FROM sales s
            JOIN clients c ON s.clientId = c.id
            WHERE s.balance > 0
            AND s.status = 'collected'
            ORDER BY s.orderDate ASC
        `).all();

        res.json({
            success: true,
            overdueBalances
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get monthly reports
router.get('/reports/monthly', (req, res) => {
    const { month, year } = req.query;
    
    try {
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;

        const report = {
            registrations: db.prepare(`
                SELECT COUNT(*) as count
                FROM clients
                WHERE date(registrationDate) BETWEEN ? AND ?
            `).get(startDate, endDate).count,

            sales: db.prepare(`
                SELECT 
                    COUNT(*) as count,
                    SUM(total) as totalAmount,
                    SUM(balance) as outstandingBalance
                FROM sales
                WHERE date(orderDate) BETWEEN ? AND ?
            `).get(startDate, endDate),

            prescriptions: db.prepare(`
                SELECT COUNT(*) as count
                FROM prescriptions
                WHERE date(examDate) BETWEEN ? AND ?
            `).get(startDate, endDate).count,

            collections: db.prepare(`
                SELECT COUNT(*) as count
                FROM sales
                WHERE status = 'collected'
                AND date(orderDate) BETWEEN ? AND ?
            `).get(startDate, endDate).count,

            statusSummary: db.prepare(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM sales
                WHERE date(orderDate) BETWEEN ? AND ?
                GROUP BY status
            `).all(startDate, endDate)
        };

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get client demographics
router.get('/analytics/demographics', (req, res) => {
    try {
        const demographics = {
            ageGroups: db.prepare(`
                SELECT 
                    CASE 
                        WHEN (strftime('%Y', 'now') - strftime('%Y', dateOfBirth)) < 20 THEN 'Under 20'
                        WHEN (strftime('%Y', 'now') - strftime('%Y', dateOfBirth)) BETWEEN 20 AND 30 THEN '20-30'
                        WHEN (strftime('%Y', 'now') - strftime('%Y', dateOfBirth)) BETWEEN 31 AND 40 THEN '31-40'
                        WHEN (strftime('%Y', 'now') - strftime('%Y', dateOfBirth)) BETWEEN 41 AND 50 THEN '41-50'
                        ELSE 'Over 50'
                    END as ageGroup,
                    COUNT(*) as count
                FROM clients
                GROUP BY ageGroup
                ORDER BY ageGroup
            `).all(),

            areaDistribution: db.prepare(`
                SELECT 
                    areaOfResidence,
                    COUNT(*) as count
                FROM clients
                GROUP BY areaOfResidence
                ORDER BY count DESC
                LIMIT 10
            `).all()
        };

        res.json({
            success: true,
            demographics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get popular products
router.get('/analytics/products', (req, res) => {
    try {
        const products = {
            brands: db.prepare(`
                SELECT 
                    brand,
                    COUNT(*) as count,
                    SUM(total) as totalRevenue
                FROM sales
                GROUP BY brand
                ORDER BY count DESC
                LIMIT 10
            `).all(),

            models: db.prepare(`
                SELECT 
                    model,
                    COUNT(*) as count,
                    SUM(total) as totalRevenue
                FROM sales
                GROUP BY model
                ORDER BY count DESC
                LIMIT 10
            `).all()
        };

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;