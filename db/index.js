const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const backupUtils = require('../utils/backup'); 

function addRecord({ name, value }) {
    recordUtils.validateRecord({ name, value });

    const data = fileDB.readDB();

    const newRecord = {
        id: recordUtils.generateId(),
        name,
        value,
        createdAt: new Date().toISOString() // Add creation timestamp
    };

    data.push(newRecord);
    fileDB.writeDB(data);

    // Emit event after record is created
    vaultEvents.emit('recordAdded', newRecord);

    // Automatic backup after adding a record
    if (backupUtils && typeof backupUtils.createBackup === 'function') {
        backupUtils.createBackup(data);
    }

    return newRecord;
}

function listRecords() {
    return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
    const data = fileDB.readDB();
    const record = data.find(r => r.id === id);
    if (!record) return null;

    record.name = newName;
    record.value = newValue;

    fileDB.writeDB(data);
    vaultEvents.emit('recordUpdated', record);

    return record;
}

function deleteRecord(id) {
    const data = fileDB.readDB();
    const record = data.find(r => r.id === id);
    if (!record) return null;

    const updatedData = data.filter(r => r.id !== id);
    fileDB.writeDB(updatedData);

    vaultEvents.emit('recordDeleted', record);

    // Automatic backup after deletion
    if (backupUtils && typeof backupUtils.createBackup === 'function') {
        backupUtils.createBackup(updatedData);
    }

    return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };

