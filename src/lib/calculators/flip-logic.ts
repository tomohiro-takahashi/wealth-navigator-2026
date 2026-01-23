/**
 * Flip Logic - Profitability Calculator Engine
 */

export type FlipInput = {
    purchasePrice: number;    // 物件取得価格（万円）
    renovationCost: number;   // リノベーション費用（万円）
    expectedResalePrice: number; // 想定再販価格 (ARV)（万円）
    riskBufferRate: number;   // 予備費率 (0.1, 0.15, 0.2)
    miscExpenses?: number;    // 諸経費（万円） ※オプション
};

export type FlipResult = {
    input: FlipInput;
    calculation: {
        totalInvestment: number;      // 総投資額
        miscExpenses: number;         // 算出された諸経費
        grossProfit: number;          // 粗利
        netProfit: number;            // 純利益（予備費・経費後）
        roi: number;                  // 投資利益率 (%)
        breakEvenPrice: number;       // 損益分岐点となる仕入れ価格
    };
    judgment: {
        id: 'BUY' | 'NEGOTIATE' | 'PASS';
        label: string;
        color: string;
        message: string;
        description: string;
    };
    calculatedAt: string;
};

const CONFIG = {
    defaultMiscExpenseRate: 0.07, // 取得価格の7%を諸経費とする
    thresholds: {
        buy: 15,          // 15%以上 → BUY
        negotiate: 5,     // 5%以上 → NEGOTIATE
        // 5%未満 → PASS
    }
};

export class FlipLogicCalculator {
    /**
     * 収益性計算を実行
     */
    static calculate(input: FlipInput): FlipResult {
        const { purchasePrice, renovationCost, expectedResalePrice, riskBufferRate } = input;
        
        // 諸経費の算出
        const miscExpenses = input.miscExpenses ?? Math.round(purchasePrice * CONFIG.defaultMiscExpenseRate);
        
        // 総投資額 (仕入れ + リフォーム + 諸経費)
        const totalInvestment = purchasePrice + renovationCost + miscExpenses;
        
        // 粗利 (再販価格 - 総投資額)
        const grossProfit = expectedResalePrice - totalInvestment;
        
        // 予備費 (想定外の修繕や空室期間などのリスクバッファ)
        const riskBuffer = expectedResalePrice * riskBufferRate;
        
        // 純利益
        const netProfit = grossProfit - riskBuffer;
        
        // ROI (%)
        const roi = (netProfit / totalInvestment) * 100;
        
        // 損益分岐点 (利益ゼロになる仕入れ価格を逆算)
        // expectedResalePrice - (purchasePrice + renovationCost + (purchasePrice * 0.07) + (expectedResalePrice * riskBufferRate)) = 0
        // expectedResalePrice * (1 - riskBufferRate) - renovationCost = purchasePrice * 1.07
        const breakEvenPrice = Math.round((expectedResalePrice * (1 - riskBufferRate) - renovationCost) / (1 + CONFIG.defaultMiscExpenseRate));

        const result: FlipResult = {
            input,
            calculation: {
                totalInvestment,
                miscExpenses,
                grossProfit,
                netProfit,
                roi: Math.round(roi * 10) / 10,
                breakEvenPrice
            },
            judgment: this.determineJudgment(roi),
            calculatedAt: new Date().toISOString()
        };

        return result;
    }

    private static determineJudgment(roi: number): FlipResult['judgment'] {
        if (roi >= CONFIG.thresholds.buy) {
            return {
                id: 'BUY',
                label: '🟢 BUY',
                color: 'success',
                message: '即座に動け。',
                description: 'この価格なら、十分な利益余地がある。Flip Logicとしての最高判定だ。'
            };
        } else if (roi >= CONFIG.thresholds.negotiate) {
            return {
                id: 'NEGOTIATE',
                label: '🟡 NEGOTIATE',
                color: 'warning',
                message: '交渉が必要だ。',
                description: '利益は出るが、リスクに対して薄い。さらなる指値による価格調整を推奨する。'
            };
        } else {
            return {
                id: 'PASS',
                label: '🔴 PASS',
                color: 'danger',
                message: '見送りを推奨。',
                description: '市場価格では利益が出にくい。現在の条件での仕入れは推奨されない。'
            };
        }
    }

    /**
     * 目標の仕入れ価格を算出（目標ROIを達成するため）
     */
    static calculateTargetPurchasePrice(input: FlipInput, targetRoi: number = 20): number {
        // Target ROI 20% を達成するための仕入れ価格を逆算
        // (Resale*(1-Buffer) - TotalInv) / TotalInv = 0.2
        // Resale*(1-Buffer) = 1.2 * TotalInv
        // TotalInv = Resale*(1-Buffer) / 1.2
        // purchasePrice * 1.07 + renovationCost = Resale*(1-Buffer) / 1.2
        const targetTotalInv = (input.expectedResalePrice * (1 - input.riskBufferRate)) / (1 + targetRoi / 100);
        const targetPurchasePrice = (targetTotalInv - input.renovationCost) / (1 + CONFIG.defaultMiscExpenseRate);
        
        return Math.round(targetPurchasePrice);
    }
}
