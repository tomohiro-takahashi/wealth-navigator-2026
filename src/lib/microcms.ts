import { createClient } from 'microcms-js-sdk';
import dna from '../../src/dna.config.json'; // Direct import from src

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "service-domain-placeholder",
    apiKey: process.env.MICROCMS_API_KEY || "api-key-placeholder",
});

const SITE_ID = dna.identity.siteId || 'wealth_navigator';

// Helper to merge filters
const mergeFilters = (existingFilters?: string) => {
    const siteFilter = `site_id[equals]${SITE_ID}`;
    if (!existingFilters) return siteFilter;
    return `(${existingFilters})[and]${siteFilter}`;
};

// ブログ一覧を取得
export const getList = async (endpoint: string = "articles", queries?: Record<string, unknown>) => {
    try {
        const mergedQueries = {
            ...queries,
            filters: mergeFilters(queries?.filters as string),
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
    const mergedQueries = {
        ...queries,
        filters: mergeFilters(queries?.filters as string),
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
        const listData = await client.getList({
            endpoint,
            queries: {
                filters: mergeFilters(`slug[equals]${slug}`),
                limit: 1
            },
        });
        if (listData.contents.length === 0) {
            return null;
        }
        return listData.contents[0];
    } catch (error) {
        console.error("MicroCMS getDetailBySlug error:", error);
        return null; // notFound() needs to be handled by caller
    }
};
