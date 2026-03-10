"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateIdeaThumbnailInternal as generateIdeaThumbnail } from "./generate-image";
import { requireSession } from "@/lib/auth-guards";
import { checkRateLimit } from "@/lib/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const channelNameMap: Record<string, string> = {
    "direct": "Direct Input",
    "pain": "Pain-Storming",
    "technology": "Technology",
    "market": "Demandas de Mercado",
    "shocks": "Choques Externos",
};

export async function generateChannelIdeas(ideaId: string, channelId: string, input: string): Promise<string | null> {
    const channelName = channelNameMap[channelId] || channelId;
    return generateConcept(ideaId, channelName, input, "en");
}

export async function generateConcept(ideaId: string, channel: string, input: string, language: string) {
    if (!input.trim()) return null;
    const session = await requireSession();
    checkRateLimit(session.user.id, "ideation", 10, 60_000);

    const { validateInput } = await import("@/app/actions/validate-input");
    const validation = await validateInput(input);
    if (!validation.safe) {
        return validation.reason || "Input flagged for review.";
    }

    // Sanitize: strip quotes and newlines to prevent prompt boundary escape
    const safeInput = input.replace(/["\n\r]/g, ' ').substring(0, 2000).trim();

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const channelPrompts: Record<string, string> = {
            "Direct Input": "Propose a startup solution based on this input.",
            "Pain-Storming": "The user has described a frustration or pain point. Analyze this friction and propose an elegant product solution that directly addresses it. Focus on the problem-solution fit and why this is a real pain.",
            "Technology": "Analyze this concept through cutting-edge technology lenses: AI world models, nanotechnology, swarm robotics, quantum computing, brain-computer interfaces, spatial computing. Propose a high-value deep tech venture leveraging the latest technological advances.",
            "Demandas de Mercado": "Analyze this concept in the context of open innovation bids, public grant opportunities (like FINEP in Brazil, DoE in the US, EU Horizon Europe), and untapped market demands. Propose a business that directly addresses a real institutional or market demand.",
            "Choques Externos": "Analyze this concept through the lens of major external disruptions happening now (AI workforce shift, de-globalization, energy transition, aging populations, geopolitical shifts). Propose a business that capitalizes on 'Why Now?' timing from these disruptions.",
        };

        const specificPrompt = channelPrompts[channel] || "Propose a startup solution based on this input.";

        const prompt = `
            You are an expert venture builder. 
            User Input (${channel}): "${safeInput}"
            
            Task: ${specificPrompt}
            
            Output: You must return a valid JSON object with three fields:
            1. "title": a catchy, 2-to-4 word auto-title for this venture.
            2. "pitch": a concise, compelling 1-paragraph elevator pitch. Focus on the problem, solution, and value proposition. Do not use markdown formatting like bolding in the pitch.
            3. "imagePrompt": a prompt describing a sleek, cyberpunk visual poster illustrating this concept without text.
            
            Language: ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}
        `;

        console.log(`[Ideation] Generating concept for channel: ${channel}, input: "${input.substring(0, 50)}..."`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let parsed: any = { title: "Untitled Venture", pitch: "Failed to parse pitch.", imagePrompt: "" };
        try {
            // Strip markdown formatting if Gemini wrapped the JSON
            let cleanText = text.trim();
            if (cleanText.startsWith("\`\`\`json")) cleanText = cleanText.substring(7);
            else if (cleanText.startsWith("\`\`\`")) cleanText = cleanText.substring(3);
            if (cleanText.endsWith("\`\`\`")) cleanText = cleanText.substring(0, cleanText.length - 3);

            let rawParsed = JSON.parse(cleanText.trim());

            // If Gemini returned an array of objects, take the first one
            if (Array.isArray(rawParsed)) {
                rawParsed = rawParsed[0] || {};
            }

            parsed.title = rawParsed?.title || "Untitled Venture";
            parsed.pitch = rawParsed?.pitch || text;
            parsed.imagePrompt = rawParsed?.imagePrompt || text.substring(0, 100);
        } catch (e) {
            console.error("Failed to parse JSON out of concept generator", text);
            // fallback
            parsed.pitch = text;
        }

        const safePitch = typeof parsed.pitch === 'string' ? parsed.pitch : JSON.stringify(parsed.pitch);

        console.log(`[Ideation] Generated pitch: "${safePitch.substring(0, 50)}..."`);

        // Save automatically to DB
        const { prisma } = await import("@/lib/prisma");
        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                title: parsed.title,
                rawText: safePitch
            }
        });

        // Generate thumbnail immediately and await it so the server action doesn't terminate the promise
        const promptToUse = parsed.imagePrompt || safePitch;
        try {
            await generateIdeaThumbnail(ideaId, promptToUse);
        } catch (err) {
            console.error("[Ideation] Early image gen failed", err);
        }

        return safePitch.trim();
    } catch (error: any) {
        console.error("[Ideation] Error generating concept:", error);
        return `Error: Failed to generate concept. Please try again.`;
    }
}
