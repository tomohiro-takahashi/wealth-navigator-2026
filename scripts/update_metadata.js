
const { createClient } = require('microcms-js-sdk');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

const ARTICLE_ID = 'w_qtsaoz5s';

const payload = {
    meta_title: '【2026年予測】金利ある世界の「勝者」と「敗者」：インフレで笑う富裕層',
    meta_description: '2026年、金利ある世界への大転換（Sea Change）が到来します。インフレ時代に現金を抱え続けるリスクと、富裕層が実践する「ゴールド（金）」への資産シフト戦略を、30年の経験を持つストラテジストが冷徹に解説します。',
    keywords: '不動産投資,2026年,金利上昇,インフレ,ゴールド,金相場,Sea Change,ハワード・マークス,資産防衛'
};

client.update({
    endpoint: 'articles',
    contentId: ARTICLE_ID,
    content: payload,
})
    .then(() => console.log(`Successfully updated metadata for article ${ARTICLE_ID}`))
    .catch((err) => console.error('Failed to update metadata:', err));
