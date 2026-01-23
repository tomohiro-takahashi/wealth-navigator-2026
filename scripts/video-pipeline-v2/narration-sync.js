/**
 * narration-sync.js
 * 
 * ナレーション生成 + タイムスタンプ同期スクリプト
 * 
 * 処理フロー:
 * 1. video-script.json を読み込み
 * 2. 各シーンのナレーションテキストをTTSで音声化
 * 3. 生成した音声をSTTで解析し、単語タイムスタンプを取得
 * 4. タイムスタンプからキャプションを生成
 * 5. 更新されたJSONを出力
 * 
 * 使用API:
 * - Google Cloud Text-to-Speech API
 * - Google Cloud Speech-to-Text API
 */

const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// ============================
// 設定
// ============================

const CONFIG = {
  // 入出力
  inputScript: path.resolve(__dirname, '../../video-generator/src/video-script.json'),
  outputScript: path.resolve(__dirname, '../../video-generator/src/video-script-synced.json'),
  audioOutputDir: path.resolve(__dirname, '../../video-generator/public/audio'),

  // TTS設定
  tts: {
    languageCode: 'ja-JP',
    // 日本語のおすすめ音声
    voices: {
      male: 'ja-JP-Neural2-C',      // 男性（落ち着いた）
      female: 'ja-JP-Neural2-B',    // 女性
      maleWavenet: 'ja-JP-Wavenet-C',
      femaleWavenet: 'ja-JP-Wavenet-B',
    },
    speakingRate: 0.95,  // やや遅め
    pitch: 0,
    audioEncoding: 'LINEAR16',  // STT解析用にWAV形式
  },

  // STT設定
  stt: {
    languageCode: 'ja-JP',
    model: 'latest_long',
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
  },

  // キャプション生成設定
  caption: {
    maxWordsPerCaption: 15,      // 1キャプションあたりの最大単語数
    maxCharsPerCaption: 40,      // 1キャプションあたりの最大文字数（日本語）
    minDurationSec: 1.5,         // 最小表示時間
    maxDurationSec: 5.0,         // 最大表示時間
  }
};

// ============================
// クライアント初期化
// ============================

const ttsClient = new textToSpeech.TextToSpeechClient();
const sttClient = new speech.SpeechClient();

// ============================
// TTS: テキストを音声に変換
// ============================

async function synthesizeSpeech(text, outputPath, voiceGender = 'male') {
  const voiceName = voiceGender === 'female'
    ? CONFIG.tts.voices.female
    : CONFIG.tts.voices.male;

  const request = {
    input: { text },
    voice: {
      languageCode: CONFIG.tts.languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: CONFIG.tts.audioEncoding,
      speakingRate: CONFIG.tts.speakingRate,
      pitch: CONFIG.tts.pitch,
      sampleRateHertz: 24000,  // 高品質
    },
  };

  console.log(`  [TTS] Synthesizing: "${text.substring(0, 30)}..."`);

  const [response] = await ttsClient.synthesizeSpeech(request);

  // 音声ファイルを保存
  fs.writeFileSync(outputPath, response.audioContent, 'binary');
  console.log(`  [TTS] Saved: ${outputPath}`);

  // 音声の長さを取得（ffprobeを使用）
  const duration = getAudioDuration(outputPath);

  return {
    audioPath: outputPath,
    durationSec: duration,
  };
}

// ============================
// 音声ファイルの長さを取得
// ============================

function getAudioDuration(audioPath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(result.trim());
  } catch (error) {
    console.warn(`  [WARN] Could not get duration for ${audioPath}, estimating...`);
    // ファイルサイズから推定（24kHz, 16bit mono = 48000 bytes/sec）
    const stats = fs.statSync(audioPath);
    return stats.size / 48000;
  }
}

// ============================
// STT: 音声から単語タイムスタンプを取得
// ============================

