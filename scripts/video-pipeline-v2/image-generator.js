/**
 * image-generator.js
 * 
 * ブランド別の背景画像生成スクリプト
 * 
 * 処理フロー:
 * 1. video-script.json を読み込み
 * 2. 各シーンのvisual_promptとブランドIDから画像プロンプトを生成
 * 3. Google Imagen API (または Vertex AI) で画像生成
 * 4. public/scenes/ に保存
 * 
 * 使用API:
 * - Google Cloud Vertex AI (Imagen)
 */

const fs = require('fs');
const path = require('path');
const { VertexAI } = require('@google-cloud/vertexai');
const sharp = require('sharp');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// ============================
// 設定
// ============================

const CONFIG = {
  // Google Cloud
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id',
  location: 'us-central1',

  // 入出力
  inputScript: path.resolve(__dirname, '../../video-generator/src/video-script.json'),
  outputDir: path.resolve(__dirname, '../../video-generator/public/scenes'),

  // Imagen設定
  imagen: {
    model: 'imagen-3.0-generate-001',  // Imagen 3
    aspectRatio: '9:16',           // 縦型動画用
    numberOfImages: 1,
    guidanceScale: 7.5,
    seed: null,  // nullでランダム
  },
};

// ============================
// ブランド別スタイル設定
// ============================

const BRAND_STYLES = {
  wealth: {
    stylePrefix: 'Luxury, premium, elegant, professional photography,',
    colorPalette: 'dark navy, gold accents, white, marble textures',
    mood: 'sophisticated, authoritative, exclusive',
    negativePrompt: 'text, watermark, logo, low quality, blurry, cartoon, anime, illustration',
  },

  kominka: {
    stylePrefix: 'Cinematic, atmospheric, real estate photography,',
    colorPalette: 'warm wood tones, gold, traditional Japanese colors',
    mood: 'dramatic, inspiring, nostalgic yet modern',
    negativePrompt: 'text, watermark, logo, low quality, blurry, cartoon, people faces',
  },

  legacy: {
    stylePrefix: 'Warm, nostalgic, emotional photography,',
    colorPalette: 'warm beige, soft green, brown, sepia tones',
    mood: 'comforting, reassuring, homely, peaceful',
    negativePrompt: 'text, watermark, logo, low quality, harsh lighting, cold colors',
  },

  flip: {
    stylePrefix: 'Modern, sharp, high contrast photography,',
    colorPalette: 'black, white, red accents, minimal',
    mood: 'professional, analytical, serious, cold',
    negativePrompt: 'text, watermark, logo, low quality, warm colors, soft focus',
  },

  subsidy: {
    stylePrefix: 'Bright, clean, friendly photography,',
    colorPalette: 'soft green, cream, orange, white',
    mood: 'warm, inviting, simple, approachable',
    negativePrompt: 'text, watermark, logo, low quality, dark, complex, cluttered',
  },
};

// ============================
// セクションタイプ別のデフォルトサブジェクト
// ============================

const DEFAULT_SUBJECTS = {
  wealth: {
    hook: 'luxury office with city night view, marble desk, dramatic lighting',
    truth: 'abstract financial data visualization, dark background, gold lines',
    solution: 'elegant private banking interior, leather chairs, warm lighting',
    cta: 'abstract dark navy gradient with floating gold particles',
  },
  kominka: {
    hook: 'abandoned Japanese traditional house at golden hour, overgrown garden',
    truth: 'data infographic about vacant houses in Japan, dark background',
    solution: 'beautifully renovated kominka interior, modern meets traditional',
    cta: 'abstract premium background, navy and gold, light particles',
  },
  legacy: {
    hook: 'nostalgic Japanese suburban house exterior, afternoon light',
    protagonist: 'silhouette of person looking at old house, emotional lighting',
    conflict: 'overgrown garden of neglected house, melancholic atmosphere',
    turnaround: 'family discussion around table, warm interior lighting',
    solution: 'bright renovated living room, modern and comfortable',
    cta: 'soft beige and green gradient, gentle light rays',
  },
  flip: {
    hook: 'dramatic before-after split of property renovation, high contrast',
    secret_hook: 'mysterious dark room with single spotlight on documents',
    truth: 'financial charts and property data, red and white on black',
    reveal: 'auction gavel with property documents, dramatic lighting',
    real_way: 'calculator and property blueprints, professional setup',
    solution: 'modern renovated apartment, clean minimal style',
    cta: 'pure black background with minimal red geometric lines',
  },
  subsidy: {
    hook: 'bright modern bathroom after renovation, clean white tiles',
    question: 'friendly illustration style house with question mark',
    truth: 'simple infographic of house with yen symbols, pastel colors',
    logic: 'cheerful kitchen renovation, natural light, modern appliances',
    correction: 'checklist with green checkmarks, clean design',
    better_alternative: 'happy home renovation result, bright and welcoming',
    solution: 'beautiful renovated interior, natural light streaming in',
    cta: 'soft green and cream gradient with friendly rounded shapes',
  },
};

// ============================
// プロンプト生成
// ============================

function buildImagePrompt(scene, brandId) {
  const brandStyle = BRAND_STYLES[brandId] || BRAND_STYLES.wealth;
  const defaultSubjects = DEFAULT_SUBJECTS[brandId] || DEFAULT_SUBJECTS.wealth;

  // シーンのvisual_promptがあればそれを使用、なければデフォルト
  let subject = scene.visual_prompt;
  if (!subject || subject.trim() === '') {
    subject = defaultSubjects[scene.section_type] || defaultSubjects.solution;
  }

  // プロンプトを構築
  const prompt = [
    brandStyle.stylePrefix,
    subject,
    `Color palette: ${brandStyle.colorPalette}.`,
    `Mood: ${brandStyle.mood}.`,
    '4K quality, professional photography, vertical 9:16 aspect ratio.',
  ].join(' ');

  return {
    prompt,
    negativePrompt: brandStyle.negativePrompt,
  };
}

