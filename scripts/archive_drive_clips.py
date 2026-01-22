import os
import sys
import datetime
from googleapiclient.discovery import build
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

def create_folder(service, name, parent_id):
    query = f"name = '{name}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    files = results.get('files', [])
    if files:
        return files[0]['id']
    else:
        file_metadata = {'name': name, 'mimeType': 'application/vnd.google-apps.folder', 'parents': [parent_id]}
        file = service.files().create(body=file_metadata, fields='id', supportsAllDrives=True).execute()
        return file.get('id')

def archive_clips(service, slug):
    if not PARENT_FOLDER_ID:
        print("Error: PARENT_FOLDER_ID not set.")
        return

    # 1. Find Project Folder (Search by slug at the end of name)
    query = f"'{PARENT_FOLDER_ID}' in parents and name contains '{slug}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    projects = results.get('files', [])
    if not projects:
        print(f"❌ Project folder for {slug} not found.")
        return

    project_folder_id = projects[0]['id']
    print(f"📁 Found project: {projects[0]['name']}")

    # 2. Find 'clips' folder
    query = f"name = 'clips' and '{project_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    clips_results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    clips_folders = clips_results.get('files', [])
    if not clips_folders:
        print(f"⚠️ 'clips' folder not found.")
        return
    
    clips_folder_id = clips_folders[0]['id']

    # 3. Create 'archived' folder inside 'clips'
    archived_folder_id = create_folder(service, "archived", clips_folder_id)

    # 4. Move all files from 'clips' to 'archived'
    # EXCEPT the archived folder itself
    query = f"'{clips_folder_id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'"
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True).execute()
    files = results.get('files', [])

    print(f"📦 Archiving {len(files)} files...")
    for file in files:
        # Move file: remove current parents and add new parent
        try:
            service.files().update(
                fileId=file['id'],
                addParents=archived_folder_id,
                removeParents=clips_folder_id,
                fields='id, parents',
                supportsAllDrives=True
            ).execute()
            print(f"   [MOV] {file['name']} -> archived/")
        except Exception as e:
            print(f"   [ERR] Failed to move {file['name']}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 archive_drive_clips.py <slug>")
        sys.exit(1)
    
    slug = sys.argv[1]
    service = authenticate()
    archive_clips(service, slug)

if __name__ == '__main__':
    main()
