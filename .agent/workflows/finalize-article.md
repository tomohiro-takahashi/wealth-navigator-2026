---
description: Finalize an article by saving content and generating a cover image
---

This workflow takes a raw markdown article, saves it, generates matching images, deploys content to MicroCMS, and syncs images to Git/Vercel. One command to rule them all.

# Step 1: Save Article

1. **Parse Content**:
   - The `[ARTICLE_CONTENT]` is the argument provided in the command.
   - Extract the title from the first line (e.g. `# Title`).
   - Generate a filename: `content/articles/YYYY-MM-DD-[theme].md` (Use current date and a kebab-case slug of the title/theme).
2. **Save File**:
   - Save the `[ARTICLE_CONTENT]` to the generated path.
   - Ensure the directory `content/articles/` exists.

# Step 1.5: Content Polishing (AI Structure)

1. **Apply Logic & Format**:
   - Run `python3 scripts/polish_article.py content/articles/[filename-slug].md`.
   - **Gemini 2.0 Flash** analyzes the raw content and:
     - Formats it into strict HTML (`h2`, `h3`, `p`).
     - Extracts "Expert Tips" into `<div class="expert-box">`.
     - Inserts 3 comparison tables if data exists.
     - Inserts `IMAGE_ID_1`, `IMAGE_ID_2`, `IMAGE_ID_3` placeholders.
   - **Result**: The file is overwritten with the high-quality HTML version, and brand personality is applied dynamically based on the `site_id` found in frontmatter.

# Step 2: Image Generation

1. **Analyze Content**:
   - Read the polished file.
   - Create a DALL-E 3 prompt based on: "Abstract, Luxury, Minimalist artwork representing [Theme of the article]".
2. **Generate Image**:
   - Use `generate_image` tool.
   - **Optimize & Save**:
     - Run `node scripts/optimize_image.js [Artifact Path] public/images/articles/[filename-slug].webp`.
3. **Update Frontmatter**:
   - Edit the saved article file.
   - Add or update the `coverImage:` field in the YAML frontmatter to point to `/images/articles/[filename-slug].webp`.
   - If no frontmatter exists, add it at the top:
     ```yaml
     ---
     title: [Title]
     coverImage: /images/articles/[filename-slug].webp
     ---
     ```

# Step 3: Body Image Generation

1. **Scan Content**:
   - Read the polished article file.
   - Look for placeholders `IMAGE_ID_1`, `IMAGE_ID_2`, `IMAGE_ID_3`.
2. **Process Each Placeholder**:
   - **Context Analysis**: Read the paragraph before and after the placeholder.
   - **Generate Image**:
     - Prompt: "[Context] + photorealistic luxury style. Cinematic lighting, 8k resolution".
   - Output: `[Artifact Path]`
   - **Optimize & Save**:
     - Run `node scripts/optimize_image.js [Artifact Path] public/images/articles/[filename-slug]_[index].webp`.
   - **Replace in File**:
     - Replace `IMAGE_ID_X` (or the `img src` pointing to it) with the actual path `/images/articles/[filename-slug]_[index].webp`.
     - Ensure the syntax is valid Markdown image `![alt](/path)` or HTML `<img src="/path">` depending on the file format.

# Step 4: MicroCMS Deployment

1. **Execute Ingestion**:
   - Run `node scripts/deploy_markdown.js [content/articles/FILENAME.md]`.
   - This uploads the text to MicroCMS. (Images generated in Step 2/3 are referenced as local paths).

# Step 5: Git Image Sync (Production Release)

// turbo

1. **Stage Images**:
   - Run `git add public/images/articles/`.
2. **Commit**:
   - Run `git commit -m "Deploy images for article: [Theme]"`.
3. **Push**:
   - Run `git push origin main`.
   - This triggers Vercel deployment, making the images accessible in production (resolving the 401 issue).

# Step 6: Manual Video Workflow Prep

1. **Generate 8-Second Cut Prompts (Gemini)**:
   - Run `node scripts/brain_architect.js [filename-slug] --type video`.
   - **Goal**: Generate "No Text" prompts tailored for Manual Generation tools.
   - **Output**:
     - JSON Prompts (8 scenes x 7.5s)
     - Narration Script
     - Audio Assets (Synthesized voice for timeline placement)
2. **Auto-Render Draft Video (Optional)**:
   - Run `npm run render` in `video-generator/`.
   - **Goal**: Create a draft MP4 with kinetic text and narration to preview the flow.
   - **Output**: `public/videos/[filename-slug].mp4`
3. **Note**:
   - Actual video rendering can be done Manually using external AI tools.
   - The generated `audio.mp3` or script can be used for editing.

# Step 7: Social Media Strategy

1. **Generate X (Twitter) Posts**:
   - Run `python3 scripts/generate_social_posts.py [filename-slug]`.
   - Output: `content/social/[filename-slug]_posts.md` (Summary/Question/Impact patterns).

# Step 8: Google Drive Backup

1. **Upload Assets**:
   - Run `python3 scripts/upload_to_drive.py [filename-slug]`.
   - This creates a folder `YYYY-MM-DD_[slug]` in Drive and uploads:
     - 【動画】 Video (.mp4)
     - 【台本】 Script (Doc)
     - 【プロンプト】 Prompts (Doc)
     - 【SNS】 Social Posts (Doc)

# Step 9: Completion

1. Notify variables:
   - `[MicroCMS Preview URL]`
2. Send final confirmation message to the user: "Article finalized, polished, uploaded to MicroCMS, and images pushed to Production."

---

To run: `/finalize-article [ARTICLE_CONTENT]`
