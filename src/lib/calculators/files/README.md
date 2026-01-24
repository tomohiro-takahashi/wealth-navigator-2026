# 診断コンテンツ ロジック実装

4つのブランドの診断ツールのバックエンドロジック実装です。

## 📁 ファイル構成

```
diagnosis-tools/
├── mao-calculator.js         # Flip Logic - MAO計算シミュレーター
├── subsidy-diagnosis.js      # おうちの補助金相談室 - 補助金かんたん診断
├── yield-calculator.js       # 空き家錬金術 - 利回りシミュレーター
├── choice-diagnosis.js       # 親の家、どうする？ - 選択肢診断
├── test-all.js               # 全ツールのテストコード
└── README.md                 # このファイル
```

## 🚀 使い方

### 1. Flip Logic - MAO計算シミュレーター

物件の最大許容価格(MAO)を計算し、購入判定を行います。

```javascript
const MaoCalculator = require('./mao-calculator.js');

const calculator = new MaoCalculator();

const result = calculator.calculate({
  arv: 3000,              // 想定再販価格（万円）
  rehabCost: 450,         // リフォーム費用（万円）
  listPrice: 1800,        // 売出価格（万円）
  contingencyRate: 0.20,  // 予備費率（0.10, 0.15, 0.20）
});

// 結果表示
console.log(calculator.formatResult(result));

// 結果オブジェクト
console.log(result.judgment);        // 'BUY' | 'NEGOTIATE' | 'PASS'
console.log(result.mao.mao70);       // MAO（70%ルール）
console.log(result.difference);      // 売出価格との差額
console.log(result.targetPrice);     // 指値目標価格
```

**判定基準（修正版）:**
- 売出価格 ≤ MAO_70 → 🟢 BUY
- MAO_70 < 売出価格 ≤ MAO_75 → 🟡 NEGOTIATE  
- 売出価格 > MAO_75 → 🔴 PASS

### 2. おうちの補助金相談室 - 補助金かんたん診断

利用可能な補助金制度を判定し、概算金額を提示します。

```javascript
const SubsidyDiagnosis = require('./subsidy-diagnosis.js');

const diagnosis = new SubsidyDiagnosis();

const result = diagnosis.diagnose({
  prefecture: '東京都',
  buildingType: '戸建て',                      // '戸建て' | 'マンション'
  buildingAge: '20〜30年',                     // '10年未満' | '10〜20年' | '20〜30年' | '30〜40年' | '40年以上'
  renovationItems: ['窓の断熱', '給湯器'],     // 複数選択可
  householdType: '18歳未満の子どもがいる',     // 世帯の状況
});

// 結果表示
console.log(diagnosis.formatResult(result));

// LINE配信用の補助金活用シート生成
const sheet = diagnosis.generateSubsidySheet(result);
console.log(sheet);

// 結果オブジェクト
console.log(result.matchedSubsidies);  // 該当制度の配列
console.log(result.totalEstimate);     // 合計概算金額
console.log(result.subsidyCount);      // 該当制度数
```

**リフォーム項目の選択肢:**
- '窓の断熱'
- '浴室'
- 'キッチン'
- 'トイレ'
- '給湯器'
- '外壁・屋根'
- 'バリアフリー'
- 'その他'

**世帯の状況:**
- '18歳未満の子どもがいる'
- '夫婦どちらかが39歳以下'
- '要介護・要支援の方がいる'
- 'いずれも該当しない'

### 3. 空き家錬金術 - 利回りシミュレーター

空き家投資の収益性を計算し、投資判定を行います。

```javascript
const YieldCalculator = require('./yield-calculator.js');

const calculator = new YieldCalculator();

const result = calculator.calculate({
  acquisitionPrice: 150,      // 物件取得価格（万円）
  renovationCost: 300,        // リノベーション費用（万円）
  otherExpenses: 30,          // 諸経費（万円）
  monthlyRent: 8,             // 想定月額家賃（万円）
  annualExpenseRate: 0.15,    // 年間経費率（0.10, 0.15, 0.20）
});

// 結果表示
console.log(calculator.formatResult(result));

// 諸経費の自動計算（物件価格の7%）
const estimatedExpenses = calculator.estimateOtherExpenses(500);
console.log(`概算諸経費: ${estimatedExpenses}万円`);

// 結果オブジェクト
console.log(result.judgment);                 // 'HIGH_YIELD' | 'STANDARD' | 'LOW_YIELD'
console.log(result.yields.gross);             // 表面利回り（%）
console.log(result.yields.net);               // 実質利回り（%）
console.log(result.paybackPeriod);            // 投資回収期間（年）
console.log(result.income.monthlyCashFlow);   // 月間キャッシュフロー（万円）
```