async function transcribeWithTimestamps(audioPath) {
  console.log(`  [STT] Transcribing: ${audioPath}`);

  const audioBytes = fs.readFileSync(audioPath).toString('base64');

  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 24000,
      languageCode: CONFIG.stt.languageCode,
      model: CONFIG.stt.model,
      enableWordTimeOffsets: CONFIG.stt.enableWordTimeOffsets,
      enableAutomaticPunctuation: CONFIG.stt.enableAutomaticPunctuation,
    },
  };

  const [response] = await sttClient.recognize(request);

  // 単語タイムスタンプを抽出
  const wordTimestamps = [];

  for (const result of response.results) {
    const alternative = result.alternatives[0];

    if (alternative.words) {
      for (const wordInfo of alternative.words) {
        const startTime = parseGoogleDuration(wordInfo.startTime);
        const endTime = parseGoogleDuration(wordInfo.endTime);

        wordTimestamps.push({
          word: wordInfo.word,
          start_sec: startTime,
          end_sec: endTime,
        });
      }
    }
  }

  console.log(`  [STT] Found ${wordTimestamps.length} words`);

  return wordTimestamps;
}

// Google Duration形式をパース（"1.500s" or {seconds: 1, nanos: 500000000}）
function parseGoogleDuration(duration) {
  if (typeof duration === 'string') {
    return parseFloat(duration.replace('s', ''));
  }

  const seconds = parseInt(duration.seconds || 0);
  const nanos = parseInt(duration.nanos || 0);
  return seconds + nanos / 1e9;
}

// ============================
// キャプション生成
// ============================

function generateCaptions(wordTimestamps, originalText) {
  if (!wordTimestamps || wordTimestamps.length === 0) {
    // タイムスタンプがない場合、テキストを均等分割
    return generateFallbackCaptions(originalText, 10); // 仮の10秒
  }

  const captions = [];
  let currentCaption = {
    words: [],
    text: '',
    start_sec: 0,
    end_sec: 0,
  };

  for (let i = 0; i < wordTimestamps.length; i++) {
    const word = wordTimestamps[i];

    // 最初の単語
    if (currentCaption.words.length === 0) {
      currentCaption.start_sec = word.start_sec;
    }

    currentCaption.words.push(word.word);
    currentCaption.end_sec = word.end_sec;
    currentCaption.text = currentCaption.words.join('');

    // キャプションを区切るかどうか判定
    const shouldSplit =
      // 文字数上限
      currentCaption.text.length >= CONFIG.caption.maxCharsPerCaption ||
      // 句読点で区切る
      /[。、！？]$/.test(word.word) ||
      // 時間上限
      (currentCaption.end_sec - currentCaption.start_sec) >= CONFIG.caption.maxDurationSec;

    if (shouldSplit && i < wordTimestamps.length - 1) {
      captions.push({
        text: currentCaption.text,
        start_sec: roundTo(currentCaption.start_sec, 2),
        end_sec: roundTo(currentCaption.end_sec, 2),
      });

      currentCaption = {
        words: [],
        text: '',
        start_sec: 0,
        end_sec: 0,
      };
    }
  }

  // 最後のキャプション
  if (currentCaption.words.length > 0) {
    captions.push({
      text: currentCaption.text,
      start_sec: roundTo(currentCaption.start_sec, 2),
      end_sec: roundTo(currentCaption.end_sec, 2),
    });
  }

  return captions;
}

// フォールバック: タイムスタンプがない場合の均等分割
function generateFallbackCaptions(text, durationSec) {
  // 句読点で分割
  const sentences = text.split(/(?<=[。、！？])/g).filter(s => s.trim());

  if (sentences.length === 0) {
    return [{
      text: text,
      start_sec: 0,
      end_sec: durationSec,
    }];
  }

  const avgDuration = durationSec / sentences.length;
  let currentTime = 0;

  return sentences.map(sentence => {
    const caption = {
      text: sentence.trim(),
      start_sec: roundTo(currentTime, 2),
      end_sec: roundTo(currentTime + avgDuration, 2),
    };
    currentTime += avgDuration;
    return caption;
  });
}

function roundTo(num, decimals) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ============================
// メイン処理
// ============================

