const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const articles = [
    '2026-01-24-ai-datacenter-investment',
    '2026-01-24-kominka-vacant-house-strategy',
    '2026-01-24-flip-rotation-strategy',
    '2026-01-24-legacy-inheritance-defense',
    '2026-01-24-subsidy-renovation-strategy',
    '2026-01-24-70-percent-rule',
    'wealth-navigator-manifesto',
    '2026-01-23-gold-to-5000'
];

async function sync() {
    for (const slug of articles) {
        console.log(`\n🚀 Re-Syncing to MicroCMS: ${slug}`);
        const articlePath = path.join('content/articles', `${slug}.md`);
        if (!fs.existsSync(articlePath)) {
            console.error(`   ❌ Article not found: ${articlePath}`);
            continue;
        }

        const content = fs.readFileSync(articlePath, 'utf8');
        
        // Extract metadata from frontmatter
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        const siteIdMatch = content.match(/site_id:\s*"(.*?)"/);
        const categoryMatch = content.match(/category:\s*\["(.*?)"\]/); // Array format
        
        const title = titleMatch ? titleMatch[1] : "Untitled";
        const siteId = siteIdMatch ? siteIdMatch[1] : "";
        const category = categoryMatch ? categoryMatch[1] : "column";

        // Find images
        const imagesDir = path.join('public/images/articles', slug);
        let imageArgs = '';
        if (fs.existsSync(imagesDir)) {
            const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp')).sort();
            if (images.length > 0) {
                imageArgs = ' --images ' + images.map(img => path.join(imagesDir, img)).join(' ');
            }
        }

        const cmd = `node scripts/import_articles.js --file "${articlePath}" --title "${title}" --slug "${slug}" --category "${category}" --site_id "${siteId}"${imageArgs}`;
        
        console.log(`   -> Running: ${cmd}`);
        try {
            execSync(cmd, { stdio: 'inherit' });
            console.log(`   ✅ Successfully synced ${slug}`);
        } catch (e) {
            console.error(`   ❌ Sync failed for ${slug}: ${e.message}`);
        }
    }
}

sync();
