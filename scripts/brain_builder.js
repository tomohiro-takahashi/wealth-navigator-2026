const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { loadContext, saveContext } = require('./lib/create_context');
require('dotenv').config({ path: '.env.local' });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    const args = require('minimist')(process.argv.slice(2));
    const contextPath = args.context;
    
    if (!contextPath || !fs.existsSync(contextPath)) {
        console.error("Usage: node scripts/brain_builder.js --context <path/to/context.json>");
        process.exit(1);
    }

    const context = loadContext(contextPath);
    const slug = context.slug;

    // Load blueprint from workDir
    const blueprintPath = path.join(context.paths.workDir, 'blueprint.json');
    if (!fs.existsSync(blueprintPath)) {
        console.error(`Blueprint not found in work directory: ${blueprintPath}`);
        process.exit(1);
    }

    const blueprint = fs.readFileSync(blueprintPath, 'utf8');
    const blueprintObj = JSON.parse(blueprint);
    const editorBible = fs.readFileSync(EDITOR_BRAIN_PATH, 'utf8');
    
    // ★ OVERWRITE blueprint values with context values (Single Source of Truth)
    blueprintObj.site_id = context.siteId;
    blueprintObj.category = context.category;
    
    const siteId = context.siteId;
    const dnaPath = context.paths.dna;
    let dna = {};
    if (fs.existsSync(dnaPath)) {
        dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    }

    const brandBiblePath = context.paths.bible;
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
    Replace every 'content_html' instruction in the JSON below with actual High-Quality content.
    Follow the "Style Rules" in the Bible (Japanese, Professional, Numbers-based).
    
    【TECHNICAL REQUIREMENT: FORMAT】
    - ALWAYS USE PURE MARKDOWN for 'content_html' fields. 
    - The building system will handle the conversion to HTML.
    - DO NOT include raw HTML tags like <p> or <h3> inside the JSON strings.
    - Use standard markdown headers (#, ##, ###), lists, and bolding.
    
    【CRITICAL REQUIREMENT: TOPIC EXCLUSIVITY】
    - Target Topic: ${blueprintObj.target_keyword}
    - You MUST write specifically about this topic and NOTHING ELSE. 
    - Do NOT reuse structure or content from previous articles about different topics.
    
    【CRITICAL REQUIREMENT: LENGTH & DEPTH】
    - Ensure EVERY section is extremely detailed.
    - The TOTAL article content MUST BE NO LESS THAN 5,000 Japanese characters.
    - Provide specific numbers, case studies, and deep insights.

    【CRITICAL REQUIREMENT: METADATA】
    - You MUST also provide:
      - "h1_title": A powerful, SEO-optimized title.
      - "meta_title": For search results (60 chars max).
      - "meta_description": Compelling summary for search (120-160 chars).
      - "keywords": 3-5 comma-separated keywords.
      - "sns_posts": An array of 3 SNS post ideas (X/Twitter style) in Japanese.
        1. Pattern A: Professional/News style
        2. Pattern B: Engagement/Question style
        3. Pattern C: Counter-intuitive/Shock style

    ## Blueprint JSON (To Be Completed)
    ${JSON.stringify(blueprintObj, null, 2)}

    ## Important
    Output ONLY THE COMPLETED JSON. No markdown blocks.
    `;

    try {
        console.log(`✍️  Writing content for: ${slug} (Brand: ${siteId})`);
        let result;

        const callWithRetry = async (fn, name) => {
            let attempts = 0;
            const maxAttempts = 2;
            while (attempts < maxAttempts) {
                try {
                    return await fn();
                } catch (e) {
                    if (e.message.includes('429') && attempts < maxAttempts - 1) {
                        console.warn(`⚠️ Rate limit (429) hit for ${name}. Sleeping for 30s before retry...`);
                        await sleep(30000);
                        attempts++;
                        continue;
                    }
                    throw e;
                }
            }
        };

        // 1. Try Claude (Sonnet 3.5 fallback) -> Gemini Pro (1.5) -> Gemini 2.0 Flash -> Haiku
        try {
            const primaryModel = siteId === 'wealth' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20240620';
            console.log(`🧠 Attempting ${primaryModel}...`);
            result = await callWithRetry(() => callClaude(prompt, primaryModel), `Claude ${primaryModel}`);
        } catch (e1) {
            console.warn(`⚠️ Claude failed (${e1.message}). Trying Gemini Pro...`);
            try {
                // gemini-pro-latest in this environment points to 1.5 Pro
                result = await callWithRetry(() => callGemini(prompt, 'gemini-pro-latest'), "Gemini Pro");
            } catch (e1_5) {
                console.warn(`⚠️ Gemini Pro failed (${e1_5.message}). Trying Gemini 2.0 Flash...`);
                try {
                    result = await callWithRetry(() => callGemini(prompt, 'gemini-2.0-flash'), "Gemini Flash");
                } catch (e2) {
                    console.warn(`⚠️ Gemini Flash failed (${e2.message}). Trying Haiku...`);
                    try {
                        result = await callWithRetry(async () => {
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
                            return haikuData.content[0].text;
                        }, "Claude Haiku");
                    } catch (e3) {
                        console.error("❌ All models failed.");
                        throw e3;
                    }
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
            console.warn("⚠️ Standard JSON.parse failed. Attempting complex recovery...");
            
            // 1. Basic Cleaning
            let repaired = cleanJson
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\\\\\")
                .replace(/,\s*([\}\]])/g, '$1');

            // 2. Truncation Repair (Close open brackets)
            function repairTruncatedJson(str) {
                let json = str.trim();
                const stack = [];
                for (let i = 0; i < json.length; i++) {
                    const char = json[i];
                    if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
                    else if (char === '}' || char === ']') {
                        if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
                    }
                }
                while (stack.length > 0) json += stack.pop();
                return json;
            }

            try {
                contentJson = JSON.parse(repairTruncatedJson(repaired));
            } catch (e2) {
                console.error("❌ Recovery failed.");
                console.log("DEBUG RAW PREVIEW:", cleanJson.substring(cleanJson.length - 100)); // Show the end of the string
                throw e2;
            }
        }
        
        // Output path for complete JSON
        const outputPath = path.join(context.paths.workDir, 'article_complete.json');
        fs.writeFileSync(outputPath, JSON.stringify(contentJson, null, 2));
        
        console.log("🧩 Assembling Final Artifacts...");
        convertToArtifacts(contentJson, slug, context);

        // Contextを更新して保存
        context.meta.title = contentJson.h1_title || contentJson.meta_title;
        context.meta.description = contentJson.meta_description;
        saveContext(context);
        
    } catch (error) {
        console.error("❌ Build Failed:", error);
        process.exit(1);
    }
}

function convertToArtifacts(json, slug, context) {
    const siteId = context.siteId;
    const category = context.category;

    const articleMd = `---\n` +
        `title: "${json.h1_title || json.meta_title}"\n` +
        `meta_title: "${json.meta_title || json.h1_title}"\n` +
        `meta_description: "${json.meta_description || ''}"\n` +
        `keywords: "${json.keywords || ''}"\n` +
        `publishedAt: "${new Date().toISOString().split('T')[0]}"\n` +
        `site_id: "${siteId}"\n` +
        `category: "${category}"\n` +
        `coverImage: "/images/articles/${slug}/01.webp"\n` +
        `sns_posts: ${JSON.stringify(json.sns_posts || [])}\n` +
        `---\n\n` + 
        `# ${json.h1_title}\n\n${json.intro_hook}\n\n` + 
        (json.sections ? json.sections.map(sec => `## ${sec.h2_heading}\n\n${sec.content_html}`).join('\n\n') : '') + 
        `\n\n## まとめ\n\n${json.conclusion}`;
    
    const articlePath = path.join(context.paths.workDir, `article.md`);
    fs.writeFileSync(articlePath, articleMd);
    console.log(`✅ Saved: ${articlePath}`);
}

builderArticle();
