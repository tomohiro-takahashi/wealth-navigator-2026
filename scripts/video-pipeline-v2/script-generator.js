/**
 * script-generator.js
 * 
 * AI（Claude/GPT）を使った動画台本の自動生成
 * 
 * 入力: 記事コンテンツ or トピック
 * 出力: video-script.json
 * 
 * 使用: Anthropic Claude API or OpenAI API
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// ============================
// 設定
// ============================

const CONFIG = {
  // API
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',

  // 出力
  outputPath: './src/video-script.json',

  // デフォルト設定
  defaultDuration: 60,
  defaultFps: 30,
};

// ============================
// ブランド別プロンプトテンプレート
// ============================

const BRAND_PROMPTS = {
  wealth: {
    persona: '富裕層向け資産コンサルタント。権威的かつ信頼感のあるトーン。',
    style: '高級感、データ重視、インサイダー情報の雰囲気',
    cta: '資産診断・無料相談',
  },
  kominka: {
    persona: '夢を語れる建築家 × 数字に厳しい投資家。情熱的だが現実的。',
    style: '空き家・古民家再生、民泊投資、インバウンド、利回り重視',
    cta: '非公開物件リストの配布',
  },
  legacy: {
    persona: '寄り添う相続コンサルタント。温かみがあり、共感的。',
    style: '感情に寄り添う、実家問題の解決、不安の解消',
    cta: '無料相談・査定',
  },
  flip: {
    persona: '冷徹な相場師（トレーダー）。感情を排し、数字だけで語る。',
    style: 'フリッピング、短期売買、出口逆算、プロ向け',
    cta: '利益シミュレーションシート',
  },
  subsidy: {
    persona: '補助金を使い倒したリフォーム会社の社長。親切でわかりやすい。',
    style: 'シニアフレンドリー、専門用語を使わない、「大丈夫」「簡単」',
    cta: 'LINE補助金診断',
  },
};

// ============================
// スクリプトパターン
// ============================

const SCRIPT_PATTERNS = {
  Type_A_Myth_Buster: {
    name: '常識破壊型',
    sections: ['hook', 'truth', 'solution', 'cta'],
    description: '常識を否定し、新しい正解を提示する',
  },
  Type_B_Failure_Story: {
    name: '失敗事例型',
    sections: ['protagonist', 'conflict', 'turnaround', 'cta'],
    description: '失敗事例から学ぶ教訓を伝える',
  },
  Type_C_Insider_Secret: {
    name: '裏側暴露型',
    sections: ['secret_hook', 'reveal', 'real_way', 'cta'],
    description: '業界の裏側を暴露し、本当の解決策を提示',
  },
  Type_D_Consultant_QA: {
    name: '対話型',
    sections: ['question', 'correction', 'better_alternative', 'cta'],
    description: 'よくある質問に専門家が回答する形式',
  },
};

// ============================
// プロンプト生成
// ============================

function buildPrompt(topic, brandId, patternId, articleContent = null) {
  const brand = BRAND_PROMPTS[brandId] || BRAND_PROMPTS.wealth;
  const pattern = SCRIPT_PATTERNS[patternId] || SCRIPT_PATTERNS.Type_A_Myth_Buster;

  const systemPrompt = `あなたは${brand.persona}

60秒の縦型ショート動画（TikTok/Instagram Reels/YouTube Shorts）の台本を作成してください。

## ブランドスタイル
${brand.style}

## 台本パターン: ${pattern.name}
${pattern.description}
セクション構成: ${pattern.sections.join(' → ')}

## 出力形式
以下のJSON形式で出力してください。narration_textは実際に読み上げる原稿、screen_textは画面に表示する短いテキストです。

\`\`\`json
{
  "project_title": "タイトル",
  "brand_id": "${brandId}",
  "pattern": "${patternId}",
  "scenes": [
    {
      "scene_id": 1,
      "section_type": "hook",
      "duration_target_sec": 6,
      "narration_text": "視聴者を引き込むナレーション（20-30文字程度）",
      "screen_text": "画面表示テキスト\\n（改行で2-3行）",
      "visual_prompt": "この場面の背景画像を生成するためのプロンプト（英語）"
    }
  ],
  "metadata": {
    "total_duration": 60,
    "fps": 30,
    "voice_config": {
      "language": "ja-JP",
      "gender": "male",
      "speaking_rate": 0.95
    }
  }
}
\`\`\`

## ルール
1. 総尺は55-65秒に収める
2. hookは5-8秒、最も短く衝撃的に
3. 各セクションのnarration_textは、読み上げ時間を考慮した適切な長さにする
4. screen_textは短く、インパクトのある単語を選ぶ（最大20文字/行）
5. visual_promptは英語で、具体的かつ映像的な指示を書く
6. CTAは「${brand.cta}」への誘導で終わる
7. 数字やデータを積極的に使用する`;

  let userPrompt = `以下のトピックで${pattern.name}の台本を作成してください。\n\nトピック: ${topic}`;

  if (articleContent) {
    userPrompt += `\n\n参考記事:\n${articleContent.substring(0, 3000)}`;
  }

  return { systemPrompt, userPrompt };
}

// ============================
// Claude API呼び出し
// ============================

async function generateScript(topic, brandId, patternId, articleContent = null) {
  console.log('='.repeat(60));
  console.log('Script Generator v1.0');
  console.log('='.repeat(60));
  console.log(`Topic: ${topic}`);
  console.log(`Brand: ${brandId}`);
  console.log(`Pattern: ${patternId}`);

  const anthropic = new Anthropic({
    apiKey: CONFIG.anthropicApiKey,
  });

  const { systemPrompt, userPrompt } = buildPrompt(topic, brandId, patternId, articleContent);

  console.log('\n[AI] Generating script...');

  const response = await anthropic.messages.create({
    model: CONFIG.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  // レスポンスからJSONを抽出
  const content = response.content[0].text;
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);

  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from response');
  }

  const script = JSON.parse(jsonMatch[1]);

  console.log(`[AI] Generated ${script.scenes.length} scenes`);

  return script;
}

// ============================
// 台本の検証・修正
// ============================

function validateAndFixScript(script) {
  // 必須フィールドの確認
  if (!script.scenes || !Array.isArray(script.scenes)) {
    throw new Error('Invalid script: missing scenes array');
  }

  // 各シーンの検証
  script.scenes = script.scenes.map((scene, index) => {
    return {
      scene_id: scene.scene_id || index + 1,
      section_type: scene.section_type || 'solution',
      duration_target_sec: scene.duration_target_sec || 10,
      narration_text: scene.narration_text || '',
      screen_text: scene.screen_text || '',
      visual_prompt: scene.visual_prompt || 'abstract professional background',
    };
  });

  // メタデータの確認
  if (!script.metadata) {
    script.metadata = {};
  }

  // 総尺を計算
  const totalDuration = script.scenes.reduce(
    (sum, scene) => sum + (scene.duration_target_sec || 10),
    0
  );
  script.metadata.total_duration = totalDuration;
  script.metadata.fps = script.metadata.fps || CONFIG.defaultFps;

  return script;
}

// ============================
// CLI実行
// ============================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node script-generator.js <topic> [brandId] [patternId] [articleFile]');
    console.log('');
    console.log('Brands: wealth, kominka, legacy, flip, subsidy');
    console.log('Patterns: Type_A_Myth_Buster, Type_B_Failure_Story, Type_C_Insider_Secret, Type_D_Consultant_QA');
    console.log('');
    console.log('Example:');
    console.log('  node script-generator.js "空き家投資の始め方" kominka Type_A_Myth_Buster');
    process.exit(1);
  }

  const topic = args[0];
  const brandId = args[1] || 'wealth';
  const patternId = args[2] || 'Type_A_Myth_Buster';
  const articleFile = args[3];

  let articleContent = null;
  if (articleFile && fs.existsSync(articleFile)) {
    articleContent = fs.readFileSync(articleFile, 'utf-8');
  }

  try {
    let script = await generateScript(topic, brandId, patternId, articleContent);
    script = validateAndFixScript(script);

    // 保存
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(script, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(60));
    console.log('COMPLETED');
    console.log('='.repeat(60));
    console.log(`Output: ${CONFIG.outputPath}`);
    console.log(`Total Duration: ${script.metadata.total_duration}s`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// エクスポート
module.exports = {
  generateScript,
  validateAndFixScript,
  BRAND_PROMPTS,
  SCRIPT_PATTERNS,
  CONFIG,
};

// 直接実行
if (require.main === module) {
  main();
}
