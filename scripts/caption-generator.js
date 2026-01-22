/**
 * caption-generator.js
 *
 * 自動テロップ生成（Google Cloud Speech-to-Text使用）
 *
 * 機能:
 * - Veo生成動画から音声を抽出
 * - Google Cloud STTで文字起こし + タイムスタンプ取得
 * - テロップデータとしてconfig.jsonに保存
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// ============================
// 設定
// ============================

const CONFIG = {
  // Google Cloud Speech-to-Text
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // テロップ設定
  caption: {
    maxCharsPerLine: 20, // 1行の最大文字数
    maxLinesPerCaption: 2, // 1テロップの最大行数
    minDurationSec: 0.5, // 最小表示時間
    maxDurationSec: 4.0, // 最大表示時間
  },

  // 一時ファイル
  tempDir: "./temp",
};

// ============================
// 音声抽出
// ============================

async function extractAudio(videoPath, outputPath) {
  console.log(`  🔊 Extracting audio from ${path.basename(videoPath)}...`);

  // FFmpegで音声を抽出
  await execPromise(
    `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`,
  );

  return outputPath;
}

/**
 * 複数の動画クリップの音声を結合
 */
async function extractAndConcatAudio(clipPaths, outputPath) {
  console.log(
    `  🔊 Extracting and concatenating audio from ${clipPaths.length} clips...`,
  );

  // 一時ファイルリストを作成
  const listPath = path.join(CONFIG.tempDir, "audio_list.txt");
  const tempAudioPaths = [];

  for (let i = 0; i < clipPaths.length; i++) {
    const tempAudioPath = path.join(CONFIG.tempDir, `temp_audio_${i}.wav`);
    await extractAudio(clipPaths[i], tempAudioPath);
    tempAudioPaths.push(tempAudioPath);
  }

  // ファイルリストを作成
  const listContent = tempAudioPaths
    .map((p) => `file '${path.resolve(p)}'`)
    .join("\n");
  fs.writeFileSync(listPath, listContent);

  // 音声を結合
  await execPromise(
    `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
  );

  // 一時ファイルを削除
  for (const p of tempAudioPaths) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  fs.unlinkSync(listPath);

  return outputPath;
}

// ============================
// Google Cloud Speech-to-Text
// ============================

async function transcribeWithGoogleSTT(audioPath) {
  console.log("  🎤 Transcribing with Google Cloud STT...");

  const speech = require("@google-cloud/speech");
  const client = new speech.SpeechClient();

  // 音声ファイルのサイズを確認
  const stats = fs.statSync(audioPath);
  const fileSizeMB = stats.size / (1024 * 1024);

  let transcription;

  if (fileSizeMB > 10) {
    // 大きいファイルはGCSにアップロードして非同期処理
    console.log(
      `  📁 Large file (${fileSizeMB.toFixed(1)}MB), using async recognition...`,
    );
    transcription = await transcribeLongAudio(client, audioPath);
  } else {
    // 小さいファイルは同期処理
    transcription = await transcribeShortAudio(client, audioPath);
  }

  console.log(
    `  ✓ Transcription complete: ${transcription.text.slice(0, 50)}...`,
  );

  return transcription;
}

/**
 * 短い音声の同期処理
 */
async function transcribeShortAudio(client, audioPath) {
  const audioBytes = fs.readFileSync(audioPath).toString("base64");

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "ja-JP",
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
    },
  };

  const [response] = await client.recognize(request);
  return parseGoogleSTTResponse(response);
}

/**
 * 長い音声の非同期処理（GCS経由）
 */
async function transcribeLongAudio(client, audioPath) {
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage();

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET || "video-pipeline-temp";
  const fileName = `stt-temp/${Date.now()}_${path.basename(audioPath)}`;

  // GCSにアップロード
  console.log("  📤 Uploading to GCS...");
  await storage.bucket(bucketName).upload(audioPath, { destination: fileName });

  const gcsUri = `gs://${bucketName}/${fileName}`;

  const request = {
    audio: { uri: gcsUri },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "ja-JP",
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
    },
  };

  // 非同期認識
  console.log("  ⏳ Processing (this may take a while)...");
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();

  // GCSから削除
  await storage.bucket(bucketName).file(fileName).delete();

  return parseGoogleSTTResponse(response);
}

/**
 * Google STTのレスポンスをパース
 */
function parseGoogleSTTResponse(response) {
  const words = [];
  let fullText = "";

  for (const result of response.results || []) {
    const alternative = result.alternatives?.[0];
    if (!alternative) continue;

    fullText += alternative.transcript;

    if (alternative.words) {
      for (const wordInfo of alternative.words) {
        words.push({
          word: wordInfo.word,
          start: parseGoogleDuration(wordInfo.startTime),
          end: parseGoogleDuration(wordInfo.endTime),
        });
      }
    }
  }

  return { text: fullText, words };
}

/**
 * Googleの時間形式をパース
 */
function parseGoogleDuration(duration) {
  if (!duration) return 0;
  const seconds = parseInt(duration.seconds || 0, 10);
  const nanos = parseInt(duration.nanos || 0, 10);
  return seconds + nanos / 1e9;
}

// ============================
// テロップデータ生成
// ============================

