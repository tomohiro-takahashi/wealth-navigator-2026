
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || '',
});

async function main() {
    console.log('--- DIAGNOSE WRITE PERMISSIONS ---');
    console.log('Service Domain:', process.env.MICROCMS_SERVICE_DOMAIN ? '***' : 'MISSING');
    console.log('API Key:', process.env.MICROCMS_API_KEY ? '***' : 'MISSING');

    const id = 'r9uzt25vwo4e'; // second-property-wall

    // 1. Fetch current
    console.log(`\nFetching ${id}...`);
    const current = await client.get({ endpoint: 'articles', contentId: id });
    console.log(`Current Title: ${current.title}`);
    console.log(`Current UpdatedAt: ${current.updatedAt}`);

    // 2. Update
    console.log(`\nUpdating Title...`);
    const newTitle = current.title + " (TEST)";
    try {
        const res = await client.update({
            endpoint: 'articles',
            contentId: id,
            content: { title: newTitle }
        });
        console.log(`Update Result:`, res);
    } catch (e: any) {
        console.error('UPDATE FAILED:', e.message);
        console.error(e);
        return;
    }

    // 3. Verify
    console.log(`\nVerifying...`);
    // Wait a sec?
    await new Promise(r => setTimeout(r, 1000));

    // Note: get() fetches Published. If update makes it Draft, get() might still return Old Title?
    // Unless we use draftKey? But update response doesn't give draftKey?
    // Actually, update usually returns ID.
    // If it moved to Draft, "updatedAt" of Published might NOT change?
    // But "revisedAt" works for Published.

    // Let's check status via list?
    const check = await client.get({ endpoint: 'articles', contentId: id });
    console.log(`New Title (Public API): ${check.title}`);
    console.log(`New UpdatedAt: ${check.updatedAt}`);

    if (check.title === newTitle) {
        console.log('SUCCESS: Content updated and visible directly (Auto-Publish?).');
    } else {
        console.log('WARNING: Content did not change in Public API. It might be in Draft/UpdatePending state.');
    }
}
main();
