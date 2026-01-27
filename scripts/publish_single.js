/**
 * publish-single.js
 * 
 * 指定されたブランド（または現在のブランド）に対して、
 * 記事生成から画像生成、テロップ準備までを一気通貫で実行する。
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const category = args[0] || 'column';
const brand = args[1]; // オプション

async function selectTopicFromStrategy(brand, category) {
    try {
        const dna = JSON.parse(fs.readFileSync(`./src/dna.config.${brand}.json`, 'utf-8'));
        const strategyPath = path.resolve(dna.strategy_path);
        const strategy = fs.readFileSync(strategyPath, 'utf-8');

        // カテゴリセクションを探す (例: ### learn (補助金を知る))
        const categoryRegex = new RegExp(`### ${category}[\\s\\S]*?###`, 'i');
        const match = strategy.match(categoryRegex) || strategy.match(new RegExp(`### ${category}[\\s\\S]*$`, 'i'));
        
        if (!match) return null;

        const topics = match[0].split('\n')
            .filter(line => /^\d+\.\s+\*\*.*?\*\*/.test(line)) // "1. **Topic**" 形式を探す
            .map(line => line.match(/\*\*(.*?)\*\*/)[1]);

        if (topics.length === 0) return null;
        return topics[Math.floor(Math.random() * topics.length)];
    } catch (e) {
        console.warn(`  [WARN] Topic selection failed for ${brand}: ${e.message}`);
        return null;
    }
}

