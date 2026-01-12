import { createClient } from 'microcms-js-sdk';

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
    throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}

if (!process.env.MICROCMS_API_KEY) {
    throw new Error('MICROCMS_API_KEY is required');
}

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
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
