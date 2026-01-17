const fs = require('fs');
const path = require('path');
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
} catch (e) { }

const API_KEY = process.env.ANTHROPIC_API_KEY;

async function listModels() {
    console.log('Fetching available models...');
    try {
        const response = await fetch('https://api.anthropic.com/v1/models', {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log('--- Available Models ---');
        data.data.forEach(m => {
            console.log(`- ${m.id} (${m.display_name})`);
        });
        console.log('------------------------');
    } catch (error) {
        console.error('Failed to fetch models:', error);
    }
}

listModels();
