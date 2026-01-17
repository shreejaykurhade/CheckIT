const { getDB } = require('../db/mongo');

const COLLECTION_HISTORY = 'history';
const memoryStore = []; // Fallback storage

async function saveResult(query, result) {
    const db = getDB();
    const entry = {
        _id: Date.now().toString(), // Mock ID for memory
        query,
        analysis: result.analysis_data,
        grading: result.grading_data,
        full_state: result,
        timestamp: new Date()
    };

    if (db) {
        await db.collection(COLLECTION_HISTORY).insertOne(entry);
    } else {
        memoryStore.unshift(entry); // Add to beginning
        if (memoryStore.length > 50) memoryStore.pop();
    }
    return entry;
}

async function getHistory() {
    const db = getDB();
    if (db) {
        return await db.collection(COLLECTION_HISTORY)
            .find({})
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();
    }
    return memoryStore;
}

async function getResultById(id) {
    const db = getDB();
    if (db) {
        const { ObjectId } = require('mongodb');
        try {
            return await db.collection(COLLECTION_HISTORY).findOne({ _id: new ObjectId(id) });
        } catch (e) { return null; }
    }
    return memoryStore.find(item => item._id === id) || null;
}

module.exports = { saveResult, getHistory, getResultById };
