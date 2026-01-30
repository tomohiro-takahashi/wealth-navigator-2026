const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
dotenv.config({ path: '.env.local' });

async function checkGemini() {
    console.log('=== Checking Gemini ===');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const modelName of models) {
        try {
            console.log(`--- Testing ${modelName} ---`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            console.log(`  [OK] ${modelName}: ${result.response.text().substring(0, 20)}`);
        } catch (e) {
            console.log(`  [FAIL] ${modelName}: ${e.message}`);
        }
    }
}

async function checkImagen() {
    console.log('\n=== Checking Imagen ===');
    const key = process.env.GOOGLE_API_KEY;
    const models = [
        'v1beta/models/imagen-3.0-generate-001',
        'v1/models/imagen-3.0-generate-001',
        'v1beta/models/imagen-4.0-generate-001'
    ];
    
    for (const m of models) {
        try {
            console.log(`--- Testing ${m} ---`);
            const response = await fetch(`https://generativelanguage.googleapis.com/${m}:predict?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: 'Luxury architecture' }],
                    parameters: { sampleCount: 1 }
                })
            });
            console.log(`  [${response.status}] ${m}`);
            if (!response.ok) {
                const text = await response.text();
                console.log(`    Error: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`  [ERROR] ${m}: ${e.message}`);
        }
    }
}

async function run() {
    await checkGemini();
    await checkImagen();
}

run();
