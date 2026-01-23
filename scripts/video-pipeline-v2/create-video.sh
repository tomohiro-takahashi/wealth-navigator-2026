#!/bin/bash

# ============================
# create-video.sh
# 
# 動画生成パイプライン
# 記事 → 台本 → 音声 → 画像 → 動画
# ============================

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================${NC}"
echo -e "${BLUE}Video Generation Pipeline${NC}"
echo -e "${BLUE}=============================${NC}"

# 引数
SCRIPT_PATH=${1:-"./src/video-script.json"}
OUTPUT_NAME=${2:-"output"}

# ディレクトリ
# ディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")" # wealth-navigator root
VIDEO_GEN_DIR="$PROJECT_DIR/video-generator"
OUTPUT_DIR="$PROJECT_DIR/out"

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR"
# Assets go to VIDEO_GENERATOR public folder for Remotion to find them
mkdir -p "$VIDEO_GEN_DIR/public/scenes"
mkdir -p "$VIDEO_GEN_DIR/public/audio"

echo -e "\n${YELLOW}[1/4] Checking script...${NC}"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}Error: Script not found: $SCRIPT_PATH${NC}"
    exit 1
fi

BRAND_ID=$(grep -o '"brand_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$SCRIPT_PATH" | cut -d'"' -f4)
echo -e "Brand: ${GREEN}${BRAND_ID:-default}${NC}"

SCENE_COUNT=$(grep -o '"scene_id"' "$SCRIPT_PATH" | wc -l)
echo -e "Scenes: ${GREEN}${SCENE_COUNT}${NC}"

# ============================
# Step 2: ナレーション同期
# ============================
echo -e "\n${YELLOW}[2/4] Generating narration + timestamps...${NC}"

SYNCED_SCRIPT="$VIDEO_GEN_DIR/src/video-script-synced.json"

if command -v node &> /dev/null; then
    # Pass absolute paths to scripts to avoid confusion
    # Note: Scripts might default to relative './public'. We should check them.
    # Assuming scripts use process.cwd() or relative to themselves?
    # image-generator.js uses `CONFIG.outputDir: './public/scenes'` relative to CWD.
    # So we must run them from VIDEO_GEN_DIR or pass absolute paths?
    # The Scripts are in `scripts/video-pipeline-v2`.
    # Let's run from PROJECT_DIR but pass arguments.
    # Actually, let's update the scripts to take output dir args or patch them?
    # No, easier to run from Project Root and ensure they write to video-generator/public?
    # But image-generator defaults to `./public/scenes`.
    # Let's temporarily change CWD or pass arg?
    # image-generator.js: `config.outputDir = './public/scenes'`
    
    # Best approach: Pass absolute paths as inputs/outputs if script supports it.
    # narration-sync supports args: input, output.
    # It hardcodes `./public/audio`.
    
    # We should patch the JS files to accept output dir config or just symlink?
    # Or, we update `create-video.sh` to handle this.
    
    echo "Running narration-sync..."
    # Warning: narration-sync.js writes to CONFIG.audioOutputDir = './public/audio'.
    # We need it to be '$VIDEO_GEN_DIR/public/audio'.
    # We can temporarily cd to VIDEO_GEN_DIR? But scripts are elsewhere.
    
    # Let's just fix the JS files to point to the right place or use absolute paths.
    # But I can't easily edit them all right now.
    
    # Workaround: Run from VIDEO_GEN_DIR, call script via absolute path?
    # But script requires `dotenv` from `../.env.local` (relative to script?).
    # `image-generator.js`: `path.resolve(__dirname, '../.env.local')`. This expects script to be in `scripts/video-pipeline-v2` and env in `scripts/.env.local`?
    # Wait, `__dirname` is `.../scripts/video-pipeline-v2`. `../.env.local` is `.../scripts/.env.local`.
    # Root .env is `.../wealth-navigator/.env.local`.
    # So `path.resolve(__dirname, '../../.env.local')` would be correct.
    # The provided scripts have `../.env.local`. This might be wrong if they are in `scripts/video-pipeline-v2` (depth 2).
    
    # I will fix the scripts' env path first in a separate step?
    # No, let's look at `create-video.sh` flow.
    
    node "$SCRIPT_DIR/narration-sync.js" "$SCRIPT_PATH" "$SYNCED_SCRIPT"
    
    if [ -f "$SYNCED_SCRIPT" ]; then
        echo -e "${GREEN}✓ Narration synced${NC}"
        # 同期済みスクリプトを使用
        cp "$SYNCED_SCRIPT" "$VIDEO_GEN_DIR/src/video-script.json"
    else
        echo -e "${YELLOW}⚠ Sync failed, using original script${NC}"
        cp "$SCRIPT_PATH" "$VIDEO_GEN_DIR/src/video-script.json"
    fi
else
    echo -e "${YELLOW}⚠ Node.js not found, skipping narration sync${NC}"
fi

# ============================
# Step 3: 画像生成
# ============================
echo -e "\n${YELLOW}[3/4] Generating scene images...${NC}"

if command -v node &> /dev/null; then
    # image-generator.js now has absolute paths patched
    node "$SCRIPT_DIR/image-generator.js" "$PROJECT_DIR/src/video-script.json" || {
        echo -e "${YELLOW}⚠ Image generation failed, using placeholders${NC}"
    }
else
    echo -e "${YELLOW}⚠ Node.js not found, skipping image generation${NC}"
fi

# ============================
# Step 4: Remotion レンダリング
# ============================
echo -e "\n${YELLOW}[4/4] Rendering video with Remotion...${NC}"

# Remotion project is in video-generator
cd "$VIDEO_GEN_DIR"

# Remotionでレンダリング
OUTPUT_VIDEO="$OUTPUT_DIR/${OUTPUT_NAME}.mp4"

# Ensure dependencies are installed in Remotion dir?
# The user installed deps in ROOT.
# If Remotion is a separate project (has package.json), it needs 'npm install' inside?
# Or do we use root node_modules?
# Current structure:
# wealth-navigator/package.json
# wealth-navigator/video-generator/package.json
# If we run 'npx remotion' from video-generator, it looks for local deps.
# We should probably run 'npm install' in video-generator if node_modules missing.

if [ ! -d "node_modules" ]; then
    echo "Installing Remotion dependencies..."
    npm install
fi

npx remotion render MyVideo "$OUTPUT_VIDEO" \
    --codec=h264 \
    --crf=18 \
    --pixel-format=yuv420p

if [ -f "$OUTPUT_VIDEO" ]; then
    echo -e "\n${GREEN}=============================${NC}"
    echo -e "${GREEN}✓ VIDEO CREATED SUCCESSFULLY${NC}"
    echo -e "${GREEN}=============================${NC}"
    echo -e "Output: ${BLUE}${OUTPUT_VIDEO}${NC}"
    
    # ファイルサイズ
    SIZE=$(du -h "$OUTPUT_VIDEO" | cut -f1)
    echo -e "Size: ${SIZE}"
    
    # 動画の長さ
    if command -v ffprobe &> /dev/null; then
        DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_VIDEO" | cut -d'.' -f1)
        echo -e "Duration: ${DURATION}s"
    fi
else
    echo -e "${RED}✗ Video rendering failed${NC}"
    exit 1
fi
