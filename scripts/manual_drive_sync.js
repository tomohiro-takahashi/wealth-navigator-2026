const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const articles = [
    '2026-01-24-ai-datacenter-investment',
    '2026-01-24-kominka-vacant-house-strategy',
    '2026-01-24-flip-rotation-strategy',
    '2026-01-24-legacy-inheritance-defense',
    '2026-01-24-subsidy-renovation-strategy',
    'wealth-navigator-manifesto'
];

async function syncAll() {
    console.log('🚀 Starting Manual Google Drive Re-Sync...');
    
    for (const slug of articles) {
        console.log(`\n📦 Processing: ${slug}`);
        
        // 1. Ensure projects folder is ready (Local mirroring)
        const projectDir = path.join(process.cwd(), 'projects', slug);
        if (!fs.existsSync(projectDir)) {
            console.log(`   Creating directory: ${projectDir}`);
            fs.mkdirSync(projectDir, { recursive: true });
        }
        
        const assets = [
            { from: `content/scripts/${slug}.md`, to: `${slug}.md` },
            { from: `content/prompts/${slug}_prompts.md`, to: `${slug}_prompts.md` },
            { from: `content/social/${slug}_posts.md`, to: `${slug}_posts.md` },
            { from: `content/articles/${slug}.md`, to: `${slug}.md` }
        ];
        
        assets.forEach(asset => {
            if (fs.existsSync(asset.from)) {
                // Determine target filename (keep original logic)
                fs.copyFileSync(asset.from, path.join(projectDir, path.basename(asset.from)));
                console.log(`   ✅ Copied asset: ${asset.from}`);
            }
        });

        // 2. Copy Images
        const imagesDir = path.join(process.cwd(), 'public/images/articles', slug);
        const projectImagesDir = path.join(projectDir, 'images');
        if (fs.existsSync(imagesDir)) {
            if (!fs.existsSync(projectImagesDir)) fs.mkdirSync(projectImagesDir, { recursive: true });
            fs.readdirSync(imagesDir).forEach(img => {
                if (img.endsWith('.webp') || img.endsWith('.png')) {
                    fs.copyFileSync(path.join(imagesDir, img), path.join(projectImagesDir, img));
                }
            });
            console.log(`   🖼️ Copied images from: ${imagesDir}`);
        }

        // 3. Run Python Upload
        try {
            console.log(`   ⬆️ Uploading to Drive...`);
            execSync(`python3 scripts/upload_to_drive.py "${slug}"`, { stdio: 'inherit' });
            console.log(`   ✨ Drive sync complete for ${slug}`);
        } catch (e) {
            console.error(`   ❌ Drive sync failed for ${slug}: ${e.message}`);
        }
    }
    
    console.log('\n✅ All assets synced to Google Drive!');
}

syncAll();
