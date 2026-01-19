
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');

const ARTICLES_DIR = path.resolve(__dirname, '../content/articles');
const IMPORT_SCRIPT = path.resolve(__dirname, 'import_articles.js');

function main() {
    console.log('--- Starting Batch Ingest ---');

    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error(`Directory not found: ${ARTICLES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files.`);

    for (const file of files) {
        const filePath = path.join(ARTICLES_DIR, file);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter } = matter(rawContent);

        if (!frontmatter.title) {
            console.warn(`[SKIP] No title in ${file}`);
            continue;
        }

        // Derive Slug from Filename or Frontmatter
        // Filename format: YYYY-MM-DD-slug.md
        let slug = frontmatter.slug;
        if (!slug) {
            const match = file.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
            if (match) {
                slug = match[1];
            } else {
                slug = file.replace('.md', '');
            }
        }

        console.log(`\nImporting: ${frontmatter.title} (${slug})`);

        // Construct Command
        // output content path is the source path
        // We pass the RAW file path to import_articles.js.
        // import_articles.js strips frontmatter internally.

        // Args: --file <path> --title <title> --slug <slug> --category <cat> ...
        let cmd = `node "${IMPORT_SCRIPT}" --file "${filePath}" --title "${frontmatter.title}" --slug "${slug}"`;

        if (frontmatter.category) cmd += ` --category "${frontmatter.category}"`;
        if (frontmatter.excerpt) cmd += ` --meta_description "${frontmatter.excerpt}"`;
        // expert_tip is inside content (HTML), import_articles.js extracts it.

        try {
            execSync(cmd, { stdio: 'inherit' });
        } catch (e) {
            console.error(`[ERROR] Failed to import ${file}`);
        }
    }

    console.log('\n--- Batch Ingest Complete ---');
    console.log('Now running: npm run generate:images to ensure images exist...');

    try {
        execSync('npm run generate:images', { stdio: 'inherit' });
    } catch (e) {
        console.error('[ERROR] generate:images failed');
    }
}

main();
