
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const { loadContext, saveContext } = require('./lib/create_context');
const { logExecution, notifyFailure } = require('./lib/monitoring');

async function run() {
    console.log(`\n🏭 Starting [Vision Factory]...`);

    const draftDir = path.join(process.cwd(), 'content/01_drafts');
    if (!fs.existsSync(draftDir)) {
        console.log("No drafts found in 01_drafts.");
        return;
    }

    const projects = fs.readdirSync(draftDir).filter(f => fs.statSync(path.join(draftDir, f)).isDirectory());

    for (const slug of projects) {
        console.log(`\n🖼️  Processing Images for: ${slug}`);
        const projectPath = path.join(draftDir, slug);
        const contextPath = path.join(projectPath, 'context.json');
        
        if (!fs.existsSync(contextPath)) {
            console.warn(`  [SKIP] context.json missing in ${slug}`);
            continue;
        }

        let context;
        try {
            context = loadContext(contextPath);
        } catch (e) {
            console.warn(`  [SKIP] Failed to load context for ${slug}: ${e.message}`);
            continue;
        }

        const completeJsonPath = path.join(projectPath, 'article_complete.json');
        if (!fs.existsSync(completeJsonPath)) {
            console.warn(`  [SKIP] article_complete.json missing in ${slug}`);
            continue;
        }

        const json = JSON.parse(fs.readFileSync(completeJsonPath, 'utf8'));
        const imageDir = path.join(projectPath, 'images');
        if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

        // Generate images 01, 02, 03
        let allSuccess = true;
        for (let i = 1; i <= 3; i++) {
            const imgName = `${i.toString().padStart(2, '0')}.webp`;
            const imgPath = path.join(imageDir, imgName);

            if (fs.existsSync(imgPath)) {
                // Verify size
                const stats = fs.statSync(imgPath);
                if (stats.size > 10000) {
                    console.log(`  [OK] Image ${imgName} already exists (${stats.size} bytes).`);
                    continue;
                }
                console.log(`  [REGEN] Image ${imgName} looks like a placeholder, regenerating...`);
            }

            console.log(`  [GEN] Generating Image ${imgName}...`);
            const sectionContext = (json.sections && json.sections[i-1]) ? json.sections[i-1].content_html : json.intro_hook;
            const genArgs = {
                brand: context.brand,
                slug: context.slug,
                idx: i,
                title: json.h1_title,
                context: sectionContext,
                out: imgPath
            };
            
            const argsPath = path.join(projectPath, `_gen_args_${i}.json`);
            fs.writeFileSync(argsPath, JSON.stringify(genArgs));

            let retries = 3;
            let currentSuccess = false;
            while (retries > 0 && !currentSuccess) {
                try {
                    execSync(`node scripts/generate_local_image.js --args "${argsPath}"`, { stdio: 'inherit' });
                    currentSuccess = true;
                } catch (e) {
                    retries--;
                    if (retries > 0) {
                        console.warn(`  [RETRY] Image generation failed. Waiting 60s... (${retries} attempts left)`);
                        await sleep(60000);
                    } else {
                        console.error(`  [FAIL] Image ${imgName} generation failed after retries: ${e.message}`);
                        allSuccess = false;
                    }
                }
            }
            if (fs.existsSync(argsPath)) fs.unlinkSync(argsPath); // Clean up

            // To avoid per-minute quota limits (especially for Imagen Free Tier)
            if (i < 3) {
                console.log(`  [WAIT] Sleeping 30s before next image to respect quota...`);
                await sleep(30000);
            }
        }

        if (allSuccess) {
            console.log(`✅ All images ready for ${slug}. Moving to [02_imaged]...`);
            const imagedDir = path.join(process.cwd(), 'content/02_imaged', slug);
            if (!fs.existsSync(path.dirname(imagedDir))) fs.mkdirSync(path.dirname(imagedDir), { recursive: true });
            
            // Move project to next stage
            fs.renameSync(projectPath, imagedDir);
            
            // Update Context
            context.paths.workDir = imagedDir;
            context.paths.context = path.join(imagedDir, 'context.json');
            context.stage = '02_imaged';
            saveContext(context);

            await logExecution(context, 'vision', 'success');
        } else {
            console.warn(`⚠️ Some images failed for ${slug}. Staying in [01_drafts] for retry.`);
            await logExecution(context, 'vision', 'partial', 'Some images failed.');
            await notifyFailure(context, 'vision', 'Some images failed.');
        }
    }
}

run();
