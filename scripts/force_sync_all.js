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
        console.log(`\n🚀 FORCE SYNCING ARTICLE: ${slug}`);
        const articlePath = path.join('content/articles', `${slug}.md`);
        
        if (!fs.existsSync(articlePath)) {
            console.error(`   ❌ File not found: ${articlePath}`);
            continue;
        }

        const fileContent = fs.readFileSync(articlePath, 'utf8');
        const lines = fileContent.split('\n');
        
        // Robust extraction
        let title = "";
        let siteId = "";
        let category = "column";

        const titleMatch = fileContent.match(/title:\s*"(.*?)"/);
        if (titleMatch) title = titleMatch[1];

        const siteIdMatch = fileContent.match(/site_id:\s*"(.*?)"/);
        if (siteIdMatch) siteId = siteIdMatch[1];

        const catMatch = fileContent.match(/category:\s*\["(.*?)"\]/);
        if (catMatch) category = catMatch[1];
        
        if (!title) {
            const h1Match = fileContent.match(/^# (.*)/m);
            if (h1Match) title = h1Match[1];
        }

        console.log(`   Title: ${title}`);
        console.log(`   Site: ${siteId}`);
        console.log(`   Body Length (raw): ${fileContent.length}`);

        if (fileContent.length < 500) {
            console.error(`   ⚠️ WARNING: BODY TOO SHORT. SKIPPING SYNC FOR ${slug}`);
            continue;
        }

        // Run the master importer
        const imagesDir = path.join('public/images/articles', slug);
        let imageArgs = '';
        if (fs.existsSync(imagesDir)) {
            const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp')).sort();
            if (images.length > 0) {
                imageArgs = ' --images ' + images.map(img => path.join(imagesDir, img)).join(' ');
            }
        }

        const cmd = `node scripts/import_articles.js --file "${articlePath}" --title "${title}" --slug "${slug}" --category "${category}" --site_id "${siteId}"${imageArgs}`;
        
        try {
            console.log(`   -> Executing sync...`);
            execSync(cmd, { stdio: 'inherit' });
            console.log(`   ✅ Success: ${slug}`);
        } catch (e) {
            console.error(`   ❌ Failed: ${slug}`, e.message);
        }
    }
}

sync();
