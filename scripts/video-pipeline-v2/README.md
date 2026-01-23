# Remotion マルチブランド動画生成システム Ver 4.0

## 概要

5つのブランド（Wealth Navigator + 4派生メディア）に対応した、60秒縦型ショート動画の自動生成システムです。

## 対応ブランド

| Brand ID | メディア名 | 特徴 |
|----------|-----------|------|
| `wealth` | Wealth Navigator | 富裕層向け、権威性、エレガント |
| `kominka` | 空き家錬金術 | 投資家向け、ダイナミック、ゴールド |
| `legacy` | 親の家、どうする？ | シニア向け、温かみ、やさしい |
| `flip` | Flip Logic | プロ向け、シャープ、冷徹 |
| `subsidy` | おうちの補助金相談室 | シニア向け、明るい、フレンドリー |

## 動画生成パイプライン

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① トピック/記事                                            │
│       ↓                                                     │
│  ② script-generator.js (Claude AI)                         │
│       → video-script.json 生成                              │
│       ↓                                                     │
│  ③ narration-sync.js (Google TTS + STT)                    │
│       → 音声生成 + 単語タイムスタンプ取得                    │
│       → video-script-synced.json 生成                       │
│       ↓                                                     │
│  ④ image-generator.js (Google Imagen)                      │
│       → ブランド別背景画像生成                               │
│       ↓                                                     │
│  ⑤ Remotion レンダリング                                    │
│       → 60秒縦型ショート動画 (MP4)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ファイル構成

```
remotion-upgrade/
├── src/
│   ├── MyVideo.tsx         # メイン動画コンポーネント
│   ├── Root.tsx            # Remotionエントリーポイント
│   ├── brandConfig.ts      # ブランド設定（色、フォント、オーバーレイ）
│   ├── motionPresets.ts    # モーションプリセット（Ken Burns等）
│   ├── TextAnimations.tsx  # テキストアニメーション群
│   ├── types.ts            # 型定義
│   ├── style.css           # グローバルスタイル
│   └── video-script.json   # 生成された台本
├── scripts/
│   ├── script-generator.js # AI台本生成（Claude API）
│   ├── narration-sync.js   # TTS + タイムスタンプ同期
│   ├── image-generator.js  # 背景画像生成（Imagen）
│   └── create-video.sh     # 統合パイプライン
├── public/
│   ├── audio/              # 生成された音声ファイル
│   └── scenes/             # 生成された背景画像
├── out/                    # レンダリング出力
├── package.json
└── tsconfig.json
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
# Google Cloud認証
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Anthropic API（台本生成用）
export ANTHROPIC_API_KEY="your-api-key"
```

### 3. Google Cloud APIの有効化

- Cloud Text-to-Speech API
- Cloud Speech-to-Text API
- Vertex AI API (Imagen)

## 使い方

### 方法1: 統合パイプライン（推奨）

```bash
# トピックから動画を一括生成
npm run create:video
```

### 方法2: ステップごとに実行

```bash
# 1. 台本生成
npm run generate:script -- "空き家投資の始め方" kominka Type_A_Myth_Buster

# 2. ナレーション同期
npm run sync:narration

# 3. 画像生成
npm run generate:images

# 4. 動画レンダリング
npm run render
```

### 方法3: 既存の台本から動画生成

```bash
# video-script.jsonを手動で作成/編集後
npm run render
```

## スクリプトコマンド

| コマンド | 説明 |
|----------|------|
| `npm start` | Remotion Studio（プレビュー） |
| `npm run render` | 動画レンダリング |
| `npm run generate:script` | AI台本生成 |
| `npm run sync:narration` | ナレーション同期 |
| `npm run generate:images` | 背景画像生成 |
| `npm run create:video` | 統合パイプライン |

## 台本パターン

| パターン | 説明 | 推奨ブランド |
|----------|------|-------------|
| `Type_A_Myth_Buster` | 常識破壊型 | wealth, kominka, flip |
| `Type_B_Failure_Story` | 失敗事例型 | legacy, kominka |
| `Type_C_Insider_Secret` | 裏側暴露型 | flip, kominka |
| `Type_D_Consultant_QA` | 対話型 | legacy, subsidy |

## JSON スキーマ例

```json
{
  "project_title": "kominka_sample",
  "brand_id": "kominka",
  "pattern": "Type_A_Myth_Buster",
  "scenes": [
    {
      "scene_id": 1,
      "section_type": "hook",
      "duration_target_sec": 6,
      "narration_duration_sec": 5.8,
      "narration_text": "ナレーション原稿",
      "screen_text": "画面表示テキスト",
      "captions": [
        { "text": "同期キャプション", "start_sec": 0, "end_sec": 2.0 }
      ],
      "visual_prompt": "画像生成プロンプト（英語）",
      "text_animation": "word_popup"
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
```

## テキストアニメーション

| タイプ | 説明 | 推奨セクション |
|--------|------|---------------|
| `fade` | フェードイン/アウト | cta |
| `typewriter` | タイプライター効果 | solution |
| `word_popup` | 単語ごとポップアップ | hook |
| `count_up` | 数字カウントアップ | truth |
| `slide_up` | 行ごとスライドアップ | hook (flip) |

## モーションプリセット

| プリセット | 説明 | ブランド |
|------------|------|----------|
| `hook_dramatic` | 強いインパクト | wealth, kominka, flip |
| `hook_gentle` | やさしいフェード | legacy, subsidy |
| `truth_uneasy` | 不安感を煽る | wealth, kominka, flip |
| `solution_stable` | 安定感のある動き | 全ブランド |
| `senior_friendly` | 非常にゆっくり | subsidy |

## トラブルシューティング

### 音声生成が失敗する
- Google Cloud認証を確認
- Text-to-Speech APIが有効か確認

### 画像生成が失敗する
- Vertex AI APIが有効か確認
- プロジェクトのクォータを確認

### レンダリングが遅い
- `render:preview`で15秒プレビューを先に確認
- CRF値を上げる（品質↓ 速度↑）

---

*Ver 4.0 - 2026年1月*
