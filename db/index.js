const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'nodevault';

let db;

async function connectDB() {
    if (db) return db;
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('✅ Connected to MongoDB');
    return db;
}

async function getCollection() {
    const database = await connectDB();
    return database.collection('vault');
}

async function addRecord(record) {
    const col = await getCollection();
    record.createdAt = new Date();
    record.id = Date.now(); // simple unique ID
    const result = await col.insertOne(record);
    return result.ops ? result.ops[0] : record;
}

async function listRecords() {
    const col = await getCollection();
    return col.find().toArray();
}

async function updateRecord(id, newName, newValue) {
    const col = await getCollection();
    const result = await col.findOneAndUpdate(
        { id },
        { $set: { name: newName, value: newValue } },
        { returnDocument: 'after' }
    );
    return result.value;
}

async function deleteRecord(id) {
    const col = await getCollection();
    const record = await col.findOne({ id });
    if (!record) return null;
    await col.deleteOne({ id });
    return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };

