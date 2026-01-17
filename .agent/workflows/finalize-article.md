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

# Step 2: Image Generation
1. **Analyze Content**:
   - Read the saved file (Title and Introduction).
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
   - Read the saved article file.
   - Look for placeholders like `IMAGE_ID_1`, `IMAGE_ID_2`, etc.
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

# Step 6: Completion
1. Notify variables:
   - `[MicroCMS Preview URL]`
2. Send final confirmation message to the user: "Article finalized, uploaded to MicroCMS, and images pushed to Production."

---
To run: `/finalize-article [ARTICLE_CONTENT]`
