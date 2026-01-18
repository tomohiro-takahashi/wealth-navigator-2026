import os
import sys
import datetime
import glob
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from dotenv import load_dotenv

# Load env variables (for GOOGLE_DRIVE_FOLDER_ID)
load_dotenv(".env.local")

# Config
SERVICE_ACCOUNT_FILE = 'service_account.json'
SCOPES = ['https://www.googleapis.com/auth/drive']
PARENT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_FOLDER_ID')

def authenticate():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def create_folder(service, name, parent_id):
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_id]
    }
    # Check if exists first? Or just create (Drive allows duplicates) -> Better to check.
    # Simple check query
    query = f"name = '{name}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    # supportsAllDrives=True handles both Shared Drives and standard shared folders better in some API versions
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
    files = results.get('files', [])
    
    if files:
        print(f"Folder '{name}' already exists. ID: {files[0]['id']}")
        return files[0]['id']
    else:
        file = service.files().create(body=file_metadata, fields='id', supportsAllDrives=True).execute()
        print(f"Created folder '{name}'. ID: {file.get('id')}")
        return file.get('id')

def upload_file(service, file_path, folder_id):
    name = os.path.basename(file_path)
    file_metadata = {
        'name': name,
        'parents': [folder_id]
    }
    media = MediaFileUpload(file_path, resumable=True)
    
    print(f"Uploading {name}...")
    # supportsAllDrives=True is critical if the target is a Shared Drive
    file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink', supportsAllDrives=True).execute()
    print(f"Uploaded: {file.get('id')}")
    return file

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 upload_to_drive.py <slug>")
        sys.exit(1)
        
    slug = sys.argv[1]
    
    if not PARENT_FOLDER_ID:
        print("Error: GOOGLE_DRIVE_FOLDER_ID not set in .env.local")
        sys.exit(1)
        
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Error: {SERVICE_ACCOUNT_FILE} not found.")
        sys.exit(1)

    service = authenticate()
    
    # 1. Create Subfolder
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    folder_name = f"{today}_{slug}"
    folder_id = create_folder(service, folder_name, PARENT_FOLDER_ID)
    
    # 2. Identify Files
    files_to_upload = []
    
    # Video
    video_path = f"public/videos/{slug}.mp4"
    if os.path.exists(video_path):
        files_to_upload.append(video_path)
    
    # Prompts
    prompts_path = f"content/prompts/{slug}_prompts.md"
    if os.path.exists(prompts_path):
        files_to_upload.append(prompts_path)
        
    # Images (All related webp)
    # Pattern: public/images/articles/{slug}*.webp
    img_pattern = f"public/images/articles/{slug}*.webp"
    images = glob.glob(img_pattern)
    files_to_upload.extend(images)
    
    if not files_to_upload:
        print("No files found to upload.")
        return

    print("--- Starting Upload ---")
    for f in files_to_upload:
        upload_file(service, f, folder_id)
        
    print(f"\n✅ Upload Complete! All assets in folder: {folder_name}")
    print(f"Drive Folder ID: {folder_id}")

if __name__ == '__main__':
    main()
