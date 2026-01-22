/**
 * local-agent.js
 * 
 * PCが稼働している間、バックグラウンドで動画生成タスクを監視し、
 * 自動的にレンダリングを実行するエージェント。
 */

const { execSync } = require('child_process');
const path = require('path');

// 設定
const INTERVAL_MS = 30 * 60 * 1000; // 30分おき

async function runOnce() {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[${timestamp}] 🤖 Local Agent: Checking for pending tasks...`);
    
    try {
        // batch-processorを実行
        // (内部で scripts/sync_clips_from_drive.py も実行される設計)
        execSync('node scripts/batch-processor.js', { stdio: 'inherit' });
        console.log(`[${timestamp}] ✅ Batch processing completed successfully.`);
    } catch (error) {
        console.error(`[${timestamp}] ❌ Error during local agent execution:`, error.message);
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('Wealth Navigator: Local Catchup Agent v1.0');
    console.log('='.repeat(50));
    console.log('PCが起動している間、このスクリプトがDriveと同期して動画を生成します。');
    console.log(`インターバル: ${INTERVAL_MS / 1000 / 60} 分`);
    console.log('中断するには Ctrl+C を押してください。');

    // 初回実行
    await runOnce();

    // ループ実行
    setInterval(async () => {
        await runOnce();
    }, INTERVAL_MS);
}

main().catch(console.error);
