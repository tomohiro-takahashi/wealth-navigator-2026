
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mappings = [
    { src: 'se_asia_investment_01', dest: '2026-01-17-se-asia-investment/01.webp' },
    { src: 'se_asia_investment_02', dest: '2026-01-17-se-asia-investment/02.webp' },
    { src: 'se_asia_investment_03', dest: '2026-01-17-se-asia-investment/03.webp' },
    { src: 'tokyo_one_room_01', dest: '2026-01-18-tokyo-one-room-alchemy/01.webp' },
    { src: 'kominka_strategy_01', dest: '2026-01-24-kominka-vacant-house-strategy/01.webp' },
    { src: 'renovation_subsidy_01', dest: '2026-01-23-renovation-subsidy-guide/01.webp' },
    { src: 'flip_strategy_01', dest: '2026-01-24-flip-rotation-strategy/01.webp' },
    { src: 'malaysia_js_sez_01', dest: 'malaysia-js-sez-tax-scheme/01.webp' }
];

const brainDir = '/Users/takahashitomohiro/.gemini/antigravity/brain/9f52e896-ffc0-4af6-9082-825c289a79ec';
const publicDir = '/Users/takahashitomohiro/Desktop/wealth-navigator/public/images/articles';

async function applyImages() {
    // Find the latest timestamped PNGs in the brain directory
    const files = fs.readdirSync(brainDir);
    
    for (const m of mappings) {
        const pattern = new RegExp(`^${m.src}_\\d+\\.png$`);
        const srcFile = files.find(f => pattern.test(f));
        
        if (srcFile) {
            const srcPath = path.join(brainDir, srcFile);
            const destPath = path.join(publicDir, m.dest);
            const destDir = path.dirname(destPath);
            
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            
            console.log(`Converting ${srcFile} -> ${m.dest}`);
            await sharp(srcPath)
                .webp({ quality: 85 })
                .toFile(destPath);
        } else {
            console.warn(`Source not found for ${m.src}`);
        }
    }
}

applyImages();
