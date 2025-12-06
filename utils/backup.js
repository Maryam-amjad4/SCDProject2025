const fs = require('fs');
const path = require('path');
const fileDB = require('../db/file');

const backupFolder = path.join(__dirname, '../backups');

// Ensure backups folder exists
if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
}

function createBackup() {
    try {
        const data = fileDB.readDB();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const backupFile = path.join(backupFolder, `backup_${timestamp}.json`);

        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

        console.log(`Backup created successfully: ${backupFile}`);
    } catch (err) {
        console.error("Failed to create backup:", err.message);
    }
}

module.exports = { createBackup };

