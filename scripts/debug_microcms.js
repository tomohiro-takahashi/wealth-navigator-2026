const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function check() {
    const res = await client.getList({
        endpoint: 'articles',
        queries: { limit: 10 }
    });
    
    console.log('--- MicroCMS Current Articles ---');
    res.contents.forEach(a => {
        console.log(`Title: ${a.title}`);
        console.log(`Slug: ${a.slug}`);
        console.log(`Content Length: ${a.content ? a.content.length : 0}`);
        console.log(`Category: ${JSON.stringify(a.category)}`);
        console.log(`Site ID: ${JSON.stringify(a.site_id)}`);
        console.log('---');
    });
}

check();
