import os
import sys
import glob
import asyncio
import textwrap
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts

# MoviePy v2 imports
# We import everything but will use specific classes
from moviepy import *
# Note: In MoviePy v2, effects are often in 'vfx' or applied via 'with_effects'
# but 'concatenate_videoclips' etc are top level.

# --- Configuration ---
# --- Configuration ---
VOICE = "ja-JP-KeitaNeural"  # Male Voice
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920

# Usage: python3 auto_video_maker.py [slug]

SLUG = sys.argv[1] if len(sys.argv) > 1 else None
if not SLUG:
    print("Error: Slug required.")
    sys.exit(1)

BASE_DIR = os.getcwd()
SCRIPT_PATH = os.path.join(BASE_DIR, "content/scripts", f"{SLUG}.md")
IMAGE_DIR = os.path.join(BASE_DIR, "public/images/articles")
OUTPUT_DIR = os.path.join(BASE_DIR, "public/videos")
SUBTITLE_DIR = os.path.join(BASE_DIR, "content/social") # Save subtitles to social folder for easy access
OUTPUT_FILE = os.path.join(OUTPUT_DIR, f"{SLUG}.mp4")
SUBTITLE_FILE = os.path.join(SUBTITLE_DIR, f"【自動生成動画テロップ】{SLUG}.txt")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
if not os.path.exists(SUBTITLE_DIR):
    os.makedirs(SUBTITLE_DIR)

# 3. Script Parsing
def parse_script(file_path):
    if not os.path.exists(file_path):
        print(f"Script not found: {file_path}")
        return []
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split('\n')
    audio_segments = []
    
    in_table = False
    for line in lines:
        if "|" in line and "Audio" in line and "Visual" in line:
            in_table = True
            continue
        if in_table and "|" in line:
            if "---" in line: continue
            parts = [p.strip() for p in line.split("|")]
            # Standard: | Time | Visual | Audio | Note | -> ["", "Time", "Vis", "Aud", "Note", ""]
            if len(parts) >= 4:
                audio_text = parts[3]
                if audio_text and audio_text != "Audio":
                    # Clean Audio text
                    # Remove timestamps, Visual descriptions, or "Narration 1:" prefixes
                    # Regex to remove "Narration X:", "Narrator:", "Visual:" etc
                    import re
                    # Remove "Narration 1:", "Narrator 1:", "M1:", "Male:", etc.
                    cleaned_text = re.sub(r'^(Narration\s*\d*:|Narrator:|Man:|Woman:|Visual:|Audio:)\s*', '', audio_text, flags=re.IGNORECASE)
                    
                    # Remove any markdown bold/italic
                    cleaned_text = cleaned_text.replace('**', '').replace('*', '')
                    cleaned_text = cleaned_text.strip()
                    
                    if cleaned_text:
                        audio_segments.append(cleaned_text)
                    
    return audio_segments

# 4. Audio Generation
async def generate_audio_file(text, index):
    outfile = f"tmp_voice_{index}.mp3"
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(outfile)
    return outfile

# 5. Ken Burns / Image Processing
def process_image_for_clip(img_path, duration):
    # Load Image
    clip = ImageClip(img_path).with_duration(duration)
    
    # Resize to occupy height (Vertical Video)
    # We want to fill 1080x1920
    # First resize to height=1920
    clip = clip.resized(height=VIDEO_HEIGHT)
    
    # Crop Center to 1080
    w = clip.w
    if w > VIDEO_WIDTH:
        x_center = w / 2
        clip = clip.cropped(x1=x_center - VIDEO_WIDTH/2, y1=0, width=VIDEO_WIDTH, height=VIDEO_HEIGHT)
    
    return clip

# --- MAIN ---
async def main():
    print(f"🎬 Starting Video Engine V3 (Clean) for: {SLUG}")
    print(f"🎙️  Voice: {VOICE}")
    
    # 1. Get Segments
    segments = parse_script(SCRIPT_PATH)
    if not segments:
        print("No script segments found!")
        return

    # 2. Get Images
    images = glob.glob(os.path.join(IMAGE_DIR, f"{SLUG}*.webp"))
    if not images:
        images = glob.glob(os.path.join(IMAGE_DIR, "*.webp"))
    images.sort()
    
    if not images:
        print("No images found!")
        return

    final_clips = []
    temp_files = []
    subtitle_lines = []

    print(f"Processing {len(segments)} segments...")

    for i, text in enumerate(segments):
        # A. Audio
        audio_path = await generate_audio_file(text, i)
        temp_files.append(audio_path)
        
        # Load Audio Clip to get duration
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration
        
        # B. Image (Cycle)
        img_path = images[i % len(images)]
        img_clip = process_image_for_clip(img_path, duration)
        
        # C. Composite (No Captions)
        # Just Image with Audio
        video_segment = img_clip.with_audio(audio_clip)
        
        final_clips.append(video_segment)
        subtitle_lines.append(text)
        print(f"  [{i+1}/{len(segments)}] Generated clip ({duration:.1f}s): {text[:20]}...")

    # 3. Concatenate
    print("Combining clips...")
    final_video = concatenate_videoclips(final_clips)
    
    # 4. Write Video File
    print(f"Writing to {OUTPUT_FILE}...")
    final_video.write_videofile(
        OUTPUT_FILE, 
        fps=24, 
        codec='libx264', 
        audio_codec='aac',
        threads=4
    )
    
    # 5. Write Subtitle File
    print(f"Writing subtitles to {SUBTITLE_FILE}...")
    with open(SUBTITLE_FILE, "w", encoding="utf-8") as f:
        f.write("\n\n".join(subtitle_lines))
        
    print("✅ Video Generation V3 Complete!")
    
    # Cleanup
    for f in temp_files:
        if os.path.exists(f):
            os.remove(f)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
