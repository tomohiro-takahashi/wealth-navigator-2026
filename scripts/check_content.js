
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

async function main() {
    try {
        const args = require('minimist')(process.argv.slice(2));
        const slug = args.slug || 'loan-deadline-strategy';
        
        const { contents } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `slug[equals]${slug}` }
        });

        if (contents.length === 0) {
            console.log('Article not found');
            return;
        }

        const article = contents[0];
        console.log('--- Full Article Inspection ---');
        console.log('Keys:', Object.keys(article));

        console.log('Title:', article.title);
        console.log('Description/SEO:', article.description || 'N/A'); // If description is a standard field?
        console.log('Keyword/SEO:', article.keywords || 'N/A');

        // Check "SEO Text" usage in this project?
        // Maybe it's "expert_tip"?
        console.log('Expert Tip:', article.expert_tip ? article.expert_tip.substring(0, 50) + '...' : 'UNDEFINED');

        console.log('--- Content Check ---');
        console.log(`Content Length: ${article.content.length}`);
        console.log(`Has Figure Tag? ${article.content.includes('<figure')}`);

        // Print content around H2 to see if text was lost
        const preview = article.content.substring(0, 500);
        console.log('Content Start:', preview);

        console.log('--- Content Preview ---');
        console.log(article.content.substring(0, 2000));
        console.log('--- End Preview ---');

        const h2Count = (article.content.match(/<h2/g) || []).length;
        const h3Count = (article.content.match(/<h3/g) || []).length;
        console.log(`H2 Count: ${h2Count}`);
        console.log(`H3 Count: ${h3Count}`);

    } catch (e) {
        console.error(e);
    }
}

main();
