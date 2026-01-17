import { createClient } from 'microcms-js-sdk';

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "service-domain-placeholder",
    apiKey: process.env.MICROCMS_API_KEY || "api-key-placeholder",
});

// ブログ一覧を取得
export const getList = async (endpoint: string = "articles", queries?: Record<string, unknown>) => {
    try {
        const listData = await client.getList({
            endpoint,
            queries,
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
    const detailData = await client.getListDetail({
        endpoint,
        contentId,
        queries,
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
            queries: { filters: `slug[equals]${slug}`, limit: 1 },
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
