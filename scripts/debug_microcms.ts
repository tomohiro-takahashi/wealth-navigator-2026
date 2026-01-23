
import { createClient } from 'microcms-js-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
    apiKey: process.env.MICROCMS_API_KEY || "",
});

const SITE_ID = 'wealth_navigator';

async function main() {
    console.log(`Checking articles for site_id: ${SITE_ID}`);
    console.log(`Service Domain: ${process.env.MICROCMS_SERVICE_DOMAIN}`);
    // Hide API Key
    console.log(`API Key present: ${!!process.env.MICROCMS_API_KEY}`);

    try {
        const data = await client.getList({
            endpoint: 'articles',
            queries: {
                filters: `site_id[equals]${SITE_ID}`,
            },
        });

        console.log(`Found ${data.totalCount} articles.`);
        if (data.contents.length > 0) {
            console.log('First article title:', data.contents[0].title);
            console.log('First article site_id:', data.contents[0].site_id);
        } else {
            console.log('No articles found with this filter.');

            // Try fetching without filter to seeing what site_ids exist
            console.log('Fetching top 5 articles without filter...');
            const allData = await client.getList({
                endpoint: 'articles',
                queries: { limit: 5 }
            });
            console.log('Articles found (unfiltered):', allData.totalCount);
            allData.contents.forEach(a => {
                console.log(`- Title: ${a.title}, site_id: ${JSON.stringify(a.site_id)}`);
            });
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

main();
