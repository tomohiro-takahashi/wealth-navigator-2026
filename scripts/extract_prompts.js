const fs = require('fs');

const jsonPath = process.argv[2];
const outputPath = process.argv[3];

if (!jsonPath || !outputPath) {
    console.error("Usage: node scripts/extract_prompts.js <json_path> <output_txt_path>");
    process.exit(1);
}

try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    let outputText = `# Video Construction Prompts for Generative AI\n`;
    outputText += `Project: ${data.project_title || 'Untitled'}\n`;
    outputText += `Description: Use these prompts in tools like Sora, Runway Gen-2, or Pika to generate short clips for each scene.\n\n`;

    data.scenes.forEach(scene => {
        outputText += `## Scene ${scene.scene_id} (${scene.section_type.toUpperCase()}) - ${scene.duration_sec}s\n`;
        outputText += `**Prompt**: ${scene.visual_prompt}\n`;
        outputText += `**Context**: ${scene.screen_text}\n\n`;
    });

    fs.writeFileSync(outputPath, outputText);
    console.log(`✅ Prompts extracted to: ${outputPath}`);

} catch (e) {
    console.error("Error extracting prompts:", e.message);
    process.exit(1);
}
