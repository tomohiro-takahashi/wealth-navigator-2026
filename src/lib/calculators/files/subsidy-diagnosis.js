/**
 * おうちの補助金相談室 - 補助金かんたん診断
 * 利用可能な補助金制度を判定し、概算金額を提示
 */

class SubsidyDiagnosis {
  constructor() {
    // 補助金制度データベース
    this.subsidies = {
      windowRenovation: {
        name: '先進的窓リノベ事業',
        maxAmount: 200,
        amountText: '最大200万円',
        description: '窓の断熱改修向け',
        matchScore: 3,
        avgAmount: 100, // 概算計算用の中央値
      },
      waterHeater: {
        name: '給湯省エネ事業',
        maxAmount: 20,
        amountText: '最大20万円',
        description: '給湯器交換向け',
        matchScore: 2,
        avgAmount: 15,
      },
      childcareEco: {
        name: '子育てエコホーム支援事業',
        maxAmount: 60,
        amountText: '最大60万円',
        description: '子育て世帯向け',
        matchScore: 2,
        avgAmount: 40,
      },
      nursingCare: {
        name: '介護保険住宅改修',
        maxAmount: 18,
        amountText: '最大18万円（9割支給）',
        description: '介護のための住宅改修',
        matchScore: 2,
        avgAmount: 15,
      },
      longTermQuality: {
        name: '長期優良住宅化リフォーム推進事業',
        maxAmount: 250,
        amountText: '最大250万円',
        description: '住宅の長寿命化・性能向上',
        matchScore: 1,
        avgAmount: 150,
      },
    };
  }

  /**
   * 診断を実行
   * @param {Object} input - 入力データ
   * @param {string} input.prefecture - 都道府県
   * @param {string} input.buildingType - 建物の種類（戸建て/マンション）
   * @param {string} input.buildingAge - 築年数区分
   * @param {Array<string>} input.renovationItems - 検討中のリフォーム項目
   * @param {string} input.householdType - 世帯の状況
   * @returns {Object} 診断結果
   */
  diagnose(input) {
    // 入力値の検証
    this.validateInput(input);

    const matchedSubsidies = [];

    // 窓の断熱を選択した場合
    if (input.renovationItems.includes('窓の断熱')) {
      matchedSubsidies.push({
        ...this.subsidies.windowRenovation,
        reason: '窓の断熱改修を検討中',
      });
    }

    // 給湯器を選択した場合
    if (input.renovationItems.includes('給湯器')) {
      matchedSubsidies.push({
        ...this.subsidies.waterHeater,
        reason: '給湯器の交換を検討中',
      });
    }

    // 子育て世帯または若者夫婦世帯の場合
    if (
      input.householdType === '18歳未満の子どもがいる' ||
      input.householdType === '夫婦どちらかが39歳以下'
    ) {
      matchedSubsidies.push({
        ...this.subsidies.childcareEco,
        reason: '子育て世帯・若者夫婦世帯',
      });
    }

    // 要介護・要支援の場合
    if (input.householdType === '要介護・要支援の方がいる') {
      matchedSubsidies.push({
        ...this.subsidies.nursingCare,
        reason: '要介護・要支援の方がいる',
      });
    }

    // バリアフリーを選択した場合（追加で介護保険を提案）
    if (
      input.renovationItems.includes('バリアフリー') &&
      !matchedSubsidies.find((s) => s.name === '介護保険住宅改修')
    ) {
      matchedSubsidies.push({
        ...this.subsidies.nursingCare,
        reason: 'バリアフリー改修を検討中',
        note: '※要介護・要支援認定が必要です',
      });
    }

    // 築20年以上の場合
    if (['20〜30年', '30〜40年', '40年以上'].includes(input.buildingAge)) {
      matchedSubsidies.push({
        ...this.subsidies.longTermQuality,
        reason: `築${input.buildingAge}の建物`,
      });
    }

    // マッチスコアでソート
    matchedSubsidies.sort((a, b) => b.matchScore - a.matchScore);

    // 合計概算金額を計算
    const totalEstimate = matchedSubsidies.reduce(
      (sum, subsidy) => sum + subsidy.avgAmount,
      0
    );

    // 表示タイプを決定
    let displayType, displayMessage;
    if (matchedSubsidies.length >= 3) {
      displayType = 'multiple';
      displayMessage = '🎉 たくさんの補助金が使えそうです！';
    } else if (matchedSubsidies.length >= 1) {
      displayType = 'found';
      displayMessage = '✅ 使える補助金が見つかりました';
    } else {
      displayType = 'local';
      displayMessage = '📋 お住まいの自治体独自の制度を確認しましょう';
    }

    return {
      displayType,
      displayMessage,
      matchedSubsidies,
      totalEstimate,
      subsidyCount: matchedSubsidies.length,
      input,
    };
  }

