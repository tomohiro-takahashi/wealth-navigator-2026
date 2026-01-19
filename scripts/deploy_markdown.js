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
            frontmatter[key.trim()] = values.join(':').trim();
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
    const coverImageRef = frontmatter.coverImage;

    if (!title) {
        console.error('Error: Title missing in frontmatter.');
        process.exit(1);
    }

    // 2. Handle Images
    // Logic Changed: Do NOT upload to MicroCMS. Use Vercel-hosted local paths directly.
    // The images are already in public/images/articles/[slug].webp via previous steps.
    // The Markdown content typically references them as /images/articles/[slug].webp.
    // We simply keep them as is.

    console.log('Skipping MicroCMS Image Upload (Using Vercel-hosted paths)...');

    // 3. Replace in Body (No longer needed as we use local paths, but valid if we needed to fix paths)
    // Current markdown already has /images/articles/... so no replacement needed.


    // 4. Extract Expert Tip
    const expertTip = extractExpertTip(finalBody);

    // 5. Prepare Payload
    const payload = {
        title: title,
        content: finalBody,
        category: frontmatter.category ? [frontmatter.category] : ['overseas'],
        target_yield: frontmatter.target_yield || "0",
        expert_tip: expertTip,
    };

    console.log('Deploying to MicroCMS...');
    try {
        const res = await client.create({
            endpoint: 'articles',
            content: payload,
        });
        console.log(`[SUCCESS] Deployed! ID: ${res.id}`);
        console.log(`Preview: https://${SERVICE_DOMAIN}.microcms.io/apis/articles/${res.id}`);
    } catch (e) {
        console.error('[ERROR] MicroCMS Create Failed:', e.message);
        if (e.response) {
            console.error(JSON.stringify(e.response, null, 2));
        }
        process.exit(1);
    }
}

main();