async function processScript(inputPath, outputPath) {
  console.log('='.repeat(60));
  console.log('Narration Sync Script v1.0');
  console.log('='.repeat(60));

  // JSONを読み込み
  const script = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`\nLoaded: ${inputPath}`);
  console.log(`Brand: ${script.brand_id || 'default'}`);
  console.log(`Scenes: ${script.scenes.length}`);

  // 出力ディレクトリを作成
  if (!fs.existsSync(CONFIG.audioOutputDir)) {
    fs.mkdirSync(CONFIG.audioOutputDir, { recursive: true });
  }

  // 音声の性別を取得
  const voiceGender = script.metadata?.voice_config?.gender || 'male';

  // 各シーンを処理
  let totalDuration = 0;

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    console.log(`\n--- Scene ${scene.scene_id} (${scene.section_type}) ---`);

    const audioFileName = `scene_${scene.scene_id}_${scene.section_type}.wav`;
    const audioPath = path.join(CONFIG.audioOutputDir, audioFileName);

    try {
      // 1. TTS: 音声生成
      const ttsResult = await synthesizeSpeech(
        scene.narration_text,
        audioPath,
        voiceGender
      );

      // 2. 実際の尺を設定
      scene.narration_duration_sec = roundTo(ttsResult.durationSec, 2);
      console.log(`  Duration: ${scene.narration_duration_sec}s`);

      // 3. STT: 単語タイムスタンプを取得
      const wordTimestamps = await transcribeWithTimestamps(audioPath);

      // 4. キャプション生成
      scene.captions = generateCaptions(wordTimestamps, scene.narration_text);
      console.log(`  Captions: ${scene.captions.length}`);

      // 5. 単語タイムスタンプも保存（オプション）
      scene.word_timestamps = wordTimestamps;

      totalDuration += scene.narration_duration_sec;

    } catch (error) {
      console.error(`  [ERROR] Failed to process scene ${scene.scene_id}:`, error.message);

      // エラー時はフォールバック
      scene.narration_duration_sec = scene.duration_target_sec;
      scene.captions = generateFallbackCaptions(
        scene.narration_text,
        scene.duration_target_sec
      );
    }
  }

  // メタデータを更新
  script.metadata.total_duration = roundTo(totalDuration, 2);
  script.metadata.synced_at = new Date().toISOString();

  // 結果を保存
  fs.writeFileSync(outputPath, JSON.stringify(script, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETED');
  console.log('='.repeat(60));
  console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`Output: ${outputPath}`);

  return script;
}

// ============================
// 音声ファイルを結合
// ============================

async function concatenateAudio(script, outputPath) {
  console.log('\n--- Concatenating Audio ---');

  const audioFiles = script.scenes.map(scene => {
    const audioFileName = `scene_${scene.scene_id}_${scene.section_type}.wav`;
    return path.join(CONFIG.audioOutputDir, audioFileName);
  });

  // ファイルリストを作成
  const listPath = path.join(CONFIG.audioOutputDir, 'concat_list.txt');
  const listContent = audioFiles.map(f => `file '${path.resolve(f)}'`).join('\n');
  fs.writeFileSync(listPath, listContent, 'utf-8');

  // ffmpegで結合
  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:a libmp3lame -q:a 2 "${outputPath}"`,
      { stdio: 'inherit' }
    );
    console.log(`Combined audio saved: ${outputPath}`);
  } catch (error) {
    console.error('Failed to concatenate audio:', error.message);
  }

  // 一時ファイルを削除
  fs.unlinkSync(listPath);
}

// ============================
// CLI実行
// ============================

async function main() {
  const args = process.argv.slice(2);

  const inputPath = args[0] || CONFIG.inputScript;
  const outputPath = args[1] || CONFIG.outputScript;

  try {
    const script = await processScript(inputPath, outputPath);

    // 音声を結合
    // Output to video-generator/public/audio.mp3 (sibling to audio dir)
    const audioFilePath = path.resolve(CONFIG.audioOutputDir, '../audio.mp3');
    await concatenateAudio(script, audioFilePath);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// エクスポート（モジュールとして使用する場合）
module.exports = {
  processScript,
  synthesizeSpeech,
  transcribeWithTimestamps,
  generateCaptions,
  CONFIG,
};

// 直接実行された場合
if (require.main === module) {
  main();
}
