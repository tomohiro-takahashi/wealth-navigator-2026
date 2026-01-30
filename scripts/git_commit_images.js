const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Commits and pushes images for a specific slug.
 * @param {string} slug - The article slug.
 * @returns {boolean} True if successful or no changes, false on error.
 */
function commitAndPushImages(slug) {
  const imagePath = `public/images/articles/${slug}`;
  const fullImagePath = path.resolve(process.cwd(), imagePath);
  
  if (!fs.existsSync(fullImagePath)) {
    console.warn(`[GIT] Directory not found, skipping ghost commit: ${imagePath}`);
    return true;
  }

  try {
    // 1. Add files
    console.log(`[GIT] Adding images: ${imagePath}`);
    execSync(`git add ${imagePath}`, { stdio: 'inherit' });

    // 2. Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.includes(imagePath)) {
      console.log(`[GIT] No changes detected in ${imagePath}.`);
      return true;
    }

    // 3. Commit
    console.log(`[GIT] Committing changes...`);
    execSync(`git commit -m "Add images for ${slug} [skip ci]" --allow-empty`, { stdio: 'inherit' });

    // 4. Push
    console.log(`[GIT] Pushing to origin...`);
    execSync(`git push origin main`, { stdio: 'inherit' });
    
    console.log(`✅ [GIT] Images committed and pushed for ${slug}`);
    return true;
  } catch (e) {
    console.error(`❌ [GIT] Git operation failed: ${e.message}`);
    return false;
  }
}

module.exports = { commitAndPushImages };
