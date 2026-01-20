---
description: Automated High-Quality Content Publishing Pipeline with Context-Aware Imaging
---

This workflow automates the research, writing, image generation, and ingestion of high-quality articles for Wealth Navigator, strictly adhering to the strategies in `libs/brain/titans_knowledge.md`.

# Step 0: Logic Branching (Mode Selection)
// turbo
1. **Analyze Input Arguments**:
   - Check if `[THEME]` argument is provided.
   - **IF [THEME] IS PROVIDED (High-Quality Blueprint Mode)**:
     - **Goal**: Create a strategic blueprint for manual execution with Claude.
     - **Action**:
       1. Read `libs/brain/titans_knowledge.md`.
       2. Analyze `[THEME]` using Titan's Logic to derive a "Contrarian Angle".
       3. Create a new markdown file `blueprints/[THEME].md` using the exact format below.
         ```markdown
          # Role Definition
          あなたは「30年の経験を持つ冷徹な不動産ストラテジスト」です。
          以下の【知識ベース】と【構成案】に基づき、記事を執筆してください。

          ## Context: Titan's Knowledge (前提知識)
          (※ここに、`libs/brain/titans_knowledge.md` から、今回のテーマに関連する重要な部分を抜粋・要約して埋め込む)

          ## Blueprint (記事構成案)
          **Title:** [タイトル案]
          **Angle:** [独自の切り口]

          ### Outline
          1. **Introduction**
             * [狙いと内容]
          2. **Body Paragraphs**
             * [各章の構成と、引用すべきデータ]
          3. **Conclusion**
             * [結論とアクション]

          ## Instructions (執筆ルール)
          * トーン: 「だ・ある調」。断定的かつ冷徹に。
          * ターゲット: 富裕層。安っぽい表現はNG。
          * 禁止事項: 「いかがでしたか？」等のWebライター表現。

          **【Volume & Depth (ボリューム規定)】**
          1. **Target Length:** 日本語で **5,000文字程度** を目指すこと（3,000文字以上必須）。
          2. **No Summaries:** 要約や箇条書きで逃げず、論理（Logic）と背景（Context）を文章で丁寧に説明すること。
          3. **Deep Dive:** 各見出し（H2）に対して、最低でも3〜4つのパラグラフを費やし、Titanの知識ベースにある「歴史的背景」や「データ」を必ず引用して補強すること。

          **【CRITICAL: Tool Use Policy (厳守事項)】**
          1. **Tool Execution Forbidden:** あなたはMicroCMSへの入稿ツールやAPI権限を持っている可能性がありますが、**今回は絶対に使用しないでください。**
          2. **Output Only:** 記事の執筆のみを行い、結果を**Markdown形式のテキスト**として出力してください。
          3. **Stop Sequence:** 記事本文を書き終えたら、いかなるツールも呼び出さずに処理を終了してください。
          ```
       4. **Stop Workflow Example**. Do not proceed to Step 1.
   - **IF [THEME] IS NOT PROVIDED (Auto Mode)**:
     - Proceed to Step 0.5 (Strategic Alignment) below.

# Step 0.5: Strategic Alignment & Deep Research (Titan's Logic - Auto Mode)
// turbo
1. **Read Strategic Knowledge Base**:
   - Read `libs/brain/titans_knowledge.md` to deeply understand the strategic thought process.
   - **Persona Adoption**: Write the article assuming **YOU are the author** of this knowledge base (The Cold-Hearted Real Estate Strategist). Use this logic as the foundation for your writing.
2. Select a topic from `.agent/rules/strategy.md` based on `[CATEGORY]`. Define `[TOPIC]` and `[TOPIC_SLUG]`.
3. **Apply Titan's Logic by Category** (Use as primary reference):
   - **If [CATEGORY] is 'domestic'**:
     - Logic: Reference "Deny new build premium" & "Vintage superiority".
     - Tone: "Selection/Replacement period" (not "still rising").
   - **If [CATEGORY] is 'overseas'**:
     - Logic: Use "Yen depreciation risk" & "Ray Dalio's diversification".
     - Tone: "Shelter for assets" (defense).
   - **If [CATEGORY] is 'column'**:
     - Logic: Use "Howard Marks' market cycle" & "Investor psychology".
     - Tone: "Contrarian courage" (empathize with anxiety but lead with pro logic).
4. **Deep Research**:
   - Calculate "Real Interest Rate" using 1.0% Policy Rate vs 2026 Inflation Forecast.
   - Search for specific deadlines like "Manila Subway land acquisition completion March 2026" or "Reiwa 8 tax reform implementation date".
5. Identify "Information Asymmetry" (Win for the informed, Loss for the uninformed).

