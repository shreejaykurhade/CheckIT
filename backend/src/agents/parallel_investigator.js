const { HumanMessage } = require("@langchain/core/messages");

// Helper to perform a single Tavily search
async function performSearch(query, type) {
    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5,
                topic: "general"
            })
        });

        if (!response.ok) return { type, error: `API Error: ${response.status}`, results: [] };

        const data = await response.json();
        return {
            type,
            query,
            results: data.results || [],
            answer: data.answer
        };
    } catch (e) {
        return { type, error: e.message, results: [] };
    }
}

async function parallelInvestigatorAgent(state) {
    const messages = state.messages;
    const originalQuery = messages[messages.length - 1].content;

    console.log(`[ParallelInvestigator] Starting triple-check for: "${originalQuery}"`);

    // 1. Direct Verification
    const p1 = performSearch(originalQuery, "Main Investigation");

    // 2. Skeptical/Variant Check
    const p2 = performSearch(`${originalQuery} hoax fake facts`, "Skeptical Check");

    // 3. Background/Context Check
    const p3 = performSearch(`${originalQuery} background history details`, "Context Check");

    const results = await Promise.all([p1, p2, p3]);

    // Aggregate findings
    const aggregatedData = {
        original_query: originalQuery,
        timestamp: new Date(),
        investigations: results
    };

    return {
        investigation_data: aggregatedData
    };
}

module.exports = { parallelInvestigatorAgent };
