"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "@/types/analysis";
import { validateInput } from "@/app/actions/validate-input";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function analyzeIdea(idea: string, language: string, context?: string): Promise<AnalysisResult> {
  const validation = await validateInput(idea);
  if (!validation.safe) {
    throw new Error(validation.reason || "Input flagged for review.");
  }

  // Sanitize: strip quotes and newlines to prevent prompt boundary escape
  const safeIdea = idea.replace(/["\n\r]/g, ' ').substring(0, 2000).trim();
  const safeContext = context ? context.replace(/["\n\r]/g, ' ').substring(0, 2000).trim() : undefined;

  console.log(`[AnalyzeIdea] Starting analysis for idea: "${safeIdea.substring(0, 20)}..." in language: ${language}`);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Act as "The Auditor", a ruthless venture capital analyst AI for the Syntix platform.
    Analyze the following business idea: "${safeIdea}"

    ${safeContext ? `CONTEXT FROM PREVIOUS PHASE (Inception Logic Engine):
    "${safeContext}"
    Use this context to inform your analysis, especially the Market Research and Strategy sections.
    ` : ""}

    Language: ${language} (Respond strictly in this language. If user input is Portuguese, respond in Portuguese).

    Your task is to:
    1. Calculate a "Investment Readiness Level" (IRL) score from 0 to 100 based on the overall quality.
    2. Generate data for a radar chart with 6 axes (Market Depth, Coherence, Unit Econ, Scalability, Defensibility, Viral Loop). Each value 0-150.
    3. Provide specific scores (0-100) AND a ruthless, specific explanation (2-3 sentences) for:
        - Logical Coherence (Problem/Solution fit): Why did you give this score?
        - Market Depth (Real-time TAM/SAM/SOM estimates): Why is the market massive or tiny?
        - Unit Economics (Scalability stress-test): Why is it profitable or a money pit?
    4. Provide a brief, executive summary (max 2 sentences) of your verdict.
    5. Generate a catchy, 2-to-4 word auto-title for this venture.
    6. Generate a highly detailed, conceptual image prompt for the "Nano Banana" image generator to create a cyberpunk/neon startup poster for this idea.

    Return the result strictly as a valid JSON object with the following structure:
    {
      "title": "Venture Name",
      "imagePrompt": "Detailed prompt for Nano Banana...",
      "score": number,
      "radarData": [
        { "subject": "Market Depth", "A": number, "fullMark": 150 },
        { "subject": "Coherence", "A": number, "fullMark": 150 },
        { "subject": "Unit Econ", "A": number, "fullMark": 150 },
        { "subject": "Scalability", "A": number, "fullMark": 150 },
        { "subject": "Defensibility", "A": number, "fullMark": 150 },
        { "subject": "Viral Loop", "A": number, "fullMark": 150 }
      ],
      "detailedScores": {
        "logicalCoherence": number,
        "marketDepth": number,
        "unitEconomics": number
      },
      "metricDetails": {
        "logicalCoherence": "string",
        "marketDepth": "string",
        "unitEconomics": "string"
      },
      "feedback": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Sometimes Gemini adds explanatory text outside the JSON block. 
    // We should try to find the JSON object if parsing fails or if there's extra text.
    const jsonStartIndex = cleanText.indexOf('{');
    const jsonEndIndex = cleanText.lastIndexOf('}');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanText = cleanText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback in case of error
    return {
      title: "Untitled Venture",
      imagePrompt: "",
      score: 50,
      radarData: [],
      detailedScores: {
        logicalCoherence: 50,
        marketDepth: 50,
        unitEconomics: 50
      },
      metricDetails: {
        logicalCoherence: "Analysis failed. Please try again.",
        marketDepth: "Analysis failed. Please try again.",
        unitEconomics: "Analysis failed. Please try again."
      },
      feedback: "Analysis failed. Please try again."
    };
  }
}
