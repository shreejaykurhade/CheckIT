const { HumanMessage } = require("@langchain/core/messages");

const INDIAN_FACT_CHECK_DOMAINS = [
    "boomlive.in",
    "altnews.in",
    "factchecker.in",
    "newschecker.in",
    "vishvasnews.com",
    "pib.gov.in",
    "newsmobile.in",
    "thequint.com",
    "indiatoday.in",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "indianexpress.com",
    "thehindu.com",
    "ndtv.com",
    "airnewsalerts.com",
    "ddnews.gov.in"
];

async function investigatorAgent(state) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // Use the query as is, but ensure we don't just search for "news"
    // Removing strict date injection to allow for broader context matching
    console.log(`[Investigator] Searching for: ${query}`);

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query, // Use original query
                include_domains: INDIAN_FACT_CHECK_DOMAINS,
                topic: "general", // Switch to general to get better context coverage, relying on domains for "news" source quality
                max_results: 6,
                search_depth: "advanced"
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("RATE_LIMIT_EXCEEDED");
            }
            throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return {
                messages: [new HumanMessage({
                    content: JSON.stringify({
                        error: "NO_RESULTS",
                        message: "No relevant sources found for this query in trusted Indian databases."
                    }),
                    name: "investigator"
                })]
            };
        }

        // CRITICAL: Filter out irrelevant results
        // Extract meaningful keywords (ignore common words)
        const commonWords = ['january', '2026', 'news', 'latest', 'today', 'report', 'india'];
        const queryKeywords = query.toLowerCase()
            .split(' ')
            .filter(word => word.length > 2 && !commonWords.includes(word));

        console.log(`[Investigator] Filtering with keywords: ${queryKeywords.join(', ')}`);

        const relevantResults = data.results.filter(result => {
            const snippet = (result.content || result.snippet || '').toLowerCase();

            // RELAXED CHECK: At least 70% of keywords must appear (flexible matching)
            const matchedKeywords = queryKeywords.filter(keyword => snippet.includes(keyword));
            const matchRatio = matchedKeywords.length / queryKeywords.length;

            if (matchRatio < 0.6) {
                console.log(`[Investigator] Rejected: "${result.title}" (only ${matchedKeywords.length}/${queryKeywords.length} keywords)`);
                return false;
            }

            return true;
        });

        // If no relevant results after filtering
        if (relevantResults.length === 0) {
            return {
                messages: [new HumanMessage({
                    content: JSON.stringify({
                        error: "NO_RELEVANT_RESULTS",
                        message: `No sources found that actually discuss "${query}". The search returned unrelated articles.`,
                        originalResultCount: data.results.length
                    }),
                    name: "investigator"
                })]
            };
        }

        console.log(`[Investigator] Found ${relevantResults.length} relevant results out of ${data.results.length} total`);

        return {
            messages: [new HumanMessage({ content: JSON.stringify(relevantResults), name: "investigator" })]
        };
    } catch (error) {
        console.error("[Investigator] Error:", error);

        if (error.message === "RATE_LIMIT_EXCEEDED") {
            return {
                messages: [new HumanMessage({
                    content: JSON.stringify({
                        error: "SERVICE_BUSY",
                        message: "Our search specialists are currently busy. Please try again in a moment.",
                        isRetryable: true
                    }),
                    name: "investigator_error"
                })]
            }
        }

        return {
            messages: [new HumanMessage({ content: "Error performing search.", name: "investigator_error" })]
        }
    }
}

module.exports = { investigatorAgent };
