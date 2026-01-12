import type { MicroCMSImage } from "microcms-js-sdk";

export type CTAMode = 'line' | 'simulation' | 'request';

export type Category = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
    slug: string;
};

// 以前のCategory型はPropertyで使われている可能性があるため残すが、Articleでは使用しない
// もしPropertyも同様に変更されているならProperty定義も変える必要があるが、指示は「記事」についてのみに見える。
// ただし、一貫性のためにPropertyも確認したいが、指示通りArticleを優先変更。

export type ArticleCategory = 'domestic' | 'overseas' | 'column';

export type Article = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    slug: string; // URL用スラッグ追加
    content: string;
    eyecatch?: MicroCMSImage;
    category?: ArticleCategory[]; // 複数選択 (domestic, overseas, column)
    target_yield?: string; // 想定利回り
    expert_tip?: string;   // プロの解説
    author?: string;       // 執筆者
    cta_mode?: 'simulation' | 'line' | 'list'; // listに変更
    math_enabled?: boolean; // 数式有効化
};

export type Property = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
    price: string;
    location: string;
    images: MicroCMSImage[];
    description: string;
    category?: Category; // 国内/海外などの区別用
    // 詳細項目
    price_local?: string;       // 現地通貨価格 (例: "25,000,000 PHP")
    price_jpn?: string;         // 円換算目安 (例: "6,800万円")
    unit_price_sqm?: string;    // 1BRあたりの平米単価
    installment_48?: boolean;   // 48ヶ月分割払いの可否
    infrastructure_dist?: string; // インフラ進捗距離 (例: "地下鉄Ortigas南駅から徒歩5分")
    status_badge?: string[];    // ステータスバッジ ("非公開", "先行募集", "利回り特選" など)
};
