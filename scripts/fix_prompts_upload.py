import os
import sys
import glob
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")
if not os.getenv("GOOGLE_DRIVE_FOLDER_ID"):
    load_dotenv()

PARENT_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("❌ Error: credentials.json not found.")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def find_latest_folder(service, parent_id, slug):
    # Find the most recent folder matching the pattern
    query = f"name contains '{slug}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, createdTime)", orderBy="createdTime desc").execute()
    files = results.get('files', [])
    if files:
        print(f"found target folder: {files[0]['name']} ({files[0]['id']})")
        return files[0]['id']
    return None

def main():
    slug = 'wealth-navigator-manifesto'
    file_path = f"content/prompts/{slug}_prompts.md"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    service = authenticate()
    
    folder_id = find_latest_folder(service, PARENT_FOLDER_ID, slug)
    if not folder_id:
        print("Could not find the target folder in Drive.")
        sys.exit(1)

    # Upload as Google Doc
    prompt_name = f"【プロンプト】{slug}_prompts" # No extension for Doc
    
    file_metadata = {
        'name': prompt_name,
        'parents': [folder_id],
        'mimeType': 'application/vnd.google-apps.document'
    }
    
    media = MediaFileUpload(file_path, mimetype='text/plain', resumable=True)
    
    print(f"Uploading {prompt_name} as Google Doc...")
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, webViewLink, name',
        supportsAllDrives=True
    ).execute()
    
    print(f"✅ Uploaded successfully!")
    print(f"Name: {file.get('name')}")
    print(f"Link: {file.get('webViewLink')}")

if __name__ == '__main__':
    main()
