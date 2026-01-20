#!/bin/bash
set -e

# Usage: sh scripts/create_article_video.sh "Article Title" "article-slug" [article-html-path]

TITLE="$1"
SLUG="$2"
# Optional 3rd arg: path to source content for brain generation. Default content_draft.html
CONTENT_PATH="${3:-content_draft.html}"

if [ -z "$TITLE" ] || [ -z "$SLUG" ]; then
  echo "Usage: $0 \"Title\" \"slug\" [content_path]"
  exit 1
fi

VIDEO_GENERATOR_DIR="video-generator"
OUTPUT_DIR="public/videos"
TEMP_AUDIO_PATH="$VIDEO_GENERATOR_DIR/public/audio.mp3"
FINAL_VIDEO_PATH="$OUTPUT_DIR/${SLUG}.mp4"
SCRIPT_JSON_PATH="$VIDEO_GENERATOR_DIR/src/video-script.json" # Target path for Bundling
PROMPTS_TXT_PATH="content/prompts/${SLUG}_video_prompts.txt"

mkdir -p "$OUTPUT_DIR"
mkdir -p "content/prompts"

echo "🧠 1. Running Video Director Brain..."
# Output JSON to the source dir of Remotion application so it gets bundled
node scripts/brain_video_director.js "$CONTENT_PATH" "$SCRIPT_JSON_PATH"

echo "📝 1b. Extracting Visual Prompts..."
node scripts/extract_prompts.js "$SCRIPT_JSON_PATH" "$PROMPTS_TXT_PATH"

echo "🎤 2. Generating Audio (Narration)..."
# Extract narration text from the generated JSON
NARRATION_TEXT=$(node scripts/get_narration.js "$SCRIPT_JSON_PATH")


# ... existing TTS generation ...
source "$VIDEO_GENERATOR_DIR/venv/bin/activate"
python "$VIDEO_GENERATOR_DIR/generate_voice.py" --text "$NARRATION_TEXT" --output "$TEMP_AUDIO_PATH" --voice "ja-JP-KeitaNeural"

echo "⏱️ 2b. Measuring Audio Duration..."
AUDIO_DURATION=$(python scripts/measure_audio.py "$TEMP_AUDIO_PATH")
echo "   Audio Length: ${AUDIO_DURATION}s"

echo "📝 2c. Updating Video Script Duration..."
node scripts/update_json_duration.js "$SCRIPT_JSON_PATH" "$AUDIO_DURATION"

echo "🎬 3. Rendering Video..."
cd "$VIDEO_GENERATOR_DIR"

npm run render -- --overwrite
cd ..

echo "📦 4. Finalizing..."
mv "$VIDEO_GENERATOR_DIR/out/video.mp4" "$FINAL_VIDEO_PATH"
echo "✅ Video Production Complete: $FINAL_VIDEO_PATH"

echo "☁️ 5. Uploading to Drive (Folder: $TITLE)..."

# Upload Video
UPLOAD_NAME="【ショート動画】${TITLE}.mp4"
node scripts/upload_to_drive.js "$FINAL_VIDEO_PATH" "$TITLE" "$UPLOAD_NAME"

# Upload Prompts
PROMPT_UPLOAD_NAME="【動画生成用プロンプト】${TITLE}.txt"
node scripts/upload_to_drive.js "$PROMPTS_TXT_PATH" "$TITLE" "$PROMPT_UPLOAD_NAME"

# Upload Article Images
echo "☁️ 5b. Uploading Article Images..."
IMAGE_DIR="public/images/articles/${SLUG}"
if [ -d "$IMAGE_DIR" ]; then
    for img in "$IMAGE_DIR"/*.png; do
        [ -e "$img" ] || continue
        IMG_NAME=$(basename "$img")
        UPLOAD_IMG_NAME="【挿入画像】${IMG_NAME}"
        node scripts/upload_to_drive.js "$img" "$TITLE" "$UPLOAD_IMG_NAME"
    done
else
    echo "⚠️ No images found in $IMAGE_DIR"
fi