**判定基準（修正版）:**
- 実質利回り ≥ 12% → 🟢 HIGH YIELD
- 7% ≤ 実質利回り < 12% → 🟡 STANDARD
- 実質利回り < 7% → 🔴 LOW YIELD

**複数パターン比較:**
```javascript
const baseInput = {
  acquisitionPrice: 300,
  renovationCost: 200,
  otherExpenses: 40,
  annualExpenseRate: 0.15,
};

const scenarios = calculator.compareScenarios(baseInput, [
  { name: '家賃6万円', monthlyRent: 6 },
  { name: '家賃7万円', monthlyRent: 7 },
  { name: '家賃8万円', monthlyRent: 8 },
]);

scenarios.forEach(s => {
  console.log(`${s.scenario}: 実質利回り ${s.yields.net}%`);
});
```

### 4. 親の家、どうする？ - 選択肢診断

実家の活用方法（売る/貸す/住む）を診断し、次のアクションを提案します。

```javascript
const ChoiceDiagnosis = require('./choice-diagnosis.js');

const diagnosis = new ChoiceDiagnosis();

const result = diagnosis.diagnose({
  q1: 'ないと思う',               // 実家に住む可能性
  q2: '難しい',                   // 維持管理の可能性
  q3: 'はい',                     // まとまった資金の必要性
  q4: 'なさそう',                 // 賃貸需要
  q5: '3人以上',                  // 相続人の数
  q6: '整理がついている',         // 心理的抵抗
  q7: '40年以上',                 // 築年数
  q8: 'ほとんどない',             // 帰省頻度
  q9: 'ないと思う',               // 子孫が使う可能性
  q10: '早く決着をつけたい',      // 今の気持ち
});

// 結果表示
console.log(diagnosis.formatResult(result));

// LINE配信用の詳細ガイド生成
const guide = diagnosis.generateDetailedGuide(result);
console.log(guide);

// 結果オブジェクト
console.log(result.diagnosisType);  // 'sell' | 'rent' | 'keep' | 'hybrid'
console.log(result.title);          // 診断結果のタイトル
console.log(result.message);        // メッセージ
console.log(result.nextActions);    // 次にやるべきこと（配列）
console.log(result.scores);         // 各選択肢のスコア
```

**質問の選択肢:**

| 質問 | 選択肢 |
|------|--------|
| q1 | 'ある' / 'ないと思う' / '分からない' |
| q2 | 'できる' / '難しい' / '誰かに頼めばできる' |
| q3 | 'はい' / 'いいえ' / '近い将来必要になりそう' |
| q4 | 'ありそう' / 'なさそう' / '分からない' |
| q5 | '自分だけ' / '2人' / '3人以上' |
| q6 | '抵抗がある' / '整理がついている' / 'どちらとも言えない' |
| q7 | '20年未満' / '20〜40年' / '40年以上' |
| q8 | '年に数回以上' / 'ほとんどない' |
| q9 | 'あるかもしれない' / 'ないと思う' / '分からない' |
| q10 | '早く決着をつけたい' / 'じっくり考えたい' / '何から始めればいいか分からない' |

## 🧪 テスト実行

すべての診断ツールのテストを実行:

```bash
node test-all.js
```

テストには以下が含まれます:
- 各診断ツールの正常系テスト（複数パターン）
- エラーハンドリングのテスト
- 結果フォーマットの確認

## 📊 CTA動線

### Flip Logic
- **専門家に仕入れ提案を依頼する** → お問い合わせフォーム（具体的な物件紹介依頼）
- **LINEで極秘物件情報を受け取る** → LINE登録（情報収集・週1配信）

### 補助金相談室
- **無料サポートを申し込む** → お問い合わせフォーム（申請サポート＋見積もり依頼）
- **LINEで診断結果を受け取る** → LINE登録（補助金活用シート送付）

