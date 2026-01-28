const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function purgeAll() {
    console.log('🧹 Fetching all articles from MicroCMS...');
    try {
        const res = await client.get({
            endpoint: 'articles',
            queries: { limit: 100 }
        });

        if (res.contents.length === 0) {
            console.log('✨ MicroCMS is already empty.');
            return;
        }

        console.log(`🗑️ Found ${res.contents.length} articles. Deleting...`);
        for (const article of res.contents) {
            await client.delete({
                endpoint: 'articles',
                contentId: article.id
            });
            console.log(`✅ Deleted: ${article.title}`);
        }
        console.log('🚀 MicroCMS Purge Complete.');
    } catch (e) {
        console.error('❌ Purge failed:', e.message);
    }
}

purgeAll();
