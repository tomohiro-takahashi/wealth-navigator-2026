
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || '',
});

async function main() {
    console.log('--- SCANNING FOR BROKEN LINKS ---');
    const { contents } = await client.getList({
        endpoint: 'articles',
        queries: { limit: 100 }
    });

    for (const article of contents) {
        const content = article.content || "";
        const matches = content.match(/\/images\/articles\/[^"'\s>]+/g);

        if (matches) {
            matches.forEach((m: string) => {
                const parts = m.split('/');
                // ["", "images", "articles", "slug", "file.webp"] -> length 5
                // ["", "images", "articles", "slug.webp"] -> length 4

                if (parts.length < 5) {
                    console.log(`[${article.slug}] SUSPICIOUS LINK: ${m}`);
                }
            });
        }
    }
}

main();
