
import { createClient } from 'microcms-js-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// MicroCMS Client
const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || '',
});

// Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateMetadata(title: string, content: string) {
    const prompt = `
    Analyze the following article content and generate SEO metadata and estimated yield.
    
    Article Title: ${title}
    Content (snippet): ${content.slice(0, 5000)}...

    Output strictly in JSON format with the following keys:
    - meta_title (max 32 chars, optimized for SEO)
    - meta_description (max 120 chars, compelling summary)
    - keywords (comma separated string, max 5 keywords)
    - target_yield (Estimate the annual yield mentioned or implied in the text. e.g. "8.5%" or "5.0-6.0%". If strictly financial/yield talk is absent, predict a realistic yield for this asset class in 2026. If it's a column about mindset, output "N/A".)

    JSON:
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("AI Generation Error:", e);
        return null;
    }
}

async function main() {
    console.log('--- STARTING AI CONTENT PATCH ---');

    // 1. Fetch All Articles
    const { contents } = await client.getList({
        endpoint: 'articles',
        queries: { limit: 100 }
    });

    console.log(`Found ${contents.length} articles.`);

    for (const article of contents) {
        console.log(`\nProcessing: ${article.title} (${article.slug})`);

        // Check availability
        const needsMeta = !article.meta_title;
        const needsYield = !article.target_yield || article.target_yield === '0' || article.target_yield === 0;

        let updatePayload: any = {};

        // 2. Prepare CTA (Always update to ensure array format if missing or not 'line')
        // User requested: "全記事共通で cta_mode: ['line'] を設定"
        // But we should correct existing ones. If it has a value, wrap it? 
        // Instructions said: "全記事共通で cta_mode: ['line'] を設定" -> explicit override.
        updatePayload.cta_mode = ['line'];

        // 3. AI Generation for Meta & Yield
        if (needsMeta || needsYield) {
            console.log("  Generating metadata & yield with Gemini...");
            const aiData = await generateMetadata(article.title, article.content || "");

            if (aiData) {
                if (needsMeta) {
                    updatePayload.meta_title = aiData.meta_title;
                    updatePayload.meta_description = aiData.meta_description;
                    updatePayload.keywords = aiData.keywords;
                    console.log(`  [AI] Generated Meta: ${aiData.meta_title}`);
                }

                if (needsYield) {
                    // Normalize yield: ensure string
                    let y = aiData.target_yield;
                    if (y === "N/A") y = ""; // or keep empty
                    updatePayload.target_yield = y;
                    console.log(`  [AI] Generated Yield: ${y}`);
                }
            }
        } else {
            console.log("  Skipping AI generation (Data exists).");
            // Still verify/fix yield if it's "0" (handled by needsYield)
        }

        // 4. Update
        if (Object.keys(updatePayload).length > 0) {
            try {
                await client.update({
                    endpoint: 'articles',
                    contentId: article.id,
                    content: updatePayload
                });
                console.log("  [SUCCESS] Updated article.");
            } catch (e: any) {
                console.error("  [ERROR] Update failed:", e.message);
            }
        } else {
            console.log("  No changes needed.");
        }
    }
    console.log('\n--- PATCH COMPLETE ---');
}

main();
