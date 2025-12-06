require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // from .env
const client = new MongoClient(uri);

let db;
let recordsCollection;

async function connectDB() {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    db = client.db('nodevault'); // specify DB name
    recordsCollection = db.collection('records');
}

async function addRecord(record) {
    record.createdAt = new Date();
    record.id = Date.now(); // simple unique ID
    const result = await recordsCollection.insertOne(record);
    return { ...record, _id: result.insertedId };
}

async function listRecords() {
    return await recordsCollection.find().toArray();
}

async function updateRecord(id, newName, newValue) {
    const result = await recordsCollection.findOneAndUpdate(
        { id },
        { $set: { name: newName, value: newValue } },
        { returnDocument: 'after' }
    );
    return result.value;
}

async function deleteRecord(id) {
    const record = await recordsCollection.findOne({ id });
    if (!record) return null;
    await recordsCollection.deleteOne({ id });
    return record;
}

// Optional: export a function to close the DB connection
async function closeDB() {
    await client.close();
    console.log('🔒 MongoDB connection closed');
}

module.exports = {
    connectDB,
    addRecord,
    listRecords,
    updateRecord,
    deleteRecord,
    closeDB
};

