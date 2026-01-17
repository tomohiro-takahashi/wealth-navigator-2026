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
            return {
                id,
                slug: id, // Use filename as slug for now
                title: matterResult.data.title || 'No Title',
                content: matterResult.content,
                eyecatch: {
                    url: matterResult.data.coverImage || '/luxury-apartment.png',
                    height: 600,
                    width: 800
                },
                category: matterResult.data.category || [],
                publishedAt: date,
                updatedAt: date,
                badge_text: matterResult.data.badge_text,
                is_featured: matterResult.data.is_featured,
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
