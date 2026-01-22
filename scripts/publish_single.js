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
        execSync(`node scripts/import_articles.js --file content_draft.html --title "Auto Generated" --category "${category}" --slug "${slug}" --expert_tip "$(cat expert_tip.txt)"`, { stdio: 'inherit' });

        // 4. Image Generation (画像生成)
        console.log(`\n[4/7] Generating Background Images...`);
        execSync(`npm run generate:images`, { stdio: 'inherit' });

        // 4.5 V3 Video Render (自動生成動画のレンダリング - 当日分)
        console.log(`\n[4.5/7] Rendering V3 Automated Video...`);
        try {
            execSync(`cd video-generator && npm run render`, { stdio: 'inherit' });
            // 必要に応じてリネームして保存
            const videoDest = path.join('public/videos', `${slug}.mp4`);
            if (!fs.existsSync('public/videos')) fs.mkdirSync('public/videos', { recursive: true });
            fs.copyFileSync('video-generator/out/video.mp4', videoDest);
            console.log(`   -> V3 Video Ready: ${videoDest}`);
        } catch (e) {
            console.warn(`   [WARN] V3 Video Render Failed: ${e.message}`);
        }

        // 5. Video Director Assets (動画プロンプト生成)
        console.log(`\n[5/7] Generating Video Prompts...`);
        execSync(`node scripts/brain_architect.js "${slug}" --type video`, { stdio: 'inherit' });

        // 5.5 Video Seed Images (動画用シード画像生成)
        console.log(`\n[5.5/7] Generating Video Seed Images...`);
        execSync(`npx tsx scripts/generate-video-seeds.ts`, { stdio: 'inherit' });

        // 6. Social Media Strategy (SNS投稿案生成)
        console.log(`\n[6/7] Generating Social Media Posts...`);
        execSync(`python3 scripts/generate_social_posts.py "${slug}"`, { stdio: 'inherit' });

        // 7. Google Drive Backup
        console.log(`\n[7/7] Backing up to Google Drive...`);
        // プレミアム用のクリップ格納フォルダも念のため作成しておく
        const clipsDir = path.join(`projects/${slug}`, 'clips');
        if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
        
        execSync(`python3 scripts/upload_to_drive.py "${slug}"`, { stdio: 'inherit' });

        console.log(`\n✅ Published and Backed up successfully: ${slug}`);

    } catch (error) {
        console.error(`\n❌ Publication Failed:`, error.message);
        process.exit(1);
    }
}

run();
