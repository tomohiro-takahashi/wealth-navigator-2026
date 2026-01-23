const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

// Configuration
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-3-flash-preview";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt) {
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

if (!API_KEY && !ANTHROPIC_API_KEY) {
    console.error("❌ GOOGLE_API_KEY or ANTHROPIC_API_KEY are required in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateVideoScript(articlePath) {
    console.log(`🎬 Video Director Brain Activated for: ${articlePath}`);

    let articleContent = "";
    try {
        articleContent = fs.readFileSync(articlePath, 'utf-8');
    } catch (e) {
        console.error(`❌ Could not read article file: ${e.message}`);
        process.exit(1);
    }

    // Load DNA Configuration
    const dnaPath = path.resolve(__dirname, '../src/dna.config.json');
    let dna = {};
    try {
        dna = require(dnaPath);
        console.log(`🧬 DNA Loaded for Video Director: ${dna.identity?.name}`);
    } catch (e) {
        console.warn("⚠️ DNA config not found. Using defaults.");
        dna = {
            identity: { name: "Wealth Navigator" },
            target: { audience: "Affluent Investors" },
            persona: { tone: "Professional & Trustworthy" }
        };
    }

    // Load the Director Persona/Instructions
    const directorBrainPath = path.resolve(__dirname, '../libs/brain/video_director.md');
    let directorPersona = "";
    try {
        directorPersona = fs.readFileSync(directorBrainPath, 'utf-8');

        // Dynamic Injection of DNA
        directorPersona = directorPersona
            .replace(/{{DNA_BRAND_NAME}}/g, dna.identity?.name || "Wealth Navigator")
            .replace(/{{DNA_TARGET_AUDIENCE}}/g, dna.target?.audience || "Investory")
            .replace(/{{DNA_PERSONA_TONE}}/g, dna.persona?.tone || "Professional");

    } catch (e) {
        console.error("⚠️ Could not read libs/brain/video_director.md. Using default instructions.");
        directorPersona = "You are a Video Director. Create a 60s script.";
    }

    const prompt = `
${directorPersona}

    ---
## Input Article Content
${articleContent.substring(0, 15000)} // Limit context if too large
    ---

** Instruction:**
        1. ** Analyze the Article:** Determine which Script Type(A, B, C, or D) best fits this content based on the "Matrix" in the Role Definition.
   - Type A: Myth Buster(For trends, news, misconceptions)
        - Type B: Story / Warning(For failures, specific cases)
            - Type C: Insider / Secret(For "truth behind the scenes", rich people secrets)
                - Type D: Q & A / Consultant(For specific questions, dialogue style)

    2. ** Generate Video Script JSON:**
        - Create a JSON object strictly following the provided Schema.
   - \`script_type\`: Set to the selected type(e.g., "Type B").
   - \`scenes\`: Generate scenes appropriate for that specific type's structure.
        - \`total_duration\`: Aim for 60s, but ALLOW IT TO EXCEED 60s if the content is rich.Do not cut off sentences.
   - \`screen_text\`: Keep it short!(Max 20 chars per line).

Ensure the output is strictly valid JSON inside \`\`\`json\`\`\` blocks.
`;


    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`🎬 Video Director Attempt ${attempt} (Gemini)...`);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return parseAndCleanJson(text);

        } catch (error) {
            console.warn(`⚠️ Video Director Attempt ${attempt} Failed: ${error.message}`);
            if (attempt < 3) await new Promise(r => setTimeout(r, 4000));
        }
    }

    // Fallback to Claude
    console.log("🛡️ All Gemini attempts failed. Activating Fallback (Claude)...");
    try {
        const text = await callClaude(prompt);
        return parseAndCleanJson(text);
    } catch (error) {
        console.error("❌ Video Director Fallback Failed:", error);
        process.exit(1);
    }
}

function parseAndCleanJson(text) {
    let jsonStr = text;
    if (text.includes('```json')) {
        jsonStr = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
        jsonStr = text.split('```')[1].split('```')[0];
    }
    jsonStr = jsonStr.trim();
    const scriptJson = JSON.parse(jsonStr);
    console.log("✅ Video Script Generated Successfully!");
    return scriptJson;
}


// Main Execution
(async () => {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: node scripts/brain_video_director.js <article_html_path> [output_json_path]");
        process.exit(1);
    }

    const articlePath = args[0];
    const outputPath = args[1] || articlePath.replace('.html', '_video_script.json').replace('.json', '_video_script.json'); // handle if input was json blueprint too

    const scriptJson = await generateVideoScript(articlePath);

    fs.writeFileSync(outputPath, JSON.stringify(scriptJson, null, 2));
    console.log(`📄 Script saved to: ${outputPath}`);
})();
