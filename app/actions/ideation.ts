"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function generateConcept(channel: string, input: string, language: string) {
    if (!input.trim()) return null;

    try {
        // Fallback to 1.5-flash if latest alias has issues
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const channelPrompts: Record<string, string> = {
            "Market Pull": "Analyze this market demand/RFP and propose a startup solution that directly addresses it.",
            "Pain-Storming": "Analyze this friction point/broken process and propose a product that solves it elegantly.",
            "Tech Push": "Analyze this technology/asset and propose a high-value commercial application for it.",
            "External Shocks": "Analyze this macro shift/shock and propose a business opportunity that capitalizes on 'Why Now?'."
        };

        const specificPrompt = channelPrompts[channel] || "Propose a startup solution based on this input.";

        const prompt = `
            You are an expert venture builder. 
            User Input (${channel}): "${input}"
            
            Task: ${specificPrompt}
            
            Output: Write a concise, compelling 1-paragraph elevator pitch for this new business idea. 
            Do not use markdown formatting like bolding. 
            Focus on the problem, solution, and value proposition.
            Language: ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}
        `;

        console.log(`[Ideation] Generating concept for channel: ${channel}, input: "${input.substring(0, 50)}..."`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`[Ideation] Generated text: "${text.substring(0, 50)}..."`);
        return text.trim();
    } catch (error: any) {
        console.error("[Ideation] Error generating concept:", error);
        return `Error: ${error.message || "Unknown error"}`;
    }
}