async function run() {
    try {
        const targetBrand = brand || 'wealth';
        console.log(`\n--- Switching to Brand: ${targetBrand} ---`);
        execSync(`node scripts/switch_brand.js ${targetBrand}`, { stdio: 'inherit' });

        const dnaConfig = JSON.parse(fs.readFileSync('./src/dna.config.json', 'utf-8'));
        console.log(`\n--- Publishing for: ${dnaConfig.identity.name} (${category}) ---`);

        // Topic選定
        let topic = await selectTopicFromStrategy(targetBrand, category);
        if (!topic) {
            topic = "不動産投資の未来"; // 最終フォールバック
        }
        console.log(`\n[0/5] Selected Topic: ${topic}`);

        // 1. Architect (Topic選定 & 構成)
        console.log(`\n[1/5] Architectural Design...`);
        execSync(`node scripts/brain_architect.js "${topic}" "${category}"`, { stdio: 'inherit' });

        // architectが生成した最新のblueprintを探す（簡易実装）
        const blueprintsDir = './content/blueprints';
        const files = fs.readdirSync(blueprintsDir).filter(f => f.endsWith('_blueprint.json'));
        const latestBlueprint = files.sort((a, b) => 
            fs.statSync(path.join(blueprintsDir, b)).mtime - fs.statSync(path.join(blueprintsDir, a)).mtime
        )[0];

        if (!latestBlueprint) throw new Error('No blueprint found.');
        const slug = latestBlueprint.replace('_blueprint.json', '');

        // 2. Builder (執筆)
        console.log(`\n[2/5] Building Content...`);
        execSync(`node scripts/brain_builder.js "${slug}"`, { stdio: 'inherit' });

        // 3. Ingestion (入稿)
        console.log(`\n[3/5] Importing to MicroCMS...`);
        // builderが出力する一時ファイルを使用
        let metaArgs = '';
        if (fs.existsSync('metadata.json')) {
            const meta = JSON.parse(fs.readFileSync('metadata.json', 'utf-8'));
            if (meta.meta_title) metaArgs += ` --meta_title "${meta.meta_title}"`;
            if (meta.meta_description) metaArgs += ` --meta_description "${meta.meta_description}"`;
            if (meta.keywords) metaArgs += ` --keywords "${meta.keywords}"`;
            if (meta.site_id) metaArgs += ` --site_id "${meta.site_id}"`;
        }
        
        execSync(`node scripts/import_articles.js --file content_draft.html --title "Auto Generated" --category "${category}" --slug "${slug}" --expert_tip "$(cat expert_tip.txt)"${metaArgs}`, { stdio: 'inherit' });

        // 4. Image Generation (画像生成)
        console.log(`\n[4/7] Generating Background Images...`);
        execSync(`npm run generate:images`, { stdio: 'inherit' });

        // 4.5 Rendering V3 Automated Video (Optional/Heavy)
        if (process.env.SKIP_VIDEO_RENDER === 'true') {
            console.log(`\n[4.5/7] Skipping Video Rendering (SKIP_VIDEO_RENDER=true)`);
        } else {
            console.log(`\n[4.5/7] Rendering V3 Automated Video...`);
            try {
                // Render directly using remotion to avoid nested npm/cd issues
                execSync(`npx remotion render video-generator/src/index.tsx Main public/videos/${slug}.mp4 --props='{"slug": "${slug}"}'`, { stdio: 'inherit' });
            } catch (renderError) {
                console.warn(`⚠️ Video Rendering Failed: ${renderError.message}. Proceeding with script backup...`);
            }
        }

        // 5. Video Director Assets (動画プロンプト生成 - 必須)
        console.log(`\n[5/7] Generating Video Prompts & Markdown Assets...`);
        execSync(`node scripts/brain_architect.js "${slug}" --type video`, { stdio: 'inherit' });

        // [HYBRID STRATEGY] 5.2 Initialize Local Project for Batch Processor (Phase 1)
        console.log(`\n[5.2/7] Preparing Project Skeleton for Phase 3...`);
        try {
            const projectDir = path.join(process.cwd(), 'projects', slug);
            if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
            
            const configPath = path.join(projectDir, 'config.json');
            if (!fs.existsSync(configPath)) {
                const config = {
                    project_id: slug,
                    project_name: topic,
                    brand_id: targetBrand,
                    status: 'draft',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    video: { resolution: '1080x1920', fps: 30, aspect_ratio: '9:16' },
                    clips: [],
                    captions: [],
                    audio: { use_veo_audio: true, bgm: { enabled: true, file: 'audio/bgm.mp3', volume: 0.2 } }
                };
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                console.log(`✅ Project Skeleton created: ${configPath}`);
            } else {
                console.log(`ℹ️ Project Skeleton already exists.`);
            }
            
            // Ensure subdirs exist
            ['clips', 'images', 'audio', 'captions', 'output'].forEach(d => {
                const subDir = path.join(projectDir, d);
                if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
            });
        } catch (initError) {
            console.warn(`⚠️ Project Initialization Failed: ${initError.message}`);
        }

        // 5.5 Video Seed Images (動画用シード画像生成)
        console.log(`\n[5.5/7] Generating Video Seed Images...`);
        execSync(`npx tsx scripts/generate-video-seeds.ts`, { stdio: 'inherit' });

        // 6. X (Twitter) Automation [NEW 3+2 Strategy]
        console.log(`\n[6/7] Generating & Syncing X Posts (3 Bible + 2 Article)...`);
        try {
            execSync(`node scripts/generate_x_posts.js ${targetBrand} ${slug}`, { stdio: 'inherit' });
            if (process.env.GAS_X_WEBAPP_URL) {
                execSync(`node scripts/sync_to_gas.js ${targetBrand}`, { stdio: 'inherit' });
            } else {
                console.log(`ℹ️ [SKIP] GAS_X_WEBAPP_URL not set. Skipping GAS sync.`);
            }
        } catch (snsError) {
            console.warn(`⚠️ X Post Automation Failed: ${snsError.message}. Proceeding...`);
        }

        // 7. Google Drive Backup
        console.log(`\n[7/7] Backing up to Google Drive...`);
        try {
            // Project dir and subdirs are already created in Step 5.2
            const projectDir = path.join(process.cwd(), 'projects', slug);
            
            // Copy assets to project folder before upload (for local record)
            const assetsToCopy = [
                { from: `content/scripts/${slug}.md` },
                { from: `content/prompts/${slug}_prompts.md` },
                { from: `content/social/${slug}_posts.md` },
                { from: `content/articles/${slug}.md` }
            ];
            
            // Ensure images are copied as well
            const imagesDir = path.join(process.cwd(), 'public/images/articles', slug);
            const projectImagesDir = path.join(projectDir, 'images');
            if (fs.existsSync(imagesDir)) {
                if (!fs.existsSync(projectImagesDir)) fs.mkdirSync(projectImagesDir, { recursive: true });
                fs.readdirSync(imagesDir).forEach(img => {
                    fs.copyFileSync(path.join(imagesDir, img), path.join(projectImagesDir, img));
                });
            }

            // Run Drive Sync
            console.log(`   -> Uploading to Drive (Slug: ${slug})...`);
            execSync(`python3 scripts/upload_to_drive.py "${slug}"`, { stdio: 'inherit' });
        } catch (driveError) {
            console.error(`❌ Drive Backup Failed: ${driveError.message}`);
        }

        // 8. Git Sync (Release to Production)
        console.log(`\n[8/7] Syncing Images to GitHub...`);
        try {
            execSync(`git add public/images/articles/${slug}`, { stdio: 'inherit' });
            // Check if there are changes to commit
            const status = execSync('git status --porcelain', { encoding: 'utf-8' });
            if (status.includes(`public/images/articles/${slug}`)) {
                execSync(`git commit -m "Deploy images for ${slug}"`, { stdio: 'inherit' });
                execSync(`git push origin main`, { stdio: 'inherit' });
                console.log(`✅ Images pushed to GitHub.`);
            } else {
                console.log(`ℹ️ No new images to push for ${slug}.`);
            }
        } catch (gitError) {
            console.warn(`⚠️ Git Sync Failed: ${gitError.message}. You may need to push manually.`);
        }

        console.log(`\n✅ Published and Backed up successfully: ${slug}`);
 
        // 9. Batch Video Processing (Distributed Load)
        console.log(`\n[9/7] Checking for pending video renders for ${targetBrand}...`);
        try {
            execSync(`node scripts/batch-processor.js --brand ${targetBrand}`, { stdio: 'inherit' });
            console.log(`✅ Video Batch Processing for ${targetBrand} complete.`);
        } catch (batchError) {
            console.warn(`⚠️ Video Batch Processing partially failed or no projects found: ${batchError.message}`);
        }

    } catch (error) {
        console.error(`\n❌ Publication Failed:`, error.message);
        process.exit(1);
    }
}

run();
