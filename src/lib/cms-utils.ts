import { getSiteConfig } from '@/site.config';
import { getCategoryLabelSync } from './utils';
import { getList } from './microcms';
import { getLocalArticles } from './local-articles';
import { Article } from '@/types';

/**
 * Get the category label for the current site configuration.
 * This is a SERVER ONLY utility because it uses getSiteConfig().
 */
export async function getCategoryLabel(category: string): Promise<string> {
    const siteConfig = await getSiteConfig();
    return getCategoryLabelSync(category, siteConfig);
}

/**
 * Fetch and merge articles from both local markdown and MicroCMS.
 * Filters by brand (siteId) and category.
 */
export async function getUnifiedArticles(siteId: string, options?: { limit?: number, category?: string }): Promise<Article[]> {
    // 1. Fetch Local Articles
    const localArticles = getLocalArticles().filter(a => a.site_id === siteId);

    // 2. Fetch MicroCMS Articles
    // Note: getList already filters by siteId based on site.config
    const cmsData = await getList('articles', {
        limit: options?.limit || 20,
    });
    const cmsArticles = cmsData.contents as Article[];

    // 3. Merge and Sort
    // We use slug as unique identifier to avoid duplicates if mirrored
    const allArticlesMap = new Map<string, Article>();

    // Add local first (priority)
    localArticles.forEach(a => allArticlesMap.set(a.slug, a));

    // Add CMS (overwrites local if same slug, or just adds new ones)
    cmsArticles.forEach(a => allArticlesMap.set(a.slug, a));

    let allArticles = Array.from(allArticlesMap.values());

    // 4. Apply Category Filter
    if (options?.category) {
        allArticles = allArticles.filter(a => a.category?.includes(options.category!));
    }

    // 5. Final Sort by Date (publishedAt)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // 6. Apply Limit
    if (options?.limit) {
        return allArticles.slice(0, options.limit);
    }

    return allArticles;
}
