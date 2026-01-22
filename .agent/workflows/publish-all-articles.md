---
description: Process all 5 brands (Wealth, Kominka, Flip, Legacy, Subsidy) to generate articles and video prompts.
---

This workflow executes the full article generation pipeline across all five media brands in a single run.

# Step 1: Sequential Branding Processing

// turbo-all

1. **Execute Master Orchestrator**:
   - Run `node scripts/publish-all.js [CATEGORY]`.
   - **Goal**: Loop through all 5 brands and for each:
     - Switch configuration (`switch_brand.js`).
     - Select a topic from the brand's strategy file.
     - Generate Blueprint (`brain_architect.js`).
     - Generate Content (`brain_builder.js`).
     - Ingest to MicroCMS (`import_articles.js`).
     - Generate & Link Images (`generate:images`).
     - Generate Video Prompts (`brain_architect.js --type video`).

# Step 2: Integrated Batch Video Crawler

// turbo

1. **Crawl for Manually Uploaded Clips**:
   - Run `npm run batch:process`.
   - **Goal**: After generating new article projects, check all project folders (including older ones) for new manual video clips and process them.

# Step 3: Completion

---

To run: `/publish-all-articles [CATEGORY]`

- `[CATEGORY]` (Optional): domestic, overseas, column (Default: column)
- This is ideal for daily scheduled runs or "one-click" site-wide updates.
