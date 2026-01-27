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

    const dnaPath = path.join(process.cwd(), 'src/dna.config.json');
    let dna = {};
    try {
        dna = require(dnaPath);
    } catch (e) {
        console.warn("⚠️ DNA config not found in architectVideo, using defaults.");
    }

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

    async function generateVideoScriptResilient(prompt, dna) {
        const siteId = dna.identity?.site_id || dna.identity?.siteId || "wealth";
        const useClaudePrimary = siteId === "wealth";

        // 1. Primary Strategy
        if (useClaudePrimary) {
            console.log("💎 Wealth Brand detected: Using Claude Opus as Primary Engine.");
            try {
                const anthropic = require('@anthropic-ai/sdk'); 
                const client = new anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
                const msg = await client.messages.create({
                    model: "claude-opus-4-5-20251101",
                    max_tokens: 4096,
                    messages: [{ role: "user", content: prompt }]
                });
                return JSON.parse(msg.content[0].text);
            } catch (claudeError) {
                console.warn(`⚠️ Claude Opus Primary Failed: ${claudeError.message}. Falling back to Gemini...`);
            }
        }

        // 2. Gemini Strategy (Default for other brands, or fallback for Wealth) - High Persistence
        const MAX_RETRIES = 5;
        const geminiModels = ["gemini-2.0-flash", "gemini-3-flash-preview"];
        
        for (const modelId of geminiModels) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`🌐 Video Strategy: Attempting ${modelId}... [Attempt ${attempt}/${MAX_RETRIES}]`);
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({
                        model: modelId,
                        generationConfig: { responseMimeType: "application/json" }
                    });
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();
                    let cleanJson = text.trim();
                    if (cleanJson.includes('```')) {
                        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
                    }
                    return JSON.parse(cleanJson);
                } catch (e) {
                    console.warn(`⚠️ ${modelId} Video Attempt ${attempt} Failed: ${e.message}`);
                    if (attempt < MAX_RETRIES) {
                        const waitSec = 10;
                        console.log(`⏳ Waiting ${waitSec}s before retry...`);
                        await new Promise(r => setTimeout(r, waitSec * 1000));
                    }
                }
            }
        }

        // 3. Recovery Plan: Fallback to Claude (Haiku) if Gemini is exhausted
        console.log("🛡️ RECOVERY PLAN: All Gemini attempts failed. Activating Fallback (Claude Haiku)...");
        try {
            const haikuResult = await callClaude(prompt); // Existing helper uses Haiku
            let cleanJson = haikuResult.trim();
            if (cleanJson.includes('```')) {
                cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            return JSON.parse(cleanJson);
        } catch (recoveryError) {
            console.error(`❌ Recovery Plan Failed: ${recoveryError.message}`);
            throw new Error(`❌ Video Script Generation totally failed. Gemini exhausted and Claude fallback failed.`);
        }
    }

    try {
        console.log("🤖 Generating Script...");
        let scriptJson = await generateVideoScriptResilient(prompt, dna);
        if (Array.isArray(scriptJson)) {
            scriptJson = scriptJson[0];
        }

        const slug = slugKeyword; // Ensure slug is defined for MD generation

        // Save Script (JSON for Remotion)
        fs.writeFileSync(VIDEO_SCRIPT_PATH, JSON.stringify(scriptJson, null, 2));
        console.log(`✅ Video Script (JSON) saved to: ${VIDEO_SCRIPT_PATH}`);

        // 3.5 Save Markdown versions for Drive/Human Review
        console.log("📝 Generating Markdown versions of Video Script & Prompts...");
        const scriptMd = `# 動画台本: ${scriptJson.project_title || slug}\n\n` + 
            scriptJson.scenes.map(s => `## Scene ${s.scene_id} (${s.section_type})\n**ナレーション:**\n${s.narration_text}\n\n**画面テキスト:**\n${s.screen_text}`).join('\n\n');
        
        const promptsMd = `# 動画生成プロンプト: ${scriptJson.project_title || slug}\n\n` + 
            scriptJson.scenes.map(s => `## Scene ${s.scene_id}\n**Visual Prompt:**\n${s.visual_prompt}`).join('\n\n');

        const scriptPath = path.join(process.cwd(), 'content/scripts', `${slug}.md`);
        const promptsPath = path.join(process.cwd(), 'content/prompts', `${slug}_prompts.md`);

        if (!fs.existsSync(path.dirname(scriptPath))) fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
        if (!fs.existsSync(path.dirname(promptsPath))) fs.mkdirSync(path.dirname(promptsPath), { recursive: true });

        fs.writeFileSync(scriptPath, scriptMd);
        fs.writeFileSync(promptsPath, promptsMd);
        console.log(`✅ Script MD: ${scriptPath}`);
        console.log(`✅ Prompts MD: ${promptsPath}`);

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

    async function architectWithFallback(prompt, brand) {
        // Shared Cleaner Function
        const cleanAndParse = (text) => {
            let cleanJson = text.trim();
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
                    else fixedJson += char;
                } else {
                    fixedJson += char;
                }
            }
            return JSON.parse(fixedJson);
        };

        // 1. Try Gemini (Primary) with Retries - High Persistence for Cost Saving
        const MAX_RETRIES = 5; 
        const geminiModels = ["gemini-2.0-flash", "gemini-3-flash-preview"];
        
        for (const modelId of geminiModels) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`🌐 Architect Strategy: Attempting ${modelId}... [Attempt ${attempt}/${MAX_RETRIES}]`);
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({
                        model: modelId,
                        generationConfig: { responseMimeType: "application/json" },
                        safetySettings: [
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    });

                    const result = await model.generateContent(prompt);
                    const text = result.response.text();

                    return cleanAndParse(text);

                } catch (geminiError) {
                    console.warn(`⚠️ ${modelId} Attempt ${attempt} Failed: ${geminiError.message}`);

                    if (attempt < MAX_RETRIES) {
                        const waitSec = 10;
                        console.log(`⏳ Waiting ${waitSec}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
                        await new Promise(r => setTimeout(r, waitSec * 1000));
                    }
                }
            }
        }

        // 2. Fallback to Claude
        console.log("🛡️ RECOVERY PLAN: Gemini exhausted. Activating Fallback (Claude Sonnet)...");
        try {
            const anthropic = require('@anthropic-ai/sdk'); 
            const client = new anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            const model = "claude-opus-4-5-20251101";
            
            console.log(`🧠 Using Claude model: ${model}`);
            const msg = await client.messages.create({
                model: model,
                max_tokens: 4096,
                messages: [{ role: "user", content: prompt }]
            });
            return cleanAndParse(msg.content[0].text);
        } catch (recoveryError) {
            console.error(`❌ Recovery Plan Failed: ${recoveryError.message}`);
            throw new Error(`❌ Article Architecture totally failed. Gemini exhausted and Claude fallback failed.`);
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
    
    const brandId = dna.identity?.siteId || dna.identity?.site_id || 'wealth';

    // Load Strategy from DNA Bible Path or Fallback
    const biblePath = dna.bible_path ? path.join(process.cwd(), dna.bible_path) : STRATEGIST_BRAIN_PATH;
    console.log(`📖 Utilizing Bible: ${path.basename(biblePath)}`);
    const strategistKnowledge = fs.readFileSync(biblePath, 'utf8');
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');


    const prompt = `
    ${editorBible}

    ---
    
    ## TASK: Create the Article Blueprint
    You are the "Editor-in-Chief" for "${siteId === 'wealth' ? 'Wealth Navigator' : siteId === 'kominka' ? '古民家ナビゲーター' : siteId === 'flip' ? 'Flip Logic' : siteId === 'subsidy' ? 'おうちの補助金相談室' : '親の家、どうする？'}".
    **Site ID:** ${siteId}
    **Role:** ${dna.persona?.role || 'Expert'}
    **Tone:** ${dna.persona?.tone || 'Professional'}
    **Target Audience:** ${dna.target?.audience || 'General'}
    
    あなたは現在、このブランドの専門家として、独自の「バイブル（思想）」に基づいた企画を立てています。
    他のブランド（例：Wealthの時にFlipの出口戦略を語りすぎる、など）の主張を混ぜないように厳重に注意してください。
    
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
        const blueprint = await architectWithFallback(prompt, brandId);

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

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        let slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        // Fallback for non-ASCII topics (like Japanese) - use deterministic hashing to avoid duplicates
        if (!slug || slug === '-' || /[^\x00-\x7F]/.test(topic)) {
            const crypto = require('crypto');
            const hash = crypto.createHash('md5').update(topic).digest('hex').substring(0, 8);
            slug = `${today}-${hash}`;
            console.log(`[INFO] Non-ASCII topic detected. Generated deterministic slug: ${slug}`);
        } else {
            // Prepend date to slugs for consistency
            if (!slug.startsWith(today)) {
                slug = `${today}-${slug}`;
            }
        }
        
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
