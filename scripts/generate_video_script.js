const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const matter = require('gray-matter');
require('dotenv').config({ path: '.env.local' });

async function generateScript() {
    console.log("Starting Video Script Generation...");

    // 1. Validate API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("ERROR: GOOGLE_API_KEY is not set in .env.local");
        process.exit(1);
    }

    // 2. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    // Explicitly using gemini-2.0-flash as 1.5 is deprecated/unavailable
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 3. Parse Arguments
    const articlePath = process.argv[2];
    const explicitSlug = process.argv[3];

    if (!articlePath) {
        console.error('Usage: node scripts/generate_video_script.js <article_path> [slug]');
        process.exit(1);
    }

    const fullPath = path.resolve(process.cwd(), articlePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`ERROR: File not found at ${fullPath}`);
        process.exit(1);
    }

    // 4. Prepare Content
    const ext = path.extname(articlePath);
    let content = '';
    let title = '';
    // Determine slug
    const slug = explicitSlug || path.basename(articlePath, ext).replace(/^\d{4}-\d{2}-\d{2}-/, '');

    console.log(`Target Slug: ${slug}`);

    const rawFile = fs.readFileSync(fullPath, 'utf8');
    if (ext === '.md') {
        const parsed = matter(rawFile);
        content = parsed.content;
        title = parsed.data.title || slug;
    } else if (ext === '.html') {
        content = rawFile.replace(/<[^>]+>/g, '');
        const titleMatch = rawFile.match(/<h1[^>]*>(.*?)<\/h1>/i);
        title = titleMatch ? titleMatch[1] : slug;
    } else {
        content = rawFile;
        title = slug;
    }

    // 5. Construct Prompt
    const prompt = `
  あなたはプロの動画クリエイターです。
  以下の記事をもとに、2つの成果物を作成してください。

  # 成果物1: TikTok/Shorts用台本
  - 構成: 冒頭フック(2秒) -> 要点3つ -> 結び(CTA)
  - フォーマット: Markdownテーブル (Time, Visual, Audio, Note)
  
  # 成果物2: 動画生成AI(Veo/Sora)用プロンプト集
  - 記事のシーンを描写する高精細な英語プロンプトを3〜5個。
  - フォーマット: 
    ## AI Video Prompts
    - Prompt 1: ...
    - Prompt 2: ...

  # 記事内容
  タイトル: ${title}
  本文:
  ${content.substring(0, 10000)}
  `;

    try {
        console.log("Sending request to Gemini (gemini-1.5-flash)...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Response Received. Saving files...");

        // 6. Save Script
        const scriptsDir = path.join(process.cwd(), 'content/scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        const scriptPath = path.join(scriptsDir, `${slug}.md`);

        const scriptFileContent = `---
title: Video Script & Prompts for ${title}
source_article: ${articlePath}
---

${text}
`;
        fs.writeFileSync(scriptPath, scriptFileContent);
        console.log(`SUCCESS: Script saved to ${scriptPath}`);

        // 7. Save Prompts (Extraction)
        const promptsDir = path.join(process.cwd(), 'content/prompts');
        if (!fs.existsSync(promptsDir)) {
            fs.mkdirSync(promptsDir, { recursive: true });
        }
        const promptsPath = path.join(promptsDir, `${slug}_prompts.md`);

        const promptsMatch = text.match(/## AI Video Prompts([\s\S]*)/);
        const promptsContent = promptsMatch ? promptsMatch[1].trim() : "No prompts section found in output.";

        fs.writeFileSync(promptsPath, promptsContent);
        console.log(`SUCCESS: Prompts saved to ${promptsPath}`);

    } catch (error) {
        console.error("________________________________________");
        console.error("FATAL ERROR: Failed to generate content.");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("API Response Status:", error.response.status);
            console.error("API Response Data:", JSON.stringify(error.response.data, null, 2));
        }
        console.error("Full Error Object:", error);
        console.error("________________________________________");
        process.exit(1);
    }
}

generateScript();