### 空き家錬金術
- **高利回り物件の提案を受ける** → お問い合わせフォーム（具体的な物件紹介依頼）
- **LINEで非公開物件情報を受け取る** → LINE登録（利回り12%超案件・月2回配信）

### 親の家
- **この結果をLINEで受け取る** → LINE登録（次にやるべきこと詳細ガイド送付）
- **無料で相談してみる** → お問い合わせフォーム（オンライン30分相談）

## 🛠️ カスタマイズ

### 判定基準の変更

各クラスの `constructor` 内で閾値を変更できます:

```javascript
// MAO計算の閾値変更例
class MaoCalculator {
  constructor() {
    this.thresholds = {
      buy: 0.70,
      negotiate: 0.75,  // ← ここを変更
    };
  }
}

// 利回りの閾値変更例
class YieldCalculator {
  constructor() {
    this.thresholds = {
      highYield: 12,    // ← ここを変更
      standard: 7,      // ← ここを変更
    };
  }
}
```

### メッセージのカスタマイズ

各メソッド内のメッセージ文字列を変更:

```javascript
// calculate メソッド内
if (input.listPrice <= mao70) {
  judgment = 'BUY';
  message = 'カスタムメッセージ';  // ← ここを変更
}
```

### 補助金制度の追加・変更

`SubsidyDiagnosis` クラスの `constructor` 内で制度データを編集:

```javascript
this.subsidies = {
  newSubsidy: {
    name: '新しい補助金',
    maxAmount: 100,
    amountText: '最大100万円',
    description: '○○向け',
    matchScore: 2,
    avgAmount: 50,
  },
  // ...既存の制度
};
```

## 🌐 フロントエンド連携

### APIエンドポイント例

```javascript
// Express.js の例
const express = require('express');
const MaoCalculator = require('./diagnosis-tools/mao-calculator');

const app = express();
app.use(express.json());

// MAO計算API
app.post('/api/mao-calculate', (req, res) => {
  try {
    const calculator = new MaoCalculator();
    const result = calculator.calculate(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// 補助金診断API
app.post('/api/subsidy-diagnose', (req, res) => {
  try {
    const diagnosis = new SubsidyDiagnosis();
    const result = diagnosis.diagnose(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ... 他のエンドポイント
```

### Reactコンポーネント例

```jsx
import React, { useState } from 'react';

function MaoCalculatorForm() {
  const [input, setInput] = useState({
    arv: '',
    rehabCost: '',
    listPrice: '',
    contingencyRate: 0.15,
  });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/mao-calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arv: parseFloat(input.arv),
        rehabCost: parseFloat(input.rehabCost),
        listPrice: parseFloat(input.listPrice),
        contingencyRate: parseFloat(input.contingencyRate),
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      setResult(data.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム要素 */}
      {result && (
        <div className="result">
          <h3>{result.judgment}</h3>
          <p>{result.message}</p>
          {/* 結果表示 */}
        </div>
      )}
    </form>
  );
}
```

## 📝 エラーハンドリング

すべてのクラスは入力値の検証を行い、不正な値の場合はエラーをスローします:

```javascript
try {
  const result = calculator.calculate(input);
} catch (error) {
  console.error('診断エラー:', error.message);
  // ユーザーにエラーメッセージを表示
}
```

## 🔒 セキュリティ考慮事項

- 入力値は必ず検証する
- SQL インジェクション対策（データベース使用時）
- XSS 対策（ユーザー入力を表示する際）
- CSRF トークンの使用（フォーム送信時）

## 📈 今後の拡張案

1. **データベース連携**
   - 診断結果の保存
   - ユーザー履歴の管理
   - 統計データの収集

2. **PDF生成機能**
   - 診断結果のPDF出力
   - メール送信機能

3. **A/Bテスト機能**
   - 判定基準の最適化
   - メッセージの効果測定

4. **管理画面**
   - 補助金制度の更新
   - 判定基準の調整
   - 統計データの閲覧

## 📞 サポート

実装に関する質問や問題がある場合は、お気軽にお問い合わせください。

---

**バージョン:** 1.0.0  
**最終更新:** 2026年1月24日
