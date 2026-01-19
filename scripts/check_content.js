
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function main() {
    try {
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { filters: 'slug[equals]time-leverage' }
        });

        if (contents.length === 0) {
            console.log('Article not found');
            return;
        }

        const article = contents[0];
        console.log('--- Content Check ---');
        console.log(`Title: ${article.title}`);
        console.log(`Has Figure Tag? ${article.content.includes('<figure')}`);
        console.log(`Has Img Tag? ${article.content.includes('<img')}`);

        if (article.content.includes('<figure')) {
            const match = article.content.match(/<figure.*?>.*?<\/figure>/s);
            console.log('Sample Figure:', match ? match[0] : 'Match failed');
        }

    } catch (e) {
        console.error(e);
    }
}

main();
