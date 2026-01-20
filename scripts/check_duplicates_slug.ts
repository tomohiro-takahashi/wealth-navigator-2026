
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
    const slug = 'second-property-wall';
    const { contents } = await client.getList({
        endpoint: 'articles',
        queries: { filters: `slug[equals]${slug}` }
    });

    console.log(`Checking duplicates for slug: ${slug}`);
    contents.forEach(a => {
        console.log(`ID: ${a.id}, Title: ${a.title}, UpdatedAt: ${a.updatedAt}`);
    });
}
main();
