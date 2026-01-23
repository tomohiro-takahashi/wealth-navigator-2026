const fs = require('fs');
const path = require('path');

const brands = {
    'wealth': 'dna.config.wealth.json',
    'kominka': 'dna.config.kominka.json',
    'flip': 'dna.config.flip.json',
    'legacy': 'dna.config.legacy.json',
    'subsidy': 'dna.config.subsidy.json'
};

const SITE_CONFIG_FILES = {
    'wealth': 'config/sites/wealth.ts',
    'kominka': 'config/sites/kominka.ts',
    'flip': 'config/sites/flip.ts',
    'legacy': 'config/sites/legacy.ts',
    'subsidy': 'config/sites/subsidy.ts'
};

const args = process.argv.slice(2);
const brandKey = args[0];

if (!brandKey || !brands[brandKey]) {
    console.error(`❌ Usage: node scripts/switch_brand.js [${Object.keys(brands).join('|')}]`);
    process.exit(1);
}

// 1. Swap DNA (Backend/AI Config)
const sourceFile = brands[brandKey];
const sourcePath = path.resolve(__dirname, `../src/${sourceFile}`);
const targetPath = path.resolve(__dirname, '../src/dna.config.json');

if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source config not found: ${sourcePath}`);
    process.exit(1);
}

const content = fs.readFileSync(sourcePath);
fs.writeFileSync(targetPath, content);

console.log(`✅ Switched DNA to: ${brandKey.toUpperCase()} (${sourceFile})`);
console.log(`   Identity: ${JSON.parse(content).identity.name}`);

// 2. Swap Frontend Config (TS)
const tsSourceRel = SITE_CONFIG_FILES[brandKey];
const tsSourcePath = path.resolve(__dirname, `../src/${tsSourceRel}`);
const tsTargetPath = path.resolve(__dirname, '../src/current_site_config.ts');

if (fs.existsSync(tsSourcePath)) {
    // We can't just copy TS to TS if imports are relative? 
    // They are both in src/ so relative imports within them (like type imports) should work if they use aliases (@/types/site)
    // The provided configs use '@/types/site', so copying is safe.
    fs.copyFileSync(tsSourcePath, tsTargetPath);
    console.log(`✅ Switched Frontend Config to: ${tsSourceRel}`);
} else {
    console.warn(`[WARN] Frontend config not found: ${tsSourcePath}`);
}
