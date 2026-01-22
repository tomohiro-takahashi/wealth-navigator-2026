/**
 * publish-all.js
 * 
 * 5つのメディアすべてに対して記事生成パイプラインを一括実行する
 */

const { execSync } = require('child_process');
const path = require('path');

const BRANDS = ['wealth', 'kominka', 'flip', 'legacy', 'subsidy'];

async function runAll() {
    console.log('='.repeat(60));
    console.log('Multi-Brand Master Orchestrator v1.0');
    console.log('='.repeat(60));

    const category = process.argv[2] || 'column'; // デフォルトはコラム

    for (const brand of BRANDS) {
        console.log(`\n🚀 Processing Brand: ${brand.toUpperCase()}`);
        console.log('-'.repeat(40));

        try {
            // publish_single.js を使って、切り替えから入稿・プロンプト生成まで一括実行
            console.log(`Executing publication pipeline for ${brand}...`);
            execSync(`node scripts/publish_single.js ${category} ${brand}`, { stdio: 'inherit' });
            
            console.log(`✅ ${brand} publication complete.`);

        } catch (error) {
            console.error(`❌ Error processing ${brand}:`, error.message);
            // 1つのブランドが失敗しても次に進む
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('All Brands Processed.');
    console.log('='.repeat(60));
}

runAll();
