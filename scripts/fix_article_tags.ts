
import { createClient } from 'microcms-js-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
    apiKey: process.env.MICROCMS_API_KEY || "",
});

const TARGET_SITE_ID = 'wealth_navigator';
const TARGET_IDS = [
    'dci3k4tmymb5', // Wealth Navigator Declaration
    'oh9bp9qahcr', // Manila RFO
    'dewx6pdsi', // Singapore
    '39txoy475rt', // Decoupling Japan
    'ico0fjl7g0', // Central Bank/Gold
    'p3yt20_ray', // Ray Dalio
    'cyjn04r0p', // Yen Depreciation
    '87t489p_gxi4' // Manila Land Price
];

async function main() {
    console.log(`Retagging specific articles to ${TARGET_SITE_ID}...`);

    try {
        for (const id of TARGET_IDS) {
            console.log(`Updating article ID: ${id}`);
            try {
                // Fetch to check current state (optional but good for logging)
                const current = await client.get({ endpoint: 'articles', contentId: id });
                console.log(`  - Title: ${current.title}`);
                console.log(`  - Old SiteID: ${JSON.stringify(current.site_id)}`);

                await client.update({
                    endpoint: 'articles',
                    contentId: id,
                    content: {
                        site_id: [TARGET_SITE_ID] // Overwrite to enforce strict isolation
                    }
                });
                console.log('  - Successfully updated.');
            } catch (err) {
                console.error(`  - Failed to update ${id}:`, err);
            }
        }

        console.log('Verifying...');
        const verifyData = await client.getList({
            endpoint: 'articles',
            queries: { filters: `site_id[equals]${TARGET_SITE_ID}` }
        });
        console.log(`Now found ${verifyData.totalCount} articles with tag ${TARGET_SITE_ID}.`);

    } catch (error) {
        console.error('Error in fix script:', error);
    }
}

main();
