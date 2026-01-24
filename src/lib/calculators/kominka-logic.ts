export type KominkaInput = {
    acquisitionCost: number; // 物件取得価格
    renovationCost: number;  // リノベーション費用
    otherCosts: number;       // 諸経費
    monthlyRent: number;      // 想定月額家賃
    expenseRate: number;      // 年間経費率 (0.1 - 0.25)
};

export type KominkaResult = {
    input: KominkaInput;
    totalInitialCapital: number; // 初期投資合計
    annualGrossIncome: number;   // 年間表面収入
    annualNetIncome: number;     // 年間純利益
    surfaceYield: number;        // 表面利回り (%)
    realYield: number;           // 実質利回り (%)
    paybackPeriod: number;       // 回収期間 (年)
    monthlyCashFlow: number;     // 月額キャッシュフロー
};

export const KominkaCalculator = {
    calculate: (input: KominkaInput): KominkaResult => {
        const totalInitialCapital = input.acquisitionCost + input.renovationCost + input.otherCosts;
        const annualGrossIncome = input.monthlyRent * 12;
        
        // 年間経費 = 年間表面収入 * 経費率
        const annualExpenses = annualGrossIncome * (input.expenseRate / 100);
        const annualNetIncome = annualGrossIncome - annualExpenses;
        
        const surfaceYield = totalInitialCapital > 0 
            ? (annualGrossIncome / totalInitialCapital) * 100 
            : 0;
            
        const realYield = totalInitialCapital > 0 
            ? (annualNetIncome / totalInitialCapital) * 100 
            : 0;
            
        const paybackPeriod = annualNetIncome > 0 
            ? totalInitialCapital / annualNetIncome 
            : 0;
            
        const monthlyCashFlow = annualNetIncome / 12;

        return {
            input,
            totalInitialCapital,
            annualGrossIncome,
            annualNetIncome,
            surfaceYield: Number(surfaceYield.toFixed(1)),
            realYield: Number(realYield.toFixed(1)),
            paybackPeriod: Number(paybackPeriod.toFixed(1)),
            monthlyCashFlow: Math.floor(monthlyCashFlow)
        };
    }
};
