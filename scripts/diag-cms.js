
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

async function check() {
    console.log(`Checking Service: ${process.env.MICROCMS_SERVICE_DOMAIN}`);
    try {
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { limit: 10, orders: '-publishedAt' }
        });
        
        console.table(contents.map(c => ({
            id: c.id,
            title: c.title.substring(0, 30),
            site_id: c.site_id,
            publishedAt: c.publishedAt,
            has_image: c.content.includes('/images/articles/') && !c.content.includes('placeholder')
        })));
    } catch (e) {
        console.error("Failed to fetch:", e.message);
    }
}

check();
