const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const CREDENTIALS_PATH = path.resolve(__dirname, '../credentials.json');
const TOKEN_PATH = path.resolve(__dirname, '../token.json');

async function main() {
    if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
        console.error("❌ credentials.json or token.json not found.");
        process.exit(1);
    }

    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const tokenContent = fs.readFileSync(TOKEN_PATH);
    const token = JSON.parse(tokenContent);

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris ? redirect_uris[0] : 'http://localhost');
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    console.log("🔍 Searching for potential Root Folders...");

    // List folders in root ('root' in parents)
    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed = false"
    });

    const files = res.data.files;
    if (files.length) {
        console.log('Folders found:');
        files.map((file) => {
            console.log(`${file.name} (${file.id})`);
        });
    } else {
        console.log('No folders found.');
    }
}

main();
