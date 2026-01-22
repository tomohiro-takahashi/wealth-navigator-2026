import os
import datetime
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

# Wrapper to handle both .env and .env.local
if not os.getenv("GOOGLE_DRIVE_FOLDER_ID"):
    load_dotenv()

PARENT_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    """Shows basic usage of the Drive v3 API.
    Prints the names and ids of the first 10 files the user has access to.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("❌ Error: credentials.json not found.")
                print("Please download your OAuth 2.0 Client credentials from Google Cloud Console")
                print("and save them as 'credentials.json' in this directory.")
                sys.exit(1)
                
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
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
        
    folder_id = create_folder(service, folder_name, PARENT_FOLDER_ID)
    
    # 3. Upload Assets
    # 1. Video Script (.md) -> Google Doc
    # 2. Video Prompts (.md) -> Google Doc
    # 3. Video File (.mp4) -> Raw
    # 4. Article Images (.webp) -> Raw
    
    assets = [
        f"public/videos/{slug}.mp4",            # Video
        f"content/scripts/{slug}.md",           # Script
        f"content/prompts/{slug}_prompts.md",   # Prompts
        f"content/social/{slug}_posts.md",      # Social Posts
        f"content/social/【自動生成動画テロップ】{slug}.txt", # Subtitles
        f"content/articles/{slug}.md"           # Article (Final Content)
    ]
    
    # Image (Cover)
    # Check for images in subfolder first (new structure)
    image_pattern = f"public/images/articles/{slug}/*.webp"
    images = glob.glob(image_pattern)
    if not images:
        # Fallback to old flat structure
        image_pattern = f"public/images/articles/{slug}*.webp"
        images = glob.glob(image_pattern)

    if images:
        assets.extend(images)
    else:
        # Fallback for cover if named differently (e.g. just slug.webp)
        cover_path = f"public/images/articles/{slug}.webp"
        if os.path.exists(cover_path):
            assets.append(cover_path)

    # 5. Video Seed Images
    seed_pattern = f"projects/{slug}/images/*.png"
    seeds = glob.glob(seed_pattern)
    if seeds:
        assets.extend(seeds)

    for asset in assets:
        if os.path.exists(asset):
            upload_file(service, asset, folder_id)
        else:
            print(f"⚠️ Skipping missing asset: {asset}")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
