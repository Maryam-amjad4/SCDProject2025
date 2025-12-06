const fs = require('fs');
const path = require('path');
const db = require('../db'); // MongoDB database module

const exportFolder = path.join(__dirname, '../exports');

// Ensure exports folder exists
if (!fs.existsSync(exportFolder)) {
    fs.mkdirSync(exportFolder);
}

async function exportToTxt() {
    try {
        const records = await db.listRecords();
        if (records.length === 0) {
            console.log('No records to export.');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFile = path.join(exportFolder, `vault_export_${timestamp}.txt`);

        const content = records.map(r => `ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`).join('\n');

        fs.writeFileSync(exportFile, content);
        console.log(`📄 Data exported successfully: ${exportFile}`);
    } catch (err) {
        console.error('❌ Export failed:', err.message);
    }
}

module.exports = { exportToTxt };

