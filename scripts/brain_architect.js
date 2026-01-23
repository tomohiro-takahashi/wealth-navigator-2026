const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { processAudio } = require('./process_audio');
require('dotenv').config({ path: '.env.local' });

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
            model: 'claude-3-haiku-20240307', // Fallback to Haiku (Tier 1 safe)
            max_tokens: 4096,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// --- Configuration ---
const ARTIFACTS_DIR = path.join(process.cwd(), 'content/blueprints');
const VIDEO_SCRIPT_PATH = path.join(process.cwd(), 'video-generator/src/video-script.json');
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// --- Brain Paths ---
const STRATEGIST_BRAIN_PATH = path.join(process.cwd(), 'libs/brain/titans_knowledge.md');
const EDITOR_BRAIN_PATH = path.join(process.cwd(), 'libs/brain/article_editor.md');
const VIDEO_DIRECTOR_PATH = path.join(process.cwd(), 'libs/brain/video_director.md');

// --- Helper: Find Article ---
function findArticleFile(keyword) {
    if (!fs.existsSync(ARTICLES_DIR)) return null;
    const files = fs.readdirSync(ARTICLES_DIR);
    // Find file that includes the keyword
    const match = files.find(f => f.toLowerCase().includes(keyword.toLowerCase()) && f.endsWith('.md'));
    return match ? path.join(ARTICLES_DIR, match) : null;
}

// --- Main Dispatcher ---
async function main() {
    const args = process.argv.slice(2);
    const modeIndex = args.indexOf('--type');
    const mode = (modeIndex !== -1 && args[modeIndex + 1]) ? args[modeIndex + 1] : 'article';

    // Remove flags from args to get the topic/identifier
    const cleanArgs = args.filter((arg, i) => arg !== '--type' && args[i - 1] !== '--type');
    const identifier = cleanArgs[0];
    const category = cleanArgs[1] || 'domestic';

    if (!identifier) {
        console.error("Usage: node scripts/brain_architect.js <topic/slug> [--type article|video] [category]");
        process.exit(1);
    }

    console.log(`🧠 Brain Architect: Mode = ${mode.toUpperCase()}`);

    if (mode === 'video') {
        await architectVideo(identifier);
    } else {
        await architectArticle(identifier, category);
    }
}

