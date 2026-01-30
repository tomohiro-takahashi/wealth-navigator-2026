
import fs from 'fs';
import path from 'path';
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration
const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
    console.error('Error: MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
    process.exit(1);
}

const client = createClient({
    serviceDomain: SERVICE_DOMAIN,
    apiKey: API_KEY,
});

async function main() {
    console.log('--- Starting Image Generation & Linkage Workflow (WebP Optimized + 2-Step Gen) ---');

    const targetBrand = process.env.NEXT_PUBLIC_BRAND || 'wealth';
    const slugArg = process.argv.find(arg => arg.startsWith('--slug='))?.split('=')[1];

    try {
        // 1. Fetch articles
        const { contents: articles } = await client.getList({
            endpoint: 'articles',
            queries: { 
                limit: 100,
                filters: `site_id[equals]${targetBrand}${slugArg ? `[and]slug[equals]${slugArg}` : ''}`
            }
        });

        console.log(`Fetched ${articles.length} articles for brand: ${targetBrand} ${slugArg ? `(Targeting: ${slugArg})` : ''}`);

        // Dynamic import for Sharp (ESM)
        const sharp = (await import('sharp')).default;

        for (const article of articles) {
            console.log(`\nProcessing Article: ${article.title} (ID: ${article.id})`);

            const content: string = article.content || '';
            let updated = false;

            // --- CLEANUP PHASE (Self-Healing) ---
            // Remove existing AI-generated image tags to prevent duplication
            // Patterns: <figure class="w-full my-8">... or placeholders
            const figureRegex = /<figure class="w-full my-8">[\s\S]*?<\/figure>/gi;
            const placeholderRegex = /<div class="[^"]*IMAGE_LOAD_FAILED[^"]*">[\s\S]*?<\/div>/gi;
            
            const sanitizedContent = content.replace(figureRegex, '').replace(placeholderRegex, '');
            
            const parts = sanitizedContent.split('<h2');
            if (parts.length <= 1) {
                console.log('  No H2 tags found or single section after cleanup. Skipping complex insertion.');
                continue;
            }

            let newContent = parts[0];
            let imageCount = 0;
            const slug = article.slug || article.id;

            // Ensure local directory exists
            const imageDir = path.resolve(__dirname, `../public/images/articles/${slug}`);
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
            }

            for (let i = 1; i < parts.length; i++) {
                if (imageCount < 3) {
                    imageCount++;
                    const baseName = imageCount.toString().padStart(2, '0');
                    const webpName = `${baseName}.webp`;
                    const pngName = `${baseName}.png`;

                    const publicPath = `/images/articles/${slug}/${webpName}`;
                    const localWebpPath = path.join(imageDir, webpName);
                    const localPngPath = path.join(imageDir, pngName);

                    // Generate or Convert Image
                    if (fs.existsSync(localWebpPath)) {
                        console.log(`  [OK] WebP exists: ${webpName}`);
                    }
                    else if (fs.existsSync(localPngPath)) {
                        console.log(`  [CONVERT] Found PNG, converting to WebP: ${pngName} -> ${webpName}`);
                        await sharp(localPngPath)
                            .webp({ quality: 80 })
                            .toFile(localWebpPath);
                    }
                    else {
                        console.log(`  [GENERATE] Creating new WebP: ${webpName}...`);
                        const nextPartText = parts[i].substring(0, 500).replace(/<[^>]+>/g, '');
                        await generateAndSaveImageWebP(article.title, nextPartText, localWebpPath, sharp);
                    }

                    // Create Image Tag using WebP
                    const imgTag = `<figure class="w-full my-8"><img src="${publicPath}" alt="${article.title} - Image ${imageCount}" width="1200" height="630" class="rounded-xl shadow-lg" loading="lazy" /></figure>`;

                    newContent += imgTag;
                    updated = true;
                }

                newContent += '<h2' + parts[i];
            }

            // 3. Update MicroCMS if changed
            if (content.includes(`/images/articles/${slug}/01.webp`)) {
                console.log('  WebP images seem to be already present. Checking if update needed...');
                if (content === newContent) {
                    updated = false;
                }
            } else if (content.includes(`/images/articles/${slug}/01.png`)) {
                console.log(`  [UPDATE NEEDED] Replacing PNG references with WebP for ${slug}`);
                updated = true;
            }

            if (updated) {
                console.log(`  Updating Content for ${article.id}...`);
                await client.update({
                    endpoint: 'articles',
                    contentId: article.id,
                    content: {
                        content: newContent
                    }
                });
                console.log('  [SUCCESS] Updated.');
            } else {
                console.log('  No changes needed.');
            }
        }

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

// Google Imagen 4.0 API Call with Sharp Fallback (Output WebP)
async function generateAndSaveImageWebP(title: string, context: string, savePath: string, sharp: any) {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY is missing.');
        }

        // Step 1: Generate Visual Prompt using Gemini (to fix "Chinese text" and "Unnatural" issues)
        const visualPrompt = await generatePromptWithGemini(title, context);
        console.log(`  > [PROMPT GENERATED]: "${visualPrompt.substring(0, 60)}..."`);

        // Step 2: Generate Image using Imagen 4.0
        let response;
        let attempts = 0;
        const maxAttempts = 2;
        
        while (attempts < maxAttempts) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instances: [
                        { prompt: visualPrompt }
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "16:9"
                    }
                })
            });

            if (response.status === 429 && attempts < maxAttempts - 1) {
                console.warn(`  [IMAGEN 429] Rate limit hit. Sleeping 30s before retry...`);
                await sleep(30000);
                attempts++;
                continue;
            }
            break;
        }

        if (!response || !response.ok) {
            const errText = response ? await response.text() : "No response";
            throw new Error(`Google API Error: ${response?.status} - ${errText}`);
        }

        const data = await response.json();
        let b64Data = null;

        if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
            b64Data = data.predictions[0].bytesBase64Encoded;
        }

        if (!b64Data) {
            throw new Error('No image data found in response');
        }

        const buffer = Buffer.from(b64Data, 'base64');

        // Convert API response (usually PNG/JPEG) to WebP
        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(savePath);

        console.log(`  [GENERATED] Image saved to ${savePath}`);

    } catch (e: any) {
        console.warn(`  [Generation Failed] ${e.message}. Falling back to placeholder.`);

        // Fallback: Generate Placeholder with Sharp -> WebP
        await sharp({
            create: {
                width: 1200,
                height: 630,
                channels: 4,
                background: { r: 60, g: 60, b: 70, alpha: 1 }
            }
        })
            .composite([{
                input: Buffer.from(`<svg width="1200" height="630"><rect width="100%" height="100%" fill="#333"/><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">Image Gen Failed</text></svg>`),
                blend: 'over'
            }])
            .webp({ quality: 80 })
            .toFile(savePath);
        console.log(`  [PLACEHOLDER] Saved to ${savePath}`);
    }
}

