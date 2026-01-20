
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
    console.log('--- FIXING MIXED CONTENT (Markdown Images in HTML) ---');

    // IDs of the Short articles that have this issue
    // se-asia-investment (Short): 39txoy475rt
    // vintage-superiority (Short): 1ogx_31874a (assuming this one exists and is the one kept? 
    // Wait, in step 2221 I deleted s1z9v42bdz (Long).
    // So 1ogx_31874a is the Short one.

    const targetIds = ['39txoy475rt', '1ogx_31874a'];

    for (const id of targetIds) {
        try {
            const article = await client.get({
                endpoint: 'articles',
                contentId: id,
            });

            if (!article) {
                console.log(`[SKIP] Article ${id} not found.`);
                continue;
            }

            console.log(`Processing ${article.slug} (${id})...`);
            let content = article.content || "";

            // Regex to find ![alt](src)
            // Note: simplistic regex, assumes no nested brackets in alt
            const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

            if (!mdImageRegex.test(content)) {
                console.log(`  No Markdown images found.`);
                continue;
            }

            const newContent = content.replace(mdImageRegex, (match: string, alt: string, src: string) => {
                console.log(`  Replacing: ${match}`);
                // Ensure correct path (if it's already /images/..., great)
                // If it's relative or external, leave as is.
                return `<figure class="w-full my-8"><img src="${src}" alt="${alt}" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
            });

            if (newContent !== content) {
                console.log(`  Updating content...`);
                await client.update({
                    endpoint: 'articles',
                    contentId: id,
                    content: {
                        content: newContent
                    }
                });
                console.log(`  [SUCCESS] Fixed mixed content for ${id}`);
            } else {
                console.log(`  No changes made.`);
            }

        } catch (e: any) {
            console.error(`[FAILED] Error processing ${id}:`, e.message);
        }
    }
}

main();
