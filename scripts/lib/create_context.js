const fs = require('fs');
const path = require('path');

/**
 * Creates a new Context object for a brand and category.
 * @param {string} brand - The brand ID (e.g., 'wealth')
 * @param {string} category - The category ID (e.g., 'column')
 * @param {string|null} slug - Optional slug. If null, a timestamped slug will be generated.
 * @returns {Object} The created Context object.
 */
function createContext(brand, category, slug = null) {
  // 1. dna.configをロード
  const dnaPath = path.resolve(process.cwd(), `src/dna.config.${brand}.json`);
  if (!fs.existsSync(dnaPath)) {
    throw new Error(`DNA config not found for brand: ${brand}`);
  }
  const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf-8'));

  // 2. カテゴリのバリデーション
  const valid_categories = dna.valid_categories || (dna.categories ? Object.keys(dna.categories) : []);
  if (!valid_categories.includes(category)) {
    throw new Error(
      `Invalid category "${category}" for brand "${brand}". ` +
      `Valid categories: ${valid_categories.join(', ')}`
    );
  }

  // 3. Contextオブジェクト生成
  const workId = slug || `${brand}_${Date.now()}`;
  const context = {
    brand: dna.brand || brand,
    siteId: dna.site_id || dna.identity?.site_id || brand,
    siteName: dna.identity?.name || dna.site_name || brand,
    validCategories: valid_categories,
    category: category,
    slug: workId,
    paths: {
      bible: path.resolve(process.cwd(), dna.paths?.bible || dna.bible_path),
      strategy: path.resolve(process.cwd(), dna.paths?.strategy || dna.strategy_path),
      dna: dnaPath,
      workDir: path.resolve(process.cwd(), `./content/.work/${workId}`),
      draftsDir: path.resolve(process.cwd(), `./content/01_drafts/${workId}`),
      imagedDir: path.resolve(process.cwd(), `./content/02_imaged/${workId}`),
      directedDir: path.resolve(process.cwd(), `./content/03_directed/${workId}`),
      publishedDir: path.resolve(process.cwd(), `./content/05_published/${workId}`),
    },
    images: {
      baseUrl: dna.images?.base_url || '/images/articles',
      fallback: dna.images?.fallback || '/images/common/fallback.webp',
      generated: [],
    },
    meta: {
      title: null,
      description: null,
      author: dna.meta?.default_author || "編集部",
      ogSiteName: dna.meta?.og_site_name || (dna.identity?.name || dna.site_name || brand),
    },
    status: {
      brain: null,    // 'success' | 'failed' | null
      vision: null,
      director: null,
      gateway: null,
    },
    errors: [],
    createdAt: new Date().toISOString(),
  };

  // 4. 作業ディレクトリ作成
  if (!fs.existsSync(context.paths.workDir)) {
    fs.mkdirSync(context.paths.workDir, { recursive: true });
  }

  // 5. Contextをファイルに保存（デバッグ・リカバリ用）
  fs.writeFileSync(
    path.join(context.paths.workDir, 'context.json'),
    JSON.stringify(context, null, 2)
  );

  return context;
}

/**
 * Loads an existing Context object from a work directory path or slug.
 * @param {string} workDirOrSlug - Path to context.json or slug name.
 * @returns {Object} The loaded Context object.
 */
function loadContext(workDirOrSlug) {
  let contextPath;
  if (workDirOrSlug.includes('context.json')) {
    contextPath = path.resolve(workDirOrSlug);
  } else if (fs.existsSync(workDirOrSlug) && fs.statSync(workDirOrSlug).isDirectory()) {
    contextPath = path.join(path.resolve(workDirOrSlug), 'context.json');
  } else {
    contextPath = path.resolve(process.cwd(), `./content/.work/${workDirOrSlug}/context.json`);
  }
  
  if (!fs.existsSync(contextPath)) {
    throw new Error(`Context not found: ${contextPath}`);
  }
  return JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
}

/**
 * Saves the Context object to its work directory.
 * @param {Object} context - The Context object to save.
 */
function saveContext(context) {
  const contextPath = path.join(context.paths.workDir, 'context.json');
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
}

module.exports = { createContext, loadContext, saveContext };
