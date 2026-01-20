const fs = require('fs');

const jsonPath = process.argv[2];
if (!jsonPath) {
    console.error("Usage: node scripts/get_narration.js <json_path>");
    process.exit(1);
}

try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    // Combine narration from all scenes
    const fullNarration = data.scenes
        .map(scene => scene.narration_text)
        .join(' '); // Add pause? Edge-tts might need explicit breaks or just space.
    // For now, simple space.

    console.log(fullNarration);
} catch (e) {
    console.error("Error parsing JSON:", e.message);
    process.exit(1);
}
