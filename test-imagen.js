const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
    try {
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        const result = await model.generateContent("A futuristic swarm of robotic bees pollinating a cybernetic flower");
        console.log(result.response.text());
    } catch (e) {
        console.error("Error with imagen-3.0", e.message);
    }
}
run();
