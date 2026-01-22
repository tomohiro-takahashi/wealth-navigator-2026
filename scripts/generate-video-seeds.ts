/**
 * generate-video-seeds.ts
 * 
 * video-script.json の各シーンの visual_prompt を元に、
 * 動画生成用の「シード画像（種画像）」を AI で生成する。
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function generateAndSaveImage(prompt: string, savePath: string) {
    try {
        if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is missing.');

        console.log(`  > Generating Image: "${prompt.substring(0, 50)}..."`);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt }],
                parameters: { sampleCount: 1, aspectRatio: "16:9" }
            })
        });

        if (!response.ok) throw new Error(`Google API Error: ${response.status}`);

        const data = await response.json();
        const b64Data = data.predictions?.[0]?.bytesBase64Encoded;
        if (!b64Data) throw new Error('No image data found');

        fs.writeFileSync(savePath, Buffer.from(b64Data, 'base64'));
        console.log(`  [OK] Saved to: ${savePath}`);

    } catch (e: any) {
        console.warn(`  [FAILED] ${e.message}`);
    }
}

async function main() {
    const scriptPath = path.resolve(__dirname, '../video-generator/src/video-script.json');
    if (!fs.existsSync(scriptPath)) {
        console.error('video-script.json not found.');
        process.exit(1);
    }

    const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
    const projectId = script.project_title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const outputBaseDir = path.resolve(__dirname, `../projects/${projectId}`);
    
    // プロジェクトフォルダがなければ作成（基本はあるはず）
    const imageDir = path.join(outputBaseDir, 'images');
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    console.log(`\n--- Generating Seed Images for Project: ${projectId} ---`);

    for (const scene of script.scenes) {
        const prompt = scene.visual_prompt;
        const fileName = `scene_${scene.scene_id}_seed.png`;
        const savePath = path.join(imageDir, fileName);

        if (fs.existsSync(savePath)) {
            console.log(`  [SKIP] ${fileName} already exists.`);
            continue;
        }

        await generateAndSaveImage(prompt, savePath);
    }

    console.log('\n✅ Video Seed Image Generation Complete.');
}

main().catch(console.error);
