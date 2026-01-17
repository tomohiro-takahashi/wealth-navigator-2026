const fs = require('fs');
const path = require('path');
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
} catch (e) { }

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

if (!API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not found in .env.local');
    process.exit(1);
}

const htmlFile = process.argv[2];
const outputFile = process.argv[3];

if (!htmlFile || !outputFile) {
    console.error('Usage: node scripts/generate_extras.js <html_file> <output_json_file>');
    process.exit(1);
}

const htmlContent = fs.readFileSync(htmlFile, 'utf8');

const prompt = `
You are an expert SEO specialist and Video Content Producer for a high-end financial media "Wealth Navigator 2026".
Read the following HTML article content and generate a "Content Package" with SEO metadata and Video scripts.

Target Audience: High Net Worth Individuals (HNWI) with 20M+ JPY income.
Tone: Professional, Authoritative, Urgent but Rational.

## Input Article
${htmlContent}

## Output Requirements (JSON Format ONLY)
Generate a JSON object with the following fields (all strings, except lists/arrays where appropriate, but strict JSON):
1. "meta_title": 30 chars approx. Compelling title for SEARCH RESULTS.
2. "meta_description": 120 chars approx. Summary of value proposition.
3. "keywords": String, comma-separated. 5-10 keywords.
4. "video_script_a": (TikTok/Reels 15s) Full script text. Fast paced. Hook -> Conclusion.
5. "video_script_b": (YouTube Shorts 60s) Full script text. Intro -> Problem -> Solution -> CTA.
6. "prop_list": String. List of visual assets needed for the video (e.g. "Graph of X", "Photo of Y").
7. "telop_text": String. Text to be displayed on screen as subtitles/captions (summary of script).

IMPORTANT: Return ONLY the JSON object. No preamble, no markdown formatting (no \`\`\`json). Just the raw JSON string.
`;

async function callClaude() {
    try {
        console.log('Generating SEO & Video assets with Claude...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-5-20251101',
                max_tokens: 4000,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        let content = data.content[0].text.trim();

        // Cleanup markdown if present
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Validate JSON
        try {
            JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse JSON response:', content);
            throw new Error('Invalid JSON from Claude');
        }

        fs.writeFileSync(outputFile, content);
        console.log(`Successfully generated extras to ${outputFile}`);
    } catch (error) {
        console.error('Generation failed:', error);
        process.exit(1);
    }
}

callClaude();
