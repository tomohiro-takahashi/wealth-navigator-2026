const fs = require('fs');
const path = require('path');

const brands = {
    'wealth': 'dna.config.wealth.json',
    'kominka': 'dna.config.kominka.json',
    'flip': 'dna.config.flip.json',
    'legacy': 'dna.config.legacy.json',
    'subsidy': 'dna.config.subsidy.json'
};

const args = process.argv.slice(2);
const brandKey = args[0];

if (!brandKey || !brands[brandKey]) {
    console.error(`❌ Usage: node scripts/switch_brand.js [${Object.keys(brands).join('|')}]`);
    process.exit(1);
}

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