# Step 1: High-Precision HTML Writing
// turbo
1. Read `.agent/rules/writing-guide.md` to understand Persona and Logic.
2. Write the article content with **Strict Rules**:
   - **Length**: Minimum 2,500 words.
   - **Format**: Standard HTML (`h2`, `h3`, `p`, `ul`, `li`, `table`, `strong`). **NO Markdown**.
   - **Expert Perspective**:
     - Separate a 200-char "Expert Tip" (30 years experience, authoritative).
     - Inside content, use `<div class="expert-box">【30年のプロの眼】...</div>` for emphasis.
   - **Comparison Table**: Mandatory `<table>` comparing "Old/New", "Japan/Overseas", or "Pre-build/RFO".
   - **Images**: Insert exactly 3 placeholders in effective locations:
     - 1. `<div class="image-wrapper"><img src="IMAGE_ID_1" alt="[Scene Description]"></div>`
     - 2. `<div class="image-wrapper"><img src="IMAGE_ID_2" alt="[Scene Description]"></div>`
     - 3. `<div class="image-wrapper"><img src="IMAGE_ID_3" alt="[Scene Description]"></div>`
   - **Output**:
     - Save HTML content to `content_draft.html`.
     - Save the "Expert Tip" text to `expert_tip.txt`.
     - **Save Metadata**:
       - Create `metadata.json` with the following JSON structure:
         ```json
         {
           "meta_title": "[SEO optimized title, max 32 chars]",
           "meta_description": "[Compelling summary, max 120 chars]",
           "keywords": "[comma,separated,keywords,max,5]"
         }
         ```

# Step 2: Context-Aware Image Generation
// turbo
1. **Context Analysis (Crucial)**:
   - Read `content_draft.html`.
   - Locate each `IMAGE_ID_X`.
   - Analyze the **surrounding text (preceding and following paragraphs)** to understand the exact context (e.g., specific location, time of day, atmosphere, subject matter).
   - *Instruction to Orchestrator*: Do not just use specific generic terms. If the text describes "BGC night view", generate a night view. If it describes "Luxury Condo Interior", generate an interior.
2. Generate Image 1:
   - Prompt: "[Context extracted from text around IMAGE_ID_1] + photorealistic luxury style. Cinematic lighting, 8k resolution".
   - Output: `[Artifact Path]`
   - **Optimize**: Run `node scripts/optimize_image.js [Artifact Path] public/images/tmp/[TOPIC_SLUG]_1.webp`.
3. Generate Image 2:
   - Prompt: "[Context extracted from text around IMAGE_ID_2] + photorealistic luxury style. Cinematic lighting, 8k resolution".
   - Output: `[Artifact Path]`
   - **Optimize**: Run `node scripts/optimize_image.js [Artifact Path] public/images/tmp/[TOPIC_SLUG]_2.webp`.
4. Generate Image 3:
   - Prompt: "[Context extracted from text around IMAGE_ID_3] + photorealistic luxury style. Cinematic lighting, 8k resolution".
   - Output: `[Artifact Path]`
   - **Optimize**: Run `node scripts/optimize_image.js [Artifact Path] public/images/tmp/[TOPIC_SLUG]_3.webp`.

# Step 3: Git Image Sync (Production Release)
// turbo
1. **Stage Images**:
   - Run `git add public/images/tmp/`.
2. **Commit**:
   - Run `git commit -m "Deploy optimized WebP images for auto-generated article: [TOPIC]"`.
3. **Push**:
   - Run `git push origin main`.
   - This triggers Vercel deployment, making the images accessible in production via Git (resolving the 401 issue/MicroCMS limit).

# Step 4: Auto Ingestion (Text Only)
// turbo
1. Read `expert_tip.txt` into a variable.
2. Read `metadata.json` and parse `meta_title`, `meta_description`, and `keywords`.
3. Execute ingestion script:
   - Command: `node scripts/import_articles.js --file content_draft.html --title "[TOPIC]" --category "[CATEGORY]" --slug "[TOPIC_SLUG]" --expert_tip "$(cat expert_tip.txt)" --target_yield "0" --meta_title "META_TITLE_FROM_JSON" --meta_description "META_DESC_FROM_JSON" --keywords "KEYWORDS_FROM_JSON" --images public/images/tmp/[TOPIC_SLUG]_1.webp public/images/tmp/[TOPIC_SLUG]_2.webp public/images/tmp/[TOPIC_SLUG]_3.webp`

# Step 5: Full Video Production
// turbo
1. **Generate Script & Prompts (Gemini)**:
   - Run `node scripts/generate_video_script.js content_draft.html [TOPIC_SLUG]`.
   - This saves Script (`content/scripts/[TOPIC_SLUG].md`) and Prompts (`content/prompts/[TOPIC_SLUG]_prompts.md`).
2. **Auto-Generate Video (Python)**:
   - Run `python3 scripts/auto_video_maker.py [TOPIC_SLUG]`.
   - This outputs: `public/videos/[TOPIC_SLUG].mp4`.

# Step 6: Social Media Strategy
1. **Generate X (Twitter) Posts**:
   - Run `python3 scripts/generate_social_posts.py [TOPIC_SLUG]`.
   - Output: `content/social/[TOPIC_SLUG]_posts.md` (Summary/Question/Impact patterns).

# Step 7: Google Drive Backup
// turbo
1. **Upload Assets**:
   - Run `python3 scripts/upload_to_drive.py [TOPIC_SLUG]`.
   - This creates a folder `YYYY-MM-DD_[slug]` in Drive and uploads:
     - 【動画】 Video (.mp4)
     - 【台本】 Script (Doc)
     - 【プロンプト】 Prompts (Doc)
     - 【SNS】 Social Posts (Doc)

# Step 8: Completion
---
To run: `/publish-article [CATEGORY] [THEME]`
* `[CATEGORY]`: domestic, overseas, column
* `[THEME]` (Optional): Specify a topic for "Blueprint Mode". If omitted, runs "Auto Mode".
