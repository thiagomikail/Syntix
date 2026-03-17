import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const ideaSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    ideaName: { type: SchemaType.STRING, description: "Catchy, concise name for the business" },
    pitch: { type: SchemaType.STRING, description: "A highly tailored 2-sentence pitch for this specific person, based on their exact role and company." },
    whyNow: { type: SchemaType.STRING, description: "Why recent advancements in AI make this historically difficult business now easily executable for this person." },
    tam: { type: SchemaType.STRING, description: "Total Addressable Market (e.g. '$5B')" },
    sam: { type: SchemaType.STRING, description: "Serviceable Available Market (e.g. '$500M')" },
    som: { type: SchemaType.STRING, description: "Serviceable Obtainable Market (e.g. '$5M')" },
    timeToLaunch: { type: SchemaType.NUMBER, description: "Estimated time to launch an MVP in months (integer)" }
  },
  required: ["ideaName", "pitch", "whyNow", "tam", "sam", "som", "timeToLaunch"]
};

// Enable CORS so the standalone HTML file can call this API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, position, company, apiKey } = body;

    if (!position) {
      return NextResponse.json({ error: "Position is required to generate a tailored idea." }, { status: 400, headers: corsHeaders });
    }
    
    // Use the client-provided key if available, otherwise fallback to server env
    const activeKey = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    if (!activeKey || activeKey === "YOUR_GEMINI_API_KEY") {
        return NextResponse.json({ error: "Valid Gemini API Key is required." }, { status: 401, headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(activeKey);

    const systemInstruction = `
      You are an elite Startup Founder and Business Strategist.
      
      The user will provide a person's Name, Job Position, and Company.
      Your task is to invent ONE highly tailored, highly actionable business or startup idea specifically for them.
      
      CRITICAL RULES:
      1. TAILORED: The idea MUST leverage their specific industry knowledge from their current position and company. Do not give generic ideas.
      2. AI LEVERAGE: The idea must be something that was very hard to build 5 years ago, but is now "easily executable" because AI has broken down the barriers to entry (e.g. AI-driven automation, LLM workflows, generative design, etc).
      3. METRICS: You must calculate or intelligently estimate realistic startup metrics: TAM, SAM, and SOM.
      
      Return ONLY a valid JSON object matching the requested schema.
    `;

    const prompt = `Name: ${name || "Unknown"}\nPosition: ${position}\nCompany: ${company || "Unknown"}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ideaSchema,
        temperature: 0.7
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up potential markdown wrapper (sometimes returned by Gemini even with JSON mimeType)
    let cleanText = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const jsonStartIndex = cleanText.indexOf('{');
    const jsonEndIndex = cleanText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanText = cleanText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const analysis = JSON.parse(cleanText);

    return NextResponse.json(analysis, { headers: corsHeaders });

  } catch (error: any) {
    console.error("CRM Idea Generation Failed:", error);
    return NextResponse.json(
      { error: "Failed to generate idea", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
