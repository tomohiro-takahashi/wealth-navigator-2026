import os
import sys
import re
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv(".env.local")
PARENT_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    """Authenticates using User OAuth Token (Cloud/Local) or Service Account."""
    creds = None
    
    # 1. Try User OAuth Token from Environment Variable (GitHub Actions / Cloud)
    token_info = os.getenv("GOOGLE_DRIVE_TOKEN_JSON")
    if token_info:
        print("🔐 Authenticating via User OAuth Token (Env Var)...")
        info = json.loads(token_info)
        creds = Credentials.from_authorized_user_info(info, SCOPES)
        return build('drive', 'v3', credentials=creds)

    # 2. Try Local token.json
    if os.path.exists('token.json'):
        print("👤 Authenticating via Local token.json...")
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # Refresh if expired
    if creds and creds.expired and creds.refresh_token:
        print("🔄 Refreshing expired token...")
        try:
            creds.refresh(Request())
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        except Exception as e:
            print(f"⚠️ Failed to refresh token: {e}")
            creds = None

    if creds and creds.valid:
        return build('drive', 'v3', credentials=creds)

    # 3. Try Service Account (Fallback)
    service_account_info = os.getenv("GOOGLE_SERVICE_ACCOUNT_INFO")
    if service_account_info:
        print("🤖 Authenticating via Service Account (Env Var)...")
        info = json.loads(service_account_info)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)

    # 4. Final Fallback: Full Interactive Login (Local Only)
    print("❌ No valid credentials found. Starting interactive login...")
    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)
    with open('token.json', 'w') as token:
        token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)

def sync_project_clips(service, project_folder_name, project_folder_id):
    slug = project_folder_name.split('_')[-1]
    local_clips_dir = os.path.join('projects', slug, 'clips')
    if not os.path.exists(local_clips_dir):
        os.makedirs(local_clips_dir, exist_ok=True)

    # 1. Find 'clips' subfolder in Drive
    query = f"name = 'clips' and '{project_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    clips_folders = results.get('files', [])
    if not clips_folders:
        print(f"   [SKIP] No 'clips' folder found for {slug}")
        return

    clips_folder_id = clips_folders[0]['id']

    # 2. List all mp4 files in Drive 'clips' folder
    query = f"'{clips_folder_id}' in parents and mimeType = 'video/mp4' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    drive_clips = results.get('files', [])

    if not drive_clips:
        print(f"   [EMPTY] No mp4 clips in Drive for {slug}")
        return

    print(f"🎬 Syncing {len(drive_clips)} clips for {slug}...")

    # 3. Sort by leading number and Download
    # Rule: Filename starts with digit (e.g. 1.mp4, 2_scene.mp4)
    def get_order(name):
        match = re.search(r'^(\d+)', name)
        return int(match.group(1)) if match else 999

    drive_clips.sort(key=lambda x: get_order(x['name']))

    for i, clip in enumerate(drive_clips):
        order = get_order(clip['name'])
        if order == 999:
            print(f"   [WARN] Skipping clip without number: {clip['name']}")
            continue

        target_name = f"scene_{order}.mp4"
        local_path = os.path.join(local_clips_dir, target_name)

        if os.path.exists(local_path):
            print(f"   [OK] {target_name} already exists locally.")
            continue

        print(f"   [DOWN] Downloading {clip['name']} as {target_name}...")
        request = service.files().get_media(fileId=clip['id'])
        fh = io.FileIO(local_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        print(f"   [DONE]")

def main():
    service = authenticate()
    if not PARENT_FOLDER_ID:
        print("Error: GOOGLE_DRIVE_FOLDER_ID not found.")
        sys.exit(1)

    # List all project folders (YYYY-MM-DD_slug)
    query = f"'{PARENT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    projects = results.get('files', [])

    print(f"🔍 Found {len(projects)} projects on Drive. Checking for clips to sync...")

    for project in projects:
        # Only process folders that match the naming pattern
        if re.match(r'^\d{4}-\d{2}-\d{2}_', project['name']):
            sync_project_clips(service, project['name'], project['id'])

if __name__ == '__main__':
    main()
