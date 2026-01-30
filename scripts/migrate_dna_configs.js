const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const files = fs.readdirSync(srcDir).filter(f => f.startsWith('dna.config.') && f.endsWith('.json'));

files.forEach(file => {
    const configPath = path.join(srcDir, file);
    const dna = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const brand = file.replace('dna.config.', '').replace('.json', '');

    console.log(`\n📦 Processing: ${brand} (${file})`);

    // 1. brandフィールドを追加 (Single Source of Truth)
    if (!dna.brand) {
        dna.brand = brand;
        console.log(`  + Added brand: ${brand}`);
    }

    // 2. valid_categoriesを生成
    if (!dna.valid_categories && dna.categories) {
        dna.valid_categories = Object.keys(dna.categories);
        console.log(`  + Added valid_categories: ${dna.valid_categories.join(', ')}`);
    }

    // 3. default_categoryを設定
    if (!dna.default_category && dna.valid_categories) {
        dna.default_category = dna.valid_categories[0];
        console.log(`  + Added default_category: ${dna.default_category}`);
    }

    // 4. site_idをトップレベルに正規化
    if (!dna.site_id) {
        dna.site_id = dna.identity?.site_id || brand;
        console.log(`  + Normalized site_id: ${dna.site_id}`);
    }

    // 5. pathsを正規化
    if (!dna.paths) {
        dna.paths = {};
    }
    if (!dna.paths.bible) {
        dna.paths.bible = dna.bible_path || `./libs/brain/bibles/${brand}_bible.md`;
        console.log(`  + Added paths.bible: ${dna.paths.bible}`);
    }
    if (!dna.paths.strategy) {
        dna.paths.strategy = dna.strategy_path || `./libs/brain/strategies/${brand}_strategy.md`;
        console.log(`  + Added paths.strategy: ${dna.paths.strategy}`);
    }

    // 6. images (factory_vision用)
    if (!dna.images) {
        dna.images = {
            base_url: `/images/articles`,
            fallback: `/images/common/fallback.webp`
        };
        console.log(`  + Added default images config`);
    }

    // 7. meta (factory_gateway用)
    if (!dna.meta) {
        dna.meta = {
            default_author: "編集部",
            og_site_name: dna.identity?.name || dna.site_name || brand
        };
        console.log(`  + Added default meta config`);
    }

    fs.writeFileSync(configPath, JSON.stringify(dna, null, 2));
    console.log(`✅ Migrated: ${file}`);
});
