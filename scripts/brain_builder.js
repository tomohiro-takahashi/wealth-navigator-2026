const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const EDITOR_BRAIN_PATH = path.join(process.cwd(), 'libs/brain/article_editor.md');

async function callClaude(prompt, model = 'claude-3-5-sonnet-latest') {
    // If Sonnet 404s, we will fall back to Haiku in the caller
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            max_tokens: 8192,
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

async function callGemini(prompt, modelId = "gemini-2.0-flash") {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function builderArticle() {
    console.log("🔨 Starting Brain Builder (Writer)...");

    const slug = process.argv[2];
    if (!slug) {
        console.error("Usage: node scripts/brain_builder.js <slug>");
        process.exit(1);
    }

    const blueprintPath = path.join(process.cwd(), 'content/blueprints', `${slug}_blueprint.json`);
    if (!fs.existsSync(blueprintPath)) {
        console.error(`Blueprint not found: ${blueprintPath}`);
        process.exit(1);
    }

    const blueprint = fs.readFileSync(blueprintPath, 'utf8');
    const blueprintObj = JSON.parse(blueprint);
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');
    
    const siteId = blueprintObj.site_id || "wealth";
    const dnaPath = path.join(process.cwd(), `src/dna.config.${siteId}.json`);
    let dna = {};
    if (fs.existsSync(dnaPath)) {
        dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    }

    const brandBiblePath = path.join(process.cwd(), 'libs/brain/bibles', `${siteId}_bible.md`);
    let brandBible = "";
    if (fs.existsSync(brandBiblePath)) {
        brandBible = fs.readFileSync(brandBiblePath, 'utf8');
    }

    const prompt = `
    ${editorBible}
    ## BRAND DNA
    Persona: ${dna.persona?.role || 'Expert'}
    Tone: ${dna.persona?.tone || 'Professional'}
    
    ## BRAND SPIRIT
    ${brandBible}
    
    ---
    ## TASK: Build the Article Content
    Replace every 'content_html' instruction in the JSON below with actual High-Quality HTML content.
    Follow the "Style Rules" in the Bible (Japanese, Professional, Numbers-based).
    Ensure total article length is around 5,000 characters.

    ## Blueprint JSON
    ${blueprint}

    ## Important
    Output ONLY THE COMPLETED JSON. No markdown blocks.
    `;

    try {
        console.log(`✍️  Writing content for: ${slug} (Brand: ${siteId})`);
        let result;

        // 1. Try Claude Sonnet 3.5 -> Gemini Flash -> Haiku
        try {
            console.log("🧠 Attempting Claude Sonnet...");
            result = await callClaude(prompt, 'claude-3-5-sonnet-20240620');
        } catch (e1) {
            console.warn(`⚠️ Sonnet failed. Trying Gemini Flash...`);
            try {
                result = await callGemini(prompt, 'gemini-flash-latest');
            } catch (e2) {
                console.warn(`⚠️ Gemini Flash failed. Trying Haiku...`);
                try {
                    const haikuResponse = await fetch(ANTHROPIC_API_URL, {
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
                    if (!haikuResponse.ok) throw new Error(`Haiku failed: ${haikuResponse.status}`);
                    const haikuData = await haikuResponse.json();
                    result = haikuData.content[0].text;
                } catch (e3) {
                    console.error("❌ All models failed.");
                    throw e3;
                }
            }
        }

        // Clean result
        let cleanJson = result.trim();
        const start = cleanJson.indexOf('{');
        const end = cleanJson.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error("No JSON found in response.");
        cleanJson = cleanJson.slice(start, end + 1);

        // Robust cleaning
        cleanJson = cleanJson.replace(/[\x00-\x1F\x7F-\x9F]/g, " "); // Remove control characters
        
        let contentJson;
        try {
            contentJson = JSON.parse(cleanJson);
        } catch (e) {
            console.warn("⚠️ JSON.parse failed. Attempting complex recovery...");
            // Escape special chars in content but not in JSON structure
            // This is a naive attempt, but often works for AI-generated strings
            const repaired = cleanJson
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");
            try {
                contentJson = JSON.parse(repaired);
            } catch (e2) {
                console.error("❌ Recovery failed.");
                console.log("DEBUG RAW PREVIEW:", cleanJson.substring(0, 500));
                throw e2;
            }
        }
        const outputPath = path.join(process.cwd(), 'content/blueprints', `${slug}_complete.json`);
        fs.writeFileSync(outputPath, JSON.stringify(contentJson, null, 2));
        
        console.log("🧩 Assembling Final Artifacts...");
        convertToArtifacts(contentJson, slug);

    } catch (error) {
        console.error("❌ Build Failed:", error);
        process.exit(1);
    }
}

function convertToArtifacts(json, slug) {
    let htmlLines = [`<h1>${json.h1_title}</h1>`, json.intro_hook];
    if (json.sections) {
        json.sections.forEach(sec => {
            htmlLines.push(`<h2>${sec.h2_heading}</h2>`, sec.content_html);
        });
    }
    htmlLines.push(`<h2>まとめ</h2>`, json.conclusion);

    const fullHtml = htmlLines.join('\n\n');
    const today = new Date().toISOString().split('T')[0];
    const category = json.category || 'column';
    const siteId = json.site_id || 'wealth';

    const articleMd = `---\ntitle: "${json.h1_title}"\npublishedAt: "${today}"\nsite_id: "${siteId}"\ncategory: "${category}"\ncoverImage: "/images/articles/${slug}/01.webp"\n---\n\n` + 
        `# ${json.h1_title}\n\n${json.intro_hook}\n\n` + 
        (json.sections ? json.sections.map(sec => `## ${sec.h2_heading}\n\n${sec.content_html}`).join('\n\n') : '') + 
        `\n\n## まとめ\n\n${json.conclusion}`;
    
    const articlePath = path.join(process.cwd(), 'content/articles', `${slug}.md`);
    if (!fs.existsSync(path.dirname(articlePath))) fs.mkdirSync(path.dirname(articlePath), { recursive: true });
    fs.writeFileSync(articlePath, articleMd);
    console.log(`✅ Saved: ${articlePath}`);
}

builderArticle();
