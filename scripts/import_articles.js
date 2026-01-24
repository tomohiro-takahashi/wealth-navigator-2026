
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
 * Handle image: Copy to public/images/articles/ and return relative path
 */
function handleImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
    }

    const fileName = path.basename(imagePath);
    // Dest: public/images/articles/
    const destDir = path.resolve(__dirname, '../public/images/articles');
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(imagePath, destPath);
    console.log(`[LOCAL] Copied image to: ${destPath}`);

    // Return URL path relative to public root
    return `/images/articles/${fileName}`;
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

    // Validate required arguments for minimal operation
    if (!args.file || !args.title) {
        console.error('Usage: node scripts/import_articles.js --file <path> --title <title> [options]');
        process.exit(1);
    }

    try {

        // 1. Read Content
        let content = fs.readFileSync(args.file, 'utf8');

        // STRIP FRONTMATTER: Use regex to remove YAML block at the start
        content = content.replace(/^---[\s\S]*?---\s*/, '').trim();

        // CONVERT MARKDOWN TO HTML (if not already polished)
        // This ensures the structure is preserved in MicroCMS Rich Text fields.
        const { marked } = require('marked');
        const isMarkdown = /^#|[\n\r]#|^- |^\* |^\d+\. /.test(content);
        if (isMarkdown && !content.startsWith('<')) {
            console.log('[INFO] Detected Markdown content. Converting to HTML before import...');
            content = marked.parse(content);
        }

        // SPLIT EXPERT TIP: Extract <div class="expert-box">...</div>
        // If expert_tip is not provided in args, try to extract it.
        // Always remove it from body to prevent duplication with the ExpertTip component.
        const expertTipRegex = /<div class="expert-box">([\s\S]*?)<\/div>/;
        const expertTipMatch = content.match(expertTipRegex);
        if (expertTipMatch) {
            const extractedTip = expertTipMatch[1].trim();
            console.log('[INFO] Extracted Expert Tip from content.');
            if (!args.expert_tip) {
                args.expert_tip = extractedTip;
            }
            content = content.replace(expertTipRegex, '').trim();
        }

        // 2. Handle Images (Local Copy)
        if (args.images.length > 0) {
            console.log(`Processing ${args.images.length} images...`);

            for (let i = 0; i < args.images.length; i++) {
                const imagePath = args.images[i];
                const imageIdPlaceholder = `IMAGE_ID_${i + 1}`;

                try {
                    // Start local handler
                    const imageUrl = handleImage(imagePath);

                    // Replace placeholder in content
                    if (content.includes(imageIdPlaceholder)) {
                        content = content.replace(new RegExp(imageIdPlaceholder, 'g'), imageUrl);
                        console.log(`[REPLACED] ${imageIdPlaceholder} -> ${imageUrl}`);
                    } else {
                        console.warn(`[WARN] Placeholder ${imageIdPlaceholder} not found in content.`);
                    }

                } catch (error) {
                    console.warn(`[WARN] Image processing failed for ${imagePath}: ${error.message}`);
                }
            }
        }

        // 3. Construct Payload (Only include fields if present in args)
        const payload = {
            title: args.title,
            content: content, // Content is always updated from file
        };

        if (args.category) {
            let category = args.category;

            // DNA Category Mapping (Rich Object Support)
            try {
                const dnaPath = path.resolve(__dirname, '../src/dna.config.json');
                const dna = require(dnaPath);

                // Check new structure: categories[key].id
                if (dna.categories && dna.categories[category]) {
                    const catObj = dna.categories[category];
                    console.log(`🧬 DNA Category Mapping: ${category} -> ${catObj.id} (${catObj.name})`);
                    category = catObj.id;
                }
                // Check legacy map (just in case)
                else if (dna.category_map && dna.category_map[category]) {
                    category = dna.category_map[category];
                }
            } catch (e) {
                // Ignore if DNA config issue
            }

            payload.category = [category];
        }
        if (args.slug) payload.slug = args.slug;
        if (args.target_yield) payload.target_yield = args.target_yield;
        if (args.expert_tip) payload.expert_tip = args.expert_tip;
        if (args.meta_title) payload.meta_title = args.meta_title;
        if (args.meta_description) payload.meta_description = args.meta_description;
        if (args.keywords) payload.keywords = args.keywords;
        // Site ID Logic: CLI Arg > DNA Config > Default
        let siteId = args.site_id;
        if (!siteId) {
            try {
                const dnaPath = path.resolve(__dirname, '../src/dna.config.json');
                if (fs.existsSync(dnaPath)) {
                    const dna = require(dnaPath);
                    // Support both camelCase and snake_case in DNA
                    siteId = dna.identity?.siteId || dna.identity?.site_id;
                    if (siteId) {
                        console.log(`🧬 DNA Site ID Detected: ${siteId}`);
                    }
                }
            } catch (e) {
                // Ignore
            }
        }
        if (siteId) payload.site_id = [siteId]; // Treat as Array (Multi-Select/Tag pattern)

        // Check for existing article with same title
        console.log(`Checking for existing article with title: "${args.title}"...`);
        const { contents: existingArticles } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `title[equals]${args.title}` }
        });

        if (existingArticles.length > 0) {
            const existingId = existingArticles[0].id;
            console.log(`[FOUND] Existing article found (ID: ${existingId}). Updating...`);
            console.log('Update Payload:', JSON.stringify(payload, null, 2));

            await client.update({
                endpoint: 'articles',
                contentId: existingId,
                content: payload,
            });
            console.log(`[SUCCESS] Article updated! ID: ${existingId}`);
        } else {
            console.log('[NEW] No existing article found. Creating new article...');
            // For creation, we might want defaults if fields are mandatory, 
            // but for now let's send what we have. API might validation error if missing required.
            if (!payload.category) payload.category = ['overseas']; // Default for creation only

            await client.create({
                endpoint: 'articles',
                content: payload,
            });
            console.log(`[SUCCESS] Article created!`);
        }

    } catch (error) {
        console.error('[ERROR] Import failed:', error.message);
        process.exit(1);
    }
}

main();
