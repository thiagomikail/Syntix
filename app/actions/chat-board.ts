"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Persona } from "@/types/analysis";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function chatWithBoard(history: Message[], userInput: string, language: string): Promise<Message> {
    const systemPrompt = `
     You are "The AI Board" of Syntix, a group of 4 expert personas stress-testing a founder's business idea.
    
    The Personas:
    1. "The Skeptic" (Tag: [skeptic]): Risk-averse, critical, challenges the user on differentials and why this idea will fail. Asks hard questions about competition and defensibility.
    2. "The Growth Strategist" (Tag: [growth]): Focuses on partnerships, market growth, distribution channels, and strategies for rapid scaling. Optimistic but pragmatic.
    3. "The Financial" (Tag: [cfo]): Focuses on financial structuring, unit economics, profitability, burn rate, and funding strategies. Sharp with numbers.
    4. "The Builder" (Tag: [builder]): Focuses on the fastest path to MVP and the final product. Technical architecture, build vs buy decisions, team composition, and execution speed.

    Language: ${language}.
    IMPORTANT: You MUST respond in ${language}, even if the user speaks English or another language. Do not switch languages unless explicitly asked to translate.

    Your task:
    - Analyze the user's latest input.
    - Choose ONE persona to respond. Pick the one whose expertise is most relevant to the user's last point.
    - Start your response with the persona's tag in brackets, e.g., [skeptic], [growth], [cfo], or [builder].
    - Keep the response short (under 50 words) and punchy.
  `;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt
    });

    // Map history to Gemini format
    const geminiHistory = history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    // Sanitization: Ensure strictly alternating roles [user, model, user, model...]
    const cleanHistory = [];
    let lastRole = "model"; // expecting 'user' next

    for (const msg of geminiHistory) {
        if (!msg.parts[0].text) continue;
        if (msg.role !== lastRole) {
            cleanHistory.push(msg);
            lastRole = msg.role;
        }
    }

    // If the first message in our cleaned history is 'model', we drop it.
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
        cleanHistory.shift();
    }

    try {
        const chat = model.startChat({
            history: cleanHistory,
        });

        const result = await chat.sendMessage(userInput);
        const response = await result.response;
        const text = response.text();

        let persona: Persona = "skeptic"; // default
        let content = text;

        if (text.includes("[skeptic]")) {
            persona = "skeptic";
            content = text.replace("[skeptic]", "").trim();
        } else if (text.includes("[growth]")) {
            persona = "growth";
            content = text.replace("[growth]", "").trim();
        } else if (text.includes("[cfo]")) {
            persona = "cfo";
            content = text.replace("[cfo]", "").trim();
        } else if (text.includes("[builder]")) {
            persona = "builder";
            content = text.replace("[builder]", "").trim();
        }

        return {
            id: Date.now().toString(),
            role: "ai",
            persona: persona,
            content: content,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error("AI Chat Error:", error);

        const errorMessage = error.message || "";
        let userMessage = "I'm having trouble connecting to the board. Please try again.";

        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many Requests")) {
            userMessage = "The Board is currently overwhelmed (Rate Limit Reached). Please wait a minute and try again.";
        } else if (errorMessage.includes("Roles must be alternating")) {
            userMessage = "Communication protocol error. Please try again.";
        }

        return {
            id: Date.now().toString(),
            role: "ai",
            persona: "skeptic",
            content: userMessage,
            timestamp: new Date().toISOString()
        };
    }
}
