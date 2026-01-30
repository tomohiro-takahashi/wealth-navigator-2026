
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
    console.log(`\n🏭 Starting [Director Factory]...`);

    const imagedDir = path.join(process.cwd(), 'content/02_imaged');
    if (!fs.existsSync(imagedDir)) return console.log("No imaged articles found.");

    const projects = fs.readdirSync(imagedDir).filter(f => fs.statSync(path.join(imagedDir, f)).isDirectory());

    for (const slug of projects) {
        console.log(`\n🎬 Processing Video Assets for: ${slug}`);
        const projectPath = path.join(imagedDir, slug);
        
        try {
            // 1. Generate Video Prompts & Script
            console.log(`  > Planning Video...`);
            // We need to point architect to the right folder or have it work with slugs
            // The current brain_architect.js saves to content/prompts/
            execSync(`node scripts/brain_architect.js "${slug}" --type video`, { stdio: 'inherit' });

            // 2. Generate Video Seeds
            console.log(`  > Generating Video Seeds...`);
            // The current generate-video-seeds.ts reads from video-script.json in public/
            // This is a bit messy because it's set up for one-at-a-time.
            // I'll need to update generate-video-seeds.ts to handle a specific project.
            
            // For now, let's assume we can trigger the existing pipeline
            // but we need to move the results to the project folder.
            execSync(`npx tsx scripts/generate-video-seeds.ts`, { stdio: 'inherit' });

            // Move assets into project folder
            const videoDir = path.join(projectPath, 'video');
            if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

            // 1. Audio (from brain_architect -> process_audio)
            const publicAudio = path.join(process.cwd(), 'video-generator/public/audio.mp3');
            if (fs.existsSync(publicAudio)) {
                fs.copyFileSync(publicAudio, path.join(videoDir, 'audio.mp3'));
            }

            // 2. Script (from brain_architect)
            const srcScript = path.join(process.cwd(), 'video-generator/src/video-script.json');
            if (fs.existsSync(srcScript)) {
                fs.copyFileSync(srcScript, path.join(videoDir, 'video-script.json'));
                // Also copy to public for remotion
                fs.copyFileSync(srcScript, path.join(process.cwd(), 'video-generator/public/video-script.json'));
            }

            // 3. Seeds (from generate-video-seeds.ts)
            // It saves to projects/<project-id>/images/
            const script = JSON.parse(fs.readFileSync(srcScript, 'utf8'));
            const projectId = script.project_title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const projectImageDir = path.join(process.cwd(), 'projects', projectId, 'images');
            
            if (fs.existsSync(projectImageDir)) {
                const seeds = fs.readdirSync(projectImageDir).filter(f => f.startsWith('scene_') && f.endsWith('_seed.png'));
                seeds.forEach(s => {
                    fs.copyFileSync(path.join(projectImageDir, s), path.join(videoDir, s));
                    // Also copy to public for remotion preview
                    fs.copyFileSync(path.join(projectImageDir, s), path.join(process.cwd(), 'video-generator/public', s));
                });
            }

            console.log(`✅ Video assets ready for ${slug}. Moving to [03_directed]...`);
            const directedDir = path.join(process.cwd(), 'content/03_directed', slug);
            if (!fs.existsSync(path.dirname(directedDir))) fs.mkdirSync(path.dirname(directedDir), { recursive: true });
            fs.renameSync(projectPath, directedDir);

        } catch (e) {
            console.error(`  [FAIL] Video generation failed for ${slug}: ${e.message}`);
        }
    }
}

run();
