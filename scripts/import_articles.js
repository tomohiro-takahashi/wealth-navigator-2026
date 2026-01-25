
const { createClient } = require('microcms-js-sdk');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
require('dotenv').config({ path: '.env.local' });

// Initialize MicroCMS Client
const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

const args = require('minimist')(process.argv.slice(2));

async function importArticle() {
    try {
        if (!args.file) throw new Error('Usage: node import_articles.js --file <md_file_path> [--force-reset]');

        console.log(`[IMPORT] Starting for: ${args.file}`);

        const fileAbsPath = path.resolve(args.file);
        const rawFileContent = fs.readFileSync(fileAbsPath, 'utf8');
        let { data: frontmatter, content } = matter(rawFileContent);

        // 1. Content Normalization (Markdown -> HTML)
        const isAlreadyHtml = /<[a-z][\s\S]*>/i.test(content.substring(0, 500));
        const hasMarkdownPatterns = /^#|[\n\r]#|^- |^\* |^\d+\. |!\[.*\]\(.*\)/m.test(content);
        
        if (!isAlreadyHtml || hasMarkdownPatterns) {
            console.log('[INFO] Content appears to be Markdown. Converting to clean HTML...');
            content = marked.parse(content);
        }

        // 2. Data Preparation
        const slug = args.slug || frontmatter.slug || path.basename(args.file, '.md');
        let title = args.title || frontmatter.title || 'No Title';

        // Title Fallback
        if (title === 'No Title' || title === 'undefined') {
            const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || content.match(/^# (.*)$/m);
            if (h1Match) {
                title = h1Match[1].replace(/<[^>]+>/g, '').trim();
                console.log(`[INFO] Extracted title from content: "${title}"`);
            }
        }

        // DNA Mapping (Site ID & Category)
        let siteId = args.site_id || frontmatter.site_id || 'wealth';
        let categories = args.category ? (args.category.includes('[') ? JSON.parse(args.category.replace(/'/g, '"')) : [args.category]) : (frontmatter.category ? (Array.isArray(frontmatter.category) ? frontmatter.category : [frontmatter.category]) : ['column']);

        // 3. Assemble Payload
        const payload = {
            title: title,
            content: content,
            slug: slug,
            site_id: [siteId],
            category: categories,
            meta_title: args.meta_title || frontmatter.meta_title || title,
            meta_description: args.meta_description || frontmatter.meta_description || '',
            keywords: args.keywords || frontmatter.keywords || '',
            expert_tip: args.expert_tip || frontmatter.expert_tip || '',
            target_yield: parseFloat(args.target_yield || frontmatter.target_yield) || 0,
            publishedAt: args.date || frontmatter.publishedAt || new Date().toISOString(),
        };

        // Extract Expert Tip if present in HTML
        if (!payload.expert_tip) {
            const expertMatch = content.match(/<div class="expert-box">([\s\S]*?)<\/div>/);
            if (expertMatch) {
                payload.expert_tip = expertMatch[1].replace(/【.*?】/, '').trim();
                console.log('[INFO] Extracted Expert Tip from HTML content.');
            }
        }

        // 4. Special Field: Eyecatch
        // [REMOVED] 'eyecatch' field is not configured in MicroCMS. 
        // We rely on frontend fallback: /images/articles/${slug}/01.webp

        // 5. Sync to MicroCMS
        console.log(`[CMS] Checking for existing article: "${title}" (Slug: ${slug})`);
        
        // Find by Slug first (safer than title)
        const { contents: existingBySlug } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `slug[equals]${slug}` }
        });

        let existingId = existingBySlug.length > 0 ? existingBySlug[0].id : null;

        if (!existingId) {
            // Backup search by title
            const { contents: existingByTitle } = await client.getList({
                endpoint: 'articles',
                queries: { filters: `title[equals]${title}` }
            });
            if (existingByTitle.length > 0) existingId = existingByTitle[0].id;
        }

        if (existingId) {
            console.log(`[UPDATE] Found article ID: ${existingId}. Syncing...`);
            await client.update({
                endpoint: 'articles',
                contentId: existingId,
                content: payload,
            });
            console.log('✅ Update successful.');
        } else {
            console.log('[CREATE] No article found. Creating new...');
            const newRes = await client.create({
                endpoint: 'articles',
                content: payload,
            });
            console.log(`✅ Creation successful! ID: ${newRes.id}`);
        }

    } catch (error) {
        console.error('❌ Sync Failed:', error.message);
        process.exit(1);
    }
}

importArticle();
