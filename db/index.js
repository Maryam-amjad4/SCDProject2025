require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let recordsCollection;

async function connectDB() {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    recordsCollection = client.db('nodevault').collection('records');
}

async function getCollection() {
    if (!recordsCollection) await connectDB();
    return recordsCollection;
}

async function addRecord(record) {
    const col = await getCollection();
    record.createdAt = new Date();
    record.id = Date.now();
    const result = await col.insertOne(record);
    return { ...record, _id: result.insertedId };
}

async function listRecords() {
    const col = await getCollection();
    return await col.find().toArray();
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

async function closeDB() {
    await client.close();
    console.log('🔒 MongoDB connection closed');
}

module.exports = { connectDB, addRecord, listRecords, updateRecord, deleteRecord, closeDB };

