const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
    const key = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        console.log('=== Available Models ===');
        data.models.forEach(m => {
            if (m.name.includes('imagen') || m.name.includes('gemini')) {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            }
        });
    } catch (e) {
        console.error('Failed to list models:', e.message);
    }
}

run();
