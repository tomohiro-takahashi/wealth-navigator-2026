
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config({ path: '.env.local' });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const args = require('minimist')(process.argv.slice(2));
// --slug --idx --title --context --out

async function generatePromptWithGemini(title, styleGuide) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemInstruction = `
    You are an Art Director for a high-end luxury brand.
    Create a detailed ENGLISH visual prompt for an AI image generator.
    NO TEXT. Cinematic, Photorealistic, 8k, Dramatic Lighting.
    Style Guide: ${styleGuide}
    Use Japanese/Asian subjects if context is about Japan.
    `;
    const userMessage = `Title: ${title}`;
    
    const result = await model.generateContent(systemInstruction + "\n\n" + userMessage);
    return result.response.text().trim() || `Luxury architecture image related to ${title}`;
}

async function run() {
    let argsData;
    
    // Handle arguments via file (Task 4/Task 12 reinforcement)
    if (args.args && fs.existsSync(args.args)) {
        argsData = JSON.parse(fs.readFileSync(args.args, 'utf8'));
    } else {
        argsData = args;
    }

    const { brand, slug, idx, title, out: outPathOverride, outPath: outPathArg } = argsData;
    const outPath = outPathOverride || outPathArg;

    if (!outPath) {
        console.error("❌ Output path missing. Use --out or provide via --args file.");
        process.exit(1);
    }

    const result = { success: false, path: outPath, error: null };

    try {
        // 1. Get Brand Style from DNA
        let styleGuide = "Luxury architecture, cinematic, photorealistic, premium investment feel";
        const dnaPath = path.resolve(process.cwd(), `src/dna.config.${brand || 'wealth'}.json`);
        if (fs.existsSync(dnaPath)) {
            const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
            styleGuide = dna.image_style || dna.theme?.imageStyle || styleGuide;
        }

        console.log(`🖼️  Generating image for ${brand}: ${title} (Style: ${styleGuide.substring(0, 30)}...)`);

        const visualPrompt = await generatePromptWithGemini(title, styleGuide);
        console.log(`  > [PROMPT]: "${visualPrompt.substring(0, 50)}..."`);

        let response;
        let attempts = 0;
        const maxAttempts = 2;
        
        while (attempts < maxAttempts) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: visualPrompt }],
                    parameters: { sampleCount: 1, aspectRatio: "16:9" }
                })
            });

            if (response.status === 429 && attempts < maxAttempts - 1) {
                console.warn(`  [429] Sleeping 30s...`);
                await sleep(30000);
                attempts++;
                continue;
            }
            break;
        }

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Google API ${response.status}: ${err}`);
        }

        const data = await response.json();
        const b64Data = data.predictions?.[0]?.bytesBase64Encoded;
        if (!b64Data) throw new Error('No image data returned from API');

        const buffer = Buffer.from(b64Data, 'base64');
        
        // Ensure directory exists
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        // Using sharp to save as WebP
        const sharp = require('sharp');
        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(outPath);

        // Verify result
        if (!fs.existsSync(outPath)) {
            throw new Error('Image file was not created');
        }
        const stats = fs.statSync(outPath);
        if (stats.size < 10000) {
            throw new Error(`Generated image too small: ${stats.size} bytes`);
        }

        result.success = true;
        result.size = stats.size;
        console.log(`  [SUCCESS] Image saved: ${outPath} (${stats.size} bytes)`);

    } catch (e) {
        console.warn(`⚠️  Image API failed: ${e.message}. Falling back to placeholder.`);
        try {
            const sharp = require('sharp');
            // Create a premium-feel dark placeholder
            const svg = `
                <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#333333;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad)" />
                    <text x="50%" y="45%" font-family="Arial" font-size="40" fill="#f0d1a4" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${brand.toUpperCase()}</text>
                    <text x="50%" y="55%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">Automated Insight Visualization Pending</text>
                </svg>
            `;
            await sharp(Buffer.from(svg))
                .webp({ quality: 80 })
                .toFile(outPath);
            
            result.success = true;
            result.isPlaceholder = true;
            console.log(`  [PLACEHOLDER] Saved to ${outPath}`);
        } catch (err) {
            result.success = false;
            result.error = `Placeholder failed: ${err.message}`;
            console.error(`❌ Fatal: Both API and Placeholder failed: ${err.message}`);
        }
    } finally {
        // Output result to file
        const resultFilePath = outPath.replace('.webp', '_result.json');
        fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 2));

        // Note: We DO NOT exit with 1 anymore IF the placeholder was successfully created.
        // This allows the pipeline to proceed to Gateway.
        if (!result.success) {
            process.exit(1);
        }
    }
}

run();
