const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { processAudio } = require('./process_audio');
require('dotenv').config({ path: '.env.local' });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt, model = 'claude-3-haiku-20240307') {
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
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
    const match = files.find(f => f.toLowerCase().includes(keyword.toLowerCase()) && f.endsWith('.md'));
    return match ? path.join(ARTICLES_DIR, match) : null;
}

// --- Main Dispatcher ---
async function main() {
    const args = process.argv.slice(2);
    const modeIndex = args.indexOf('--type');
    const mode = (modeIndex !== -1 && args[modeIndex + 1]) ? args[modeIndex + 1] : 'article';

    const brandIndex = args.indexOf('--brand');
    const brandIdOverride = (brandIndex !== -1 && args[brandIndex + 1]) ? args[brandIndex + 1] : null;

    const cleanArgs = args.filter((arg, i) => 
        arg !== '--type' && args[i - 1] !== '--type' &&
        arg !== '--brand' && args[i - 1] !== '--brand'
    );
    const identifier = cleanArgs[0];
    const category = cleanArgs[1] || 'domestic';

    if (!identifier) {
        console.error("Usage: node scripts/brain_architect.js <topic/slug> [--type article|video] [--brand wealth|flip|...] [category]");
        process.exit(1);
    }

    console.log(`🧠 Brain Architect: Mode = ${mode.toUpperCase()} | Brand: ${brandIdOverride || 'default'}`);

    if (mode === 'video') {
        await architectVideo(identifier);
    } else {
        await architectArticle(identifier, category, brandIdOverride);
    }
}

