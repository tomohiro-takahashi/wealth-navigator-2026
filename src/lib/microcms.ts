import { createClient } from 'microcms-js-sdk';
import { getSiteConfig } from '@/site.config';

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "service-domain-placeholder",
    apiKey: process.env.MICROCMS_API_KEY || "api-key-placeholder",
});

// Helper to merge filters
const mergeFilters = (siteId: string, existingFilters?: string) => {
    const siteFilter = `site_id[contains]${siteId}`;
    if (!existingFilters) return siteFilter;
    return `(${existingFilters})[and]${siteFilter}`;
};

/**
 * Get the current site_id dynamically.
 * This can only be called in Server Components/Server Actions.
 */
const getCurrentSiteId = async () => {
    try {
        const config = await getSiteConfig();
        return config.site_id || 'wealth';
    } catch (e) {
        // Fallback for build time or non-server contexts
        return process.env.NEXT_PUBLIC_BRAND || 'wealth';
    }
};

// ブログ一覧を取得
export const getList = async (endpoint: string = "articles", queries?: Record<string, unknown>) => {
    try {
        const siteId = await getCurrentSiteId();
        const mergedQueries = {
            ...queries,
            filters: mergeFilters(siteId, queries?.filters as string),
        };

        const listData = await client.getList({
            endpoint,
            queries: mergedQueries,
        });
        return listData;
    } catch (error) {
        console.error("MicroCMS getList error:", error);
        return { contents: [], totalCount: 0, offset: 0, limit: 10 };
    }
};

// ブログ詳細を取得
export const getDetail = async (
    contentId: string,
    endpoint: string = "articles",
    queries?: Record<string, unknown>
) => {
    const siteId = await getCurrentSiteId();
    const mergedQueries = {
        ...queries,
        filters: mergeFilters(siteId, queries?.filters as string),
    };
    const detailData = await client.getListDetail({
        endpoint,
        contentId,
        queries: mergedQueries,
    });
    return detailData;
};

// スラッグから記事詳細を取得
export const getDetailBySlug = async (
    slug: string,
    endpoint: string = "articles"
) => {
    try {
        const siteId = await getCurrentSiteId();
        const listData = await client.getList({
            endpoint,
            queries: {
                filters: mergeFilters(siteId, `slug[equals]${slug}`),
                limit: 1
            },
        });
        if (listData.contents.length === 0) {
            return null;
        }
        return listData.contents[0];
    } catch (error) {
        console.error("MicroCMS getDetailBySlug error:", error);
        return null;
    }
};
