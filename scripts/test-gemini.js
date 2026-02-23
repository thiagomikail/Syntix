const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config(); // Fallback to .env

async function listModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    // There isn't a direct listModels method on the SDK's top level in some versions,
    // but let's try to just run a generation with a few likely candidates to see which one works.

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest"
    ];

    console.log("Testing model availability...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS!`);
        } catch (error) {
            if (error.message.includes("404")) {
                console.log(`FAILED (404 Not Found)`);
            } else {
                console.log(`FAILED (${error.message.split(' ')[0]}...)`);
            }
        }
    }
}

listModels();
