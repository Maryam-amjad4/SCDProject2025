require('dotenv').config();
const readline = require('readline');
const db = require('./db'); // MongoDB-based index.js
const exportUtils = require('./utils/export');
require('./events/logger'); // event logger

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper to ask questions using Promises
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, ans => resolve(ans.trim())));
}

// Display menu
async function menu() {
    console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
`);

    const ans = await askQuestion('Choose option: ');

    switch (ans) {
        case '1': // Add Record
            const name1 = await askQuestion('Enter name: ');
            const value1 = await askQuestion('Enter value: ');
            await db.addRecord({ name: name1, value: value1 });
            console.log('✅ Record added successfully!');
            await menu();
            break;

        case '2': // List Records
            const records = await db.listRecords();
            if (records.length === 0) {
                console.log('No records found.');
            } else {
                records.forEach(r =>
                    console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
                );
            }
            await menu();
            break;

        case '3': // Update Record
            const updateId = await askQuestion('Enter record ID to update: ');
            const newName = await askQuestion('New name: ');
            const newValue = await askQuestion('New value: ');
            const updated = await db.updateRecord(Number(updateId), newName, newValue);
            console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
            await menu();
            break;

        case '4': // Delete Record
            const deleteId = await askQuestion('Enter record ID to delete: ');
            const deleted = await db.deleteRecord(Number(deleteId));
            console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
            await menu();
            break;

        case '5': // Search Records
            const keyword = await askQuestion('Enter search keyword: ');
            const results = (await db.listRecords()).filter(record =>
                record.name.toLowerCase().includes(keyword.toLowerCase()) ||
                record.id.toString() === keyword
            );

            if (results.length === 0) {
                console.log('No records found.');
            } else {
                console.log(`Found ${results.length} matching records:`);
                results.forEach(r =>
                    console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`)
                );
            }
            await menu();
            break;

        case '6': // Sort Records
            const field = (await askQuestion('Choose field to sort by (name/createdAt): ')).toLowerCase();
            const order = (await askQuestion('Choose order (asc/desc): ')).toLowerCase();

            let recordsToSort = [...await db.listRecords()];
            if (field === 'name') {
                recordsToSort.sort((a, b) => a.name.localeCompare(b.name) * (order === 'asc' ? 1 : -1));
            } else if (field === 'createdat') {
                recordsToSort.sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return order === 'asc' ? dateA - dateB : dateB - dateA;
                });
            } else {
                console.log('❌ Invalid field. Sorting aborted.');
                await menu();
                break;
            }

            console.log('Sorted Records:');
            recordsToSort.forEach(r =>
                console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
            );
            await menu();
            break;

        case '7': // Export Data
            await exportUtils.exportToTxt();
            await menu();
            break;

        case '8': // View Vault Statistics
            const allRecords = await db.listRecords();
            if (allRecords.length === 0) {
                console.log('No records found.');
            } else {
                const totalRecords = allRecords.length;
                const lastModified = new Date(Math.max(...allRecords.map(r => new Date(r.createdAt)))).toISOString();
                const longestName = allRecords.reduce((a, b) => a.name.length > b.name.length ? a : b);
                const earliest = new Date(Math.min(...allRecords.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];
                const latest = new Date(Math.max(...allRecords.map(r => new Date(r.createdAt)))).toISOString().split('T')[0];

                console.log(`
Vault Statistics:
--------------------------
Total Records: ${totalRecords}
Last Modified: ${lastModified}
Longest Name: ${longestName.name} (${longestName.name.length} characters)
Earliest Record: ${earliest}
Latest Record: ${latest}
                `);
            }
            await menu();
            break;

        case '9': // Exit
            console.log('👋 Exiting NodeVault...');
            if (db && db.closeDB) await db.closeDB(); // Close MongoDB connection
            rl.close();
            process.exit(0);
            break;

        default:
            console.log('Invalid option.');
            await menu();
            break;
    }
}

// Start application
menu();

