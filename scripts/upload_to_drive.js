const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Configuration
const DRIVE_ROOT_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CREDENTIALS_PATH = path.resolve(__dirname, '../credentials.json');
const TOKEN_PATH = path.resolve(__dirname, '../token.json');

async function findOrCreateFolder(drive, parentId, folderName) {
    // Check if folder exists
    const query = `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and name = '${folderName}' and trashed = false`;
    const res = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (res.data.files.length > 0) {
        console.log(`   📂 Found existing folder: ${folderName} (${res.data.files[0].id})`);
        return res.data.files[0].id;
    }

    // Create folder
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };
    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });
    console.log(`   zk Created new folder: ${folderName} (${folder.data.id})`);
    return folder.data.id;
}

async function uploadFile() {
    const filePath = process.argv[2];
    const subFolderName = process.argv[3]; // Optional: e.g. "Wealth Navigator Manifesto"
    const targetFileName = process.argv[4]; // Optional: e.g. "【ショート動画】Title.mp4"

    if (!filePath) {
        console.error("Usage: node scripts/upload_to_drive.js <file_path> [sub_folder_name] [target_file_name]");
        process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    if (!DRIVE_ROOT_ID) {
        console.error("⚠️ GOOGLE_DRIVE_FOLDER_ID is missing in .env.local. Skipping upload.");
        process.exit(0);
    }

    if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
        console.error("❌ credentials.json or token.json not found in root.");
        console.error("   This script requires User OAuth credentials to bypass quota limits.");
        process.exit(1);
    }

    console.log(`🚀 Preparing upload...`);
    console.log(`   Source: ${filePath}`);

    try {
        // Auth Setup
        const content = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        const tokenContent = fs.readFileSync(TOKEN_PATH);
        const token = JSON.parse(tokenContent);

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris ? redirect_uris[0] : 'http://localhost');
        oAuth2Client.setCredentials(token);

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        // Determine destination folder
        let parentId = DRIVE_ROOT_ID;
        if (subFolderName) {
            parentId = await findOrCreateFolder(drive, DRIVE_ROOT_ID, subFolderName);
        }

        // Determine File Name
        const uploadName = targetFileName || path.basename(filePath);

        const res = await drive.files.create({
            requestBody: {
                name: uploadName,
                parents: [parentId],
            },
            media: {
                mimeType: 'video/mp4',
                body: fs.createReadStream(filePath),
            },
            fields: 'id, name, webViewLink',
        });

        console.log(`✅ Upload Successful!`);
        console.log(`   Name: ${res.data.name}`);
        console.log(`   Folder ID: ${parentId}`);
        console.log(`   Link: ${res.data.webViewLink}`);

    } catch (error) {
        console.error("❌ Upload Failed:", error.message);
        if (error.message.includes('invalid_grant')) {
            console.log("⚠️ Token might be expired. Regenerate token.json.");
        }
    }
}

uploadFile();
