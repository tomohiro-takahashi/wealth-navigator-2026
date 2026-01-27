const fs = require('fs');
const path = require('path');
// Reuse logic from generate_with_claude.js for API calls
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const API_URL = 'https://api.anthropic.com/v1/messages';

const EDITOR_BRAIN_PATH = path.join(process.cwd(), 'libs/brain/article_editor.md');

async function callClaude(prompt) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-opus-4-5-20251101',
            max_tokens: 8192,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

async function callGemini(prompt, modelId = "gemini-2.0-flash") {
    if (!GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is missing in .env.local");
    }
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    const blueprintObj = JSON.parse(blueprint); // Parse here to access site_id
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');
    
    // --- Brand Identity Decoupling ---
    const siteId = blueprintObj.site_id || "wealth";
    const brandBiblePath = path.join(process.cwd(), 'libs/brain/bibles', `${siteId}_bible.md`);
    let brandBible = "";
    if (fs.existsSync(brandBiblePath)) {
        console.log(`📖 Loading Brand Bible: ${path.basename(brandBiblePath)}`);
        brandBible = fs.readFileSync(brandBiblePath, 'utf8');
    } else {
        console.warn(`⚠️ No specific bible found for ${siteId}. Using generic approach.`);
    }

    const prompt = `
    ${editorBible}

    ## BRAND SPIRIT (PERSONALITY & MINDSET)
    ${brandBible}
    
    ---
    
    ## TASK: Build the Article Content
    You are the "Master Builder" (Writer).
    You have received a Blueprint JSON from the Architect.
    
    **YOUR JOB:**
    1. Read the JSON below.
    2. For every 'content_html' field, read the INSTRUCTIONS inside it, and **REPLACE** it with the actual High-Quality HTML content.
    3. Keep the JSON structure exactly the same. Only modify the values of the keys to fill in the content.
    4. Follow the "Tone & Manner" and "Style Rules" in the Bible absolutely.
    5. Ensure total article volume is around 5,000 characters. Each H2 section should be substantial (PREP method).

    ## Blueprint JSON (Input)
    ${blueprint}

    ## BRAND CONTEXT (CRITICAL)
    あなたは現在、ブランド「${siteId}」の専属ライターとして執筆しています。
    - ブランド名: ${blueprintObj.site_id === 'wealth' ? 'Wealth Navigator' : blueprintObj.site_id === 'kominka' ? '古民家ナビゲーター' : blueprintObj.site_id === 'flip' ? 'Flip Logic' : blueprintObj.site_id === 'subsidy' ? 'おうちの補助金相談室' : '親の家、どうする？'}
    - このブランドの目的・ビジョンにのみ忠実であってください。他ブランドの主張（例：Wealthの時にFlipの出口戦略を語りすぎるなど）を混ぜないこと。
    - **CTAについても、このブランド専用のLINE誘導や個別診断へのオファーを生成してください。**

    ## Output
    Return ONLY the completed JSON object. No markdown fencing, no preamble.
    `;

    try {
        console.log(`✍️  Writing content for: ${slug}`);

        // --- HYBRID SWITCHER LOGIC ---
        const siteId = blueprintObj.site_id || "wealth";
        const useClaudePrimary = siteId === "wealth";
        let result;

        // 1. Primary Strategy (Wealth = Claude Opus)
        if (useClaudePrimary) {
            console.log(`💎 Wealth Brand detected: Using Claude Opus (Quality Mode) for ${siteId}`);
            try {
                result = await callClaude(prompt); // Existing callClaude uses Opus
            } catch (claudeError) {
                console.warn(`⚠️ Claude Opus Primary Failed: ${claudeError.message}. Falling back to Gemini...`);
            }
        }

        // 2. Gemini Strategy (Default for others, or fallback for Wealth)
        if (!result) {
            const MAX_RETRIES = 5;
            const geminiModels = ["gemini-2.0-flash", "gemini-3-flash-preview"];
            
            for (const modelId of geminiModels) {
                if (result) break;
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        console.log(`⚡ Using Engine: ${modelId} (Attempt ${attempt}/${MAX_RETRIES}) for ${siteId}`);
                        result = await callGemini(prompt, modelId);
                        break; // Success!
                    } catch (e) {
                        console.warn(`⚠️ ${modelId} Attempt ${attempt} Failed: ${e.message}`);
                        if (attempt < MAX_RETRIES) {
                            const waitSec = 10;
                            console.log(`⏳ Waiting ${waitSec}s before retry...`);
                            await new Promise(r => setTimeout(r, waitSec * 1000));
                        }
                    }
                }
            }
        }

        // 3. Recovery Plan: Fallback to Claude (Haiku/Sonnet) if Gemini fails for any brand
        if (!result) {
            console.log("🛡️ RECOVERY PLAN: Gemini exhausted. Activating Fallback Engine...");
            try {
                // For recovery, we can use Haiku to ensure the job finishes
                const anthropic = require('@anthropic-ai/sdk');
                const client = new anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
                const msg = await client.messages.create({
                    model: "claude-opus-4-5-20251101",
                    max_tokens: 4096,
                    messages: [{ role: "user", content: prompt }]
                });
                result = msg.content[0].text;
            } catch (recoveryError) {
                console.error("❌ Recovery Plan Failed:", recoveryError);
                throw new Error("❌ Article Generation failed completely (Gemini & Fallback exhausted).");
            }
        }

        // Clean result
        let cleanJson = result.trim();
        if (cleanJson.includes('```')) {
            cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
        }
        cleanJson = cleanJson.replace(/```/g, '').trim();

        let contentJson;
        try {
            contentJson = JSON.parse(cleanJson);
        } catch (e) {
            console.error("❌ JSON Parse Error. Raw Output tail:\n", cleanJson.slice(-500));
            // Attempt simple fix?
            throw e;
        }

        // Save Complete JSON
        const outputPath = path.join(process.cwd(), 'content/blueprints', `${slug}_complete.json`);
        fs.writeFileSync(outputPath, JSON.stringify(contentJson, null, 2));
        console.log(`✅ Content Complete: ${outputPath}`);

        // --- Assembler Logic (Immediate Integration) ---
        console.log("🧩 Assembling Final Artifacts...");
        convertToArtifacts(contentJson, slug);

    } catch (error) {
        console.error("❌ Build Failed:", error);
        process.exit(1);
    }
}

function convertToArtifacts(json, slug) {
    // 1. Construct HTML Body
    let htmlLines = [];

    // Add Intro (H1 is usually meta, but we can add it or let layout handle it. 
    // Usually content_draft.html starts with H1 in this workflow)
    htmlLines.push(`<h1>${json.h1_title}</h1>`);
    htmlLines.push(json.intro_hook);

    // Sections
    if (json.sections) {
        json.sections.forEach(sec => {
            htmlLines.push(`<h2>${sec.h2_heading}</h2>`);
            htmlLines.push(sec.content_html);
        });
    }

    // Conclusion
    htmlLines.push(`<h2>まとめ</h2>`);
    htmlLines.push(json.conclusion);

    const fullHtml = htmlLines.join('\n\n');
    fs.writeFileSync('content_draft.html', fullHtml);
    console.log("   -> Saved: content_draft.html");

        // 2. Extract Expert Tip
        // We need to parse the HTML to find the expert-box div content
        const expertMatch = fullHtml.match(/<div class="expert-box">([\s\S]*?)<\/div>/);
        const expertTip = expertMatch ? expertMatch[1].replace(/【.*?】/, '').trim() : "No expert tip found";
        fs.writeFileSync('expert_tip.txt', expertTip);
        console.log("   -> Saved: expert_tip.txt");

        // 3. Save Markdown Draft for Article (Critical for Video Director & Drive)
        const today = new Date().toISOString().split('T')[0];
        const articleMd = `---\ntitle: "${json.h1_title}"\npublishedAt: "${today}"\nsite_id: "${json.site_id || 'wealth_navigator'}"\ncategory: "${json.target_keyword || ''}"\ncoverImage: "/images/articles/${slug}/01.webp"\n---\n\n` + 
            `# ${json.h1_title}\n\n${json.intro_hook}\n\n` + 
            (json.sections ? json.sections.map(sec => `## ${sec.h2_heading}\n\n${sec.content_html}`).join('\n\n') : '') + 
            `\n\n## まとめ\n\n${json.conclusion}`;
        
        const articlePath = path.join(process.cwd(), 'content/articles', `${slug}.md`);
        if (!fs.existsSync(path.dirname(articlePath))) fs.mkdirSync(path.dirname(articlePath), { recursive: true });
        fs.writeFileSync(articlePath, articleMd);
        console.log(`   -> Saved: ${articlePath}`);

        // 4. Metadata
    const metaPayload = {
        meta_title: json.h1_title,
        meta_description: json.meta_description,
        keywords: json.target_keyword || "",
        target_yield: "0",
        site_id: json.site_id || "wealth_navigator"
    };
    fs.writeFileSync('metadata.json', JSON.stringify(metaPayload, null, 2));
    console.log("   -> Saved: metadata.json");
}

builderArticle();
