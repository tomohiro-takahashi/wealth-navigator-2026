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

    // 5. Load Video Brain
    const brainPath = path.join(process.cwd(), 'libs/brain/video_director.md');
    let brainContent = '';
    if (fs.existsSync(brainPath)) {
        brainContent = fs.readFileSync(brainPath, 'utf8');
        console.log("Loaded Video Director Brain.");
    } else {
        console.warn("WARNING: Video Director Brain not found. Using fallback prompt.");
        brainContent = `
        You are a professional video creator.
        Create a TikTok/Shorts script based on the article.
        Format: JSON
        `;
    }

    // 6. Construct Prompt
    const prompt = `
    ${brainContent}
    
    # Input Article
    **Title:** ${title}
    **Content:**
    ${content.substring(0, 15000)}
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
