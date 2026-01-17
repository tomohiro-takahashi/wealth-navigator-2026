const fs = require('fs');
const path = require('path');
// Try to load dotenv. If not found, we assume keys might be in env (but usually we need dotenv for .env.local)
// We need to handle the case where dotenv might not be in the root node_modules if it was installed in mcp-server only.
// But the user's package.json had "dotenv": "^17.2.3". Wait, standard is 16.x usually, but maybe 17 exists now?
// Actually, let's just require it.
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
} catch (e) {
    // ignore if package not found, but this will likely fail later if defined in .env
    console.warn("dotenv not found or failed to load");
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

if (!API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not found in .env.local');
    process.exit(1);
}

const promptFile = process.argv[2];
const outputFile = process.argv[3];

if (!promptFile || !outputFile) {
    console.error('Usage: node script.js <prompt_file> <output_file>');
    process.exit(1);
}

const promptText = fs.readFileSync(promptFile, 'utf8');

async function callClaude() {
    try {
        console.log('Calling Claude API (Opus)...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-5-20251101',
                max_tokens: 8192,
                messages: [
                    { role: 'user', content: promptText }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const content = data.content[0].text;

        fs.writeFileSync(outputFile, content);
        console.log(`Successfully generated content to ${outputFile}`);
    } catch (error) {
        console.error('Generation failed:', error);
        process.exit(1);
    }
}

callClaude();
