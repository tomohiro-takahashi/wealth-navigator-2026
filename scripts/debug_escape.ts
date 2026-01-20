
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
    try {
        const id = 'r9uzt25vwo4e'; // second-property-wall
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { ids: id }
        });

        if (contents.length > 0) {
            const article = contents[0];
            console.log('--- DEEP INSPECTION ---');
            console.log('ID:', article.id);
            // JSON stringify to see escapes
            console.log('Content Raw:', JSON.stringify(article.content));
        } else {
            console.log('Article not found');
        }

    } catch (e) {
        console.error(e);
    }
}
main();
