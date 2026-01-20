const fs = require('fs');
const path = require('path');

const slug = 'wealth-navigator-manifesto';
const scriptPath = 'video-generator/src/video-script.json';
const draftPath = 'content_draft.html';
const metadataPath = 'metadata.json';

// Outputs
const scriptMdPath = `content/scripts/${slug}.md`;
const promptsMdPath = `content/prompts/${slug}_prompts.md`;
const subtitlesPath = `content/social/【自動生成動画テロップ】${slug}.txt`;
const cleanArticlePath = `content/articles/${slug}_clean.html`;
const finalArticleMdPath = `content/articles/${slug}.md`;

if (!fs.existsSync(scriptPath)) {
    console.error("Script JSON not found");
    process.exit(1);
}
if (!fs.existsSync(draftPath)) {
    console.error("Draft HTML not found");
    process.exit(1);
}

const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const draft = fs.readFileSync(draftPath, 'utf8');

// 1. Video Script to MD
let mdContent = `# ${script.project_title}\n\n`;
mdContent += `**Target Persona**: ${script.target_persona.income_range} | ${script.target_persona.knowledge_level}\n`;
mdContent += `**Pain Points**: ${script.target_persona.pain_points.join(', ')}\n\n`;
mdContent += `## Scenes\n\n`;

script.scenes.forEach(scene => {
    mdContent += `### Scene ${scene.scene_id}: ${scene.section_type} (${scene.duration_sec}s)\n`;
    mdContent += `- **Narration**: ${scene.narration_text}\n`;
    mdContent += `- **Screen**: ${scene.screen_text}\n`;
    mdContent += `- **Visual**: ${scene.visual_prompt}\n`;
    mdContent += `- **Audio**: ${scene.audio_cues}\n\n`;
});

fs.mkdirSync(path.dirname(scriptMdPath), { recursive: true });
fs.writeFileSync(scriptMdPath, mdContent);
console.log(`Saved Script MD: ${scriptMdPath}`);

// 2. Prompts to MD
let promptsContent = `# Visual Prompts for ${slug}\n\n`;
script.scenes.forEach(scene => {
    promptsContent += `## Scene ${scene.scene_id}\n`;
    promptsContent += `${scene.visual_prompt}\n\n`;
});
fs.mkdirSync(path.dirname(promptsMdPath), { recursive: true });
fs.writeFileSync(promptsMdPath, promptsContent);
console.log(`Saved Prompts MD: ${promptsMdPath}`);

// 3. Subtitles (Narration only)
let subContent = script.scenes.map(s => s.narration_text).join('\n');
fs.mkdirSync(path.dirname(subtitlesPath), { recursive: true });
fs.writeFileSync(subtitlesPath, subContent);
console.log(`Saved Subtitles: ${subtitlesPath}`);

// 4. Clean Article (Remove IMAGE_ID)
const cleanHtml = draft.replace(/IMAGE_ID_\d+/g, '');
fs.writeFileSync(cleanArticlePath, cleanHtml);
console.log(`Saved Clean Draft: ${cleanArticlePath}`);

// 5. Final Article MD (Markdown wrapper or just content)
// Just save the content as .md for consistency
fs.writeFileSync(finalArticleMdPath, cleanHtml);
console.log(`Saved Final Article MD: ${finalArticleMdPath}`);
