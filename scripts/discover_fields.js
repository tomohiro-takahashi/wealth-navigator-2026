
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function discover() {
    const res = await client.getList({
        endpoint: 'articles',
        queries: { limit: 1 }
    });
    if (res.contents.length > 0) {
        console.log('Fields:', Object.keys(res.contents[0]));
        console.log('Sample Content:', JSON.stringify(res.contents[0], null, 2));
    } else {
        console.log('No articles found to check fields.');
    }
}
discover();