/**
 * Uses Gemini 2.0 Flash to convert Japanese context into a high-quality English visual prompt.
 */
async function generatePromptWithGemini(title: string, context: string): Promise<string> {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    // System Instruction for the Prompt Engineer Agent
    const systemInstruction = `
    You are an Art Director for a high-end investment lifestyle magazine (like Architectural Digest mixed with Forbes).
    Your task is to create a detailed **ENGLISH** visual prompt for an AI image generator based on the provided Article Title and Section Context.

    【CRITICAL RULES】
    1. **NO TEXT**: The image must NOT contain any text, signboards, or overlays. Pure photography.
    2. **Style**: Cinematic, Photorealistic, 8k resolution, Dramatic Lighting, High-End.
    3. **Subject**: Visualize the abstract concept concretely.
       - If "Debt/Money": Use metaphors like heavy bank vaults, golden hourglasses, sleek modern office desks.
       - If "Real Estate": Show the building/interior.
    4. **Demographics & Setting (Important)**:
       - **If the context is about Japan (e.g., Tokyo, 45-year-old salaryman, aging society)**: 
         - Use **Japanese/Asian** subjects.
         - e.g., "A serious 45-year-old Japanese businessman in a suit looking at Tokyo skyline at dusk", "An elderly Japanese couple relaxing in a modern living room".
       - **If the context is about Southeast Asia (Manila, Singapore)**:
         - Use local landscapes, modern tropical architecture, or diverse expat groups.
         - e.g., "A modern luxury condo balcony overlooking Manila Bay", "A diverse group of investors in a Singapore boardroom".
    5. **Avoid**: Unnatural AI artifacts, cartoonish looks, generic stock photos.

    【Output】
    Return ONLY the English prompt string. No explanations.
    `;

    const userMessage = `Title: ${title}\nContext: ${context.substring(0, 1000)}`;

    let response;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + "\n\n" + userMessage }] }]
            })
        });

        if (response.status === 429 && attempts < maxAttempts - 1) {
            console.warn(`  [GEMINI PROMPT 429] Rate limit hit. Sleeping 30s before retry...`);
            await sleep(30000);
            attempts++;
            continue;
        }
        break;
    }

    if (!response || !response.ok) {
        console.warn(`  [Prompt Gen Warning] Failed to generate prompt using Gemini. Falling back to simple prompt.`);
        return `High quality photography of ${title}, luxury, cinematic, photorealistic, 8k --no text`;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `Luxury architecture image related to ${title}`;
}

main();
