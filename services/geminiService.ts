import { GoogleGenAI, Type } from "@google/genai";
import { Session, Block, BlockType } from "../types";

const SYSTEM_INSTRUCTION = `
You are a senior principal engineer and thoughtful technical collaborator acting as a "second brain" for a developer.
Your goal is to help the user think clearly, spot edge cases, and maintain context.
- You are NOT a code generator autopilot. Do not write large blocks of code unless specifically asked for a snippet or example.
- Focus on architectural implications, logic gaps, and clarifying requirements.
- If the user logs a decision, challenge it gently if you see flaws.
- If the user is stuck, offer a Socratic question.
- Keep responses concise, high-signal, and professional.
- Use Markdown for formatting.
`;

export const getAICollaborator = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateInsight = async (session: Session, userQuery?: string): Promise<string> => {
  const ai = getAICollaborator();
  if (!ai) return "Error: API Key is missing. Please check your configuration.";

  // Construct context from session blocks
  const contextHistory = session.blocks.map(b => {
    let prefix = "";
    switch (b.type) {
      case BlockType.NOTE: prefix = "[NOTE]"; break;
      case BlockType.TASK: prefix = "[TASK]"; break;
      case BlockType.DECISION: prefix = "[DECISION LOG]"; break;
      case BlockType.AI_INSIGHT: prefix = "[PREVIOUS AI INSIGHT]"; break;
      case BlockType.AI_USER_MSG: prefix = "[USER QUESTION]"; break;
    }
    return `${prefix}\n${b.content}\n---`;
  }).join("\n");

  const prompt = userQuery 
    ? `Context:\n${contextHistory}\n\nUser Question: ${userQuery}`
    : `Analyze the current thought stream below and provide a brief insight, a potential risk, or a clarifying question to help move the developer forward. Do not just summarize.\n\nContext:\n${contextHistory}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Keep it grounded
      }
    });

    return response.text || "I'm having trouble analyzing this right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insight. Check console for details.";
  }
};
