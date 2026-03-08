const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyLine = env.split('\n').find(line => line.startsWith('GOOGLE_GEMINI_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1] : null;

async function run() {
    if (!apiKey) {
        console.log("No API Key found");
        return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: "A glowing blue futuristic banana, hyperrealistic, 4k" }],
                parameters: { sampleCount: 1 }
            })
        });
        const data = await response.json();
        if (data.predictions && data.predictions.length > 0) {
            console.log("SUCCESS. Image bytes length:", data.predictions[0].bytesBase64.length);
        } else {
            console.log("Failed. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
run();
