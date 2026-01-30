
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
    const resultPath = args.result;
    const result = { success: false, error: null, id: null };

    try {
        if (!args.file && !args.context) {
            throw new Error('Usage: node import_articles.js --file <md_file_path> [--context <path/to/context.json>] [--result <path/to/result.json>]');
        }

        let siteId, categories, validCategoryKeys, slug, title, content, frontmatter;

        // 1. Load Data from Context or File
        if (args.context && fs.existsSync(args.context)) {
            const context = JSON.parse(fs.readFileSync(args.context, 'utf8'));
            siteId = context.siteId;
            categories = [context.category];
            validCategoryKeys = context.validCategories;
            slug = context.slug;
            
            const articlePath = args.file || path.join(context.paths.workDir, 'article.md');
            if (!fs.existsSync(articlePath)) throw new Error(`Article file not found: ${articlePath}`);
            const rawFileContent = fs.readFileSync(articlePath, 'utf8');
            const matterResult = matter(rawFileContent);
            frontmatter = matterResult.data;
            content = matterResult.content;
            title = context.meta.title || frontmatter.title;
        } else {
            // Legacy/Direct File Load
            const fileAbsPath = path.resolve(args.file);
            const rawFileContent = fs.readFileSync(fileAbsPath, 'utf8');
            const matterResult = matter(rawFileContent);
            frontmatter = matterResult.data;
            content = matterResult.content;
            
            siteId = args.site_id || frontmatter.site_id || 'wealth';
            categories = args.category ? (args.category.includes('[') ? JSON.parse(args.category.replace(/'/g, '"')) : [args.category]) : (frontmatter.category ? (Array.isArray(frontmatter.category) ? frontmatter.category : [frontmatter.category]) : ['column']);
            slug = args.slug || frontmatter.slug || path.basename(args.file, '.md');
            title = frontmatter.title || args.title || 'No Title';

            // Load valid categories for validation
            const dnaPath = path.join(process.cwd(), `src/dna.config.${siteId}.json`);
            if (fs.existsSync(dnaPath)) {
                const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
                validCategoryKeys = dna.valid_categories || Object.keys(dna.categories || {});
            }
        }

        console.log(`[IMPORT] Starting for: ${slug} (Site: ${siteId})`);

        // 2. Content Normalization (Markdown -> HTML)
        const isAlreadyHtml = /<[a-z][\s\S]*>/i.test(content.substring(0, 500));
        const hasMarkdownPatterns = /^#|[\n\r]#|^- |^\* |^\d+\. |!\[.*\]\(.*\)/m.test(content);
        
        if (!isAlreadyHtml || hasMarkdownPatterns) {
            console.log('[INFO] Content appears to be Markdown. Converting to clean HTML...');
            content = marked.parse(content);
        }

        // Title Extraction if still missing
        if (!title || title === 'No Title' || title === 'undefined') {
            const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || content.match(/^# (.*)$/m);
            if (h1Match) {
                title = h1Match[1].replace(/<[^>]+>/g, '').trim();
                console.log(`[INFO] Extracted title from content: "${title}"`);
            }
        }

        // --- Brand Integrity: Category Validation ---
        if (validCategoryKeys && validCategoryKeys.length > 0) {
            const filteredCategories = categories.filter(c => validCategoryKeys.includes(c));
            if (filteredCategories.length === 0) {
                throw new Error(
                    `FATAL: Category "${categories.join(',')}" is invalid for site "${siteId}". ` +
                    `Valid: ${validCategoryKeys.join(', ')}`
                );
            }
            categories = filteredCategories;
        }

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
        };
        
        if (args.target_yield || frontmatter.target_yield) {
            payload.target_yield = parseFloat(args.target_yield || frontmatter.target_yield) || 0;
        }
        payload.publishedAt = args.date || frontmatter.publishedAt || new Date().toISOString();

        // 4. Sync to MicroCMS
        console.log(`[CMS] Checking for existing article: "${title}" (Slug: ${slug})`);
        
        const { contents: existingBySlug } = await client.getList({
            endpoint: 'articles',
            queries: { filters: `slug[equals]${slug}` }
        });

        let existingId = existingBySlug.length > 0 ? existingBySlug[0].id : null;

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
            existingId = newRes.id;
            console.log(`✅ Creation successful! ID: ${existingId}`);
        }

        result.success = true;
        result.id = existingId;

        // 5. Record to History
        const historyPath = path.join(process.cwd(), 'content/published_history.json');
        let history = [];
        if (fs.existsSync(historyPath)) {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }
        history.push({
            slug: slug,
            title: title,
            site_id: siteId,
            category: categories[0],
            date: payload.publishedAt
        });
        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    } catch (error) {
        console.error('❌ Sync Failed:', error.message);
        result.success = false;
        result.error = error.message;
    } finally {
        if (resultPath) {
            fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
            console.log(`[RESULT] Written to: ${resultPath}`);
        }
        if (!result.success && !args.context) {
            process.exit(1);
        }
    }
}

importArticle();
