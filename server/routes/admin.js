// server/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get dashboard statistics
router.get('/statistics', async (req, res) => {
    try {
        // Get total clients
        const [totalClients] = await db.promise().query(
            'SELECT COUNT(*) as total FROM clients'
        );

        // Get new clients today
        const [newClientsToday] = await db.promise().query(
            'SELECT COUNT(*) as total FROM clients WHERE DATE(created_at) = CURDATE()'
        );

        // Get pending collections
        const [pendingCollections] = await db.promise().query(
            'SELECT COUNT(*) as total FROM clients WHERE status = "pending_collection"'
        );

        // Get monthly revenue
        const [monthlyRevenue] = await db.promise().query(
            'SELECT SUM(total) as total FROM sales WHERE MONTH(created_at) = MONTH(CURDATE())'
        );

        // Get pending jobs
        const [pendingJobs] = await db.promise().query(
            'SELECT COUNT(*) as total FROM clients WHERE status = "pending_job"'
        );

        // Get registration trend (last 7 days)
        const [registrationTrend] = await db.promise().query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM clients 
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`
        );

        // Get revenue trend (last 6 months)
        const [revenueTrend] = await db.promise().query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as total
             FROM sales
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month`
        );

        // Get age distribution
        const [ageDistribution] = await db.promise().query(
            `SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN 'Under 18'
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
                    ELSE 'Over 50'
                END as age_group,
                COUNT(*) as count
             FROM clients
             GROUP BY age_group`
        );

        // Get popular brands
        const [popularBrands] = await db.promise().query(
            `SELECT brand, COUNT(*) as count
             FROM sales
             GROUP BY brand
             ORDER BY count DESC
             LIMIT 5`
        );

        res.json({
            totalClients: totalClients[0].total,
            newClientsToday: newClientsToday[0].total,
            pendingCollections: pendingCollections[0].total,
            monthlyRevenue: monthlyRevenue[0].total || 0,
            pendingJobs: pendingJobs[0].total,
            registrationTrend: {
                labels: registrationTrend.map(item => item.date),
                data: registrationTrend.map(item => item.count)
            },
            revenueTrend: {
                labels: revenueTrend.map(item => item.month),
                data: revenueTrend.map(item => item.total)
            },
            ageDistribution: {
                labels: ageDistribution.map(item => item.age_group),
                data: ageDistribution.map(item => item.count)
            },
            popularBrands: {
                labels: popularBrands.map(item => item.brand),
                data: popularBrands.map(item => item.count)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all clients with filters
router.get('/clients', async (req, res) => {
    const { status, date, search } = req.query;
    let query = 'SELECT * FROM clients';
    const params = [];

    if (status || date || search) {
        query += ' WHERE';
        const conditions = [];

        if (status) {
            conditions.push(' status = ?');
            params.push(status);
        }

        if (date) {
            conditions.push(' DATE(created_at) = ?');
            params.push(date);
        }

        if (search) {
            conditions.push(' (first_name LIKE ? OR last_name LIKE ? OR reg_number LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += conditions.join(' AND');
    }

    query += ' ORDER BY created_at DESC';

    try {
        const [clients] = await db.promise().query(query, params);
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sales report with filters
router.get('/sales', async (req, res) => {
    const { month, payment_mode } = req.query;
    let query = `
        SELECT s.*, c.first_name, c.last_name, c.reg_number
        FROM sales s
        JOIN clients c ON s.client_id = c.id
    `;
    const params = [];

    if (month || payment_mode) {
        query += ' WHERE';
        const conditions = [];

        if (month) {
            conditions.push(' DATE_FORMAT(s.created_at, "%Y-%m") = ?');
            params.push(month);
        }

        if (payment_mode) {
            conditions.push(' s.payment_mode = ?');
            params.push(payment_mode);
        }

        query += conditions.join(' AND');
    }

    query += ' ORDER BY s.created_at DESC';

    try {
        const [sales] = await db.promise().query(query, params);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate reports
router.get('/reports/:type', async (req, res) => {
    const { type } = req.params;
    const { start_date, end_date } = req.query;

    try {
        let data;
        switch (type) {
            case 'daily':
                [data] = await db.promise().query(
                    `SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as total_clients,
                        SUM(total) as total_sales,
                        SUM(advance) as total_advance,
                        SUM(balance) as total_balance
                     FROM sales
                     WHERE DATE(created_at) = CURDATE()
                     GROUP BY DATE(created_at)`
                );
                break;

            case 'monthly':
                [data] = await db.promise().query(
                    `SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(DISTINCT client_id) as total_clients,
                        SUM(total) as total_revenue,
                        AVG(total) as average_sale
                     FROM sales
                     WHERE created_at BETWEEN ? AND ?
                     GROUP BY month`,
                    [start_date || new Date(new Date().getFullYear(), 0, 1), end_date || new Date()]
                );
                break;

            case 'demographics':
                [data] = await db.promise().query(
                    `SELECT 
                        gender,
                        COUNT(*) as count,
                        AVG(TIMESTAMPDIFF(YEAR, dob, CURDATE())) as avg_age
                     FROM clients
                     GROUP BY gender`
                );
                break;

            case 'inventory':
                [data] = await db.promise().query(
                    `SELECT 
                        brand,
                        model,
                        COUNT(*) as sales_count,
                        SUM(quantity) as total_quantity,
                        SUM(total) as total_revenue
                     FROM sales
                     GROUP BY brand, model
                     ORDER BY sales_count DESC`
                );
                break;

            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;