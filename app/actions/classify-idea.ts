"use server";

import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { InceptionAnalysis } from "@/types/inception";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const inceptionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    classification: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING, description: "cash_cow | cash_farm | new_meat | ozempics | dead_end" },
        label: { type: SchemaType.STRING, description: "Cash Cow | Cash Farm | New Meat | Ozempics | Dead End" },
        badgeColor: { type: SchemaType.STRING, description: "hex string (Green for Cash Cow/Cash Farm/New Meat/Ozempics, Red for Dead End)" },
        confidence: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING, description: "A sharp, 1-sentence explanation of EXACTLY why this idea fits this archetype." }
      },
      required: ["path", "label", "badgeColor", "confidence", "reasoning"]
    },
    marketResearch: {
      type: SchemaType.OBJECT,
      properties: {
        tam: { type: SchemaType.STRING, description: "Bottom-up calculation of Total Addressable Market" },
        sam: { type: SchemaType.STRING, description: "Serviceable Available Market" },
        som: { type: SchemaType.STRING, description: "Serviceable Obtainable Market" },
        niche: { type: SchemaType.STRING, description: "Deep analysis of the specific entry niche" },
        persona: { type: SchemaType.STRING, description: "Target customer persona: demographics, behaviors, pain points, buying patterns" },
        competitors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Top 3-5 main competitors with brief analysis of each" },
        leveragePoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key leverage points that can be exploited to gain advantage" }
      },
      required: ["tam", "sam", "som", "niche", "persona", "competitors", "leveragePoints"]
    },
    strategy: {
      type: SchemaType.OBJECT,
      properties: {
        sales1M: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Concrete outreach/validation for Month 1" },
        sales6M: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Scalable growth milestones for Month 6" },
        monetization: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Possible monetization/revenue models for the business" },
        distribution: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Distribution channel strategies to reach customers" },
        moat: { type: SchemaType.STRING, description: "How to build a competitive MOAT (defensibility, switching costs, network effects, etc.)" }
      },
      required: ["sales1M", "sales6M", "monetization", "distribution", "moat"]
    },
    execution: {
      type: SchemaType.OBJECT,
      properties: {
        first3Steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Immediate 3 steps" },
        whatElse: { type: SchemaType.STRING, description: "Domain-specific insight." },
        plan30d: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key execution items for the first 30 days" },
        plan90d: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key execution items for 30-90 days" },
        plan180d: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key execution items for 90-180 days" },
        teamCompetences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Required team competences/skills to execute" },
        partnershipSuggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Strategic partnership suggestions" }
      },
      required: ["first3Steps", "whatElse", "plan30d", "plan90d", "plan180d", "teamCompetences", "partnershipSuggestions"]
    }
  },
  required: ["classification", "marketResearch", "strategy", "execution"]
};

import { prisma } from "@/lib/prisma";
import { validateInput } from "@/app/actions/validate-input";
import { requireOwnership } from "@/lib/auth-guards";

export async function classifyIdea(ideaId: string, ideaText: string, language: string = 'en'): Promise<InceptionAnalysis> {
  await requireOwnership(ideaId);
  const validation = await validateInput(ideaText);
  if (!validation.safe) {
    throw new Error(validation.reason || "Input flagged for review.");
  }

  // Sanitize: strip quotes and newlines to prevent prompt boundary escape
  const safeIdeaText = ideaText.replace(/["\n\r]/g, ' ').substring(0, 2000).trim();

  // Structural prompt injection defence: system instructions are set via systemInstruction,
  // user input is passed as a separate user message — Gemini cannot confuse the two.
  const systemInstruction = `
    Act as "The Logic Engine", a strategic business analyst AI for the Syntix platform.
    Language: ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'} (Respond strictly in this language).

    Your task is to classify the user-submitted business idea into ONE of the following 5 Business Archetypes:
    1. Cash Cow — Low scale, high margin businesses. Solo-run, indie, revenue-first, high profitability per unit.
    2. Cash Farm — Businesses that scale through specialists. Service companies, agencies, B2B consulting that grow with expert talent.
    3. New Meat — Businesses that Venture Capital seeks to back. High risk, high potential return, large market, rapid growth.
    4. Ozempics — Deep tech ventures that promote behavior change. Paradigm-shifting technology, hard to replicate, winner-takes-most.
    5. Dead End — No return even with risk. Fundamentally flawed, illegal, physically impossible, or solved by existing free tools.

    Then, provide deep strategic research covering:
    A) MARKET RESEARCH: Target persona, Top 3-5 competitors, Exploitable leverage points, TAM/SAM/SOM.
    B) STRATEGY: Monetization models, Distribution channels, Competitive MOAT, Steps for Month 1 and Month 6.
    C) EXECUTION PLAN: First 3 steps, 30/90/180-day plans, Required team competences, Strategic partnerships, Domain insight.

    Return the result strictly as a valid JSON object matching the schema.
  `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: inceptionSchema
    }
  });

  try {
    // User input passed as a separate message — structurally isolated from system instructions
    const result = await model.generateContent(safeIdeaText);
    const text = result.response.text();
    // Clean up markdown code blocks if present (common issue with Gemini)
    let cleanText = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const jsonStartIndex = cleanText.indexOf('{');
    const jsonEndIndex = cleanText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanText = cleanText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const analysis = JSON.parse(cleanText) as InceptionAnalysis;

    // Persist to Database
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        archetype: analysis.classification.path,
        refinementJson: analysis as any,
        status: "refinement"
      }
    });

    return analysis;
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
      marketResearch: { tam: "N/A", sam: "N/A", som: "N/A", niche: "N/A", persona: "N/A", competitors: [], leveragePoints: [] },
      strategy: { sales1M: [], sales6M: [], monetization: [], distribution: [], moat: "N/A" },
      execution: { first3Steps: [], whatElse: "Please try again.", plan30d: [], plan90d: [], plan180d: [], teamCompetences: [], partnershipSuggestions: [] }
    };
  }
}
