require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/db/mongo');
const { runAgent } = require('./src/graph');
const { saveResult, getHistory } = require('./src/services/store');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// History endpoint
app.get('/api/history', async (req, res) => {
    try {
        const history = await getHistory();
        res.json(history);
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get Single Result endpoint
app.get('/api/history/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Dynamic import to avoid circular dependency issues if any, or just standard require above
        const { getResultById } = require('./src/services/store');
        const result = await getResultById(id);

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        res.json(result);
    } catch (error) {
        console.error("Single result fetch error:", error);
        res.status(500).json({ error: 'Failed to fetch result' });
    }
});

// Agent endpoint
app.post('/api/check', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const result = await runAgent(query);

        // Save to DB
        await saveResult(query, result);

        // Extract relevant parts for the frontend
        const analysis = result.analysis_data;
        const grading = result.grading_data;

        res.json({
            analysis,
            grading,
            full_state: result
        });
    } catch (error) {
        console.error("Agent execution error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

async function startServer() {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

startServer();
