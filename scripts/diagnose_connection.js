const { createClient } = require('microcms-js-sdk');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

console.log('--- Config ---');
console.log('Service Domain:', serviceDomain);
console.log('API Key:', apiKey ? (apiKey.substring(0, 5) + '...') : 'MISSING');
console.log('--------------');

const client = createClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey,
});

async function testConnection() {
    try {
        console.log('Attempting to fetch "articles" list...');
        const data = await client.getList({ endpoint: 'articles', queries: { limit: 1 } });
        console.log('✓ Success! Found', data.totalCount, 'articles.');
        console.log('First article ID:', data.contents[0]?.id);
    } catch (error) {
        console.error('✗ "articles" fetch failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data));
        }
    }

    try {
        console.log('\nAttempting to fetch "properties" list...');
        const data = await client.getList({ endpoint: 'properties', queries: { limit: 1 } });
        console.log('✓ Success! Found', data.totalCount, 'properties.');
        console.log('First Property Name:', data.contents[0]?.name);
        console.log('First Property Status:', data.contents[0]?.status_badge);
    } catch (error) {
        console.error('✗ "properties" fetch failed:', error.message);
    }
}

testConnection();
