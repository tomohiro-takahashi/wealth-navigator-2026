
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const ARTICLES_DIR = path.resolve(__dirname, '../content/articles');

if (!GOOGLE_API_KEY) {
    console.error('Error: GOOGLE_API_KEY is required for meta generation.');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
});

interface ArticleMeta {
    title: string;
    description: string;
    keywords: string;
}

async function generateMeta(title: string, content: string): Promise<ArticleMeta> {
    console.log(`   [AI] Generating high-quality Meta Tags for: ${title}`);
    
    const prompt = `
    You are an SEO expert. Based on the following article content, generate high-quality Meta Title, Meta Description (approx 120 chars), and Keywords.
    
    Article Title: ${title}
    Content Snippet: ${content.substring(0, 2000)}
    
    Output Format: JSON
    {
      "title": "Optimized SEO Title",
      "description": "Compelling meta description in Japanese",
      "keywords": "investment, keyword2, keyword3"
    }
    `;

    let attempts = 0;
    while (attempts < 3) {
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (e: any) {
            if (e.message?.includes('429') || e.status === 429) {
                attempts++;
                const waitSec = 120; // 2 minutes wait
                console.warn(`   ⚠️ Rate limit hit (429). Waiting ${waitSec}s... (Attempt ${attempts}/3)`);
                await new Promise(r => setTimeout(r, waitSec * 1000));
            } else {
                throw e;
            }
        }
    }
    throw new Error('Max retries exceeded for AI Meta generation');
}

async function masterRecovery() {
    console.log('='.repeat(60));
    console.log('🚀 MASTER QUALITY RECOVERY SYSTEM v1.0');
    console.log('='.repeat(60));

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md') && f !== 'wealth-navigator-manifesto.md');

    for (const file of files) {
        const filePath = path.join(ARTICLES_DIR, file);
        const slug = file.replace('.md', '');
        
        console.log(`\n📦 Processing: ${file}`);
        
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter, content } = matter(rawContent);
        
        let metaTitle = frontmatter.meta_title || frontmatter.title;
        let metaDesc = frontmatter.description || frontmatter.meta_description;
        let keywords = frontmatter.keywords;
        const brand = frontmatter.site_id || 'wealth';
        const category = frontmatter.category || 'column';

        // 1. Meta Intelligence: Generate if missing
        if (!metaDesc || !keywords) {
            try {
                const aiMeta = await generateMeta(frontmatter.title || slug, content);
                metaTitle = aiMeta.title;
                metaDesc = aiMeta.description;
                keywords = aiMeta.keywords;
                
                // Update local MD file for future-proofing
                const updatedData = {
                    ...frontmatter,
                    meta_title: metaTitle,
                    meta_description: metaDesc,
                    keywords: keywords
                };
                fs.writeFileSync(filePath, matter.stringify(content, updatedData));
                console.log(`   ✅ Local MD updated with new Meta Tags.`);
            } catch (e: any) {
                console.warn(`   ⚠️ AI Meta Generation failed: ${e.message}`);
                metaDesc = metaDesc || frontmatter.title || "不動産投資と資産形成の専門メディア。";
                keywords = keywords || "不動産投資, 資産形成";
            }
        }

        // 2. Force Re-Import (Sync to CMS)
        console.log(`   📤 Re-importing to MicroCMS (Force Reset)...`);
        try {
            // Ensure marked is available for the check
            const { marked } = require('marked');
            let finalContent = content;
            
            // Check if content needs markdown conversion
            const isAlreadyHtml = /<[a-z][\s\S]*>/i.test(content.substring(0, 500));
            if (!isAlreadyHtml) {
                console.log(`   [INFO] Converting Markdown to HTML for sync...`);
                finalContent = marked.parse(content);
            }

            // Use temporary file for content to avoid issues
            const tempFile = 'recovery_draft.html';
            fs.writeFileSync(tempFile, finalContent);
            
            execSync(`node scripts/import_articles.js --file "${tempFile}" --title "${frontmatter.title}" --slug "${slug}" --category "${category}" --force-reset --site_id "${brand}" --meta_title "${metaTitle}" --meta_description "${metaDesc}" --keywords "${keywords}"`, { stdio: 'inherit' });
            
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        } catch (syncError: any) {
            console.error(`   ❌ Sync Failed: ${syncError.message}`);
            continue;
        }

        // 3. Self-Healing Image Generation
        console.log(`   🎨 Self-Healing Image Generation...`);
        try {
            // We run a targeted generate-images script or just the global one
            // Since our generate-images.ts fetches all, we might want to modify it to take an ID.
            // But for now, let's run it once at the end? 
            // Better to run it article by article IF we can.
            // For now, let's just trigger the global one to clean everything.
        } catch (imgError: any) {
            console.warn(`   ⚠️ Image Healing Note: ${imgError.message}`);
        }
    }

    // Final Global Heal
    console.log(`\n🧹 Running Final Global Image Healing & Cleanup...`);
    execSync(`npm run generate:images`, { stdio: 'inherit' });

    console.log('\n' + '='.repeat(60));
    console.log('✅ MASTER RECOVERY COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
}

masterRecovery().catch(console.error);
