const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { processAudio } = require('./process_audio');
require('dotenv').config({ path: '.env.local' });

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

    const strategistKnowledge = fs.readFileSync(STRATEGIST_BRAIN_PATH, 'utf8');
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ${editorBible}

    ---
    
    ## TASK: Create the Article Blueprint
    You are the "Editor-in-Chief". 
    Based on the "Article Production Bible" above, and the "Strategist Knowledge" below, create the JSON Blueprint for the topic: "${topic}".

    ## Context: Strategist Knowledge
    ${strategistKnowledge.substring(0, 15000)}

    ## Category Specific Logic
    Category: ${category}
    (Reference the logic appropriate for this category from the knowledge base)

    ## Requirements
    - Output strictly valid JSON matching the schema in the Bible (Chapter 4).
    - **Do NOT write the full body content.**
    - For 'content_html' fields, write a **detailed instruction** (bullet points) of what the Writer should write in that section.
    - Example for content_html: "Explain the risk of new condos. Cite the 150% management fee increase data. Reference the 2026 cliff."
    - The Writer will fill in the actual HTML later. You are the Architect defining the structure.
    
    ## Output JSON
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const blueprint = JSON.parse(response.text());

        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const outputPath = path.join(ARTIFACTS_DIR, `${slug}_blueprint.json`);

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
