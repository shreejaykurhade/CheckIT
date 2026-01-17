const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0.2, // Low temperature for more factual reasoning
    maxOutputTokens: 2048,
});

async function analystAgent(state) {
    const { messages } = state;
    // The investigator results should be the last message
    const investigatorMsg = messages[messages.length - 1];
    const searchResults = investigatorMsg.content;

    console.log(`[Analyst] Analyzing search results...`);

    const systemPrompt = `You are a Fact-Checking Analyst for the Indian ecosystem. 
  Your goal is to analyze search snippets and find "Conflict of Facts".
  
  Input: JSON string of search results from trusted Indian sources (BoomLive, AltNews, PIB, etc.).
  
  Task:
  1. Read the search snippets carefully.
  2. Synthesize the findings.
  3. clearly state if the original claim is TRUE, FALSE, or MISLEADING based on the evidence.
  4. Highlight any contradictions between sources if they exist.
  5. Cite the sources (URL and Name) which support your conclusion.
  
  Output Format:
  - Conclusion: [True/False/Misleading]
  - Summary: [Detailed explanation]
  - Evidence: [Bulleted list of facts from snippets]
  - Sources: [List of URLs]
  `;

    try {
        const result = await llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Analyze these search results: ${searchResults}`)
        ]);

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

module.exports = { analystAgent, llm };
