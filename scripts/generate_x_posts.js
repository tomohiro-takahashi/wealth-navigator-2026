
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

async function generateXPosts(brand, slugInput) {
    console.log(`🧠 X Post Generator: Brand = ${brand}`);

    // 1. Load Bible
    let biblePath = path.join(process.cwd(), `libs/brain/bibles/${brand}_bible.md`);
    if (!fs.existsSync(biblePath)) {
        biblePath = path.join(process.cwd(), "libs/brain/titans_knowledge.md");
    }
    const bibleContent = fs.readFileSync(biblePath, 'utf8');

    // 2. Find Article
    let articleContent = "N/A";
    let articleUrl = "#";
    let finalSlug = slugInput || "";

    const articlesDir = path.join(process.cwd(), 'content/articles');
    let articleFile = null;

    if (slugInput) {
        articleFile = path.join(articlesDir, `${slugInput}.md`);
        if (!fs.existsSync(articleFile)) {
            const matches = fs.readdirSync(articlesDir).filter(f => f.includes(slugInput) && f.endsWith('.md'));
            if (matches.length > 0) articleFile = path.join(articlesDir, matches[0]);
        }
    } else {
        // Find latest for brand
        const files = fs.readdirSync(articlesDir)
            .filter(f => f.endsWith('.md'))
            .map(f => ({ name: f, time: fs.statSync(path.join(articlesDir, f)).mtime }))
            .sort((a,b) => b.time - a.time);
        
        for (const f of files) {
            const content = fs.readFileSync(path.join(articlesDir, f.name), 'utf8');
            if (content.includes(`site_id: "${brand}"`) || content.includes(`site_id: ${brand}`)) {
                articleFile = path.join(articlesDir, f.name);
                break;
            }
        }
    }

    if (articleFile && fs.existsSync(articleFile)) {
        articleContent = fs.readFileSync(articleFile, 'utf8');
        finalSlug = path.basename(articleFile).replace('.md', '');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wealth-navigator.com";
        articleUrl = `${baseUrl}/articles/${finalSlug}`;
        console.log(`📄 Using Article: ${path.basename(articleFile)}`);
    } else {
        console.warn(`⚠️ No article found for ${brand}. Generating Mindset posts only.`);
    }

    // 3. Prompt
    let dna = { identity: { name: brand }, persona: { role: "Expert", tone: "Professional" } };
    try {
        const dnaPath = path.join(process.cwd(), `src/dna.config.${brand}.json`);
        if (fs.existsSync(dnaPath)) {
            dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
        }
    } catch (e) {
        console.warn(`⚠️ Could not load DNA for ${brand}, using default persona.`);
    }

    const prompt = `
    あなたは「${dna.identity.name}」の公式X（Twitter）担当者であり、
    自身も「${dna.persona.role || '専門家'}」として、ブランドの思想を世に広める役割を担っています。
    
    以下の「ブランドバイブル（思想・知識）」と「最新記事」を元に、
    ターゲットである「${dna.target?.audience || '投資家・一般層'}」に深く刺さる5つのポスト案を作成してください。

    ---
    ### 【ブランドバイブル】
    ${bibleContent.substring(0, 5000)}

    ---
    ### 【最新記事】
    ${articleContent.substring(0, 5000)}
    記事URL: ${articleUrl}

    ---
    ### 【出力要件】
    1. **Mindset x 3個**: バイブルの思想に基づいた、ターゲットの価値観を揺さぶる言葉。
    2. **Promotion x 2個**: 最新記事を読むメリットを強調した、クリックを誘発する宣伝文。必ずURLを含めること。

    ### 【文体・トーン（重要）】
    - 一人称: ${dna.persona.first_person || '私'}
    - トーン: ${dna.persona.tone || '知的で信頼感のあるトーン'}
    - 可読性: 適度に改行や空白行（2つの改行）を入れ、スマホでパッと見て読みやすい構成にすること。1ブロック詰めすぎないこと。
    - 文字数: 各ポスト140文字以内。
    - 絵文字: 最小限（1投稿に1つ程度）、ブランドの知性を損なわないもの。

    ### 【出力形式】
    JSON出力のみを行ってください。形式は以下：
    {
      "brand": "${brand}",
      "slug": "${finalSlug}",
      "posts": [
        { "type": "mindset", "content": "..." },
        { "type": "mindset", "content": "..." },
        { "type": "mindset", "content": "..." },
        { "type": "promotion", "content": "..." },
        { "type": "promotion", "content": "..." }
      ]
    }
    `;

    // 4. Resilient Generation
    let resultText = "";
    const geminiModels = ["gemini-2.0-flash", "gemini-3-flash-preview"];
    let success = false;

    for (const modelId of geminiModels) {
        try {
            console.log(`🌐 Attempting ${modelId}...`);
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: modelId,
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(prompt);
            resultText = result.response.text();
            success = true;
            break;
        } catch (e) {
            console.warn(`⚠️ ${modelId} Failed: ${e.message}`);
        }
    }

    if (!success) {
        console.warn(`🛡️ RECOVERY PLAN: All Gemini models exhausted. Activating Fallback (Claude Opus)...`);
        const client = new anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const msg = await client.messages.create({
            model: "claude-opus-4-5-20251101",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt + "\nReturn ONLY raw JSON." }]
        });
        resultText = msg.content[0].text;
    }

    // 5. Clean and Save
    let data;
    try {
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanJson);
        
        const saveDir = path.join(process.cwd(), 'content/social');
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
        
        const filename = `${brand}_x_posts_latest.json`;
        fs.writeFileSync(path.join(saveDir, filename), JSON.stringify(data, null, 2));
        console.log(`✅ Success! Generated 5 posts and saved to ${filename}`);
        return data;
    } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", resultText);
        throw parseError;
    }
}

const args = process.argv.slice(2);
if (require.main === module) {
    generateXPosts(args[0] || 'wealth', args[1]).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
