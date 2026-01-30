const { createContext, saveContext } = require('./lib/create_context');
const { logExecution, notifyFailure } = require('./lib/monitoring');

const args = require('minimist')(process.argv.slice(2));
const brand = args._[0] || 'wealth';
const category = args._[1] || 'column';

async function selectTopicFromStrategy(context) {
    try {
        const strategyPath = context.paths.strategy;
        if (!fs.existsSync(strategyPath)) {
            console.warn(`[WARN] Strategy file not found: ${strategyPath}`);
            return null;
        }
        const strategy = fs.readFileSync(strategyPath, 'utf-8');

        // Load History
        const historyPath = path.resolve('content/published_history.json');
        let historyTitles = [];
        if (fs.existsSync(historyPath)) {
            historyTitles = JSON.parse(fs.readFileSync(historyPath, 'utf-8')).map(h => h.title);
        }

        // カテゴリセクションを探す
        const categoryRegex = new RegExp(`### ${context.category}[\\s\\S]*?###`, 'i');
        const match = strategy.match(categoryRegex) || strategy.match(new RegExp(`### ${context.category}[\\s\\S]*$`, 'i'));
        
        if (!match) return null;

        const topics = match[0].split('\n')
            .filter(line => /^\d+\.\s+\*\*.*?\*\*/.test(line))
            .map(line => line.match(/\*\*(.*?)\*\*/)[1])
            .filter(t => !historyTitles.some(ht => ht.includes(t)));

        if (topics.length === 0) return null;
        return topics[Math.floor(Math.random() * topics.length)];
    } catch (e) {
        console.warn(`  [WARN] Topic selection failed for ${context.brand}: ${e.message}`);
        return null;
    }
}

async function run() {
    console.log(`\n🏭 Starting [Brain Factory] for Brand: ${brand}, Category: ${category}`);

    let context;
    try {
        // 1. Initialize Context
        context = createContext(brand, category);
        console.log(`📂 Work Directory: ${context.paths.workDir}`);

        // 2. Select Topic
        let topic = await selectTopicFromStrategy(context);
        if (!topic) {
            topic = "不動産投資の未来";
            console.log(`⚠️ No specific topic found, using fallback: ${topic}`);
        }
        console.log(`🎯 Selected Topic: ${topic}`);
        context.meta.title = topic;
        saveContext(context);

        // 3. Architecture (Blueprint)
        console.log(`🏗️  Architecting Article Blueprint...`);
        execSync(`node scripts/brain_architect.js "${topic}" "${category}" --context "${context.paths.context}"`, { stdio: 'inherit' });

        // 4. Content Building (Writer)
        console.log(`✍️  Building Content...`);
        execSync(`node scripts/brain_builder.js --context "${context.paths.context}"`, { stdio: 'inherit' });

        // 5. Success Logging
        await logExecution(context, 'brain', 'success');

        // 6. Move to 01_drafts (Stage 1 for Vision)
        console.log(`📦 Moving to [01_drafts]...`);
        const draftDir = path.join(process.cwd(), 'content/01_drafts', context.slug);
        if (!fs.existsSync(draftDir)) fs.mkdirSync(draftDir, { recursive: true });

        // Move workDir contents to stage dir
        const files = fs.readdirSync(context.paths.workDir);
        files.forEach(file => {
            const src = path.join(context.paths.workDir, file);
            const dest = path.join(draftDir, file);
            fs.copyFileSync(src, dest); // Use copy + delete later or rename if on same drive
        });
        
        // Update context with new work directory and stage
        context.paths.workDir = draftDir;
        context.paths.context = path.join(draftDir, 'context.json');
        context.stage = '01_drafts';
        saveContext(context);

        console.log(`\n✅ [Brain Factory] SUCCESS: ${context.slug} is now in Stage: ${context.stage}`);

    } catch (e) {
        console.error(`\n❌ [Brain Factory] FAILED:`, e.message);
        if (context) {
            await logExecution(context, 'brain', 'failed', e.message);
            await notifyFailure(context, 'brain', e.message);
        }
        process.exit(1);
    }
}

run();
