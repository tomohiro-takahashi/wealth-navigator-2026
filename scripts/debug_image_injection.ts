
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import path from 'path';
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
    console.log('--- Debugging Image Injection for time-leverage ---');

    try {
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { filters: 'slug[equals]loan-deadline-strategy' }
        });

        if (contents.length === 0) {
            console.log('Article not found');
            return;
        }

        const article = contents[0];
        const content = article.content;
        const slug = article.slug || article.id;

        console.log(`Title: ${article.title}`);
        console.log(`Original Length: ${content.length}`);

        const parts = content.split('<h2');
        console.log(`Split parts length: ${parts.length}`);

        if (parts.length <= 1) {
            console.log('No H2 tags found or single section.');
            return;
        }

        let newContent = parts[0];
        let imageCount = 0;
        let updated = false;

        for (let i = 1; i < parts.length; i++) {
            if (imageCount < 3) {
                imageCount++;
                const webpName = `${imageCount.toString().padStart(2, '0')}.webp`;
                const publicPath = `/images/articles/${slug}/${webpName}`;

                const imgTag = `<figure class="w-full my-8"><img src="${publicPath}" alt="${article.title} - Section ${imageCount}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;

                console.log(`Injecting Image ${imageCount}: ${imgTag}`);
                newContent += imgTag;
                updated = true;
            } else {
                console.log(`Skipping injection at H2 #${i} (Max reached)`);
            }
            newContent += '<h2' + parts[i];
        }

        console.log(`Updated: ${updated}`);
        console.log(`New Content Length: ${newContent.length}`);

        // Debug diff
        if (content === newContent) {
            console.log('Content MATCHES (No change)');
        } else {
            console.log('Content CHANGED. Updating MicroCMS...');
            await client.update({
                endpoint: 'articles',
                contentId: article.id,
                content: {
                    content: newContent
                }
            });
            console.log('Update API Called.');
        }

    } catch (e) {
        console.error(e);
    }
}

main();
