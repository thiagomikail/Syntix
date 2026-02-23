"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { InceptionAnalysis } from "@/types/inception";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function classifyIdea(idea: string, language: string = 'en'): Promise<InceptionAnalysis> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Act as "The Logic Engine", a strategic business analyst AI for the Syntix platform.
    Analyze the following business idea: "${idea}"

    Language: ${language} (Respond strictly in this language).

    Your task is to classify this idea into ONE of the following 5 Entrepreneurial Paths:

    1. Path 1: The Cash-Flow Micro (Indie/Levels model) - Revenue first, solo-run, low capital, high margin.
    2. Path 2: The Scalable Specialist (Ries/Aulet model) - B2B, niche dominance, scientific validation required.
    3. Path 3: The Venture Engine (Graham/YC model) - High growth potential (>7%/week), VC-scale, large market.
    4. Path 4: The Paradigm Shifter (Thiel/Hoffman model) - Monopoly potential, high-tech, winner-takes-most, hard to replicate.
    5. Path 5: The Dead End (Drop it now) - Fundamentally flawed, illegal, physically impossible, or solved by a free feature in major OS/Apps.

    Then, provide deep strategic research.

    Return the result strictly as a valid JSON object matching this structure:
    {
      "classification": {
        "path": "micro" | "specialist" | "venture" | "paradigm" | "dead_end",
        "label": "The Cash-Flow Micro" | "The Scalable Specialist" | "The Venture Engine" | "The Paradigm Shifter" | "The Dead End",
        "badgeColor": "hex string (Green for Micro/Specialist/Venture/Paradigm, Red for Dead End)",
        "confidence": number,
        "reasoning": "A sharp, 1-sentence explanation of EXACTLY why this idea fits this path."
      },
      "marketResearch": {
        "tam": "Bottom-up calculation of Total Addressable Market (e.g., '$5B (10M users * $500/yr)')",
        "sam": "Serviceable Available Market",
        "som": "Serviceable Obtainable Market (Year 1 target)",
        "niche": "Deep analysis of the specific entry niche"
      },
      "strategy": {
        "sales1M": ["Step 1", "Step 2", "Step 3"], // Concrete outreach/validation for Month 1
        "sales6M": ["Milestone 1", "Milestone 2"] // Scalable growth milestones for Month 6
      },
      "execution": {
        "first3Steps": ["Immediate Action 1", "Immediate Action 2", "Immediate Action 3"],
        "whatElse": "Domain-specific insight. For Path 4: Moat Analysis. For Path 1: 'Ship-it' checklist. For Path 5: 'Reality Check' explaining why to drop it."
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean up markdown code blocks if present (common issue with Gemini)
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStartIndex = cleanText.indexOf('{');
    const jsonEndIndex = cleanText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanText = cleanText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    return JSON.parse(cleanText) as InceptionAnalysis;
  } catch (error) {
    console.error("Classification Analysis failed:", error);
    // Fallback error object
    return {
      classification: {
        path: "dead_end",
        label: "Analysis Failed",
        badgeColor: "#ef4444",
        confidence: 0,
        reasoning: "System was unable to classify this idea. Please try again."
      },
      marketResearch: { tam: "N/A", sam: "N/A", som: "N/A", niche: "N/A" },
      strategy: { sales1M: [], sales6M: [] },
      execution: { first3Steps: [], whatElse: "Please try again." }
    };
  }
}
