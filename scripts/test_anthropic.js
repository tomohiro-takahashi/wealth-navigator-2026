
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const models = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-latest",
        "claude-opus-4-5-20251101",
        "claude-3-7-sonnet-20250620",
        "claude-3-5-haiku-20241022"
    ];

    console.log("ANTHROPIC_API_KEY: " + (apiKey ? "Found (" + apiKey.substring(0, 10) + "...)" : "Not found"));

    for (const model of models) {
        try {
            console.log(`\nTesting model: ${model}...`);
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 10,
                    messages: [{ role: "user", content: "hi" }]
                })
            });

            const data = await response.json();
            console.log(`Status: ${response.status}`);
            if (response.ok) {
                console.log(`✅ Success: ${data.content[0].text}`);
            } else {
                console.log(`❌ Error: ${data.error.type} - ${data.error.message}`);
            }
        } catch (e) {
            console.log(`⚠️ Exception: ${e.message}`);
        }
    }
}

test();
