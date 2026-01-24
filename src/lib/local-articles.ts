import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article } from '@/types';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export function getLocalArticles(): Article[] {
    if (!fs.existsSync(articlesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(articlesDirectory);
    const allArticlesData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            // Remove ".md" from file name to get id (or use slug from frontmatter)
            const id = fileName.replace(/\.md$/, '');

            // Read markdown file as string
            const fullPath = path.join(articlesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const matterResult = matter(fileContents);

            // Extract date from filename if available (YYYY-MM-DD-slug)
            const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : new Date().toISOString();

            // Combine the data with the id
            let categories = matterResult.data.category || [];
            if (typeof categories === 'string') {
                categories = [categories];
            }

            return {
                id,
                slug: id, 
                title: matterResult.data.title || matterResult.content.match(/^# (.*)/m)?.[1] || 'No Title',
                content: matterResult.content,
                eyecatch: {
                    url: matterResult.data.coverImage || `/images/articles/${id}/01.webp`,
                    height: 600,
                    width: 800
                },
                category: categories,
                publishedAt: date,
                updatedAt: date,
                badge_text: matterResult.data.badge_text,
                is_featured: matterResult.data.is_featured,
                site_id: matterResult.data.site_id || (fileName.includes('wealth') ? 'wealth' : 'subsidy'),
            } as Article;
        });

    // Sort articles by date
    return allArticlesData.sort((a, b) => {
        if (a.publishedAt < b.publishedAt) {
            return 1;
        } else {
            return -1;
        }
    });
}
