
const fs = require('fs');
const path = require('path');
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });

// Configuration
const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY?.trim();

if (!SERVICE_DOMAIN || !API_KEY) {
    console.error('Error: MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required in .env.local');
    process.exit(1);
}

const client = createClient({
    serviceDomain: SERVICE_DOMAIN,
    apiKey: API_KEY,
});

/**
 * Upload image to microCMS Media API
 */
async function uploadImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
    }

    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);

    console.log(`Uploading image: ${fileName}...`);

    const response = await fetch(`https://upload.microcms.io/api/v1/media`, {
        method: 'POST',
        headers: {
            'X-MICROCMS-API-KEY': API_KEY,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Image uploaded successfully: ${data.url}`);
    return data.url;
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = { images: [] };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--images') {
            // Collect all subsequent arguments until the next flag
            let j = i + 1;
            while (j < args.length && !args[j].startsWith('--')) {
                parsed.images.push(args[j]);
                j++;
            }
            i = j - 1;
        } else if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                parsed[key] = value;
                i++;
            } else {
                parsed[key] = true;
            }
        }
    }
    return parsed;
}

async function main() {
    const args = parseArgs();

    // Validate required arguments
    if (!args.file || !args.title || !args.category) {
        console.error('Usage: node scripts/import_articles.js --file <path> --title <title> --category <category> --expert_tip <tip> --target_yield <yield> [--images <path1> <path2>...] [--slug <slug>]');
        process.exit(1);
    }

    try {
        // 1. Read Content
        let content = fs.readFileSync(args.file, 'utf8');

        // 2. Upload Images and Replace Placeholders
        // Expected Logic:
        // Input: --images A.png B.png C.png
        // Content Placeholders: IMAGE_ID_1, IMAGE_ID_2, IMAGE_ID_3
        if (args.images.length > 0) {
            console.log(`Processing ${args.images.length} images...`);

            for (let i = 0; i < args.images.length; i++) {
                const imagePath = args.images[i];
                const imageIdPlaceholder = `IMAGE_ID_${i + 1}`;

                try {
                    const imageUrl = await uploadImage(imagePath);

                    // Replace placeholder in content
                    if (content.includes(imageIdPlaceholder)) {
                        content = content.replace(new RegExp(imageIdPlaceholder, 'g'), imageUrl);
                        console.log(`[REPLACED] ${imageIdPlaceholder} -> ${imageUrl}`);
                    } else {
                        console.warn(`[WARN] Placeholder ${imageIdPlaceholder} not found in content.`);
                    }

                } catch (error) {
                    console.warn(`[WARN] Image upload failed for ${imagePath}: ${error.message}`);
                    console.warn(`[WARN] Using local path fallback. Ensure images are deployed to production.`);

                    // Fallback: Use the local path relative to public/
                    // Assuming imagePath is something like "public/images/tmp/foo.png"
                    // We need "/images/tmp/foo.png" for the src
                    const publicRelPath = imagePath.replace('public/', '/');

                    if (content.includes(imageIdPlaceholder)) {
                        content = content.replace(new RegExp(imageIdPlaceholder, 'g'), publicRelPath);
                        console.log(`[FALLBACK] ${imageIdPlaceholder} -> ${publicRelPath}`);
                    }
                }
            }
        }

        // 3. Create or Update Article
        const payload = {
            title: args.title,
            content: content,
            category: [args.category],
            slug: args.slug || undefined,
            target_yield: args.target_yield || "0",
            expert_tip: args.expert_tip || "",
            meta_title: args.meta_title || undefined,
            meta_description: args.meta_description || undefined,
            keywords: args.keywords || undefined,
            video_script_a: args.video_script_a || undefined,
            video_script_b: args.video_script_b || undefined,
            prop_list: args.prop_list || undefined,
            telop_text: args.telop_text || undefined,
        };

        // Check for existing article with same title
        console.log(`Checking for existing article with title: "${args.title}"...`);
        const { contents: existingArticles } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `title[equals]${args.title}` }
        });

        if (existingArticles.length > 0) {
            const existingId = existingArticles[0].id;
            console.log(`[FOUND] Existing article found (ID: ${existingId}). Updating...`);

            await client.update({
                endpoint: 'articles',
                contentId: existingId,
                content: payload,
            });
            console.log(`[SUCCESS] Article updated! ID: ${existingId}`);
            console.log(`Review it here: https://${SERVICE_DOMAIN}.microcms.io/apis/articles/${existingId}`);
        } else {
            console.log('[NEW] No existing article found. Creating new article...');
            const res = await client.create({
                endpoint: 'articles',
                content: payload,
            });
            console.log(`[SUCCESS] Article created! ID: ${res.id}`);
            console.log(`Review it here: https://${SERVICE_DOMAIN}.microcms.io/apis/articles/${res.id}`);
        }

    } catch (error) {
        console.error('[ERROR] Import failed:', error.message);
        process.exit(1);
    }
}

main();