// ============================
// Vertex AI Imagen で画像生成
// ============================

// Google Auth (認証用)
const { GoogleAuth } = require('google-auth-library');

async function generateImage(prompt, negativePrompt, outputPath) {
  console.log(`  [IMAGEN] Generating image...`);
  console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const endpoint = `https://${CONFIG.location}-aiplatform.googleapis.com/v1/projects/${CONFIG.projectId}/locations/${CONFIG.location}/publishers/google/models/${CONFIG.imagen.model}:predict`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
      }
    ],
    parameters: {
      sampleCount: CONFIG.imagen.numberOfImages,
      aspectRatio: CONFIG.imagen.aspectRatio,
      guidanceScale: CONFIG.imagen.guidanceScale,
      negativePrompt: negativePrompt, // Imagen 2 supports negativePrompt in parameters
    }
  };

  if (CONFIG.imagen.seed) {
    requestBody.parameters.seed = CONFIG.imagen.seed;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.predictions && data.predictions.length > 0) {
    // Imagen responds with base64 in 'bytesBase64Encoded' inside predictions
    // Ensure the structure matches what Imagen 2 returns
    const prediction = data.predictions[0];
    const base64Data = prediction.bytesBase64Encoded;

    if (!base64Data) {
      throw new Error('No image data found in prediction');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, buffer);

    console.log(`  [IMAGEN] Saved: ${outputPath}`);
    return true;
  }

  console.warn('  [IMAGEN] No predictions returned');
  return false;
}

// ============================
// フォールバック: プレースホルダー画像生成
// ============================

async function createPlaceholderImage(brandId, sectionType, outputPath) {
  console.log(`  [PLACEHOLDER] Creating placeholder for ${brandId}/${sectionType}`);

  // SVGでプレースホルダーを作成
  const brandColors = {
    wealth: { bg: '#0A1628', text: '#D4AF37' },
    kominka: { bg: '#0A1628', text: '#D4AF37' },
    legacy: { bg: '#F5F1EB', text: '#2D4A3E' },
    flip: { bg: '#0D0D0D', text: '#E63946' },
    subsidy: { bg: '#FFF8E1', text: '#7CB342' },
  };

  const colors = brandColors[brandId] || brandColors.wealth;

  const svg = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colors.bg}"/>
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            fill="${colors.text}" 
            text-anchor="middle">
        ${brandId.toUpperCase()}
      </text>
      <text x="50%" y="55%" 
            font-family="Arial, sans-serif" 
            font-size="32" 
            fill="${colors.text}" 
            text-anchor="middle" 
            opacity="0.7">
        ${sectionType}
      </text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`  [PLACEHOLDER] Saved PNG: ${outputPath}`);
  } catch (e) {
    console.error(`  [PLACEHOLDER] Sharp failed: ${e.message}, saving SVG`);
    const svgPath = outputPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg, 'utf-8');
    return svgPath;
  }

  return outputPath;
}

// ============================
// メイン処理
// ============================

async function processScript(inputPath) {
  console.log('='.repeat(60));
  console.log('Image Generator Script v1.0');
  console.log('='.repeat(60));

  // JSONを読み込み
  const script = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const brandId = script.brand_id || 'wealth';

  console.log(`\nLoaded: ${inputPath}`);
  console.log(`Brand: ${brandId}`);
  console.log(`Scenes: ${script.scenes.length}`);

  // 出力ディレクトリを作成
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // 各シーンの画像を生成
  const results = [];

  for (const scene of script.scenes) {
    console.log(`\n--- Scene ${scene.scene_id} (${scene.section_type}) ---`);

    const outputFileName = `scene_${scene.scene_id}.png`;
    const outputPath = path.join(CONFIG.outputDir, outputFileName);

    // プロンプト生成
    const { prompt, negativePrompt } = buildImagePrompt(scene, brandId);

    // 画像生成を試行 (リトライロジック付き)
    let success = false;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      try {
        success = await generateImage(prompt, negativePrompt, outputPath);
        if (success) break; // 成功したらループを抜ける
      } catch (error) {
        // 429エラー (Quota Exceeded) の場合のみリトライ
        if (error.message.includes('429') && retries < maxRetries) {
          const waitTime = 20000 * (retries + 1); // 20s, 40s, 60s
          console.warn(`  [IMAGEN] Quota Exceeded (429). Waiting ${waitTime / 1000}s before retry ${retries + 1}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }

        console.error(`  [ERROR] ${error.message}`);
        break; // その他のエラーはリトライしない
      }
      break; // 成功またはリトライ対象外のエラーでループ終了
    }

    // 失敗した場合はプレースホルダー
    if (!success) {
      createPlaceholderImage(brandId, scene.section_type, outputPath);
    }

    results.push({
      scene_id: scene.scene_id,
      section_type: scene.section_type,
      image_path: outputPath,
      success,
    });
    // シーン間に短い待機を入れて負荷分散 (1s)
    if (scene !== script.scenes[script.scenes.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETED');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  console.log(`Generated: ${successCount}/${results.length} images`);

  return results;
}

// ============================
// CLI実行
// ============================

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || CONFIG.inputScript;

  try {
    await processScript(inputPath);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// エクスポート
module.exports = {
  processScript,
  generateImage,
  buildImagePrompt,
  BRAND_STYLES,
  DEFAULT_SUBJECTS,
  CONFIG,
};

// 直接実行
if (require.main === module) {
  main();
}
