// backend/src/db/database.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'optiplus.db'), {
    verbose: console.log
});

// Initialize database tables
function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT,
            dateOfBirth TEXT,
            phone TEXT NOT NULL,
            areaOfResidence TEXT,
            previousRx TEXT,
            registrationDate TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientId TEXT NOT NULL,
            rightSph TEXT,
            rightCyl TEXT,
            rightAxi TEXT,
            rightAdd TEXT,
            rightVa TEXT,
            leftSph TEXT,
            leftCyl TEXT,
            leftAxi TEXT,
            leftAdd TEXT,
            leftVa TEXT,
            ipd TEXT,
            clinicalHistory TEXT,
            examDate TEXT NOT NULL,
            examinedBy TEXT,
            FOREIGN KEY (clientId) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientId TEXT NOT NULL,
            prescriptionId INTEGER NOT NULL,
            brand TEXT,
            model TEXT,
            color TEXT,
            quantity INTEGER DEFAULT 1,
            amount REAL NOT NULL,
            total REAL NOT NULL,
            advance REAL DEFAULT 0,
            balance REAL NOT NULL,
            fittingInstructions TEXT,
            orderBookedBy TEXT NOT NULL,
            deliveryDate TEXT,
            referenceNumber TEXT UNIQUE,
            status TEXT DEFAULT 'pending_collection',
            orderDate TEXT NOT NULL,
            FOREIGN KEY (clientId) REFERENCES clients(id),
            FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            relatedId TEXT,
            isRead BOOLEAN DEFAULT 0,
            createdAt TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_clients_search 
        ON clients(firstName, lastName, phone, id);

        CREATE INDEX IF NOT EXISTS idx_sales_status 
        ON sales(status);

        CREATE INDEX IF NOT EXISTS idx_client_registration 
        ON clients(registrationDate);
    `);
}

// Initialize database
initDatabase();

// Export database instance
module.exports = db;