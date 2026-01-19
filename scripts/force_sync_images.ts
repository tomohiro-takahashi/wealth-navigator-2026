
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || '',
});

async function main() {
    console.log('--- FORCIBLE IMAGE SYNC (AGGRESSIVE MODE) STARTED ---');

    // 1. Scan local images
    const imagesDir = path.resolve(__dirname, '../public/images/articles');
    if (!fs.existsSync(imagesDir)) {
        console.error('Images directory not found');
        return;
    }

    const slugs = fs.readdirSync(imagesDir).filter(file => {
        return fs.statSync(path.join(imagesDir, file)).isDirectory();
    });

    console.log(`Found ${slugs.length} local article directories.`);

    // 2. Fetch all articles from MicroCMS
    const { contents: articles } = await client.getList({
        endpoint: 'articles',
        queries: { limit: 100 }
    });

    console.log(`Fetched ${articles.length} articles from MicroCMS.\n`);

    for (const slug of slugs) {
        console.log(`Processing: ${slug}`);

        // Find matching article
        const article = articles.find(a => a.slug === slug || a.id === slug);

        if (!article) {
            console.log(`  [SKIP] Article not found in MicroCMS for slug: ${slug}`);
            continue;
        }

        // Auto-detect content field
        let fieldName = '';
        if (typeof article.content === 'string') fieldName = 'content';
        else if (typeof article.body === 'string') fieldName = 'body';
        else if (typeof article.text === 'string') fieldName = 'text';
        else if (typeof article.html === 'string') fieldName = 'html';

        if (!fieldName) {
            console.log(`  [ERROR] No HTML content field detected. Keys: ${Object.keys(article).join(', ')}`);
            continue;
        }
        console.log(`  [Slug: ${slug}] Detected HTML field: ${fieldName}`);

        let content = article[fieldName] as string;
        const originalContent = content;

        // Get local images
        const localArticleDir = path.join(imagesDir, slug);
        const images = fs.readdirSync(localArticleDir)
            .filter(f => f.endsWith('.webp') || f.endsWith('.png'))
            .sort(); // 01.webp, 02.webp...

        if (images.length === 0) {
            console.log(`  [SKIP] No images found locally.`);
            continue;
        }

        // 3. Forced Insertion Logic
        let updated = false;

        for (let i = 0; i < images.length; i++) {
            const imgFile = images[i];
            const imgPath = `/images/articles/${slug}/${imgFile}`;

            // Check existence
            if (content.includes(imgPath)) {
                console.log(`  [SKIP] Image already exists: ${imgFile}`);
                continue;
            }

            // Prepare Image Tag
            const imgTag = `<figure class="w-full my-8"><img src="${imgPath}" alt="${article.title} - ${imgFile}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;

            // Decide where to insert
            const h2Match = content.match(/<h2/);

            if (h2Match && h2Match.index !== undefined) {
                // Insert before the first H2 (or subsequent if we were more complex, but user said "start" or "before H2")
                // User requirement: "If H2 exists: Insert before first H2"
                // Actually user said: "If H2 exists: Insert before first H2. If no H2: Insert at START."

                // Let's stick to a simple strategy:
                // If we have multiple images, we want to distribute them?
                // The user prompt logic was: "before first H2 (or subsequent)".

                // Simplified Interpretation for Aggressive Mode:
                // Just put them all? No, we should distribute if possible, but the prompt says 
                // "if H2 exists, insert before first H2".
                // If we put ALL images before first H2, it's a gallery.
                // Let's try to distribute: Image 1 before H2#1. Image 2 before H2#2?

                // Splitting by H2 is safer for distribution.
                const parts = content.split('<h2');
                if (parts.length > i + 1) { // We have enough sections
                    // Insert before H2 #(i+1). 
                    // part[0] <h2 part[1] <h2 part[2]
                    // Image 1 goes to end of part[0]. Image 2 goes to end of part[1].

                    // However, string replacement is tricky with split.
                    // Let's use specific replacement.

                    // Actually, re-reading the prompt: "Check regular expression for <h2>... If not present, insert... If present, insert before first <h2>".

                    // To be safe and aggressive:
                    // Let's split content by H2 again to inject neatly.

                    // Current content might have changed in this loop? 
                    // Ah, if I modify `content` in the loop, indices shift.

                    // Re-split current modified content
                    const currentParts = content.split('<h2');
                    if (currentParts.length > i + 1) {
                        // Inject at the end of the previous part
                        // effectively "before content.split('<h2')[i+1]"

                        // We can construct new content
                        let tempContent = currentParts[0];
                        for (let k = 1; k < currentParts.length; k++) {
                            if (k === i + 1) {
                                // Inject image here (before this H2)
                                tempContent += imgTag;
                                console.log(`  [Slug: ${slug}] Inserting ${imgFile} before H2 #${k}`);
                            }
                            tempContent += '<h2' + currentParts[k];
                        }
                        content = tempContent;
                    } else {
                        // Not enough H2s for this image, append to end or before first H2?
                        // Fallback: Before FIRST H2
                        console.log(`  [Slug: ${slug}] Not enough H2s for ${imgFile}. Inserting before H2 #1`);
                        const p = content.split('<h2');
                        p[0] += imgTag;
                        content = p.join('<h2');
                    }

                } else {
                    // Should not happen if h2Match was true, unless parts length is 1 (start with H2?)
                    // Just prepend to first H2
                    console.log(`  [Slug: ${slug}] Inserting ${imgFile} before first H2 (fallback)`);
                    const p = content.split('<h2');
                    p[0] += imgTag;
                    content = p.join('<h2');
                }
            } else {
                // No H2 -> Insert at START
                console.log(`  [Slug: ${slug}] Inserting ${imgFile} at START (No H2 found)`);
                content = imgTag + content;
            }
            updated = true;
        }

        // 4. Update
        if (updated) {
            console.log(`  [Slug: ${slug}] PATCH request sent...`);
            try {
                // Ensure we send ONLY the detected field
                const updateData: any = {};
                updateData[fieldName] = content;

                await client.update({
                    endpoint: 'articles',
                    contentId: article.id,
                    content: updateData
                });
                console.log(`  SUCCESS: [${slug}] Updated.`);
            } catch (e: any) {
                console.error(`  FAILED: [${slug}] Update failed.`, e.message);
            }
        } else {
            console.log(`  [Slug: ${slug}] No changes required (images present).`);
        }
    }
    console.log('--- SYNC COMPLETE ---');
}

main();
