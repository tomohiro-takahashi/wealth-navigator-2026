const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

// Configuration
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-2.0-flash-exp";

if (!API_KEY) {
    console.error("❌ GOOGLE_API_KEY is missing in .env.local");
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

    // Load the Director Persona/Instructions
    const directorBrainPath = path.resolve(__dirname, '../libs/brain/video_director.md');
    let directorPersona = "";
    try {
        directorPersona = fs.readFileSync(directorBrainPath, 'utf-8');
    } catch (e) {
        console.error("⚠️ Could not read libs/brain/video_director.md. Using default instructions.");
        directorPersona = "You are a Video Director. Create a 60s script.";
    }


${ directorPersona }

    ---
## Input Article Content
${ articleContent.substring(0, 15000) } // Limit context if too large
    ---

** Instruction:**
        1. ** Analyze the Article:** Determine which Script Type(A, B, C, or D) best fits this content based on the "Matrix" in the Role Definition.
   - Type A: Myth Buster(For trends, news, misconceptions)
        - Type B: Story / Warning(For failures, specific cases)
            - Type C: Insider / Secret(For "truth behind the scenes", rich people secrets)
                - Type D: Q & A / Consultant(For specific questions, dialogue style)

    2. ** Generate Video Script JSON:**
        - Create a JSON object strictly following the provided Schema.
   - `script_type`: Set to the selected type(e.g., "Type B").
   - `scenes`: Generate scenes appropriate for that specific type's structure.
        - `total_duration`: Aim for 60s, but ALLOW IT TO EXCEED 60s if the content is rich.Do not cut off sentences.
   - `screen_text`: Keep it short!(Max 20 chars per line).

Ensure the output is strictly valid JSON inside \`\`\`json\`\`\` blocks.


    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and Extract JSON
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

    } catch (error) {
    console.error("❌ Generation Failed:", error);
    process.exit(1);
}
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
