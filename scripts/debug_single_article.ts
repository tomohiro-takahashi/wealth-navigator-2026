
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
        const ids = ['39txoy475rt'];
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { ids: ids.join(',') }
        });
        console.log('--- Duplicate Comparison ---');
        contents.forEach(a => {
            console.log(`\nID: ${a.id}`);
            console.log(`Slug: ${a.slug}`);
            console.log(`Title: ${a.title}`);
            console.log(`Length: ${a.content?.length}`);
            console.log(`Start: ${a.content?.substring(0, 100)}`);
            console.log(`End: ${a.content?.substring(a.content.length - 100)}`);
        });
    } catch (e) {
        console.error(e);
    }
}
main();
