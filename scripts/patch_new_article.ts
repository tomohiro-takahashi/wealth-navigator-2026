
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
    console.log('--- PATCHING NEW ARTICLE IMAGE PORTS ---');

    // Find ID by slug
    const slug = 'second-property-wall';
    const { contents } = await client.getList({
        endpoint: 'articles',
        queries: { filters: `slug[equals]${slug}` }
    });

    if (contents.length === 0) {
        console.error('Article not found');
        return;
    }

    const article = contents[0];
    console.log(`Found article: ${article.title} (${article.id})`);

    let content = article.content || "";

    // Fix Title (Remove TEST)
    if (article.title.includes('(TEST)')) {
        console.log('Restoring Title...');
        await client.update({
            endpoint: 'articles',
            contentId: article.id,
            content: { title: article.title.replace(' (TEST)', '') }
        });
    }

    // Force Inject Logic
    console.log(`Original Content Length: ${content.length}`);
    const contentParts = content.split(/<h2/i);
    console.log(`Found ${contentParts.length - 1} H2 tags.`);

    let injectedContent = content;

    if (contentParts.length > 1) { // At least 1 H2
        let newHtml = contentParts[0];

        // Inject Img 1
        newHtml += `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/01.webp" alt="Bank negotiation room" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
        newHtml += `<h2` + contentParts[1];

        // Inject Img 2 if H2 #2 exists
        if (contentParts.length > 2) {
            newHtml += `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/02.webp" alt="Asset vs Liability" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
            newHtml += `<h2` + contentParts[2];
        } else {
            newHtml += `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/02.webp" alt="Asset vs Liability" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
        }

        // Inject Img 3
        if (contentParts.length > 3) {
            newHtml += `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/03.webp" alt="Tokyo Storm" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
            newHtml += `<h2` + contentParts[3];
            // Add rest
            for (let i = 4; i < contentParts.length; i++) {
                newHtml += `<h2` + contentParts[i];
            }
        } else {
            // Append to end if not enough H2
            newHtml += `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/03.webp" alt="Tokyo Storm" width="1200" height="630" class="rounded-xl shadow-lg" /></figure>`;
            // Add remaining parts if any (e.g. if length was 3, we already added part 1,2. Loop above handles 3+. Wait.)
            for (let i = 3; i < contentParts.length; i++) { // Loop starts at 3
                newHtml += `<h2` + contentParts[i];
            }
        }

        injectedContent = newHtml;
    } else {
        console.log("No H2 tags found! Appending to top.");
        const imgs = `<figure class="w-full my-8"><img src="/images/articles/second-property-wall/01.webp" alt="All Images" width="1200" height="630" /></figure>`;
        injectedContent = imgs + content;
    }

    console.log(`New Content Length: ${injectedContent.length}`);

    if (injectedContent !== content) {
        console.log('Injecting images...');
        try {
            await client.update({
                endpoint: 'articles',
                contentId: article.id,
                content: {
                    content: injectedContent
                }
            });
            console.log('SUCCESS: Images injected manually.');
        } catch (e: any) {
            console.error("Update Failed:", e);
        }
    } else {
        console.log("Content unchanged (maybe already injected?)");
    }
}

main();
