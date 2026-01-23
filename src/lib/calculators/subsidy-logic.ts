/**
 * Subsidy Navigator - Calculation Engine
 */

export type SubsidyRenovationPart = 'window' | 'bath' | 'kitchen' | 'heater' | 'other';

export type SubsidyInput = {
    prefecture?: string;
    buildingType: 'house' | 'apartment';
    buildingAge: 'new' | 'mid' | 'old'; // 10, 20, 21+
    renovationParts: SubsidyRenovationPart[];
    householdStatus: ('child' | 'elderly' | 'none')[];
};

export type SubsidyItem = {
    id: string;
    name: string;
    maxAmount: number;
    description: string;
    category: string;
    imageUrl: string;
};

export type SubsidyResult = {
    totalMaxAmount: number;
    applicableSubsidies: SubsidyItem[];
    input: SubsidyInput;
};

const SUBSIDY_DATABASE: Record<SubsidyRenovationPart, SubsidyItem> = {
    window: {
        id: 'window-reno-2026',
        name: '先進的窓リノベ2026',
        maxAmount: 2000000,
        description: '断熱改修で冷暖房費を大幅に削減。冬は暖かく、夏は涼しいお家に。内窓設置やガラス交換が対象です。',
        category: '2026年最新版',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRCAD_-DgW1Ou3u3c9XJlgeYxfXCY455KDPga-n8ZrROu9S84yadx-qyJuGvxWQNKLmQ_OJAvWWnj_8vt4AjJrQ-pxjqtIPTQ71vgd-o_2bnfJLCmXmre_gFuZ-dSPwycZOXs4uUCjd9c6COLfA_qEXppggyOdlyEr1tfI-RhrQobKPE3T3AT8JWp34LdWDEi1Q23TRot0fbjxtgEob1t7w7ggDX-D_GxwilvTIDS_RWKjRbQl9nmpWjYjaMmKTqXQVYe5NMuotRg'
    },
    heater: {
        id: 'heater-save-2026',
        name: '給湯省エネ事業2026',
        maxAmount: 200000,
        description: '高効率給湯器（エコキュート等）への交換で、毎月の光熱費を節約。環境にも家計にも優しい選択です。',
        category: '省エネ家電',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNQDSFWT7uZoojFWuMDNGpe63sMRHfbkvijF7tYzUEZj_7n99Y5cqYOkVAcWEUZzI9FydAQ6L7ZcVc1CUjkCnga0m-ucLQjqXcz5ftV04r3M2eQrgYFtDnIopMMEQvSOCsEPa_qIR-gvJwFREYj6lzoXGlA9wIFlXg44kxAtEwEXi7LIB6BakO7ae6ZFl21PM8fGRj9r0orCqSJO-S1cfVqueaA0CEeW0a-_Untx4UwWW0Gn8OaNDSUBI2qww3K7St9LFN0Q-dK6I'
    },
    kitchen: {
        id: 'eco-home-kitchen',
        name: '子育てエコホーム支援（キッチン）',
        maxAmount: 600000,
        description: '対面キッチンへの改修や、節湯水栓、ビルトイン食洗機の設置が補助対象となります。',
        category: '幅広いリフォーム',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA63xs-NGm4DVot6nepZWDTzwhreOgk9rmSsMTgGmX75vZaEXX4QuQsYdTaGWxARf8c4N0C4I4wGlzWonrlf0xG4h2qQq5cidMrWmz4-8kjQyhtXlIn9zeMucv_-e0JcaiqnMYf6ocGixoIqxhdXUz_j1PvBzK-vhY6y1TqbrKIFwUKkQdWWp2LbIUFB6wXLpeT7tETpYzdWS92era1JuPQWJ1C0vZzf0_oWccw8A4_EdpRaYjj35ODJiHiktIVGzk4GGmambBszmQ'
    },
    bath: {
        id: 'eco-home-bath',
        name: '子育てエコホーム支援（お風呂）',
        maxAmount: 600000,
        description: '高断熱浴槽や浴室乾燥機の設置、手すりの取り付けなどのバリアフリー化が対象です。',
        category: '快適リフォーム',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA63xs-NGm4DVot6nepZWDTzwhreOgk9rmSsMTgGmX75vZaEXX4QuQsYdTaGWxARf8c4N0C4I4wGlzWonrlf0xG4h2qQq5cidMrWmz4-8kjQyhtXlIn9zeMucv_-e0JcaiqnMYf6ocGixoIqxhdXUz_j1PvBzK-vhY6y1TqbrKIFwUKkQdWWp2LbIUFB6wXLpeT7tETpYzdWS92era1JuPQWJ1C0vZzf0_oWccw8A4_EdpRaYjj35ODJiHiktIVGzk4GGmambBszmQ'
    },
    other: {
        id: 'barrier-free',
        name: 'バリアフリー改修支援',
        maxAmount: 200000,
        description: '段差解消、通路幅の拡張、滑り止め設置など、誰もが安心して暮らせる住まいづくりを支援します。',
        category: '安心安全',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA63xs-NGm4DVot6nepZWDTzwhreOgk9rmSsMTgGmX75vZaEXX4QuQsYdTaGWxARf8c4N0C4I4wGlzWonrlf0xG4h2qQq5cidMrWmz4-8kjQyhtXlIn9zeMucv_-e0JcaiqnMYf6ocGixoIqxhdXUz_j1PvBzK-vhY6y1TqbrKIFwUKkQdWWp2LbIUFB6wXLpeT7tETpYzdWS92era1JuPQWJ1C0vZzf0_oWccw8A4_EdpRaYjj35ODJiHiktIVGzk4GGmambBszmQ'
    }
};

export class SubsidyCalculator {
    /**
     * 計算実行
     */
    static calculate(input: SubsidyInput): SubsidyResult {
        const applicable: SubsidyItem[] = [];
        let total = 0;

        // リフォーム箇所に基づく判定
        input.renovationParts.forEach(part => {
            const subsidy = SUBSIDY_DATABASE[part];
            if (subsidy) {
                applicable.push(subsidy);
                
                // 概算の受給額（最大値ではなく、現実的な平均値を一旦セット）
                let estimated = 0;
                switch(part) {
                    case 'window': estimated = 800000; break;
                    case 'kitchen': estimated = 300000; break;
                    case 'bath': estimated = 300000; break;
                    case 'heater': estimated = 100000; break;
                    default: estimated = 50000;
                }
                total += estimated;
            }
        });

        // 属性による加算（子育て・高齢者）
        const hasBoost = input.householdStatus.some(s => s === 'child' || s === 'elderly');
        if (hasBoost && total > 0) {
            total = Math.round(total * 1.2); // 20%増しとするダミーロジック
        }

        return {
            totalMaxAmount: Math.min(total, 4000000), // 上限設定
            applicableSubsidies: applicable,
            input
        };
    }
}
