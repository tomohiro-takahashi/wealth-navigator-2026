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

// uploadImage function removed as we use local paths

function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, body: text };

    const frontmatterBlock = match[1];
    const body = text.replace(/^---\n[\s\S]*?\n---/, '').trim();

    const frontmatter = {};
    frontmatterBlock.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
            const value = values.join(':').trim();
            // Strip leading/trailing quotes
            frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
    });

    return { frontmatter, body };
}

function extractExpertTip(body) {
    // Look for "専門家の視点" or similar header
    const match = body.match(/専門家の視点\s*([\s\S]*)/);
    if (match) {
        return match[1].trim();
    }
    return "";
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node scripts/deploy_markdown.js <file_path>');
        process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Processing: ${filePath}`);
    const rawContent = fs.readFileSync(filePath, 'utf8');

    // 1. Parse Frontmatter
    const { frontmatter, body } = parseFrontmatter(rawContent);
    let finalBody = body;
    const title = frontmatter.title;

    if (!title) {
        console.error('Error: Title missing in frontmatter.');
        process.exit(1);
    }

    // Determine Slug from filename
    // Format expected: YYYY-MM-DD-slug.md or just slug.md
    const filename = path.basename(filePath, '.md');
    let slug = filename;
    const dateMatch = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
    if (dateMatch) {
        slug = dateMatch[1];
    }
    console.log(`Derived Slug: ${slug}`);

    // 2. Handle Images (Skip - Vercel hosted)
    console.log('Skipping MicroCMS Image Upload (Using Vercel-hosted paths)...');

    // 4. Extract Expert Tip
    const expertTip = extractExpertTip(finalBody);

    // 5. Prepare Payload
    // Ensure category is an array
    let categories = ['overseas']; // Default
    if (frontmatter.category) {
        categories = frontmatter.category.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    }

    // Handle site_id (should be array of strings)
    let siteId = [];
    if (frontmatter.site_id) {
        siteId = frontmatter.site_id.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }

    const payload = {
        title: title,
        content: finalBody,
        category: categories,
        site_id: siteId,
        meta_title: frontmatter.meta_title || title,
        meta_description: frontmatter.meta_description || "",
        keywords: frontmatter.keywords || "",
        target_yield: frontmatter.target_yield || "0",
        expert_tip: expertTip,
        slug: slug,
    };

    console.log('Deploying to MicroCMS...');
    console.log('Payload Slug:', payload.slug);
    console.log('Payload Category:', payload.category);

    try {
        // We use create. If we wanted to update distinct items we'd need their IDs.
        // For now, we are re-deploying as new entries (or duplicates) to fix the content.
        // Ideally we would update, but we don't track the IDs locally.
        const res = await client.create({
            endpoint: 'articles',
            content: payload,
        });
        console.log(`[SUCCESS] Deployed! ID: ${res.id}`);
        console.log(`Preview: https://${SERVICE_DOMAIN}.microcms.io/apis/articles/${res.id}`);
        // NOTE: The actual URL on the site will include the 'slug' field value, NOT this random ID (unless they match).
    } catch (e) {
        console.error('[ERROR] MicroCMS Create Failed:', e.message);
        if (e.response) {
            console.error(JSON.stringify(e.response, null, 2));
        }
        process.exit(1);
    }
}

main();
