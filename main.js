const readline = require('readline');
const db = require('./db');
const exportUtils = require('./utils/export');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
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

    rl.question('Choose option: ', async (ans) => {
        switch (ans.trim()) {

            case '1': // Add Record
                rl.question('Enter name: ', async (name) => {
                    rl.question('Enter value: ', async (value) => {
                        const record = await db.addRecord({ name, value });
                        console.log('✅ Record added successfully!', record);
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
                        console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
                    );
                }
                menu();
                break;

            case '3': // Update Record
                rl.question('Enter record ID to update: ', async (id) => {
                    rl.question('New name: ', async (name) => {
                        rl.question('New value: ', async (value) => {
                            const updated = await db.updateRecord(Number(id), name, value);
                            console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
                            menu();
                        });
                    });
                });
                break;

            case '4': // Delete Record
                rl.question('Enter record ID to delete: ', async (id) => {
                    const deleted = await db.deleteRecord(Number(id));
                    console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
                    menu();
                });
                break;

            case '5': // Search Records
                rl.question('Enter search keyword: ', async (keyword) => {
                    const allRecords = await db.listRecords();
                    const results = allRecords.filter(record =>
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
                    menu();
                });
                break;

            case '6': // Sort Records
                rl.question('Choose field to sort by (name/createdAt): ', async (field) => {
                    field = field.trim().toLowerCase();
                    rl.question('Choose order (asc/desc): ', async (order) => {
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
                            console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | CreatedAt: ${r.createdAt}`)
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
                const statsRecords = await db.listRecords();
                if (statsRecords.length === 0) {
                    console.log('No records to display statistics.');
                } else {
                    const total = statsRecords.length;
                    const lastModified = statsRecords.reduce((max, r) => {
                        const date = new Date(r.createdAt);
                        return date > max ? date : max;
                    }, new Date(0));

                    const longestNameRecord = statsRecords.reduce((a, b) =>
                        a.name.length >= b.name.length ? a : b
                    );

                    const sortedDates = statsRecords
                        .map(r => new Date(r.createdAt))
                        .sort((a, b) => a - b);

                    console.log(`
Vault Statistics:
--------------------------
Total Records: ${total}
Last Modified: ${lastModified.toISOString()}
Longest Name: ${longestNameRecord.name} (${longestNameRecord.name.length} characters)
Earliest Record: ${sortedDates[0].toISOString().split('T')[0]}
Latest Record: ${sortedDates[sortedDates.length - 1].toISOString().split('T')[0]}
`);
                }
                menu();
                break;

            case '9': // Exit
                console.log('👋 Exiting NodeVault...');
                rl.close();
                break;

            default:
                console.log('Invalid option.');
                menu();
        }
    });
}

// Start the application
menu();

