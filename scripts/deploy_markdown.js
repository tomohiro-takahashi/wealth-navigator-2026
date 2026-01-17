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
    // Find all images: ![alt](/images/...) or <img src="/images/...">
    // We assume mostly standard markdown for this workflow
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = [...finalBody.matchAll(imageRegex)];

    // Include coverImage in list to process
    const imageMap = new Map(); // LocalPath -> RemoteURL

    const allImages = matches.map(m => m[1]);
    if (coverImageRef) allImages.push(coverImageRef);

    // Filter duplicates and only process local images
    const uniqueImages = [...new Set(allImages)].filter(img => img.startsWith('/'));

    for (const imgPath of uniqueImages) {
        // Map /images/articles/xxx -> public/images/articles/xxx
        const localSystemPath = path.join(process.cwd(), 'public', imgPath);

        try {
            const remoteUrl = await uploadImage(localSystemPath);
            imageMap.set(imgPath, remoteUrl);
        } catch (e) {
            console.warn(`[WARN] Failed to process image ${imgPath}: ${e.message}`);
            console.warn(`[WARN] Keeping local path: ${imgPath}. Ensure this image is deployed to your frontend server.`);
            // Do not exit, just keep the local path (by not setting it in imageMap, or mapping to itself)
            imageMap.set(imgPath, imgPath);
        }
    }

    // 3. Replace in Body
    imageMap.forEach((remoteUrl, localPath) => {
        // Only replace if they are different
        if (remoteUrl !== localPath) {
            finalBody = finalBody.split(localPath).join(remoteUrl);
        }
    });

    // 4. Extract Expert Tip
    const expertTip = extractExpertTip(finalBody);

    // 5. Prepare Payload
    const payload = {
        title: title,
        content: finalBody,
        category: ['overseas'], // Defaulting to overseas for this specific task context, or could infer
        target_yield: "0", // Default
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
