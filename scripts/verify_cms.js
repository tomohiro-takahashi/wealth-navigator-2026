
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function check() {
    console.log("Checking MicroCMS for recent articles...");
    try {
        const res = await client.getList({
            endpoint: 'articles',
            queries: { 
                limit: 5,
                orders: '-publishedAt'
            }
        });

        console.log(`Found ${res.totalCount} articles.`);
        res.contents.forEach(a => {
            console.log(`- [${a.publishedAt}] ${a.title} (ID: ${a.id}) [Site: ${a.site_id}]`);
        });
    } catch (e) {
        console.error("Error:", e.message);
    }
}

check();
