
import { createClient } from 'microcms-js-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
    apiKey: process.env.MICROCMS_API_KEY || "",
});

async function main() {
    const SITE_ID = 'kominka_frontier';
    console.log(`Testing filters for site_id: ${SITE_ID}`);

    try {
        // Test 1: [equals]
        console.log("--- Test 1: [equals] ---");
        const dataEq = await client.getList({
            endpoint: 'articles',
            queries: { filters: `site_id[equals]${SITE_ID}` }
        });
        console.log(`[equals] result: ${dataEq.totalCount}`);

        // Test 2: [contains]
        console.log("--- Test 2: [contains] ---");
        const dataContains = await client.getList({
            endpoint: 'articles',
            queries: { filters: `site_id[contains]${SITE_ID}` }
        });
        console.log(`[contains] result: ${dataContains.totalCount}`);

        if (dataContains.contents.length > 0) {
            console.log("Sample article tags (from [contains]):", dataContains.contents[0].site_id);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
