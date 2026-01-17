const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API KEY provided");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("Fetching available models...");
    try {
        // There isn't a direct helper in the high-level SDK for listModels in quite the same way as python?
        // Actually the Node SDK exposes it via the ModelManager or simpler fetch?
        // Let's check documentation / source pattern.
        // The GoogleGenerativeAI class doesn't seem to have listModels directly on instances in older versions, 
        // but in latest it might be named differently or accessed via the underlying API client.

        // Actually, simply making a raw request to the endpoint is safest to identify what's going on.
        // Endpoint: https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("Error fetching models:", response.status, response.statusText);
            console.error("Details:", JSON.stringify(data, null, 2));
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.version}) [Supported generation methods: ${m.supportedGenerationMethods}]`);
            });
        } else {
            console.log("No models found in response.");
            console.log("Response:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Exception:", error);
    }
}

listModels();
