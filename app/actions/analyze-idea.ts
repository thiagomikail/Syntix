"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "@/types/analysis";
import { validateInput } from "@/app/actions/validate-input";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth-guards";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function analyzeIdea(idea: string, language: string, context?: string): Promise<AnalysisResult> {
  const session = await requireSession();
  await checkRateLimit(session.user.id, "analyze", 10, 60_000);

  const validation = await validateInput(idea);
  if (!validation.safe) {
    throw new Error(validation.reason || "Input flagged for review.");
  }

  // Sanitize user inputs — stripped before structural separation
  const safeIdea = idea.replace(/[\r\n]/g, ' ').substring(0, 2000).trim();
  const safeContext = context ? context.replace(/[\r\n]/g, ' ').substring(0, 2000).trim() : undefined;

  console.log(`[AnalyzeIdea] Starting for idea: "${safeIdea.substring(0, 20)}..." lang: ${language}`);

  // Structural prompt injection defence: static instructions in systemInstruction,
  // user input passed as a separate user message.
  const systemInstruction = `
    Act as "The Auditor", a ruthless venture capital analyst AI for the Syntix platform.
    Language: ${language} (Respond strictly in this language. If user input is Portuguese, respond in Portuguese).

    Your task is to analyze the user-submitted business idea and return ONLY a valid JSON object with this structure:
    {
      "title": "Venture Name (2-4 words)",
      "imagePrompt": "Detailed cyberpunk/neon startup poster prompt",
      "score": number (0-100 IRL score),
      "radarData": [
        { "subject": "Market Depth", "A": number, "fullMark": 150 },
        { "subject": "Coherence", "A": number, "fullMark": 150 },
        { "subject": "Unit Econ", "A": number, "fullMark": 150 },
        { "subject": "Scalability", "A": number, "fullMark": 150 },
        { "subject": "Defensibility", "A": number, "fullMark": 150 },
        { "subject": "Viral Loop", "A": number, "fullMark": 150 }
      ],
      "detailedScores": { "logicalCoherence": number, "marketDepth": number, "unitEconomics": number },
      "metricDetails": { "logicalCoherence": "string", "marketDepth": "string", "unitEconomics": "string" },
      "feedback": "string (max 2 sentences executive summary)"
    }
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction });

  // User input structurally separated from system instructions
  const userMessage = safeContext
    ? `Business idea: ${safeIdea}\n\nContext from Inception phase: ${safeContext}`
    : safeIdea;

  try {
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleanText);

    // Basic structure validation before returning
    if (
        typeof parsed.score !== 'number' || 
        !Array.isArray(parsed.radarData) ||
        typeof parsed.title !== 'string' ||
        typeof parsed.feedback !== 'string'
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return parsed;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      title: "Untitled Venture",
      imagePrompt: "",
      score: 50,
      radarData: [],
      detailedScores: { logicalCoherence: 50, marketDepth: 50, unitEconomics: 50 },
      metricDetails: {
        logicalCoherence: "Analysis failed. Please try again.",
        marketDepth: "Analysis failed. Please try again.",
        unitEconomics: "Analysis failed. Please try again."
      },
      feedback: "Analysis failed. Please try again."
    };
  }
}
