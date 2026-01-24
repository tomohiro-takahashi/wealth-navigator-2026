/**
 * 全診断ツールのテストコードと使用例
 */

const MaoCalculator = require('./mao-calculator.js');
const SubsidyDiagnosis = require('./subsidy-diagnosis.js');
const YieldCalculator = require('./yield-calculator.js');
const ChoiceDiagnosis = require('./choice-diagnosis.js');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('診断ツール テストプログラム');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ================================================
// 1. Flip Logic - MAO計算シミュレーター
// ================================================
console.log('■ TEST 1: Flip Logic - MAO計算シミュレーター\n');

const maoCalc = new MaoCalculator();

// テストケース1: PASS判定（売出価格が高すぎる）
console.log('【テストケース1-1】PASS判定');
const maoTest1 = maoCalc.calculate({
  arv: 3000,           // 想定再販価格3,000万円
  rehabCost: 450,      // リフォーム費用450万円
  listPrice: 1800,     // 売出価格1,800万円
  contingencyRate: 0.20, // 予備費率20%
});
console.log(maoCalc.formatResult(maoTest1));
console.log('\n');

// テストケース2: BUY判定（売出価格が適正）
console.log('【テストケース1-2】BUY判定');
const maoTest2 = maoCalc.calculate({
  arv: 3000,
  rehabCost: 450,
  listPrice: 1300,     // 売出価格1,300万円（適正）
  contingencyRate: 0.15,
});
console.log(maoCalc.formatResult(maoTest2));
console.log('\n');

// テストケース3: NEGOTIATE判定（交渉次第）
console.log('【テストケース1-3】NEGOTIATE判定');
const maoTest3 = maoCalc.calculate({
  arv: 2500,
  rehabCost: 350,
  listPrice: 1350,     // 売出価格1,350万円（交渉次第）
  contingencyRate: 0.15,
});
console.log(maoCalc.formatResult(maoTest3));
console.log('\n');

// ================================================
// 2. おうちの補助金相談室 - 補助金かんたん診断
// ================================================
console.log('■ TEST 2: おうちの補助金相談室 - 補助金かんたん診断\n');

const subsidyDiag = new SubsidyDiagnosis();

// テストケース1: 複数の補助金が該当
console.log('【テストケース2-1】複数補助金該当（子育て世帯）');
const subsidyTest1 = subsidyDiag.diagnose({
  prefecture: '東京都',
  buildingType: '戸建て',
  buildingAge: '20〜30年',
  renovationItems: ['窓の断熱', '給湯器', 'バリアフリー'],
  householdType: '18歳未満の子どもがいる',
});
console.log(subsidyDiag.formatResult(subsidyTest1));
console.log('\n補助金活用シート:');
console.log(subsidyDiag.generateSubsidySheet(subsidyTest1));
console.log('\n');

// テストケース2: 介護世帯
console.log('【テストケース2-2】介護世帯');
const subsidyTest2 = subsidyDiag.diagnose({
  prefecture: '大阪府',
  buildingType: 'マンション',
  buildingAge: '30〜40年',
  renovationItems: ['バリアフリー', '浴室'],
  householdType: '要介護・要支援の方がいる',
});
console.log(subsidyDiag.formatResult(subsidyTest2));
console.log('\n');

// テストケース3: 該当なし
console.log('【テストケース2-3】該当制度なし');
const subsidyTest3 = subsidyDiag.diagnose({
  prefecture: '福岡県',
  buildingType: 'マンション',
  buildingAge: '10年未満',
  renovationItems: ['キッチン'],
  householdType: 'いずれも該当しない',
});
console.log(subsidyDiag.formatResult(subsidyTest3));
console.log('\n');

// ================================================
// 3. 空き家錬金術 - 利回りシミュレーター
// ================================================
console.log('■ TEST 3: 空き家錬金術 - 利回りシミュレーター\n');

const yieldCalc = new YieldCalculator();

// テストケース1: 高利回り
console.log('【テストケース3-1】HIGH YIELD判定');
const yieldTest1 = yieldCalc.calculate({
  acquisitionPrice: 150,    // 物件取得150万円
  renovationCost: 300,      // リノベ300万円
  otherExpenses: 30,        // 諸経費30万円
  monthlyRent: 8,           // 月額家賃8万円
  annualExpenseRate: 0.15,  // 年間経費率15%
});
console.log(yieldCalc.formatResult(yieldTest1));
console.log('\n');

// テストケース2: 標準的な利回り
console.log('【テストケース3-2】STANDARD判定');
const yieldTest2 = yieldCalc.calculate({
  acquisitionPrice: 300,
  renovationCost: 200,
  otherExpenses: 40,
  monthlyRent: 5,
  annualExpenseRate: 0.15,
});
console.log(yieldCalc.formatResult(yieldTest2));
console.log('\n');

