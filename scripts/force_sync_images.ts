
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
    console.log('--- FORCIBLE IMAGE SYNC STARTED ---');

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
    // Limit to 100 for now, or handle pagination if needed
    const { contents: articles } = await client.getList({
        endpoint: 'articles',
        queries: { limit: 100 }
    });

    console.log(`Fetched ${articles.length} articles from MicroCMS.`);

    for (const slug of slugs) {
        console.log(`\nProcessing: ${slug}`);

        // Find matching article
        const article = articles.find(a => a.slug === slug || a.id === slug);

        if (!article) {
            console.log(`  [SKIP] Article not found in MicroCMS for slug: ${slug}`);
            continue;
        }

        const localArticleDir = path.join(imagesDir, slug);
        const images = fs.readdirSync(localArticleDir)
            .filter(f => f.endsWith('.webp') || f.endsWith('.png'))
            .sort(); // 01.webp, 02.webp ...

        if (images.length === 0) {
            console.log(`  [SKIP] No images found locally.`);
            continue;
        }

        let content = article.content || "";
        console.log(`  Current Content Length: ${content.length}`);

        // 3. Force Insertion Logic
        let updated = false;
        let originalContent = content;

        // Strategy: Split by <h2, insert image before each H2 (starting from 1st or 2nd?)
        // User said: "Insert before first h2 or subsequent"
        // Let's split by <h2
        const parts = content.split('<h2');

        if (parts.length <= 1) {
            console.log(`  [WARN] No H2 tags found. Appending images to bottom.`);
            // Fallback: Append all images at bottom if no H2
            for (const imgFile of images) {
                const imgPath = `/images/articles/${slug}/${imgFile}`;
                if (!content.includes(imgPath)) {
                    const imgTag = `<figure class="w-full my-8"><img src="${imgPath}" alt="${article.title}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
                    content += imgTag;
                    updated = true;
                }
            }
        } else {
            // Reconstruct content
            let newContent = parts[0]; // Intro

            // We have parts[1]...parts[n] each starting with attributes of h2 and then content
            // We want to inject images BETWEEN them or inside?
            // "Before H2" means at the end of the previous section.

            // Loop through available images
            let imgIndex = 0;

            // Start injecting from before the FIRST H2 (between intro and first H2)? 
            // Or after first H2? Usually images look good inside sections.
            // Let's try to inject before the H2 (at the end of the previous block)
            // parts[0] + IMG + <h2 + parts[1] + IMG + <h2 + parts[2] ...

            for (let i = 1; i < parts.length; i++) {
                // Check if we have an image to inject
                if (imgIndex < images.length) {
                    const imgFile = images[imgIndex];
                    const imgPath = `/images/articles/${slug}/${imgFile}`;

                    // Only inject if NOT already present
                    // We check the WHOLE original content for this path to avoid duplicates if they are moved
                    if (!originalContent.includes(imgPath)) {
                        const imgTag = `<figure class="w-full my-8"><img src="${imgPath}" alt="${article.title}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
                        newContent += imgTag; // Append to end of previous section
                        console.log(`  [INJECT] ${imgFile} before H2 #${i}`);
                        updated = true;
                    } else {
                        console.log(`  [EXISTS] ${imgFile} already in content.`);
                    }
                    imgIndex++;
                }

                newContent += '<h2' + parts[i];
            }

            // If there are leftover images (more images than H2s), append them to the end
            while (imgIndex < images.length) {
                const imgFile = images[imgIndex];
                const imgPath = `/images/articles/${slug}/${imgFile}`;
                if (!originalContent.includes(imgPath)) {
                    const imgTag = `<figure class="w-full my-8"><img src="${imgPath}" alt="${article.title}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
                    newContent += imgTag;
                    console.log(`  [INJECT] ${imgFile} at end.`);
                    updated = true;
                }
                imgIndex++;
            }
            content = newContent;
        }

        if (updated) {
            console.log(`  Updating MicroCMS for ${slug}...`);
            try {
                await client.update({
                    endpoint: 'articles',
                    contentId: article.id,
                    content: {
                        content: content
                    }
                });
                console.log(`  SUCCESS: [${slug}] Updated.`);
            } catch (e) {
                console.error(`  FAILED: [${slug}] Update failed.`, e.message);
            }
        } else {
            console.log(`  [OK] No changes needed for ${slug}.`);
        }
    }

    console.log('--- SYNC COMPLETE ---');
}

main();
