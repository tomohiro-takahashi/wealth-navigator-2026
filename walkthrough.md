# Video Director Upgrade# Walkthrough - Multi-Tenant Media Factory

## Verification Results (Frontend & Content Logic)

### 1. Dynamic Frontend Theming
- **Colors**: `src/app/layout.tsx` now injects `--color-primary` and `--color-accent` from the active DNA.
- **CTA**: `DynamicCTA.tsx` dynamically renders the brand-specific offer (Title, Text, Link) defined in `dna.config.json`.

### 2. Multi-Tenant Content Pipeline
We verified the end-to-end flow for all 4 new brands:
- **Kominka**: Imported "Kominka Test: Find" (Category: `find`)
- **Legacy**: Imported "Legacy Test: Mindset" (Category: `mindset`)
- **Flip**: Imported "Flip Test: Source" (Category: `source`)
- **Subsidy**: Imported "Subsidy Test: Learn" (Category: `learn`)

All brands successfully map their CLI categories to the correct CMS setup.
**Update**: Verified that `site_id` is correctly auto-detected from `dna.config` and applied to articles (e.g., `kominka_frontier`, `legacy_guard`).

## Next Steps
- Verify Frontend visually at `localhost:3000`.
- Verify Video Generation pipeline for new brands.
Web記事（Article）からショート動画用の台本を自動生成し、ナレーション音声を合成・尺合わせまで行う一連のフロー「Video Director」を実装しました。
また、**「Wealth Navigator Manifesto」** の完全納品と、**「Malaysia JS-SEZ Tax Scheme」** の記事公開完了を行いました。

## Key Updates & Delivery Status

### 1. Malaysia JS-SEZ Tax Scheme (New Article)
- **Status**: ✅ **Published** (Live on Production)
- **URL**: [Malaysia JS-SEZ Tax Scheme](https://wealth-navigator-2026.vercel.app/articles/malaysia-js-sez-tax-scheme)
- **Content Fix**: "2026年時点" の視点に修正済み (Hotfix applied to MicroCMS).
- **Video**: ✅ **Completed** (Both Automated MP4 & Manual Video Prompts)
  - **Auto**: Remotionによる自動生成版 (`.mp4`)
  - **Manual**: 「8秒カット法」用プロンプト・音声・台本一式
- **Social Posts**: ✅ **Completed** (Uploaded to Drive)

### 2. Wealth Navigator Manifesto
- **Status**: ✅ **Fully Completed**
- **Video**: Generated with fixed male voice (`ja-JP-KeitaNeural`) and archived.
- **Archive**: All assets (article, images, video, script) uploaded to Google Drive.

## Technical Changes & New Standards

### 1. Video Production: "8-Second Cut Rule" (New!)
手動生成AIツール（Runway/Pika/Sora等）との親和性を高めるため、台本生成ロジックを刷新しました。
- **Structure**: 60秒動画 = "7.5秒 × 8シーン" の固定構成。
- **Visual Prompt**: 全シーンに **"No text, no subtitles, no words"** を強制付与。
- **Workflow**:
  1. `brain_architect.js` で8秒刻みのプロンプトとナレーション台本を生成。
  2. ユーザーはプロンプトを生成AIに入力し、8秒の映像素材を8本作る。
  3. 編集ソフトで素材とナレーション（生成済み）を結合し、テロップを乗せる。

### 2. Script Generation (`scripts/brain_architect.js`)
- **Video Mode**: `node scripts/brain_architect.js [slug] --type video`
- **Output**: 8秒カット法に基づいたJSONおよびMarkdown台本。

### 3. Audio Processing (`scripts/process_audio.js`)
- **Voice**: Python (`edge-tts`) を呼び出し (`ja-JP-KeitaNeural` 男性音声に固定)。
- **Sync**: ナレーション音声も生成されるため、手動編集時の素材として利用可能。

### 4. Content Production (Writer & Artist)
- **Writing**: `scripts/brain_builder.js` により、ブループリントからHTML記事を執筆。
- **Images**: `scripts/generate-images.ts` により、Geminiでプロンプト生成 -> Google Imagen 4.0 で画像生成 -> MicroCMSへ自動入稿。

## Validation (Drive Archive)
以下の成果物を生成し、Google Driveへ格納しました。

### 1. Manifesto Project (`2026-01-21_wealth-navigator-manifesto`)
- [Drive Link](https://drive.google.com/drive/folders/14gdAascP8SOkT5lbKCehKdN5-6y1FZmv)
- Contains: Video (`.mp4`), Script (`.md`), Images (`.webp`), Article Source (`.html`)

### 2. Malaysia Project (`2026-01-21_malaysia-js-sez-tax-scheme`)
- Contains: Article Source (`.md`), Images (`.webp`), Converted Script Link (`.gdoc`)
- **Video**: `【動画】malaysia-js-sez-tax-scheme.mp4`
- **Script**: `【プロンプト】malaysia-js-sez-tax-scheme_prompts`
- **Social**: `【SNS】malaysia-js-sez-tax-scheme_posts`

## How to Run (Workflow)
1. **Architect** (Blueprint & Video Script):
   ```bash
   node scripts/brain_architect.js [slug] --type video
   ```
   *Generating optimized 8s-cut prompts...*
2. **Writer** (Content Gen):
   ```bash
   node scripts/brain_builder.js [slug]
   ```
3. **Ingest & Images** (CMS & Art):
   ```bash
   node scripts/import_articles.js ... # Content
   npx tsx scripts/generate-images.ts  # Images
   ```
4. **Render Video (Optional / Auto)**:
   ```bash
   npm run render # in video-generator
   ```
5. **Archive & Deploy**:
   ```bash
   python3 scripts/upload_to_drive.py [slug]
   git add . && git commit -m "feat: content" && git push origin main
   ```
