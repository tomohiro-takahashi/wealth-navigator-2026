const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function check() {
    const res = await client.getList({
        endpoint: 'articles',
        queries: { limit: 1 }
    });
    
    if (res.contents.length > 0) {
        const article = res.contents[0];
        console.log('--- Raw Keys found in MicroCMS Article ---');
        console.log(Object.keys(article).join(', '));
        console.log('--- Sample Data ---');
        console.log(JSON.stringify(article, null, 2));
    } else {
        console.log('No articles found in MicroCMS ARTICLES endpoint.');
    }
}

check();
