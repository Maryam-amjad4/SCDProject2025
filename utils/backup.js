const fs = require('fs');
const path = require('path');
const db = require('../db'); // MongoDB database module

const backupFolder = path.join(__dirname, '../backups');

// Ensure backups folder exists
if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
}

async function createBackup() {
    try {
        const data = await db.listRecords();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupFolder, `backup_${timestamp}.json`);

        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        console.log(`💾 Backup created: ${backupFile}`);
    } catch (err) {
        console.error('❌ Backup failed:', err.message);
    }
}

module.exports = { createBackup };

