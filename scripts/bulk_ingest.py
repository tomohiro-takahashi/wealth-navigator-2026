
import os
import json
import subprocess
import sys

# Configuration
GENERATED_DIR = "generated_content"
ARTIFACTS_DIR = "/Users/takahashitomohiro/.gemini/antigravity/brain/c1445810-c7f6-4201-b2b0-7494297804bb"
SCRIPT_PATH = "scripts/import_articles.js"

# Map article indexes to their image filenames in artifacts dir
# (In a real scenario, we'd store this mapping in the metadata or strictly name files.
#  Here I reconstruct it based on the logic I used: overseas_1_1, etc.)
ARTICLE_MAP = [
    {"id": "01", "prefix": "overseas_1"},
    {"id": "02", "prefix": "overseas_2"},
    {"id": "03", "prefix": "overseas_3"},
    {"id": "04", "prefix": "domestic_1"},
    {"id": "05", "prefix": "domestic_2"},
    {"id": "06", "prefix": "domestic_3"},
    {"id": "07", "prefix": "column_1"},
]

def find_images(prefix):
    images = []
    # Find files in artifacts dir starting with prefix
    for f in sorted(os.listdir(ARTIFACTS_DIR)):
        if f.startswith(prefix) and f.endswith(".png"):
            images.append(os.path.join(ARTIFACTS_DIR, f))
    return images[:3] # Ensure max 3

def main():
    print("Starting Bulk Ingestion...")
    
    for item in ARTICLE_MAP:
        meta_file = os.path.join(GENERATED_DIR, f"{item['id']}_metadata.json")
        content_file = os.path.join(GENERATED_DIR, f"{item['id']}_content.html")
        
        if not os.path.exists(meta_file):
            print(f"Skipping {item['id']}: Metadata not found")
            continue
            
        with open(meta_file, 'r') as f:
            meta = json.load(f)
            
        images = find_images(item['prefix'])
        
        print(f"Processing: {meta['title']}")
        print(f"  - Images found: {len(images)}")
        
        cmd = [
            "node", SCRIPT_PATH,
            "--file", content_file,
            "--title", meta["title"],
            "--category", meta["category"],
            "--slug", meta["slug"],
            "--expert_tip", meta["expert_tip"],
            "--target_yield", meta.get("target_yield", "0"),
            # SEO & Video Scripts (passed as flags supported by updated script if applicable, 
            # if script allows unknown flags or we need to update script)
            # Note: The current import_articles.js threw error on video_script_a.
            # We will COMMENT OUT the fields that caused 400 error until schema is fixed.
            # "--video_script_a", meta["video_scripts"]["script_15s"],
            # "--video_script_b", meta["video_scripts"]["script_60s"],
            "--meta_title", meta["seo"]["meta_title"],
            "--meta_description", meta["seo"]["meta_description"],
            "--keywords", meta["seo"]["keywords"],
        ]
        
        # Add images
        if images:
            cmd.append("--images")
            cmd.extend(images)
            
        try:
            subprocess.check_call(cmd)
            print(f"  [SUCCESS] Ingested {item['id']}")
        except subprocess.CalledProcessError as e:
            print(f"  [ERROR] Failed to ingest {item['id']}: {e}")
            # Continue to next
            
if __name__ == "__main__":
    main()
