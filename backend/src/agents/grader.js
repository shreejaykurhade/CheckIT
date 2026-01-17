const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Reuse the LLM instance or create a new one with strict json output if needed
// For simplicity, reusing a similar config
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0,
});

async function graderAgent(state) {
    const { messages } = state;
    const analysisMsg = messages[messages.length - 1];
    const analysisContent = analysisMsg.content;

    console.log(`[Grader] Grading the analysis...`);

    const systemPrompt = `You are a Trust Scorer (Grader).
  Your task is to assign a reliability score (0-100) to the fact-check analysis provided.
  
  Criteria:
  - Source Authority (Is it from PIB, BoomLive, AltNews?): High points.
  - Recency (Is the news current?): Adjust points.
  - Evidence Strength (Are there direct quotes/official documents?): High points.
  
  Output ONLY a JSON object:
  {
    "score": <number 0-100>,
    "reasoning": "<short explanation>"
  }
  `;

    try {
        const result = await llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Grade this analysis: ${analysisContent}`)
        ]);

        // Clean up markdown code blocks if Gemini returns them
        let cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();

        return {
            messages: [new HumanMessage({ content: cleanContent, name: "grader_result" })],
            grading_data: JSON.parse(cleanContent)
        };
    } catch (error) {
        console.error("[Grader] Error:", error);
        return {
            messages: [new HumanMessage({ content: JSON.stringify({ score: 0, reasoning: "Error in grading" }), name: "grader_error" })]
        }
    }
}

module.exports = { graderAgent };
