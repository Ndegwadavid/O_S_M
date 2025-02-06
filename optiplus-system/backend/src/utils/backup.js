// backend/src/utils/backup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

class DatabaseBackup {
    constructor() {
        this.backupPath = process.env.BACKUP_PATH || './backups';
        this.dbPath = process.env.DB_PATH;
        this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 7;
        
        // Create backup directory if it doesn't exist
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }

    // Create backup
    createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupPath, `backup-${timestamp}.db`);
            
            // Copy database file
            fs.copyFileSync(this.dbPath, backupFile);
            
            console.log(`Backup created: ${backupFile}`);
            
            // Clean old backups
            this.cleanOldBackups();
            
            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            return false;
        }
    }

    // Clean old backups
    cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupPath)
                .filter(file => file.startsWith('backup-'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupPath, file),
                    time: fs.statSync(path.join(this.backupPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            // Remove excess backups
            if (files.length > this.maxBackups) {
                files.slice(this.maxBackups).forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log(`Removed old backup: ${file.name}`);
                });
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    // Restore from backup
    restoreFromBackup(backupFile) {
        try {
            // Stop the server first
            console.log('Restoring database from backup...');
            
            // Create a temporary backup of current database
            const tempBackup = path.join(this.backupPath, 'temp-current.db');
            fs.copyFileSync(this.dbPath, tempBackup);

            try {
                // Copy backup file to main database
                fs.copyFileSync(backupFile, this.dbPath);
                console.log('Database restored successfully');
                
                // Remove temporary backup
                fs.unlinkSync(tempBackup);
                return true;
            } catch (error) {
                // If restore fails, recover from temporary backup
                fs.copyFileSync(tempBackup, this.dbPath);
                fs.unlinkSync(tempBackup);
                throw new Error('Restore failed, recovered from temporary backup');
            }
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    }

    // List available backups
    listBackups() {
        try {
            return fs.readdirSync(this.backupPath)
                .filter(file => file.startsWith('backup-'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupPath, file),
                    size: fs.statSync(path.join(this.backupPath, file)).size,
                    created: fs.statSync(path.join(this.backupPath, file)).mtime
                }))
                .sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('Error listing backups:', error);
            return [];
        }
    }
}

// Export singleton instance
module.exports = new DatabaseBackup();