  /**
   * 入力値の検証
   */
  validateInput(input) {
    if (!input.prefecture) {
      throw new Error('都道府県を選択してください');
    }
    if (!['戸建て', 'マンション'].includes(input.buildingType)) {
      throw new Error('建物の種類を選択してください');
    }
    if (
      ![
        '10年未満',
        '10〜20年',
        '20〜30年',
        '30〜40年',
        '40年以上',
      ].includes(input.buildingAge)
    ) {
      throw new Error('築年数を選択してください');
    }
    if (!Array.isArray(input.renovationItems) || input.renovationItems.length === 0) {
      throw new Error('検討中のリフォーム項目を選択してください');
    }
    if (!input.householdType) {
      throw new Error('世帯の状況を選択してください');
    }
  }

  /**
   * 結果を表示用にフォーマット
   */
  formatResult(result) {
    let output = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${result.displayMessage}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (result.matchedSubsidies.length > 0) {
      output += `合計で最大 約${result.totalEstimate.toLocaleString()}万円 戻ってくる
可能性があります

`;

      result.matchedSubsidies.forEach((subsidy, index) => {
        const stars = '★'.repeat(subsidy.matchScore) + '☆'.repeat(3 - subsidy.matchScore);
        output += `
■ ${index + 1}. ${subsidy.name}
   ${subsidy.amountText} / ${subsidy.description}
   おすすめ度：${stars}
   理由：${subsidy.reason}
   ${subsidy.note || ''}
`;
      });

      output += `
※金額は目安です。実際の金額は工事内容により異なります。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 私たちがワンストップでサポートします

  ✓ 補助金の申請手続き（無料）
  ✓ リフォーム見積もりの取得
  ✓ 登録事業者のご紹介
  ✓ 申請〜工事〜完了までの進行管理

  面倒な手続きは、すべてお任せください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    } else {
      output += `
現在の条件では国の補助金制度に該当するものが
見つかりませんでしたが、お住まいの自治体独自の
補助金制度がある可能性があります。

無料相談で詳しくお調べいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    }

    return output.trim();
  }

  /**
   * LINE配信用の補助金活用シートを生成
   */
  generateSubsidySheet(result) {
    if (result.matchedSubsidies.length === 0) {
      return null;
    }

    let sheet = `
📄 あなた専用 補助金活用シート

■ 診断結果サマリー
・使える制度：${result.subsidyCount}件
・最大補助額：約${result.totalEstimate.toLocaleString()}万円

■ 制度別チェックリスト
`;

    result.matchedSubsidies.forEach((subsidy, index) => {
      sheet += `
□ ${index + 1}. ${subsidy.name}
   └ ${subsidy.amountText}
   └ ${subsidy.description}
   └ 申請期限：予算上限に達し次第終了
`;
    });

    sheet += `
■ 次のステップ
1. リフォーム箇所を決める
2. 見積もりを取る（当相談室で無料）
3. 申請手続き（当相談室で無料代行）
4. 工事開始

ご不明点はLINEでいつでもご質問ください
`;

    return sheet.trim();
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubsidyDiagnosis;
}
