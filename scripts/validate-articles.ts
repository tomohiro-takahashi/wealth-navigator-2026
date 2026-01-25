
import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
    console.error('Error: MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
    process.exit(1);
}

const client = createClient({
    serviceDomain: SERVICE_DOMAIN,
    apiKey: API_KEY,
});

async function validate() {
    console.log('--- content Quality Inspector starting... ---');
    
    try {
        const { contents: articles } = await client.getList({
            endpoint: 'articles',
            queries: { limit: 100 }
        });

        console.log(`Scanning ${articles.length} articles across all brands...\n`);

        let totalIssues = 0;
        const publicDir = path.resolve(__dirname, '../public');

        for (const article of articles) {
            const issues: string[] = [];
            const content = article.content || '';
            const slug = article.slug || article.id;
            
            // 1. Check for pollution (duplicates)
            const figureCount = (content.match(/<figure class="w-full my-8">/gi) || []).length;
            if (figureCount > 3) {
                issues.push(`⚠️ POLLUTED: Found ${figureCount} image tags (Should be 3 max)`);
            }

            // 2. Check for Error Placeholders
            if (content.includes('IMAGE LOAD FAILED')) {
                issues.push(`❌ BROKEN: Content contains "IMAGE LOAD FAILED" placeholders`);
            }

            // 3. Verify Image Paths
            const imgRegex = /img src="(\/images\/articles\/[^"]+)"/gi;
            let match;
            while ((match = imgRegex.exec(content)) !== null) {
                const imgPath = match[1];
                const localPath = path.join(publicDir, imgPath);
                
                if (!fs.existsSync(localPath)) {
                    issues.push(`🚫 MISSING FILE: ${imgPath}`);
                }
            }

            // 4. Check Eyecatch (if exists)
            if (article.eyecatch && article.eyecatch.url) {
                // handle microcms managed images if any, but our strategy is local /images/
            }

            if (issues.length > 0) {
                console.log(`[${article.site_id || 'unknown'}] "${article.title}"`);
                issues.forEach(msg => console.log(`   ${msg}`));
                totalIssues += issues.length;
            }
        }

        console.log(`\n--- Inspection Complete: ${totalIssues} issues found. ---`);
        if (totalIssues > 0) {
            console.log('Tip: Run "npm run generate:images" to auto-fix pollution and missing tags.');
        }

    } catch (e) {
        console.error('Validation Error:', e);
    }
}

validate();
