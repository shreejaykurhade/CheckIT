const { generateWithFallback } = require("../services/llm");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

async function analystAgent(state) {
    const { messages } = state;
    // The first message is the original user query
    const originalQuery = messages[0].content;
    const investigatorMsg = messages[messages.length - 1];
    const searchResults = investigatorMsg.content;

    console.log(`[Analyst] Analyzing search results for query: "${originalQuery}"...`);

    const systemPrompt = `You are a Fact-Checking Analyst for the Indian ecosystem. 
  Your goal is to analyze search snippets and find "Conflict of Facts".
  
  Current Date: ${new Date().toDateString()}
  User Query: "${originalQuery}"
  
  Input: JSON string of search results from trusted Indian sources.
  
  Task:
  1. Analyze snippets for FACTS.
  2. **CRITICAL**: Focus ONLY on valid facts related to the User Query ("${originalQuery}").
  3. **IGNORE** any search results/news snippets that are irrelevant to the User Query (e.g. if query is about "Delhi Fog", ignore "Maharashtra Elections" or "Sports").
  4. STRICTLY GROUND your analysis in the provided text. DO NOT Hallucinate.
  5. Be CONCISE.
  
  **OUTPUT FORMAT (MANDATORY):**
  
  - **Conclusion**: True/False/Misleading
  - **Summary**: Your analysis with citations [1], [2]
  - **Evidence**: Bullet points with citations [1], [2]
  
  ### Sources
  1. [Descriptive Title Based On Content](Full URL)
  2. [Descriptive Title Based On Content](Full URL)
  
  **SOURCES SECTION RULES:**
  1. **YOU MUST INCLUDE THE SOURCES SECTION.**
  2. **CRITICAL**: The search engine returns messy URL titles. IGNORE the URL title from the JSON.
  3. **CREATE YOUR OWN DESCRIPTIVE TITLE** based on what the snippet/content actually talks about.
  4. **Example**: If snippet talks about "Delhi fog disrupts flights" but URL says "NFL Football", 
     write: "[Delhi Fog Disrupts Flight Operations - Times of India](actual-url)"
  5. Include the actual URL from the search results.
  6. Use numbered citations [1], [2] in your analysis.
  
  Example Output:
  "Dense fog disrupted flights [1]. The AQI reached 'very poor' levels [2]."
  
  ### Sources
  1. [Delhi Airport Flight Delays Due to Dense Fog - Times of India](https://timesofindia.com/...)
  2. [Air Quality Worsens in Delhi NCR - NDTV](https://ndtv.com/...)
  `;

    try {
        const result = await generateWithFallback([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Analyze these search results: ${searchResults} `)
        ], 0.2);

        return {
            messages: [result],
            analysis_data: result.content
        };
    } catch (error) {
        console.error("[Analyst] Error:", error);
        return {
            messages: [new HumanMessage({ content: "Error performing analysis.", name: "analyst_error" })]
        }
    }
}

module.exports = { analystAgent };
