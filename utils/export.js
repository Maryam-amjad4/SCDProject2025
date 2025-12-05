const fs = require('fs');
const path = require('path');
const db = require('../db');

function exportToTxt() {
    const records = db.listRecords();

    const filePath = path.join(process.cwd(), 'export.txt');

    const header = 
`===== NodeVault Export File =====
File Name: export.txt
Export Date: ${new Date().toLocaleString()}
Total Records: ${records.length}
=================================

`;

    let body = "";

    if (records.length === 0) {
        body += "No records available.\n";
    } else {
        records.forEach(r => {
            body += `ID: ${r.id}\n`;
            body += `Name: ${r.name}\n`;
            body += `Value: ${r.value}\n`;
            body += `Created At: ${r.createdAt}\n`;
            body += `---------------------------\n`;
        });
    }

    fs.writeFileSync(filePath, header + body);

    console.log(`📄 Data exported successfully to export.txt`);
}

module.exports = { exportToTxt };

