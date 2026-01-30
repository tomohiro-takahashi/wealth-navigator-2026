
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function generateStandalonePost(brandId) {
    const dnaPath = path.join(process.cwd(), `src/dna.config.${brandId}.json`);
    if (!fs.existsSync(dnaPath)) return null;
    const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));

    // Bibles for tone
    const brandBiblePath = path.join(process.cwd(), 'libs/brain/bibles', `${brandId}_bible.md`);
    let brandBible = "";
    if (fs.existsSync(brandBiblePath)) {
        brandBible = fs.readFileSync(brandBiblePath, 'utf8');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are the social media voice for "${dna.identity.name}".
    Brand Persona: ${dna.persona.role} (${dna.persona.tone})
    Key Values: ${(dna.persona.keywords || []).join(', ')}
    
    ## Brand Bible Snippet
    ${brandBible.substring(0, 500)}

    ## Task
    Generate a standalone X (Twitter) post (Japanese) that provides value/insight to the audience TODAY.
    Today's Date: ${new Date().toLocaleDateString('ja-JP')}
    
    The post should NOT be about a specific article. It should be:
    - An observation on the current market/social climate (based on brand expertise).
    - A strategic tip.
    - A thought-provoking question for the audience.
    
    Rules:
    - Japanese language.
    - Max 140 characters.
    - Include 2-3 hashtags.
    - Sound like a human expert, not an AI.
    - Output ONLY the post text.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (e) {
        console.error(`Failed to generate standalone post for ${brandId}:`, e.message);
        return null;
    }
}

async function run() {
    console.log(`\n📅 Starting [Autonomous Social Factory]...`);

    const brands = ['wealth', 'flip', 'kominka', 'legacy', 'subsidy'];
    
    for (const brand of brands) {
        console.log(`\n📱 Generating Standalone Post for: ${brand}`);
        const post = await generateStandalonePost(brand);
        if (post) {
            console.log(`  [POST]: ${post}`);
            
            // 1. Save to content/social/ (for sync_to_gas.js)
            const socialDir = path.join(process.cwd(), 'content/social');
            if (!fs.existsSync(socialDir)) fs.mkdirSync(socialDir, { recursive: true });
            
            const payload = {
                brand: brand,
                posts: [
                    { type: 'standalone', content: post }
                ]
            };
            const filePath = path.join(socialDir, `${brand}_x_posts_latest.json`);
            fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
            console.log(`  💾 Saved to: ${filePath}`);

            // 2. Trigger Sync to GAS
            console.log(`  📡 Syncing to GAS...`);
            try {
                // We use process.argv[2] brand in sync_to_gas, so we need to pass it
                execSync(`node scripts/sync_to_gas.js ${brand}`, { stdio: 'inherit' });
            } catch (e) {
                console.error(`  [WARN] GAS Sync failed for ${brand}: ${e.message}`);
            }
        }
    }
}

run();
