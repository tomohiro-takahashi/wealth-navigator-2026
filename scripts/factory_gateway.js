const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadContext, saveContext } = require('./lib/create_context');
const { logExecution, notifyFailure } = require('./lib/monitoring');
const { commitAndPushImages } = require('./git_commit_images');

async function run() {
    console.log(`\n🏭 Starting [Gateway Factory]...`);

    // We check both 02_imaged (Articles) and 03_directed (Videos)
    const stages = ['content/02_imaged', 'content/03_directed'];
    
    for (const stagePath of stages) {
        const fullStagePath = path.join(process.cwd(), stagePath);
        if (!fs.existsSync(fullStagePath)) continue;

        const projects = fs.readdirSync(fullStagePath).filter(f => fs.statSync(path.join(fullStagePath, f)).isDirectory());

        for (const slug of projects) {
            console.log(`\n🚀 Shipping project: ${slug} from ${stagePath}`);
            const projectPath = path.join(fullStagePath, slug);
            const contextPath = path.join(projectPath, 'context.json');
            
            if (!fs.existsSync(contextPath)) {
                console.warn(`  [SKIP] context.json missing in ${slug}`);
                continue;
            }

            let context;
            try {
                context = loadContext(contextPath);
            } catch (e) {
                console.warn(`  [SKIP] Failed to load context for ${slug}: ${e.message}`);
                continue;
            }

            try {
                // 1. Sync Images to public/ (for MicroCMS local linking)
                console.log(`  > Syncing images to public/images/articles/${slug}`);
                const publicImageDir = path.join(process.cwd(), 'public/images/articles', slug);
                if (!fs.existsSync(publicImageDir)) fs.mkdirSync(publicImageDir, { recursive: true });
                
                const localImages = path.join(projectPath, 'images');
                if (fs.existsSync(localImages)) {
                    fs.readdirSync(localImages).forEach(img => {
                        fs.copyFileSync(path.join(localImages, img), path.join(publicImageDir, img));
                    });
                }

                // 2. Import to MicroCMS
                console.log(`  > Importing to MicroCMS...`);
                const resultPath = path.join(projectPath, '.cms_result.json');
                execSync(`node scripts/import_articles.js --context "${contextPath}" --result "${resultPath}"`, { stdio: 'inherit' });

                const cmsResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                if (!cmsResult.success) {
                    throw new Error(`MicroCMS Import Failed: ${cmsResult.error}`);
                }

                // 3. Git Commit & Push Images (Critical for Vercel/MicroCMS reference)
                console.log(`  > Committing images to Git...`);
                const gitSuccess = commitAndPushImages(slug);
                if (!gitSuccess) {
                    console.warn(`  [WARN] Git push failed. Images might not be available on production yet.`);
                }

                // 4. SNS Promotion (Relinked)
                console.log(`  > Generating & Pushing SNS Promotion...`);
                try {
                    execSync(`node scripts/generate_x_posts.js ${context.brand} ${slug}`, { stdio: 'inherit' });
                    execSync(`node scripts/sync_to_gas.js ${context.brand}`, { stdio: 'inherit' });
                } catch (snsError) {
                    console.error(`  [WARN] SNS Promotion failed: ${snsError.message}`);
                }

                // 5. Success Logging
                await logExecution(context, 'gateway', 'success');

                // 6. Move to published
                console.log(`✅ [GATEWAY] SUCCESS: ${slug} is now live.`);
                const publishedDir = path.join(process.cwd(), 'content/05_published', slug);
                if (!fs.existsSync(path.dirname(publishedDir))) fs.mkdirSync(path.dirname(publishedDir), { recursive: true });
                if (fs.existsSync(publishedDir)) {
                    fs.rmSync(publishedDir, { recursive: true, force: true });
                }
                fs.renameSync(projectPath, publishedDir);

            } catch (e) {
                console.error(`  [FAIL] Shipping failed for ${slug}: ${e.message}`);
                await logExecution(context, 'gateway', 'failed', e.message);
                await notifyFailure(context, 'gateway', e.message);
            }
        }
    }
}

run();
