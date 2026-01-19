
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
    console.log('--- Restoring Loan Deadline Strategy Article ---');

    try {
        // 1. Get Target Article ID/Slug
        const targetSlug = 'loan-deadline-strategy';
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `slug[equals]${targetSlug}` }
        });

        if (contents.length === 0) {
            console.log('Article not found in CMS');
            return;
        }
        const articleId = contents[0].id;

        // 2. Read Source Content (HTML)
        const htmlPath = path.resolve(__dirname, '../generated_content/domestic_3.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        // 3. Read Source Metadata (JSON)
        const jsonPath = path.resolve(__dirname, '../generated_content/06_metadata.json');
        const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // 4. Process Content (Inject Image Paths)
        // Convert IMAGE_ID_1 -> /images/articles/loan-deadline-strategy/01.webp
        htmlContent = htmlContent.replace(/IMAGE_ID_1/g, `/images/articles/${targetSlug}/01.webp`);
        htmlContent = htmlContent.replace(/IMAGE_ID_2/g, `/images/articles/${targetSlug}/02.webp`);
        htmlContent = htmlContent.replace(/IMAGE_ID_3/g, `/images/articles/${targetSlug}/03.webp`);

        // Wrap in figure if not already (The HTML has <div class="image-wrapper">)
        // Convert <div class="image-wrapper"><img ...></div> -> <figure...><img ...></figure>
        htmlContent = htmlContent.replace(
            /<div class="image-wrapper"><img src="([^"]+)" alt="([^"]+)"><\/div>/g,
            '<figure class="w-full my-8"><img src="$1" alt="$2" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>'
        );

        console.log('Prepared Content Length:', htmlContent.length);

        // 5. Update MicroCMS
        console.log('Restoring Metadata & Content...');
        console.log('Title:', metadata.title);
        console.log('Description:', metadata.seo.meta_description);

        await client.update({
            endpoint: 'articles',
            contentId: articleId,
            content: {
                content: htmlContent,
                // description: metadata.seo.meta_description,
                // keywords: metadata.seo.keywords,
                expert_tip: metadata.expert_tip,
                // title: metadata.title // Optional: Keep existing title or update
            }
        });

        console.log('[SUCCESS] Article Restored.');

    } catch (e) {
        console.error(e);
    }
}

main();
