const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const mp3Duration = require('mp3-duration');
const util = require('util');

const execPromise = util.promisify(exec);
const getDuration = util.promisify(mp3Duration);

// Paths
const VIDEO_GEN_DIR = path.join(__dirname, '../video-generator');
const PYTHON_SCRIPT = path.join(VIDEO_GEN_DIR, 'generate_voice.py');
const SCRIPT_JSON_PATH = path.join(VIDEO_GEN_DIR, 'src/video-script.json');
const OUTPUT_AUDIO_DIR = path.join(VIDEO_GEN_DIR, 'public');
const OUTPUT_AUDIO_FILE = path.join(OUTPUT_AUDIO_DIR, 'audio.mp3');

async function processAudio() {
    console.log("🎙️  Processing Audio...");

    // 1. Load Script JSON
    if (!fs.existsSync(SCRIPT_JSON_PATH)) {
        console.error("❌ Script JSON not found:", SCRIPT_JSON_PATH);
        process.exit(1);
    }
    const script = JSON.parse(fs.readFileSync(SCRIPT_JSON_PATH, 'utf8'));

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_AUDIO_DIR)) {
        fs.mkdirSync(OUTPUT_AUDIO_DIR, { recursive: true });
    }

    const sceneAudioFiles = [];
    let totalDuration = 0;

    // 2. Generate Audio for each Scene
    for (const scene of script.scenes) {
        console.log(`   Processing Scene ${scene.scene_id}: ${scene.section_type}`);

        const tempFile = path.join(OUTPUT_AUDIO_DIR, `temp_scene_${scene.scene_id}.mp3`);

        // Escape quotes for command line
        const safeText = scene.narration_text.replace(/"/g, '\\"');

        // Call Python Script
        const cmd = `python3 "${PYTHON_SCRIPT}" --text "${safeText}" --output "${tempFile}"`;

        try {
            await execPromise(cmd);
        } catch (error) {
            console.error(`❌ Failed to generate voice for scene ${scene.scene_id}:`, error);
            process.exit(1);
        }

        // 3. Measure Duration
        try {
            const duration = await getDuration(tempFile);
            const adjustedDuration = Math.ceil(duration * 10) / 10 + 0.2; // Round up to 1 decimal place + buffer

            console.log(`      Duration: ${duration.toFixed(2)}s -> Adjusted: ${adjustedDuration.toFixed(2)}s`);

            // Update Scene Duration in JSON
            scene.duration_sec = adjustedDuration;
            totalDuration += adjustedDuration;

            sceneAudioFiles.push(tempFile);
        } catch (error) {
            console.error(`❌ Failed to measure duration for scene ${scene.scene_id}:`, error);
            process.exit(1);
        }
    }

    // 4. Update Total Duration in Metadata
    script.metadata.total_duration = Math.ceil(totalDuration);

    // Write updated JSON back
    fs.writeFileSync(SCRIPT_JSON_PATH, JSON.stringify(script, null, 2));
    console.log("✅ Updated video-script.json with correct durations.");

    // 5. Concatenate Audio Files
    // Simple buffer concatenation is usually sufficient for MP3
    try {
        const buffers = sceneAudioFiles.map(file => fs.readFileSync(file));
        const combinedBuffer = Buffer.concat(buffers);
        fs.writeFileSync(OUTPUT_AUDIO_FILE, combinedBuffer);
        console.log(`✅ Combined audio saved to: ${OUTPUT_AUDIO_FILE}`);

        // Cleanup temp files
        sceneAudioFiles.forEach(file => fs.unlinkSync(file));
        console.log("🧹 Cleaned up temporary files.");

    } catch (error) {
        console.error("❌ Failed to concatenate audio:", error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    processAudio();
}

module.exports = { processAudio };
