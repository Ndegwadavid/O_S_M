// server/config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'optiplus_db'
});

db.connect(error => {
    if (error) throw error;
    console.log('Database connected successfully');
});

module.exports = db;