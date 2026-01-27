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
            // 常に最新の状態を返しつつ、日付が違えば完成リストのみクリア
            if (state.date !== today) {
                state.date = today;
                state.completed = [];
            }
            return state;
        } catch (e) {
            console.error('Error parsing STATE_FILE:', e.message);
        }
    }
    return { date: today, completed: [], brand_categories: {} };
}

function saveJobState(brand, category) {
    const state = getJobState();
    if (!state.completed.includes(brand)) {
        state.completed.push(brand);
    }
    // 次回使うカテゴリを保存（ローテーション）
    if (!state.brand_categories) state.brand_categories = {};
    
    const dna = JSON.parse(fs.readFileSync(path.join(__dirname, `../src/dna.config.${brand}.json`), 'utf-8'));
    const categories = Object.keys(dna.categories);
    const currentIndex = categories.indexOf(category);
    const nextIndex = (currentIndex + 1) % categories.length;
    state.brand_categories[brand] = categories[nextIndex];

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function runAll() {
    console.log('='.repeat(60));
    console.log('Multi-Brand Master Scheduler (Sequential Category Rotation)');
    console.log('='.repeat(60));

    const state = getJobState();

    for (let i = 0; i < BRANDS.length; i++) {
        const brand = BRANDS[i];
        
        // 当日すでに完了しているブランドはスキップ
        if (state.completed.includes(brand)) {
            console.log(`\n⏭️  Skipping ${brand.toUpperCase()} (Already published today: ${state.date})`);
            continue;
        }

        // 次回実行すべきカテゴリを特定
        let category = state.brand_categories?.[brand];
        
        // 初回実行時のフォールバック
        if (!category) {
            const dna = JSON.parse(fs.readFileSync(path.join(__dirname, `../src/dna.config.${brand}.json`), 'utf-8'));
            category = Object.keys(dna.categories)[0];
        }

        console.log(`\n🚀 Processing Brand: ${brand.toUpperCase()} | Category: ${category.toUpperCase()}`);
        console.log('-'.repeat(40));

        try {
            console.log(`Executing publication pipeline for ${brand}...`);
            // 引数は強制せず、決定したカテゴリを渡す
            execSync(`node scripts/publish_single.js ${category} ${brand}`, { stdio: 'inherit' });
            
            console.log(`✅ ${brand} publication complete.`);
            saveJobState(brand, category);

            // 最後のブランド以外は待機
            const remainingBrands = BRANDS.slice(i + 1).filter(b => !getJobState().completed.includes(b));
            if (remainingBrands.length > 0) {
                const nextRun = new Date(Date.now() + WAIT_MIN * 60000);
                console.log(`\n⏳ Cooling down for ${WAIT_MIN} minutes...`);
                console.log(`📅 Next brand (${remainingBrands[0]}) scheduled for: ${nextRun.toLocaleTimeString()}`);
                
                execSync(`sleep ${WAIT_MIN * 60}`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${brand}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Daily Publishing Schedule Complete.');
    console.log('='.repeat(60));
}

runAll();
