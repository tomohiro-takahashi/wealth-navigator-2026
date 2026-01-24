/**
 * 親の家、どうする？ - 選択肢診断
 * 実家の活用方法（売る/貸す/住む）を診断し、次のアクションを提案
 */

class ChoiceDiagnosis {
  constructor() {
    // 診断タイプと対応するメッセージ
    this.diagnosisTypes = {
      sell: {
        title: '「手放す」ことで、前に進めるかもしれません',
        message: `今のあなたの状況では、実家を売却することで、経済的にも心理的にも整理がつきやすいかもしれません。

売却は「諦める」ことではなく、「次のステップに進む」選択です。`,
        nextActions: [
          '実家の査定を依頼してみる',
          '相続登記が済んでいるか確認',
          '兄弟姉妹と方針を共有する',
        ],
      },
      rent: {
        title: '「活かしながら持つ」という選択肢があります',
        message: `所有権を手放さず、誰かに住んでもらうことで、実家を活かし続けることができます。

将来の選択肢を残しながら、収入を得ることも可能です。`,
        nextActions: [
          '賃貸需要を調査する',
          '賃貸物件として貸し出せる状態か確認',
          '管理会社に相談してみる',
        ],
      },
      keep: {
        title: '今は「持ち続ける」という選択も、正解です',
        message: `無理に決断を急ぐ必要はありません。

思い入れのある実家を、もう少し持ち続けることで見えてくるものもあります。`,
        nextActions: [
          '定期的な管理計画を立てる',
          '維持費用の見積もりを出す',
          '将来的な活用方法を家族で話し合う',
        ],
      },
      hybrid: {
        title: '選択肢は、一つではありません',
        message: `あなたの状況では、複数の選択肢が考えられます。

それぞれのメリット・デメリットを比較しながら、ゆっくり考えていきましょう。`,
        nextActions: [
          '各選択肢のメリット・デメリットを整理',
          '専門家に相談して客観的な意見を聞く',
          '期限を決めて再度検討する',
        ],
      },
    };
  }

  /**
   * 診断を実行
   * @param {Object} answers - 質問への回答
   * @returns {Object} 診断結果
   */
  diagnose(answers) {
    // 入力値の検証
    this.validateInput(answers);

    // 各選択肢のスコアを計算
    const scores = {
      sell: 0,
      rent: 0,
      keep: 0,
    };

    // Q1: 実家に今後住む可能性
    if (answers.q1 === 'ある') {
      scores.keep += 2;
    } else if (answers.q1 === 'ないと思う') {
      scores.sell += 2;
    }

    // Q2: 維持管理の可能性
    if (answers.q2 === 'できる') {
      scores.keep += 1;
    } else if (answers.q2 === '難しい') {
      scores.sell += 2;
    } else if (answers.q2 === '誰かに頼めばできる') {
      scores.rent += 1;
    }

    // Q3: まとまった資金の必要性
    if (answers.q3 === 'はい') {
      scores.sell += 2;
    } else if (answers.q3 === '近い将来必要になりそう') {
      scores.sell += 1;
    }

    // Q4: 賃貸需要
    if (answers.q4 === 'ありそう') {
      scores.rent += 2;
    } else if (answers.q4 === 'なさそう') {
      scores.sell += 1;
    }

    // Q5: 相続人の数
    if (answers.q5 === '2人') {
      scores.sell += 1;
    } else if (answers.q5 === '3人以上') {
      scores.sell += 2;
    }

    // Q6: 心理的抵抗
    if (answers.q6 === '抵抗がある') {
      scores.keep += 2;
    } else if (answers.q6 === '整理がついている') {
      scores.sell += 1;
    }

    // Q7: 築年数
    if (answers.q7 === '40年以上') {
      scores.sell += 1;
    }

    // Q8: 帰省頻度
    if (answers.q8 === '年に数回以上') {
      scores.keep += 1;
    } else if (answers.q8 === 'ほとんどない') {
      scores.sell += 1;
    }

    // Q9: 子孫が使う可能性
    if (answers.q9 === 'あるかもしれない') {
      scores.keep += 2;
    } else if (answers.q9 === 'ないと思う') {
      scores.sell += 1;
    } else if (answers.q9 === '分からない') {
      scores.rent += 1;
    }

    // Q10: 今の気持ち
    if (answers.q10 === '早く決着をつけたい') {
      scores.sell += 1;
    } else if (answers.q10 === 'じっくり考えたい') {
      scores.keep += 1;
    }

    // 最大スコアを特定
    const maxScore = Math.max(scores.sell, scores.rent, scores.keep);
    const topChoices = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([choice, _]) => choice);

    // 2位のスコアを取得
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const secondScore = sortedScores[1];

    // 僅差判定（差が2以下なら複合型）
    let diagnosisType;
    if (maxScore - secondScore <= 2) {
      diagnosisType = 'hybrid';
    } else {
      diagnosisType = topChoices[0];
    }

    const diagnosis = this.diagnosisTypes[diagnosisType];

