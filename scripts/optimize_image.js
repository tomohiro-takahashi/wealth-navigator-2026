const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node scripts/optimize_image.js <input_path> <output_path> [width]');
    process.exit(1);
}

const inputPath = args[0];
const outputPath = args[1];
const targetWidth = args[2] ? parseInt(args[2]) : 1200;

if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
}

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImage() {
    try {
        console.log(`Optimizing: ${inputPath} -> ${outputPath}`);
        await sharp(inputPath)
            .resize({ width: targetWidth, withoutEnlargement: true }) // Resize to max width, don't upscale
            .webp({ quality: 80 })
            .toFile(outputPath);
        console.log('Optimization complete.');
    } catch (error) {
        console.error('Error processing image:', error);
        process.exit(1);
    }
}

processImage();
