const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BRANDS = ['wealth', 'flip', 'kominka', 'subsidy', 'legacy'];
const STATE_FILE = path.join(__dirname, 'last_run.json');
const WAIT_MIN = 150; // 2.5時間

function getJobState() {
    const today = new Date().toISOString().split('T')[0];
    if (fs.existsSync(STATE_FILE)) {
        try {
            const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            if (state.date !== today) {
                state.date = today;
                state.completed = [];
                state.failed = {}; // Clear daily fail counts
            }
            if (!state.failed) state.failed = {};
            return state;
        } catch (e) {
            console.error('Error parsing STATE_FILE:', e.message);
        }
    }
    return { date: today, completed: [], failed: {}, brand_categories: {} };
}

function saveJobState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function runAll() {
    console.log('='.repeat(60));
    console.log('Multi-Brand Master Scheduler (Zero-Debt & High-Resilience)');
    console.log('='.repeat(60));

    const isDistributed = process.argv.includes('--distributed');
    const state = getJobState();

    for (let i = 0; i < BRANDS.length; i++) {
        const brand = BRANDS[i];
        
        // 当日すでに完了しているブランドはスキップ
        if (state.completed.includes(brand)) {
            console.log(`\n⏭️  Skipping ${brand.toUpperCase()} (Already published today)`);
            continue;
        }

        // 失敗回数が多すぎる場合はスキップ（デッドロック回避）
        const failCount = state.failed[brand] || 0;
        if (failCount >= 3) {
            console.log(`\n🚨 Skipping ${brand.toUpperCase()} (Failed 3 times today. Check run_log.json)`);
            continue;
        }

        // 次回実行すべきカテゴリを特定
        let category = state.brand_categories?.[brand];
        if (!category) {
            const dna = JSON.parse(fs.readFileSync(path.join(__dirname, `../src/dna.config.${brand}.json`), 'utf-8'));
            category = Object.keys(dna.categories)[0];
        }

        console.log(`\n🚀 Processing Brand: ${brand.toUpperCase()} | Category: ${category.toUpperCase()} (Attempt: ${failCount + 1}/3)`);
        console.log('-'.repeat(40));

        try {
            console.log(`Executing publication pipeline for ${brand}...`);
            execSync(`node scripts/factory_brain.js "${brand}" "${category}"`, { stdio: 'inherit' });
            
            console.log(`✅ ${brand} brain extraction complete.`);
            state.completed.push(brand);
            state.failed[brand] = 0; // Reset fail count on success

            // Category Rotation
            const dna = JSON.parse(fs.readFileSync(path.join(__dirname, `../src/dna.config.${brand}.json`), 'utf-8'));
            const categories = Object.keys(dna.categories);
            const nextIndex = (categories.indexOf(category) + 1) % categories.length;
            if (!state.brand_categories) state.brand_categories = {};
            state.brand_categories[brand] = categories[nextIndex];

            saveJobState(state);

            if (isDistributed) {
                console.log(`\n✅ Distributed mode: One brand processed. Exiting.`);
                return;
            }

            // Wait logic for local run
            const remaining = BRANDS.slice(i + 1).filter(b => !getJobState().completed.includes(b));
            if (remaining.length > 0) {
                console.log(`\n⏳ Cooling down for ${WAIT_MIN} minutes...`);
                execSync(`sleep ${WAIT_MIN * 60}`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${brand}:`, error.message);
            state.failed[brand] = (state.failed[brand] || 0) + 1;
            saveJobState(state);
            
            if (isDistributed) {
                console.log(`\n⚠️ Failure in Distributed mode. State saved. Exiting.`);
                process.exit(0); // Exit gracefully to allow CI to commit logs
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Daily Publishing Cycle Complete.');
    console.log('='.repeat(60));
}

runAll();