function generateCaptions(transcription, clipDurations) {
  console.log("  💬 Generating captions...");

  const captions = [];

  const words = transcription.words || [];

  if (words.length > 0) {
    // 単語ベースの処理
    let buffer = [];
    let bufferStart = null;

    for (const word of words) {
      if (bufferStart === null) {
        bufferStart = word.start;
      }

      buffer.push(word.word);
      const currentText = buffer.join("");

      // テロップの長さ制限をチェック
      if (
        currentText.length >=
          CONFIG.caption.maxCharsPerLine * CONFIG.caption.maxLinesPerCaption ||
        word.end - bufferStart >= CONFIG.caption.maxDurationSec
      ) {
        captions.push({
          text: formatCaptionText(currentText),
          start_sec: bufferStart,
          end_sec: word.end,
        });

        buffer = [];
        bufferStart = null;
      }
    }

    // 残りを追加
    if (buffer.length > 0) {
      const lastWord = words[words.length - 1];
      captions.push({
        text: formatCaptionText(buffer.join("")),
        start_sec: bufferStart,
        end_sec: lastWord.end,
      });
    }
  }

  // シーンごとにグループ化
  const captionsByScene = groupCaptionsByScene(captions, clipDurations);

  console.log(`  ✓ Generated ${captions.length} captions`);

  return captionsByScene;
}

/**
 * テロップテキストをフォーマット（改行挿入）
 */
function formatCaptionText(text) {
  const maxChars = CONFIG.caption.maxCharsPerLine;

  if (text.length <= maxChars) {
    return text;
  }

  // 適切な位置で改行
  const lines = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }

    // 句読点や助詞で分割
    let splitPoint = maxChars;
    const breakPoints = ["、", "。", "は", "が", "を", "に", "で", "と"];

    for (const bp of breakPoints) {
      const idx = remaining.slice(0, maxChars).lastIndexOf(bp);
      if (idx > 5) {
        splitPoint = idx + 1;
        break;
      }
    }

    lines.push(remaining.slice(0, splitPoint).trim());
    remaining = remaining.slice(splitPoint).trim();

    if (lines.length >= CONFIG.caption.maxLinesPerCaption) {
      if (remaining.length > 0) {
        lines[lines.length - 1] += "...";
      }
      break;
    }
  }

  return lines.join("\n");
}

/**
 * テロップをシーンごとにグループ化
 */
function groupCaptionsByScene(captions, clipDurations) {
  const result = [];
  let accumulatedTime = 0;

  for (let i = 0; i < clipDurations.length; i++) {
    const sceneStart = accumulatedTime;
    const sceneEnd = accumulatedTime + clipDurations[i];

    const sceneCaptions = captions
      .filter((c) => c.start_sec >= sceneStart && c.start_sec < sceneEnd)
      .map((c) => ({
        text: c.text,
        start_sec: c.start_sec - sceneStart, // シーン内相対時間に変換
        end_sec: Math.min(c.end_sec, sceneEnd) - sceneStart,
      }));

    result.push({
      scene_id: i + 1,
      entries: sceneCaptions,
    });

    accumulatedTime = sceneEnd;
  }

  return result;
}

// ============================
// メイン処理
// ============================

async function generateCaptionsForProject(projectId) {
  console.log("\n" + "=".repeat(60));
  console.log(`Caption Generator: ${projectId}`);
  console.log("=".repeat(60));

  const projectPath = path.join("./projects", projectId);
  const configPath = path.join(projectPath, "config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  // クリップのパスを取得
  const clipPaths = config.clips.map((c) => path.join(projectPath, c.file));
  const clipDurations = config.clips.map((c) => c.duration_sec);

  if (clipPaths.length === 0) {
    throw new Error("No clips found. Run sync-clips first.");
  }

  // 一時ディレクトリ作成
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
  }

  // 音声を抽出・結合
  const combinedAudioPath = path.join(CONFIG.tempDir, `${projectId}_audio.wav`);
  await extractAndConcatAudio(clipPaths, combinedAudioPath);

  // 文字起こし（Google Cloud STT）
  const transcription = await transcribeWithGoogleSTT(combinedAudioPath);

  // テロップデータ生成
  const captions = generateCaptions(transcription, clipDurations);

  // config.jsonを更新
  config.captions = captions;
  config.transcription = {
    full_text: transcription.text,
    generated_at: new Date().toISOString(),
  };
  config.status = "captions_ready";
  config.updated_at = new Date().toISOString();

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  // 一時ファイル削除
  if (fs.existsSync(combinedAudioPath)) {
    fs.unlinkSync(combinedAudioPath);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Captions generated successfully!");
  console.log("=".repeat(60));

  // サマリー表示
  let totalCaptions = 0;
  for (const scene of captions) {
    console.log(`\nScene ${scene.scene_id}: ${scene.entries.length} captions`);
    for (const entry of scene.entries.slice(0, 2)) {
      console.log(
        `  [${entry.start_sec.toFixed(1)}s] ${entry.text.replace(/\n/g, " | ")}`,
      );
    }
    if (scene.entries.length > 2) {
      console.log(`  ... and ${scene.entries.length - 2} more`);
    }
    totalCaptions += scene.entries.length;
  }

  console.log(`\nTotal: ${totalCaptions} captions`);

  return captions;
}

// ============================
// CLI実行
// ============================

async function main() {
  const args = process.argv.slice(2);
  const projectId = args[0];

  if (!projectId) {
    console.log("Usage: node caption-generator.js <project_id>");
    console.log("");
    console.log("This will:");
    console.log("  1. Extract audio from all clips");
    console.log("  2. Transcribe using Google Cloud STT");
    console.log("  3. Generate timed captions");
    console.log("  4. Update config.json");
    process.exit(1);
  }

  await generateCaptionsForProject(projectId);
}

// エクスポート
module.exports = {
  generateCaptionsForProject,
  extractAudio,
  transcribeWithGoogleSTT,
  generateCaptions,
  CONFIG,
};

if (require.main === module) {
  main().catch(console.error);
}
