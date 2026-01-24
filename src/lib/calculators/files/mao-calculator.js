/**
 * Flip Logic - MAO計算シミュレーター
 * 物件の最大許容価格(MAO)を計算し、購入判定を行う
 */

class MaoCalculator {
  constructor() {
    // 判定基準（修正版：緩和済み）
    this.thresholds = {
      buy: 0.70,      // 70%以下なら即BUY
      negotiate: 0.75, // 75%以下なら交渉可能
      // 75%超はPASS
    };
  }

  /**
   * MAO計算と判定を実行
   * @param {Object} input - 入力データ
   * @param {number} input.arv - 想定再販価格（万円）
   * @param {number} input.rehabCost - リフォーム費用（万円）
   * @param {number} input.listPrice - 売出価格（万円）
   * @param {number} input.contingencyRate - 予備費率（0.10, 0.15, 0.20）
   * @returns {Object} 計算結果と判定
   */
  calculate(input) {
    // 入力値の検証
    this.validateInput(input);

    // リフォーム費用（予備費込み）
    const rehabWithContingency = input.rehabCost * (1 + input.contingencyRate);

    // MAO計算（75%, 70%, 65%, 60%）
    const mao75 = input.arv * 0.75 - rehabWithContingency;
    const mao70 = input.arv * 0.70 - rehabWithContingency;
    const mao65 = input.arv * 0.65 - rehabWithContingency;
    const mao60 = input.arv * 0.60 - rehabWithContingency;

    // 判定差額（MAO70基準）
    const difference = mao70 - input.listPrice;

    // 判定ロジック
    let judgment, message, targetPrice;
    
    if (input.listPrice <= mao70) {
      // 70%以下 → BUY
      judgment = 'BUY';
      message = 'この価格なら、十分な利益余地がある。即座に動け。';
      targetPrice = null; // すでに適正価格
    } else if (input.listPrice <= mao75) {
      // 70%超〜75%以下 → NEGOTIATE
      judgment = 'NEGOTIATE';
      const negotiationTarget = Math.floor(mao70);
      message = `利益は出るが、交渉が必要だ。${negotiationTarget.toLocaleString()}万円以下への指値を狙え。`;
      targetPrice = negotiationTarget;
    } else {
      // 75%超 → PASS
      judgment = 'PASS';
      message = '数字が合わない。この価格で市場から仕入れるのはリスクが高い。';
      targetPrice = Math.floor(mao75);
    }

    // 内訳計算（30%ルール）
    const expenses = input.arv * 0.30; // 諸経費30%

    return {
      judgment,
      message,
      mao: {
        mao75: Math.floor(mao75),
        mao70: Math.floor(mao70),
        mao65: Math.floor(mao65),
        mao60: Math.floor(mao60),
      },
      difference: Math.floor(difference),
      targetPrice,
      breakdown: {
        arv: input.arv,
        rehabCostWithContingency: Math.floor(rehabWithContingency),
        expenses: Math.floor(expenses),
        maxPurchasePrice: Math.floor(mao70),
      },
      input,
    };
  }

  /**
   * 入力値の検証
   */
  validateInput(input) {
    if (!input.arv || input.arv <= 0) {
      throw new Error('想定再販価格(ARV)は正の数値である必要があります');
    }
    if (!input.rehabCost || input.rehabCost < 0) {
      throw new Error('リフォーム費用は0以上の数値である必要があります');
    }
    if (!input.listPrice || input.listPrice <= 0) {
      throw new Error('売出価格は正の数値である必要があります');
    }
    if (![0.10, 0.15, 0.20].includes(input.contingencyRate)) {
      throw new Error('予備費率は10%, 15%, 20%のいずれかである必要があります');
    }
  }

  /**
   * 結果を表示用にフォーマット
   */
  formatResult(result) {
    const icon = {
      'BUY': '🟢',
      'NEGOTIATE': '🟡',
      'PASS': '🔴',
    }[result.judgment];

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
判定：${icon} ${result.judgment}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${result.message}

■ MAO（最大許容価格）
  MAO（75%ルール）：${result.mao.mao75.toLocaleString()}万円
  MAO（70%ルール）：${result.mao.mao70.toLocaleString()}万円
  MAO（65%ルール）：${result.mao.mao65.toLocaleString()}万円
  MAO（60%ルール）：${result.mao.mao60.toLocaleString()}万円

売出価格との差額：${result.difference >= 0 ? '+' : ''}${result.difference.toLocaleString()}万円
${result.targetPrice ? `→ 指値目標：${result.targetPrice.toLocaleString()}万円以下` : ''}

■ 内訳
  ・想定再販価格：${result.breakdown.arv.toLocaleString()}万円
  ・リフォーム費用：${result.breakdown.rehabCostWithContingency.toLocaleString()}万円（予備費込）
  ・諸経費（30%）：${result.breakdown.expenses.toLocaleString()}万円
  ・最大仕入れ価格：${result.breakdown.maxPurchasePrice.toLocaleString()}万円

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

市場に出る前の物件なら、
この条件でも仕入れられる可能性がある。

■ Flip Logicの仕入れルート
  ・任意売却・競売前物件
  ・金融機関との直接取引案件
  ・業者間ネットワークの未公開情報
  → 市場価格より10〜30%安く仕入れ可

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaoCalculator;
}
