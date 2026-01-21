# Zero-Operational-Cost Media Factory: System Architecture (2026 Edition)

## 1. Overview
本システムは、「Wealth Navigator」およびその派生メディア（計5ブランド）を無尽蔵に量産するための完全自動化ファクトリーです。
単一のコードベースと「3つの脳」を維持しつつ、**DNA設定ファイル (`dna.config.json`)** を切り替えるだけで、異なるブランド・ペルソナ・格納場所を持つメディアを運用可能です。

## 2. Core Components (The 3 Brains)

以下の3つのAI役割（Brains）が、DNA設定により動的に人格を変えます。

| Role | Script | Responsibility | DNA Injection (Persona) |
| :--- | :--- | :--- | :--- |
| **Architect** | `brain_architect.js` | 記事構成 (Blueprint) の作成 | Title, Tone, Target Audience |
| **Builder** | `brain_builder.js` | 記事執筆 (HTML) | Writing Style, formatting |
| **Director** | `brain_video_director.js`| 動画台本 (JSON) の作成 | Visual Tone, BGM, Narration Persona |

## 3. Multi-Tenant Mechanism (DNA System)

### 5 Available Brands
現在は以下の5ブランドが定義されています。

| Brand Key | Name | Site ID | Tone |
| :--- | :--- | :--- | :--- |
| **wealth** | Wealth Navigator | `wealth_navigator` | High-End, Strategic |
| **kominka** | 空き家錬金術 | `kominka_frontier` | Visionary, Sharp |
| **flip** | Flip Logic | `flip_logic` | Cold, Logical (Trader) |
| **legacy** | 親の家、どうする？ | `legacy_guard` | Empathetic, Gentle |
| **subsidy** | おうちの補助金相談室 | `subsidy_nav` | Friendly, Simple |

### Switching Command
運用するブランドを切り替えるには、以下のコマンドを実行します。

```bash
# フォーマット
node scripts/switch_brand.js [brand_key]

# 例：古民家モードへ切り替え
node scripts/switch_brand.js kominka

# 例：相続モードへ切り替え
node scripts/switch_brand.js legacy
```

実行すると `src/dna.config.json` が上書きされ、以降のすべてのワークフロー（`/publish-article` 等）がそのブランドの人格で行われます。

## 4. Asset Management (Google Drive)

成果物（記事、動画、画像、SNS投稿）は、Googleドライブ上で自動的にテナントごとに分離されます。

*   **Root**: `Wealth Navigator Media Factory` (Defined by Env Var)
    *   **Wealth Navigator/**
    *   **空き家錬金術/**
    *   **Flip Logic/**
    *   **親の家、どうする？/**
    *   **おうちの補助金相談室/**
        *   `YYYY-MM-DD_[slug]/` (各プロジェクトフォルダ)
            *   `Video.mp4`
            *   `Script.md`
            *   `Instagram_Post.md`

## 5. Workflow (End-to-End)

1.  **Switch Context**: ブランドを選択 (`node scripts/switch_brand.js [brand]`)。
2.  **Instruction**: 通常通り記事生成コマンドを実行 (`/publish-article domestic [THEME]`)。
3.  **Architect**: 青写真を作成（DNAに基づき論理構成）。
4.  **Builder**: 執筆（DNAに基づき文体を調整）。
5.  **Director**: 動画台本作成（DNAに基づき演出を調整）。
6.  **Upload**: 全資産をDriveの当該テナントフォルダへ自動格納。

このアーキテクチャにより、1人のオペレーターが「5つの人格」を使い分け、無限にメディアを拡大可能です。