// テストケース3: 低利回り
console.log('【テストケース3-3】LOW YIELD判定');
const yieldTest3 = yieldCalc.calculate({
  acquisitionPrice: 800,
  renovationCost: 300,
  otherExpenses: 80,
  monthlyRent: 6,
  annualExpenseRate: 0.20,
});
console.log(yieldCalc.formatResult(yieldTest3));
console.log('\n');

// 諸経費の自動計算例
console.log('【参考】諸経費自動計算');
console.log(`物件価格500万円の場合の概算諸経費: ${yieldCalc.estimateOtherExpenses(500)}万円`);
console.log(`物件価格1000万円の場合の概算諸経費: ${yieldCalc.estimateOtherExpenses(1000)}万円\n`);

// ================================================
// 4. 親の家、どうする？ - 選択肢診断
// ================================================
console.log('■ TEST 4: 親の家、どうする？ - 選択肢診断\n');

const choiceDiag = new ChoiceDiagnosis();

// テストケース1: 売却タイプ
console.log('【テストケース4-1】売却タイプ');
const choiceTest1 = choiceDiag.diagnose({
  q1: 'ないと思う',
  q2: '難しい',
  q3: 'はい',
  q4: 'なさそう',
  q5: '3人以上',
  q6: '整理がついている',
  q7: '40年以上',
  q8: 'ほとんどない',
  q9: 'ないと思う',
  q10: '早く決着をつけたい',
});
console.log(choiceDiag.formatResult(choiceTest1));
console.log('\n詳細ガイド:');
console.log(choiceDiag.generateDetailedGuide(choiceTest1));
console.log('\n');

// テストケース2: 賃貸タイプ
console.log('【テストケース4-2】賃貸タイプ');
const choiceTest2 = choiceDiag.diagnose({
  q1: 'ないと思う',
  q2: '誰かに頼めばできる',
  q3: 'いいえ',
  q4: 'ありそう',
  q5: '自分だけ',
  q6: 'どちらとも言えない',
  q7: '20〜40年',
  q8: '年に数回以上',
  q9: '分からない',
  q10: 'じっくり考えたい',
});
console.log(choiceDiag.formatResult(choiceTest2));
console.log('\n');

// テストケース3: 所有継続タイプ
console.log('【テストケース4-3】所有継続タイプ');
const choiceTest3 = choiceDiag.diagnose({
  q1: 'ある',
  q2: 'できる',
  q3: 'いいえ',
  q4: '分からない',
  q5: '自分だけ',
  q6: '抵抗がある',
  q7: '20年未満',
  q8: '年に数回以上',
  q9: 'あるかもしれない',
  q10: 'じっくり考えたい',
});
console.log(choiceDiag.formatResult(choiceTest3));
console.log('\n');

// テストケース4: 複合型
console.log('【テストケース4-4】複合型（僅差）');
const choiceTest4 = choiceDiag.diagnose({
  q1: '分からない',
  q2: '誰かに頼めばできる',
  q3: '近い将来必要になりそう',
  q4: '分からない',
  q5: '2人',
  q6: 'どちらとも言えない',
  q7: '20〜40年',
  q8: '年に数回以上',
  q9: '分からない',
  q10: '何から始めればいいか分からない',
});
console.log(choiceDiag.formatResult(choiceTest4));
console.log('\n');

// ================================================
// エラーハンドリングのテスト
// ================================================
console.log('■ TEST 5: エラーハンドリング\n');

try {
  console.log('【テストケース5-1】不正な入力値（MAO計算）');
  maoCalc.calculate({
    arv: -1000,
    rehabCost: 450,
    listPrice: 1800,
    contingencyRate: 0.20,
  });
} catch (error) {
  console.log(`✓ エラー捕捉成功: ${error.message}\n`);
}

try {
  console.log('【テストケース5-2】必須項目未入力（補助金診断）');
  subsidyDiag.diagnose({
    prefecture: '東京都',
    buildingType: '戸建て',
    // buildingAgeが未入力
  });
} catch (error) {
  console.log(`✓ エラー捕捉成功: ${error.message}\n`);
}

try {
  console.log('【テストケース5-3】不正な経費率（利回り計算）');
  yieldCalc.calculate({
    acquisitionPrice: 500,
    renovationCost: 200,
    otherExpenses: 50,
    monthlyRent: 6,
    annualExpenseRate: 0.25, // 無効な値
  });
} catch (error) {
  console.log(`✓ エラー捕捉成功: ${error.message}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('全テスト完了');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