    return {
      diagnosisType,
      title: diagnosis.title,
      message: diagnosis.message,
      nextActions: diagnosis.nextActions,
      scores: {
        sell: scores.sell,
        rent: scores.rent,
        keep: scores.keep,
      },
      maxScore,
      answers,
    };
  }

  /**
   * 入力値の検証
   */
  validateInput(answers) {
    const requiredQuestions = [
      'q1',
      'q2',
      'q3',
      'q4',
      'q5',
      'q6',
      'q7',
      'q8',
      'q9',
      'q10',
    ];
    
    for (const q of requiredQuestions) {
      if (!answers[q]) {
        throw new Error(`質問${q.toUpperCase()}に回答してください`);
      }
    }
  }

  /**
   * 結果を表示用にフォーマット
   */
  formatResult(result) {
    // スコアバーの生成
    const maxBarLength = 12;
    const totalScore = result.scores.sell + result.scores.rent + result.scores.keep;
    
    const sellBar = '█'.repeat(
      Math.round((result.scores.sell / totalScore) * maxBarLength)
    );
    const rentBar = '█'.repeat(
      Math.round((result.scores.rent / totalScore) * maxBarLength)
    );
    const keepBar = '█'.repeat(
      Math.round((result.scores.keep / totalScore) * maxBarLength)
    );

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
あなたへのご提案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${result.title}

─────────────────────────────

${result.message}

─────────────────────────────

■ あなたの診断スコア
┌─────────────────────────────┐
│ 売却     ${sellBar.padEnd(maxBarLength, ' ')}  ${result.scores.sell}pt
│ 賃貸     ${rentBar.padEnd(maxBarLength, ' ')}  ${result.scores.rent}pt
│ 所有継続 ${keepBar.padEnd(maxBarLength, ' ')}  ${result.scores.keep}pt
└─────────────────────────────┘

■ 次にやるべきこと
${result.nextActions.map((action, i) => `  ${i + 1}. ${action}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【この結果をLINEで受け取る】
→ 「次にやるべきこと」の詳しい
   ガイドもお届けします

【無料で相談してみる】
→ まずは話を聞いてほしい、でも大丈夫

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * LINE配信用の詳細ガイドを生成
   */
  generateDetailedGuide(result) {
    const guides = {
      sell: `
■ 売却を検討する際の詳細ガイド

【ステップ1】実家の査定を依頼
・複数の不動産会社に査定依頼（最低3社）
・査定額だけでなく、売却実績も確認
・相場を把握することが第一歩

【ステップ2】相続登記の確認
・登記簿謄本を取得して所有者を確認
・未登記の場合は早急に相続登記を
・司法書士に相談すると確実

【ステップ3】家族との方針共有
・全員の同意を得ることが重要
・売却時期、価格、分配方法を話し合う
・書面での合意が望ましい

【税金について】
・譲渡所得税がかかる可能性
・3,000万円特別控除の適用条件確認
・税理士への相談を推奨

【よくある質問】
Q. 荷物はどうすればいい？
A. 売却前に整理が必要。遺品整理業者も検討を。

Q. リフォームは必要？
A. 基本的には不要。そのままで査定を。
`,
      rent: `
■ 賃貸を検討する際の詳細ガイド

【ステップ1】賃貸需要の調査
・周辺の家賃相場を調べる
・空室率、入居者層を確認
・管理会社に市場調査を依頼

【ステップ2】物件状態の確認
・修繕が必要な箇所をリストアップ
・最低限のリフォーム費用を見積もる
・設備の動作確認

【ステップ3】管理会社の選定
・管理手数料の相場は家賃の5-10%
・実績、対応力を比較検討
・サブリース（一括借上げ）も選択肢

【収支シミュレーション】
・想定家賃収入
・固定資産税、修繕費、管理費
・空室リスクを考慮した収支計画

【よくある質問】
Q. 遠方でも管理できる？
A. 管理会社に委託すれば可能。

Q. 途中で売却できる？
A. 可能。入居者がいても売却できます。
`,
      keep: `
■ 所有継続する際の詳細ガイド

【ステップ1】定期管理計画の策定
・月1回以上の換気、掃除
・庭木の手入れ、草刈り
・郵便物の整理

【ステップ2】維持費用の把握
・固定資産税：年間○○万円
・光熱費（基本料金）：月○○円
・火災保険：年間○○万円
・管理委託費（必要な場合）

【ステップ3】将来の活用方法検討
・セカンドハウスとして利用
・リノベーションして賃貸
・将来的な売却の可能性

【空き家管理サービス】
・月1回の巡回：月5,000円〜
・庭の手入れ：別途見積
・郵便物転送サービス

【よくある質問】
Q. 空き家にしておくリスクは？
A. 劣化、害虫、不法侵入、固定資産税の増額など。

Q. どのくらいの頻度で帰省すべき？
A. 最低でも月1回の管理が望ましい。
`,
      hybrid: `
■ 複数選択肢を比較する際のガイド

【各選択肢のメリット・デメリット】

◆売却
メリット：
・まとまった資金が手に入る
・維持管理の負担がなくなる
・相続人間での分配がしやすい

デメリット：
・思い出の家を手放すことになる
・売却後は取り戻せない
・税金がかかる可能性

◆賃貸
メリット：
・所有権は維持しつつ収入を得られる
・将来的な選択肢を残せる
・家が荒れるのを防げる

デメリット：
・入居者トラブルのリスク
・空室リスク
・管理の手間とコスト

◆所有継続
メリット：
・いつでも使える状態を保てる
・思い出の場所を残せる
・将来的な資産価値の上昇の可能性

デメリット：
・維持費用がかかり続ける
・管理の手間
・空き家リスク

【専門家への相談を】
・不動産会社：売却・賃貸の見積もり
・税理士：税金面のアドバイス
・ファイナンシャルプランナー：総合的な資産計画
`,
    };

    return guides[result.diagnosisType] || guides.hybrid;
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChoiceDiagnosis;
}