// --- Video Architect ---
async function architectVideo(slugKeyword) {
    console.log("🎬 Starting Video Director...");

    // 1. Locate Article
    const articlePath = findArticleFile(slugKeyword);
    if (!articlePath) {
        console.error(`❌ Article not found for keyword: ${slugKeyword}`);
        console.log(`   Searched in: ${ARTICLES_DIR}`);
        process.exit(1);
    }
    console.log(`📄 Using Article: ${path.basename(articlePath)}`);
    const articleContent = fs.readFileSync(articlePath, 'utf8');
    const videoBrain = fs.readFileSync(VIDEO_DIRECTOR_PATH, 'utf8');

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // 3. Construct Prompt
    const prompt = `
    ${videoBrain}

    ---
    
    ## TASK: Generate Video Script
    You are the "Video Director".
    Based on the "Video Director Bible" above, create a 60-second video script JSON for the provided Article.
    
    ## Input Article
    ${articleContent.substring(0, 20000)}

    ## Requirements
    - Conform strictly to the JSON Schema in Chapter 4 of the Bible.
    - **Total Duration Target:** ~60 seconds (but prioritize content flow).
    - **Narration:** Natural, conversational, and punchy.
    - **Visuals:** Highly descriptive English prompts.
    
    ## Output JSON
    `;

    try {
        console.log("🤖 Generating Script with Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text();
        let scriptJson = JSON.parse(jsonText);
        if (Array.isArray(scriptJson)) {
            scriptJson = scriptJson[0];
        }

        // Save Script
        fs.writeFileSync(VIDEO_SCRIPT_PATH, JSON.stringify(scriptJson, null, 2));
        console.log(`✅ Video Script saved to: ${VIDEO_SCRIPT_PATH}`);

        // 4. Process Audio (Generate Voice & Sync Duration)
        console.log("🔊 Generating Audio & Syncing Duration...");
        await processAudio();

    } catch (error) {
        console.error("❌ Video Architecture Failed:", error);
        process.exit(1);
    }
}

// --- Article Architect ---
async function architectArticle(topic, category) {
    console.log(`🏗️  Architecting Article Blueprint for: ${topic} (${category})`);

    // --- STRATEGY: RESILIENT ARCHITECT ---
    // Primary: Gemini 3 Flash (Cost/Speed)
    // Fallback: Claude 3.5 Sonnet (Quality/Reliability)

    async function architectWithFallback(prompt) {
        // Shared Cleaner Function
        const cleanAndParse = (text) => {
            let cleanJson = text.trim();
            if (cleanJson.includes('```')) cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
            const start = cleanJson.indexOf('{');
            const end = cleanJson.lastIndexOf('}');
            if (start !== -1 && end !== -1) cleanJson = cleanJson.slice(start, end + 1);

            // State machine cleaner
            let fixedJson = '';
            let inString = false;
            let escaped = false;
            for (let i = 0; i < cleanJson.length; i++) {
                const char = cleanJson[i];
                if (char === '"' && !escaped) inString = !inString;
                if (char === '\\' && !escaped) escaped = true;
                else escaped = false;
                if (inString) {
                    if (char === '\n') fixedJson += '\\n';
                    else if (char === '\r') fixedJson += '\\r';
                    else if (char === '\t') fixedJson += '\\t';
                    else fixedJson += char;
                } else {
                    fixedJson += char;
                }
            }
            return JSON.parse(fixedJson);
        };

        // 1. Try Gemini (Primary) with Retries
        const MAX_RETRIES = 3;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`🌐 Architect Strategy: Attempting Primary (Gemini 3 Flash)... [Attempt ${attempt}/${MAX_RETRIES}]`);
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({
                    model: "gemini-3-flash-preview",
                    generationConfig: { responseMimeType: "application/json" },
                    safetySettings: [
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                });

                const result = await model.generateContent(prompt);
                const text = result.response.text();

                // Validate IMMEDIATELY
                return cleanAndParse(text);

            } catch (geminiError) {
                console.warn(`⚠️ Gemini Attempt ${attempt} Failed: ${geminiError.message}`);

                if (attempt < MAX_RETRIES) {
                    const waitTime = attempt * 3000; // 3s, 6s...
                    console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
                    await new Promise(r => setTimeout(r, waitTime));
                } else {
                    console.error(`❌ All Gemini attempts failed. Moving to Fallback.`);
                }
            }
        }

        console.log("🛡️ Architect Strategy: Activating Fallback (Claude 3.5 Sonnet)...");

        // 2. Try Claude (Fallback)
        try {
            const claudeText = await callClaude(prompt);
            return cleanAndParse(claudeText);
        } catch (claudeError) {
            throw new Error(`CRITICAL: All AI Engines Failed. Claude Error: ${claudeError.message}`);
        }
    }

    const dnaPath = path.join(process.cwd(), 'src/dna.config.json');
    let dna = {};
    try {
        dna = require(dnaPath);
        console.log(`🧬 Loaded DNA for: ${dna.identity.name}`);
    } catch (e) {
        console.warn("⚠️ DNA config not found, using defaults.");
    }

    // Load Strategy from DNA Bible Path or Fallback
    const biblePath = dna.bible_path ? path.join(process.cwd(), dna.bible_path) : STRATEGIST_BRAIN_PATH;
    console.log(`📖 Utilizing Bible: ${path.basename(biblePath)}`);
    const strategistKnowledge = fs.readFileSync(biblePath, 'utf8');
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');


    const prompt = `
    ${editorBible}

    ---
    
    ## TASK: Create the Article Blueprint
    You are the "Editor-in-Chief" for "${dna.identity?.name || 'the media'}".
    **Role:** ${dna.persona?.role || 'Expert'}
    **Tone:** ${dna.persona?.tone || 'Professional'}
    **Target Audience:** ${dna.target?.audience || 'General'}
    
    Based on the "Article Production Bible" above, and the "Strategist Knowledge" below, create the JSON Blueprint for the topic: "${topic}".

    ## Context: Strategist Knowledge
    ${strategistKnowledge.substring(0, 15000)}

    ## Category Specific Logic
    Category: ${category}
    Context/Focus: ${dna.categories?.[category]?.context || 'Apply general logic for this category based on the bible.'}
    (Reference the above Context/Focus to determine the angle)

    ## Requirements
    - Output strictly valid JSON matching the schema in the Bible (Chapter 4).
    - **Do NOT write the full body content.**
    - For 'content_html' fields, write a **detailed instruction** (bullet points) of what the Writer should write in that section.
    - Example for content_html: "Explain the risk of new condos. Cite the 150% management fee increase data. Reference the 2026 cliff."
    - The Writer will fill in the actual HTML later. You are the Architect defining the structure.
    
    ## Output JSON
    IMPORTANT: RETURN ONLY THE RAW JSON. NO PREAMBLE.
    OUTPUT MUST BE MINIFIED (SINGLE LINE). DO NOT USE UNESCAPED NEWLINES INSIDE STRINGS.
    `;

    try {
        const blueprint = await architectWithFallback(prompt);

        // Remove redundant cleaning logic here since architectWithFallback returns parsed JSON object
        /*
        // Clean result (Handle Markdown/Newlines)
        let cleanJson = resultText.trim();
        if (cleanJson.includes('```')) {
            cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
        }

        // Robust extraction: Find first { and last }
        const start = cleanJson.indexOf('{');
        const end = cleanJson.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleanJson = cleanJson.slice(start, end + 1);
        }

        // Custom State Machine Cleaner (handles escaped chars in strings)
        let fixedJson = '';
        let inString = false;
        let escaped = false;
        for (let i = 0; i < cleanJson.length; i++) {
            const char = cleanJson[i];
            if (char === '"' && !escaped) inString = !inString;
            if (char === '\\' && !escaped) escaped = true;
            else escaped = false;

            if (inString) {
                if (char === '\n') fixedJson += '\\n';
                else if (char === '\r') fixedJson += '\\r';
                else if (char === '\t') fixedJson += '\\t';
            } else {
                fixedJson += char;
            }
        }

        const blueprint = JSON.parse(fixedJson);
        */

        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const outputPath = path.join(ARTIFACTS_DIR, `${slug}_blueprint.json`);

        blueprint.site_id = dna.identity?.siteId || dna.identity?.site_id || 'wealth_navigator';

        fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
        console.log(`✅ Blueprint saved to: ${outputPath}`);
        console.log(`   Title: ${blueprint.h1_title}`);

    } catch (error) {
        console.error("❌ Architecture Failed:", error);
        process.exit(1);
    }
}

// Run Main
main();
