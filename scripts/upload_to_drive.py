import os
import datetime
import sys
import glob
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv(".env.local")

# Wrapper to handle both .env and .env.local
if not os.getenv("GOOGLE_DRIVE_FOLDER_ID"):
    load_dotenv()

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

    # 3. Try Service Account (Fallback for specific tasks if needed)
    service_account_info = os.getenv("GOOGLE_SERVICE_ACCOUNT_INFO")
    service_account_path = 'service_account_key.json'
    
    if service_account_info:
        print("🤖 Authenticating via Service Account (Env Var)...")
        info = json.loads(service_account_info)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    elif os.path.exists(service_account_path):
        print("🤖 Authenticating via Service Account (Key File)...")
        creds = service_account.Credentials.from_service_account_file(service_account_path, scopes=SCOPES)
    
    if creds:
        return build('drive', 'v3', credentials=creds)

    # 4. Final Fallback: Full Interactive Login (Local Only)
    print("❌ No valid credentials found. Starting interactive login...")
    if not os.path.exists('credentials.json'):
        print("❌ Error: credentials.json not found.")
        sys.exit(1)
        
    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)
    with open('token.json', 'w') as token:
        token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def create_folder(service, name, parent_id):
    """Create a folder and return its ID."""
    print(f"Checking/Creating folder: {name}")
    
    # Check if exists first
    query = f"name = '{name}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    # supportsAllDrives=True handles both Shared Drives and standard shared folders better
    results = service.files().list(q=query, fields="files(id, name)", supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
    files = results.get('files', [])
    
    if files:
        print(f"Folder '{name}' already exists. ID: {files[0]['id']}")
        return files[0]['id']
    else:
        file_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        file = service.files().create(body=file_metadata, fields='id', supportsAllDrives=True).execute()
        print(f"Created folder '{name}'. ID: {file.get('id')}")
        return file.get('id')

def upload_file(service, file_path, folder_id):
    name = os.path.basename(file_path)
    
    # Rename Logic for Clarity
    # [slug].mp4 -> 【動画】[slug].mp4
    # [slug].md -> 【台本】[slug] (Doc)
    # [slug]_prompts.md -> 【プロンプト】[slug] (Doc)
    # [slug]_posts.md -> 【SNS】[slug] (Doc)
    
    
    display_name = name
    
    # Path-based detection for accuracy
    if "content/social" in file_path and name.endswith(".md"):
         display_name = f"【SNS】{name}"
    elif "content/prompts" in file_path and name.endswith(".md"):
         display_name = f"【プロンプト】{name}"
    elif "content/scripts" in file_path and name.endswith(".md"):
         display_name = f"【台本】{name}"
    elif "content/articles" in file_path and name.endswith(".md"):
         display_name = f"【記事原稿】{name}" # Article draft
    elif name == "walkthrough.md":
         display_name = "【報告書】walkthrough"
    elif name.endswith(".md"):
        # Fallback for other MD files
        display_name = f"【資料】{name}"
    elif name.endswith("_seed.png"):
        display_name = f"【種画像】{name}"
    elif name.endswith(".mp4"):
        display_name = f"【動画】{name}"

    file_metadata = {
        'name': display_name,
        'parents': [folder_id]
    }
    
    # Auto-convert Markdown to Google Doc for mobile editing
    target_mime = None
    source_mime = None
    
    if file_path.endswith('.md') or (file_path.endswith('.txt') and "テロップ" in name):
        print(f"🔄 Converting to Google Doc: {display_name}")
        target_mime = 'application/vnd.google-apps.document'
        # Force text/plain for MD/TXT to ensure conversion works
        source_mime = 'text/plain' 
        file_metadata['mimeType'] = target_mime
        
        # Remove extension from name for cleaner Doc title and set display name
        base_name = os.path.splitext(display_name)[0]
        file_metadata['name'] = base_name
    else:
        # Standard file
        file_metadata['name'] = display_name
    
    # Pass explicit source mime if needed (critical for conversion)
    media = MediaFileUpload(file_path, resumable=True, mimetype=source_mime)
    
    print(f"Uploading {display_name}...")
    try:
        # supportsAllDrives=True is critical if the target is a Shared Drive
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink',
            supportsAllDrives=True
        ).execute()
        print(f"✅ Uploaded ({file.get('id')})")
        return file
    except Exception as e:
        print(f"❌ Failed to upload {name}: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 upload_to_drive.py <slug>")
        sys.exit(1)

    slug = sys.argv[1]
    today = datetime.date.today().strftime("%Y-%m-%d")
    folder_name = f"{today}_{slug}"
    
    # 1. Authenticate (User OAuth)
    service = authenticate()
    
    # 2. Create Subfolder
    if not PARENT_FOLDER_ID:
        print("Error: GOOGLE_DRIVE_FOLDER_ID not found in environment.")
        sys.exit(1)
        
    project_folder_id = create_folder(service, folder_name, PARENT_FOLDER_ID)
    
    # Standard Subfolders
    clips_folder_id = create_folder(service, "clips", project_folder_id)
    images_folder_id = create_folder(service, "images", project_folder_id)

    # Placeholder for clips
    placeholder_path = "DROP_VEO_CLIPS_HERE.txt"
    if not os.path.exists(placeholder_path):
        with open(placeholder_path, "w") as f:
            f.write("スマホからVeoで生成した動画（mp4）を、ファイル名の先頭を数字にしてここにアップロードしてください。\n例: 1.mp4, 2_bridge.mp4 ...")
    upload_file(service, placeholder_path, clips_folder_id)

    # 3. Upload Assets
    assets = [
        (f"public/videos/{slug}.mp4", project_folder_id),            # V3 Video
        (f"content/scripts/{slug}.md", project_folder_id),           # Script
        (f"content/prompts/{slug}_prompts.md", project_folder_id),   # Prompts
        (f"content/social/{slug}_posts.md", project_folder_id),      # Social Posts
        (f"content/articles/{slug}.md", project_folder_id)           # Article Draft
    ]
    
    # Sync Seed Images to images/ folder
    seed_pattern = f"projects/{slug}/images/*.png"
    seeds = glob.glob(seed_pattern)
    for seed in seeds:
        assets.append((seed, images_folder_id))

    # Sync Article WebP to images/ folder
    image_pattern = f"public/images/articles/{slug}/*.webp"
    articles_images = glob.glob(image_pattern)
    for img in articles_images:
        assets.append((img, images_folder_id))

    for asset_path, target_id in assets:
        if os.path.exists(asset_path):
            upload_file(service, asset_path, target_id)
        else:
            print(f"⚠️ Skipping missing asset: {asset_path}")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
