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
VOICE = "ja-JP-NanamiNeural"  # Creating a human-like feel
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FONT_SIZE = 60
STROKE_WIDTH = 4

# Usage: python3 auto_video_maker.py [slug]

SLUG = sys.argv[1] if len(sys.argv) > 1 else None
if not SLUG:
    print("Error: Slug required.")
    sys.exit(1)

BASE_DIR = os.getcwd()
SCRIPT_PATH = os.path.join(BASE_DIR, "content/scripts", f"{SLUG}.md")
IMAGE_DIR = os.path.join(BASE_DIR, "public/images/articles")
OUTPUT_DIR = os.path.join(BASE_DIR, "public/videos")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, f"{SLUG}.mp4")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# 1. Font Finder for macOS/Linux to avoid Tofu
def get_japanese_font_path():
    """Find a suitable Japanese font on the system."""
    # Priority list for macOS
    candidates = [
        "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",  # Hiragino Sans W6 (Bold)
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/JejuGothic.ttf",           # Fallback
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/AppleSDGothicNeo.ttc"
    ]
    
    for path in candidates:
        if os.path.exists(path):
            return path
            
    # Fallback to system default (might fail for JP)
    return "Arial" 

FONT_PATH = get_japanese_font_path()
print(f"Using Font: {FONT_PATH}")

# 2. Text Clip Generator (Using Pillow for Robustness vs ImageMagick)
def create_caption_clip(text, duration, width=VIDEO_WIDTH, height=VIDEO_HEIGHT):
    """
    Creates a MoviePy ImageClip containing the captioned text.
    Uses PIL to draw text with stroke (background transparent).
    """
    # Create a transparent image
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Load Font
    try:
        font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
    except Exception:
        font = ImageFont.load_default()
    
    # Wrap text
    # Estimate chars per line (rough)
    max_chars = 16
    lines = textwrap.wrap(text, width=max_chars)
    
    # Calculate text position (Bottom Center)
    # Start drawing from bottom - margin
    # Full height of text block
    line_h = FONT_SIZE * 1.5
    total_text_h = len(lines) * line_h
    start_y = height - total_text_h - 200 # 200px margin from bottom
    
    for i, line in enumerate(lines):
        # Calculate text width to center
        # bbox = draw.textbbox((0, 0), line, font=font)
        # w = bbox[2] - bbox[0]
        # h = bbox[3] - bbox[1]
        # Pillow < 10 might verify textsize
        w = draw.textlength(line, font=font)
        x = (width - w) / 2
        y = start_y + (i * line_h)
        
        # Draw Stroke (Black)
        draw.text((x-STROKE_WIDTH, y), line, font=font, fill="black")
        draw.text((x+STROKE_WIDTH, y), line, font=font, fill="black")
        draw.text((x, y-STROKE_WIDTH), line, font=font, fill="black")
        draw.text((x, y+STROKE_WIDTH), line, font=font, fill="black")
        
        # Draw Text (White)
        draw.text((x, y), line, font=font, fill="white")
    
    # Convert PIL image to numpy array for MoviePy
    img_np = np.array(img)
    
    # Create Clip
    txt_clip = ImageClip(img_np).with_duration(duration)
    return txt_clip

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
                    # Remove any markdown bold/italic
                    audio_text = audio_text.replace('**', '').replace('*', '')
                    audio_segments.append(audio_text)
                    
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
    
    # Ken Burns Effect (Slow Zoom)
    # In MoviePy v2, simple zoom can be tricky.
    # We'll stick to a static beautiful crop for stability in "Auto" mode, 
    # OR try a safe transform if available.
    # For V2 reliability, let's keep it static but ensure high quality.
    # If the user INSISTS on zoom, we can try `vfx.scroll` or similar, but often it breaks compilation.
    
    return clip

# --- MAIN ---
async def main():
    print(f"🎬 Starting Video Engine V2 for: {SLUG}")
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
        
        # C. Caption (Subtitle)
        txt_clip = create_caption_clip(text, duration)
        
        # D. Composite
        # Image at bottom, Text on top
        video_segment = CompositeVideoClip([img_clip, txt_clip]).with_duration(duration)
        video_segment = video_segment.with_audio(audio_clip)
        
        final_clips.append(video_segment)
        print(f"  [{i+1}/{len(segments)}] Generated clip ({duration:.1f}s): {text[:20]}...")

    # 3. Concatenate
    print("Combining clips...")
    final_video = concatenate_videoclips(final_clips)
    
    # 4. Write File
    print(f"Writing to {OUTPUT_FILE}...")
    final_video.write_videofile(
        OUTPUT_FILE, 
        fps=24, 
        codec='libx264', 
        audio_codec='aac',
        threads=4
    )
    
    print("✅ Video Generation V2 Complete!")
    
    # Cleanup
    for f in temp_files:
        if os.path.exists(f):
            os.remove(f)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
