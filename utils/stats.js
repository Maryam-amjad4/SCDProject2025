const fs = require('fs');
const path = require('path');

const fileDB = require('../db/file');

function viewStatistics() {
    const records = fileDB.readDB();

    console.log("\nVault Statistics:");
    console.log("--------------------------");

    if (records.length === 0) {
        console.log("No records found.");
        return;
    }

    // Total records
    console.log(`Total Records: ${records.length}`);

    // File last modified timestamp
    const dbPath = path.join(__dirname, "..", "data", "vault.json");
    const stats = fs.statSync(dbPath);
    console.log(`Last Modified: ${stats.mtime.toISOString().replace('T', ' ').replace('Z', '')}`);

    // Longest name
    const longest = records.reduce((max, r) =>
        r.name.length > max.name.length ? r : max
    );

    console.log(`Longest Name: ${longest.name} (${longest.name.length} characters)`);

    // Earliest + Latest creation timestamps
    const recordsWithDate = records.filter(r => r.createdAt);

    if (recordsWithDate.length > 0) {
        const sortedByDate = recordsWithDate.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        console.log(`Earliest Record: ${sortedByDate[0].createdAt.split('T')[0]}`);
        console.log(`Latest Record: ${sortedByDate[sortedByDate.length - 1].createdAt.split('T')[0]}`);
    } else {
        console.log("Earliest Record: N/A");
        console.log("Latest Record: N/A");
    }

    console.log("--------------------------\n");
}

module.exports = { viewStatistics };