// --- Video Architect ---
async function architectVideo(slugKeyword) {
    console.log("🎬 Starting Video Director...");
    const articlePath = findArticleFile(slugKeyword);
    if (!articlePath) {
        console.error(`❌ Article not found for keyword: ${slugKeyword}`);
        process.exit(1);
    }
    const articleContent = fs.readFileSync(articlePath, 'utf8');
    const videoBrain = fs.readFileSync(VIDEO_DIRECTOR_PATH, 'utf8');

    const dnaPath = path.join(process.cwd(), 'src/dna.config.json');
    let dna = {};
    try {
        dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    } catch (e) {
        console.warn("⚠️ DNA config not found in architectVideo.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ${videoBrain}
    ---
    ## TASK: Generate Video Script
    ${articleContent.substring(0, 20000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const scriptJson = JSON.parse(result.response.text());
        fs.writeFileSync(VIDEO_SCRIPT_PATH, JSON.stringify(scriptJson, null, 2));
        await processAudio();
    } catch (error) {
        console.error("❌ Video Architecture Failed:", error);
        process.exit(1);
    }
}

// --- Article Architect ---
async function architectArticle(topic, category, brandId = null) {
    console.log(`🏗️  Architecting Article Blueprint: ${topic} (Brand: ${brandId || 'default'})`);

    async function architectWithFallback(prompt) {
        const cleanAndParse = (text) => {
            let jsonString = text.trim();
            const start = jsonString.indexOf('{');
            const end = jsonString.lastIndexOf('}');
            if (start === -1 || end === -1) {
                console.error("❌ No JSON found in text.");
                throw new Error("Invalid output format from AI.");
            }
            jsonString = jsonString.slice(start, end + 1);

            // Robust cleaning for control characters
            jsonString = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, " ");

            try {
                return JSON.parse(jsonString);
            } catch (e) {
                console.warn("⚠️ Standard JSON.parse failed. Attempting complex recovery...");
                
                // Attempt to fix common AI mistakes (unescaped quotes inside strings, newlines)
                let repaired = jsonString
                    .replace(/\n/g, "\\n")
                    .replace(/\r/g, "\\r")
                    .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\") // Fix malformed escapes
                    .replace(/,\s*([\}\]])/g, '$1'); // Trailing commas
                
                try {
                    return JSON.parse(repaired);
                } catch (e2) {
                    console.error("❌ Recovery failed.");
                    console.log("DEBUG RAW PREVIEW:", jsonString.substring(0, 1000));
                    throw e2;
                }
            }
        };

        // 1. Primary: Stronger models for better JSON reliability
        const models = ["gemini-1.5-pro", "claude-3-5-sonnet-latest", "claude-3-haiku-20240307", "gemini-2.0-flash"];
        for (const modelId of models) {
            try {
                console.log(`🧠 Attempting model: ${modelId}...`);
                let resultText;
                if (modelId.startsWith('claude')) {
                    resultText = await callClaude(prompt, modelId);
                } else {
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({
                        model: modelId
                    });
                    const result = await model.generateContent(prompt);
                    resultText = result.response.text();
                }
                return cleanAndParse(resultText);
            } catch (e) {
                console.warn(`⚠️ Model ${modelId} failed: ${e.message}`);
            }
        }
        throw new Error("All AI models failed.");
    }

    const dnaPath = brandId ? path.join(process.cwd(), `src/dna.config.${brandId}.json`) : path.join(process.cwd(), 'src/dna.config.json');
    let dna = {};
    try {
        dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    } catch (e) {
        console.warn(`⚠️ DNA config not found at ${dnaPath}.`);
    }
    
    const siteId = brandId || dna.identity?.siteId || dna.identity?.site_id || 'wealth';
    const biblePath = dna.bible_path ? path.join(process.cwd(), dna.bible_path) : STRATEGIST_BRAIN_PATH;
    const strategistKnowledge = fs.readFileSync(biblePath, 'utf8');
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');

    const prompt = `
    ## TASK: Create the Article Blueprint (MANIFESTO MODE)
    **Brand Context**: ${siteId}
    **Category**: ${category}
    **Topic**: ${topic}
    
    ## BRAND BIBLE (The Manifesto)
    ${strategistKnowledge.substring(0, 15000)}
    
    ## MANDATORY JSON SCHEMA (Output strictly matching this):
    {
      "site_id": "${siteId}",
      "category": "${category}",
      "target_keyword": "string",
      "h1_title": "string (no HTML)",
      "intro_hook": "instruction string with [IMAGE_1] (max 300 chars, no HTML)",
      "sections": [
        { "h2_heading": "string (no HTML)", "content_html": "instruction string with [EXPERT_BOX] or [TABLE] if needed (max 300 chars, no HTML)" }
      ],
      "conclusion": "instruction string with [IMAGE_3] (max 200 chars, no HTML)",
      "meta_description": "string",
      "manifesto_check": "string"
    }

    ## ARCHITECT RULES:
    1. **NO HTML**: NEVER use HTML tags (e.g., <p>, <div>, <table>) in the output. This is a structural blueprint only.
    2. **MARKERS**: Use [IMAGE_1], [IMAGE_2], [IMAGE_3], [EXPERT_BOX], [TABLE] as markers in your instruction strings where those elements should be placed.
    3. **QUOTING RULE**: NEVER use the double quote character (") in Japanese text. Use 「 」 instead.
    4. **MANIFESTO ENFORCEMENT**: The H2 titles MUST reflect the brand's unique "Anti-Thesis" as defined in the Bible.
    5. **NO BRAND LEAKAGE**: Do not use logic from other brands.
    6. **NO FINISHED CONTENT**: Output only WRITING INSTRUCTIONS in Japanese.

    ## OUTPUT:
    - Output ONLY the JSON object. 
    - No markdown formatting (\`\`\`json), no preamble.
    `;

    try {
        const blueprint = await architectWithFallback(prompt);
        const today = new Date().toISOString().split('T')[0];
        let slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!slug || slug === '-' || /[^\x00-\x7F]/.test(topic)) {
            const crypto = require('crypto');
            const hash = crypto.createHash('md5').update(topic).digest('hex').substring(0, 8);
            slug = `${today}-${hash}`;
        } else if (!slug.startsWith(today)) {
            slug = `${today}-${slug}`;
        }
        
        const outputPath = path.join(ARTIFACTS_DIR, `${slug}_blueprint.json`);
        blueprint.site_id = siteId;
        blueprint.category = category;
        fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
        console.log(`✅ Blueprint saved: ${outputPath}`);
    } catch (error) {
        console.error("❌ Architecture Failed:", error);
        process.exit(1);
    }
}

main();
