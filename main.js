const readline = require('readline');
const db = require('./db'); // MongoDB connection and functions
const exportUtils = require('./utils/export');
require('./events/logger'); // Initialize event logger
require('dotenv').config(); // Load environment variables

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

    rl.question('Choose option: ', async ans => {
        switch (ans.trim()) {

            case '1': // Add Record
                rl.question('Enter name: ', async name => {
                    rl.question('Enter value: ', async value => {
                        await db.addRecord({ name, value });
                        console.log('✅ Record added successfully!');
                        menu();
                    });
                });
                break;

            case '2': // List Records
                const records = await db.listRecords();
                if (records.length === 0) {
                    console.log('No records found.');
                } else {
                    records.forEach(r =>
                        console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
                    );
                }
                menu();
                break;

            case '3': // Update Record
                rl.question('Enter record ID to update: ', async id => {
                    rl.question('New name: ', async name => {
                        rl.question('New value: ', async value => {
                            const updated = await db.updateRecord(id, name, value);
                            console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
                            menu();
                        });
                    });
                });
                break;

            case '4': // Delete Record
                rl.question('Enter record ID to delete: ', async id => {
                    const deleted = await db.deleteRecord(id);
                    console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
                    menu();
                });
                break;

            case '5': // Search Records
                rl.question('Enter search keyword: ', async keyword => {
                    const allRecords = await db.listRecords();
                    const results = allRecords.filter(record =>
                        record.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        record._id.toString() === keyword
                    );

                    if (results.length === 0) {
                        console.log('No records found.');
                    } else {
                        console.log(`Found ${results.length} matching records:`);
                        results.forEach(r =>
                            console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value}`)
                        );
                    }
                    menu();
                });
                break;

            case '6': // Sort Records
                rl.question('Choose field to sort by (name/createdAt): ', async field => {
                    field = field.trim().toLowerCase();
                    rl.question('Choose order (asc/desc): ', async order => {
                        order = order.trim().toLowerCase();

                        let recordsToSort = await db.listRecords();

                        if (field === 'name') {
                            recordsToSort.sort((a, b) => {
                                if (a.name.toLowerCase() < b.name.toLowerCase()) return order === 'asc' ? -1 : 1;
                                if (a.name.toLowerCase() > b.name.toLowerCase()) return order === 'asc' ? 1 : -1;
                                return 0;
                            });
                        } else if (field === 'createdat') {
                            recordsToSort.sort((a, b) => {
                                const dateA = new Date(a.createdAt);
                                const dateB = new Date(b.createdAt);
                                return order === 'asc' ? dateA - dateB : dateB - dateA;
                            });
                        } else {
                            console.log('❌ Invalid field. Sorting aborted.');
                            return menu();
                        }

                        console.log('Sorted Records:');
                        recordsToSort.forEach(r =>
                            console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
                        );
                        menu();
                    });
                });
                break;

            case '7': // Export Data
                await exportUtils.exportToTxt();
                menu();
                break;

            case '8': // View Vault Statistics
                const stats = await db.getVaultStatistics();
                console.log('Vault Statistics:');
                console.log('--------------------------');
                console.log(`Total Records: ${stats.total}`);
                console.log(`Last Modified: ${stats.lastModified}`);
                console.log(`Longest Name: ${stats.longestName.name} (${stats.longestName.length} characters)`);
                console.log(`Earliest Record: ${stats.earliestRecord}`);
                console.log(`Latest Record: ${stats.latestRecord}`);
                menu();
                break;

            case '9': // Exit
                console.log('👋 Exiting NodeVault...');
                await db.closeDB(); // Close MongoDB connection
                rl.close();
                break;

            default:
                console.log('Invalid option.');
                menu();
        }
    });
}

// Connect to DB first, then start menu
(async () => {
    try {
        await db.connectDB();
        menu();
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
})();

