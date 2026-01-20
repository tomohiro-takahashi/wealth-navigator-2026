const fs = require('fs');

const jsonPath = process.argv[2];
const durationSec = parseFloat(process.argv[3]);

if (!jsonPath || isNaN(durationSec)) {
    console.error("Usage: node update_json_duration.js <json_path> <duration_sec>");
    process.exit(1);
}

try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    // Update metadata
    if (!data.metadata) data.metadata = {};

    // Add 2 seconds buffer to ensure no cutoff
    data.metadata.total_duration = durationSec + 2.0;

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✅ Updated timestamp: total_duration = ${data.metadata.total_duration.toFixed(2)}s`);

} catch (e) {
    console.error("Error updating JSON:", e.message);
    process.exit(1);
}
