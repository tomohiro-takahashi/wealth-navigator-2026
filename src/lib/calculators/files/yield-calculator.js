/**
 * 空き家錬金術 - 利回りシミュレーター
 * 空き家投資の収益性を計算し、投資判定を行う
 */

class YieldCalculator {
  constructor() {
    // 判定基準（修正版：緩和済み）
    this.thresholds = {
      highYield: 12,   // 12%以上は高利回り
      standard: 7,     // 7%以上は標準的
      // 7%未満は低利回り
    };
  }

  /**
   * 利回り計算と判定を実行
   * @param {Object} input - 入力データ
   * @param {number} input.acquisitionPrice - 物件取得価格（万円）
   * @param {number} input.renovationCost - リノベーション費用（万円）
   * @param {number} input.otherExpenses - 諸経費（万円）
   * @param {number} input.monthlyRent - 想定月額家賃（万円）
   * @param {number} input.annualExpenseRate - 年間経費率（0.10, 0.15, 0.20）
   * @returns {Object} 計算結果と判定
   */
  calculate(input) {
    // 入力値の検証
    this.validateInput(input);

    // 総投資額
    const totalInvestment =
      input.acquisitionPrice + input.renovationCost + input.otherExpenses;

    // 年間家賃収入
    const annualRentIncome = input.monthlyRent * 12;

    // 年間経費
    const annualExpenses = annualRentIncome * input.annualExpenseRate;

    // 年間純収益
    const annualNetIncome = annualRentIncome - annualExpenses;

    // 表面利回り
    const grossYield = (annualRentIncome / totalInvestment) * 100;

    // 実質利回り
    const netYield = (annualNetIncome / totalInvestment) * 100;

    // 投資回収期間（年）
    const paybackPeriod = totalInvestment / annualNetIncome;

    // 月間キャッシュフロー
    const monthlyCashFlow = annualNetIncome / 12;

    // 判定ロジック
    let judgment, message;

    if (netYield >= this.thresholds.highYield) {
      judgment = 'HIGH_YIELD';
      message = '優秀な数字だ。この利回りを実現できるなら、迷わず動け。';
    } else if (netYield >= this.thresholds.standard) {
      judgment = 'STANDARD';
      message =
        '空き家投資としては合格ラインだ。リスクとリターンのバランスが取れている。';
    } else {
      judgment = 'LOW_YIELD';
      message =
        '利回りが物足りない。より安く仕入れるか、もっと高利回りの物件を探すべきだ。';
    }

    return {
      judgment,
      message,
      yields: {
        gross: Math.round(grossYield * 10) / 10, // 小数点1桁
        net: Math.round(netYield * 10) / 10,
      },
      investment: {
        total: Math.floor(totalInvestment),
        breakdown: {
          acquisition: input.acquisitionPrice,
          renovation: input.renovationCost,
          other: input.otherExpenses,
        },
      },
      income: {
        annualRent: Math.floor(annualRentIncome),
        annualExpenses: Math.floor(annualExpenses),
        annualNet: Math.floor(annualNetIncome),
        monthlyCashFlow: Math.round(monthlyCashFlow * 10) / 10,
      },
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      input,
    };
  }

  /**
   * 入力値の検証
   */
  validateInput(input) {
    if (!input.acquisitionPrice || input.acquisitionPrice < 0) {
      throw new Error('物件取得価格は0以上の数値である必要があります');
    }
    if (!input.renovationCost || input.renovationCost < 0) {
      throw new Error('リノベーション費用は0以上の数値である必要があります');
    }
    if (input.otherExpenses === undefined || input.otherExpenses < 0) {
      throw new Error('諸経費は0以上の数値である必要があります');
    }
    if (!input.monthlyRent || input.monthlyRent <= 0) {
      throw new Error('想定月額家賃は正の数値である必要があります');
    }
    if (![0.10, 0.15, 0.20].includes(input.annualExpenseRate)) {
      throw new Error('年間経費率は10%, 15%, 20%のいずれかである必要があります');
    }
  }

  /**
   * 諸経費を自動計算（物件価格の約6-8%）
   * @param {number} acquisitionPrice - 物件取得価格（万円）
   * @returns {number} 概算諸経費（万円）
   */
  estimateOtherExpenses(acquisitionPrice) {
    // 取得価格の7%を目安として計算
    return Math.floor(acquisitionPrice * 0.07);
  }

  /**
   * 結果を表示用にフォーマット
   */
  formatResult(result) {
    const icon = {
      HIGH_YIELD: '🟢',
      STANDARD: '🟡',
      LOW_YIELD: '🔴',
    }[result.judgment];

    const judgmentText = {
      HIGH_YIELD: 'HIGH YIELD',
      STANDARD: 'STANDARD',
      LOW_YIELD: 'LOW YIELD',
    }[result.judgment];

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
判定：${icon} ${judgmentText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${result.message}

┌─────────────────────────────┐
│ 表面利回り    ${result.yields.gross.toFixed(1)}%
│ 実質利回り    ${result.yields.net.toFixed(1)}%
│ 投資回収期間  ${result.paybackPeriod.toFixed(1)}年
│ 月間CF       約${result.income.monthlyCashFlow.toFixed(1)}万円
└─────────────────────────────┘

■ 投資サマリー
┌─────────────────────────────┐
│ 総投資額          ${result.investment.total.toLocaleString()}万円
│ 年間家賃収入      ${result.income.annualRent.toLocaleString()}万円
│ 年間経費          ${result.income.annualExpenses.toLocaleString()}万円
│ 年間純収益        ${result.income.annualNet.toLocaleString()}万円
└─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

もっと高利回りの物件を探していますか?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 空き家錬金術の独自ルート
┌─────────────────────────────┐
│ ・空き家バンク未掲載の直接交渉案件
│ ・自治体担当者からの事前情報
│ ・地方金融機関の任売案件
│ → 実質利回り15%超の案件も多数
└─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * 複数パターンの比較シミュレーション
   * @param {Object} baseInput - 基本入力データ
   * @param {Array<Object>} variations - 変動パラメータ配列
   * @returns {Array<Object>} 複数パターンの計算結果
   */
  compareScenarios(baseInput, variations) {
    return variations.map((variation) => {
      const input = { ...baseInput, ...variation };
      const result = this.calculate(input);
      return {
        ...result,
        scenario: variation.name || '無名シナリオ',
      };
    });
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = YieldCalculator;
}
