
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function syncToGas() {
    const gasUrl = process.env.GAS_X_WEBAPP_URL;
    if (!gasUrl) {
        console.error("❌ Error: GAS_X_WEBAPP_URL not found in .env.local");
        process.exit(1);
    }

    const brand = process.argv[2] || 'wealth';
    const filePath = path.join(process.cwd(), 'content/social', `${brand}_x_posts_latest.json`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: JSON file not found at ${filePath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`📡 Sending ${data.posts.length} posts for ${brand} to GAS...`);

    try {
        const response = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.text();
        if (response.ok) {
            console.log(`✅ Success: Pushed to Spreadsheet! Response: ${result}`);
        } else {
            console.error(`❌ GAS Error: ${response.status} - ${result}`);
        }
    } catch (e) {
        console.error(`❌ Network Error: ${e.message}`);
    }
}

syncToGas();
