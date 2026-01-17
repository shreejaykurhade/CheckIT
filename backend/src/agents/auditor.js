const { HumanMessage } = require("@langchain/core/messages");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function auditorAgent(state) {
    const { investigation_data } = state;
    // We assume 'investigation_data' contains the raw search results from the previous step (Investigator)

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The auditor has a strict persona
    const prompt = `
        You are the **INTERNAL AUDITOR** for the Truth DAO. 
        Your job is to RE-EVALUATE the findings of a TRIPLE-CHECK investigation to eliminate hallucinations, inconsistencies, and bias.

        ## INPUT DATA (3 Parallel Investigations):
        ${JSON.stringify(investigation_data)}

        ## INSTRUCTIONS:
        1.  **Synthesize Findings**: You have data from 3 separate search streams (Main, Skeptical, Context). Look for patterns across them.
        2.  **Cross-Verification**: If the "Skeptical" search found hoax reports that the "Main" search missed, highlighting this is CRITICAL.
        3.  **No Hallucinations**: Do NOT add facts that are not present in the snippets.
        4.  **Final Verdict**: Provide a concise summary for the DAO Voters.

        ## OUTPUT FORMAT (JSON):
        {
            "summary": "Concise, neutral summary of the facts, noting if sources agree.",
            "evidence": ["Bullet point 1 (cited from Main)", "Bullet point 2 (cited from Skeptical)"],
            "conflicts": ["List any contradictions found between the 3 investigations"],
            "conclusion": "Final rigorous conclusion based ONLY on cross-verified evidence.",
            "audit_note": "Note on the reliability of the sources (e.g. 'All 3 streams confirm X')."
        }
    `;

    try {
        console.log("[Auditor] Auditing investigation data...");
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Ensure JSON parsing
        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
            // Fallback for text
            jsonResponse = {
                summary: cleanedText,
                evidence: [],
                conflicts: [],
                conclusion: "Audit completed (Raw Text due to formatting error).",
                audit_note: "Manual review recommended."
            };
        }

        // Return strictly formatted string for consistency with existing UI parsing
        return {
            analysis_data: JSON.stringify(jsonResponse)
        };

    } catch (error) {
        console.error("[Auditor] Error:", error);
        return {
            analysis_data: JSON.stringify({
                summary: "Audit failed due to technical error.",
                conclusion: "INCONCLUSIVE",
                audit_note: "System error during audit."
            })
        };
    }
}

module.exports = { auditorAgent };
