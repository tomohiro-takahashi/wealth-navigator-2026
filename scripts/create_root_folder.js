const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const CREDENTIALS_PATH = path.resolve(__dirname, '../credentials.json');
const TOKEN_PATH = path.resolve(__dirname, '../token.json');

async function main() {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const tokenContent = fs.readFileSync(TOKEN_PATH);
    const token = JSON.parse(tokenContent);

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris ? redirect_uris[0] : 'http://localhost');
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    console.log("📂 Creating 'Wealth Navigator Media Factory' in root...");

    const fileMetadata = {
        name: 'Wealth Navigator Media Factory',
        mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });

    console.log(`✅ Folder Created! ID: ${folder.data.id}`);
    console.log(`👉 Please add this to .env.local as GOOGLE_DRIVE_FOLDER_ID`);
}

main();
