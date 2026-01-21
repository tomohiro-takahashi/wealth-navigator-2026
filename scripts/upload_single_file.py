
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaFileUpload
import os
import sys
import glob

# --- Auth ---
SCOPES = ['https://www.googleapis.com/auth/drive']
KEY_FILE_PATH = os.path.join(os.path.dirname(__file__), '../service_account.json')
from dotenv import load_dotenv

# --- Auth ---
SCOPES = ['https://www.googleapis.com/auth/drive']
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# --- Auth ---
SCOPES = ['https://www.googleapis.com/auth/drive']

load_dotenv(".env.local")
if not os.getenv("GOOGLE_DRIVE_FOLDER_ID"):
    load_dotenv() # try default .env

PARENT_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def find_latest_folder(service, slug):
    # Search for folder that matches the "YYYY-MM-DD_slug" pattern mostly by checking name containment
    query = f"'{PARENT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    
    folders = []
    page_token = None
    
    while True:
        results = service.files().list(q=query, fields="nextPageToken, files(id, name)", pageToken=page_token).execute()
        files = results.get('files', [])
        for f in files:
            if slug in f['name']:
                folders.append(f)
        
        page_token = results.get('nextPageToken')
        if not page_token:
            break
            
    if not folders:
        return None
    
    # Sort by name (descending) to get the latest date
    folders.sort(key=lambda x: x['name'], reverse=True)
    return folders[0]
            
    if not folders:
        return None
    
    # Sort by name (which starts with date YYYY-MM-DD...) descending
    folders.sort(key=lambda x: x['name'], reverse=True)
    return folders[0] # Return the most recent one

def upload_file(service, folder_id, file_path):
    filename = os.path.basename(file_path)
    file_metadata = {
        'name': f"【プロンプト】{filename}",
        'parents': [folder_id],
        'mimeType': 'application/vnd.google-apps.document' # Convert to Doc
    }
    media = MediaFileUpload(file_path, mimetype='text/markdown')
    
    print(f"Uploading {filename} to folder ID {folder_id}...")
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    print(f"✅ Uploaded! File ID: {file.get('id')}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 upload_single_file.py <slug> <file_path>")
        sys.exit(1)

    slug = sys.argv[1]
    file_path = sys.argv[2]
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    service = authenticate()
    folder = find_latest_folder(service, slug)
    
    if not folder:
        print(f"❌ No existing folder found for slug: {slug}")
        sys.exit(1)
        
    print(f"📂 Found target folder: {folder['name']}")
    upload_file(service, folder['id'], file_path)

if __name__ == '__main__':
    main()
