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

        // Load History
        const historyPath = path.resolve('content/published_history.json');
        let historyTitles = [];
        if (fs.existsSync(historyPath)) {
            historyTitles = JSON.parse(fs.readFileSync(historyPath, 'utf-8')).map(h => h.title);
        }

        // カテゴリセクションを探す (例: ### learn (補助金を知る))
        const categoryRegex = new RegExp(`### ${category}[\\s\\S]*?###`, 'i');
        const match = strategy.match(categoryRegex) || strategy.match(new RegExp(`### ${category}[\\s\\S]*$`, 'i'));
        
        if (!match) return null;

        const topics = match[0].split('\n')
            .filter(line => /^\d+\.\s+\*\*.*?\*\*/.test(line)) // "1. **Topic**" 形式を探す
            .map(line => line.match(/\*\*(.*?)\*\*/)[1])
            .filter(t => !historyTitles.some(ht => ht.includes(t))); // 重複除外

        if (topics.length === 0) {
            console.log(`  [INFO] All topics in "${category}" are already published. Picking a random one as fallback.`);
            // Fallback to any if all used
            return null;
        }
        return topics[Math.floor(Math.random() * topics.length)];
    } catch (e) {
        console.warn(`  [WARN] Topic selection failed for ${brand}: ${e.message}`);
        return null;
    }
}

const LOG_PATH = path.resolve('content/run_log.json');

function logRun(brand, category, status, step, message, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        brand,
        category,
        status, // 'START', 'SUCCESS', 'FAILURE'
        step,
        message,
        details
    };
    try {
        let logs = [];
        if (fs.existsSync(LOG_PATH)) {
            logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
        }
        logs.push(logEntry);
        // Keep only last 100 logs to avoid file bloat
        if (logs.length > 100) logs = logs.slice(-100);
        fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error('Failed to write to run_log.json:', e.message);
    }
}

async function run() {
    const targetBrand = brand || 'wealth';
    let slug = 'unknown';

    try {
        logRun(targetBrand, category, 'START', 'INIT', `Starting publication for ${targetBrand}`);

        console.log(`\n--- Switching to Brand: ${targetBrand} ---`);
        execSync(`node scripts/switch_brand.js ${targetBrand}`, { stdio: 'inherit' });

        const dnaConfig = JSON.parse(fs.readFileSync('./src/dna.config.json', 'utf-8'));
        console.log(`\n--- Publishing for: ${dnaConfig.identity.name} (${category}) ---`);

        // Topic選定
        logRun(targetBrand, category, 'START', 'TOPIC_SELECTION', 'Selecting topic from strategy...');
        let topic = await selectTopicFromStrategy(targetBrand, category);
        if (!topic) {
            topic = "不動産投資の未来"; 
            logRun(targetBrand, category, 'INFO', 'TOPIC_SELECTION', 'No specific topic found, using fallback', { topic });
        }
        console.log(`\n[0/5] Selected Topic: ${topic}`);
        logRun(targetBrand, category, 'SUCCESS', 'TOPIC_SELECTION', `Selected: ${topic}`);

        // 1. Architect (Topic選定 & 構成)
        console.log(`\n[1/5] Architectural Design...`);
        logRun(targetBrand, category, 'START', 'ARCHITECT', `Creating blueprint for: ${topic}`);
        execSync(`node scripts/brain_architect.js "${topic}" "${category}"`, { stdio: 'inherit' });

        const blueprintsDir = './content/blueprints';
        const files = fs.readdirSync(blueprintsDir).filter(f => f.endsWith('_blueprint.json'));
        const latestBlueprint = files.sort((a, b) => 
            fs.statSync(path.join(blueprintsDir, b)).mtime - fs.statSync(path.join(blueprintsDir, a)).mtime
        )[0];

        if (!latestBlueprint) throw new Error('No blueprint found.');
        slug = latestBlueprint.replace('_blueprint.json', '');
        logRun(targetBrand, category, 'SUCCESS', 'ARCHITECT', `Blueprint ready: ${slug}`);

        // 2. Builder (執筆)
        console.log(`\n[2/5] Building Content...`);
        logRun(targetBrand, category, 'START', 'BUILDER', `Writing article body for ${slug}`);
        execSync(`node scripts/brain_builder.js "${slug}"`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'BUILDER', `Content generated for ${slug}`);

        // 3. Ingestion (入稿)
        console.log(`\n[3/5] Importing to MicroCMS...`);
        logRun(targetBrand, category, 'START', 'INGESTION', `Uploading ${slug} to MicroCMS`);
        let metaArgs = '';
        if (fs.existsSync('metadata.json')) {
            const meta = JSON.parse(fs.readFileSync('metadata.json', 'utf-8'));
            if (meta.meta_title) metaArgs += ` --meta_title "${meta.meta_title}"`;
            if (meta.meta_description) metaArgs += ` --meta_description "${meta.meta_description}"`;
            if (meta.keywords) metaArgs += ` --keywords "${meta.keywords}"`;
            if (meta.site_id) metaArgs += ` --site_id "${meta.site_id}"`;
        }
        
        execSync(`node scripts/import_articles.js --file "content/articles/${slug}.md" --title "Auto Generated" --category "${category}" --slug "${slug}"${metaArgs}`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'INGESTION', `Article ${slug} live on MicroCMS`);

        // 4. Image Generation (画像生成)
        console.log(`\n[4/7] Generating Background Images for ${slug}...`);
        logRun(targetBrand, category, 'START', 'IMAGES', `Generating WebP assets for ${slug}`);
        execSync(`npm run generate:images -- --slug=${slug}`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'IMAGES', `Images generated and synced for ${slug}`);

        // 5. Video Director Assets (動画プロンプト生成)
        console.log(`\n[5/7] Generating Video Prompts & Markdown Assets...`);
        logRun(targetBrand, category, 'START', 'VIDEO_ASSETS', `Creating video script and prompts for ${slug}`);
        execSync(`node scripts/brain_architect.js "${slug}" --type video`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'VIDEO_ASSETS', `Video assets ready for ${slug}`);

        // 5.5 Video Seed Images
        console.log(`\n[5.5/7] Generating Video Seed Images...`);
        logRun(targetBrand, category, 'START', 'VIDEO_SEEDS', `Generating scene seeds for ${slug}`);
        execSync(`npx tsx scripts/generate-video-seeds.ts`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'VIDEO_SEEDS', `Video seeds generated for ${slug}`);

        // 7. Google Drive Backup
        console.log(`\n[7/7] Backing up to Google Drive...`);
        logRun(targetBrand, category, 'START', 'BACKUP', `Uploading all assets for ${slug} to Google Drive`);
        execSync(`python3 scripts/upload_to_drive.py "${slug}"`, { stdio: 'inherit' });
        logRun(targetBrand, category, 'SUCCESS', 'BACKUP', `Drive backup complete for ${slug}`);

        logRun(targetBrand, category, 'SUCCESS', 'COMPLETE', `Full publication cycle finished for ${slug}`);
        console.log(`\n✅ Published and Backed up successfully: ${slug}`);

    } catch (error) {
        console.error(`\n❌ Publication Failed:`, error.message);
        logRun(targetBrand, category, 'FAILURE', 'FATAL', error.message, { 
            slug, 
            stack: error.stack?.split('\n').slice(0, 3).join(' ') 
        });
        process.exit(1);
    }
}

run();
