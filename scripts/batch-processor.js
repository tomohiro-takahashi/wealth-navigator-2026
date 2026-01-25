/**
 * batch-processor.js
 * 
 * 未処理の動画プロジェクトを巡回し、ステータスを自動更新・レンダリングする
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const projectManager = require('./project-manager'); // syncClips を再利用
const captionGenerator = require('./caption-generator'); // generateCaptionsForProject を再利用

const PROJECTS_DIR = './projects';
const OUTPUT_DIR = './out';

async function processPendingProjects() {
  console.log('='.repeat(60));
  console.log('Batch Video Processor v1.1 (Cloud-First)');
  console.log('='.repeat(60));

  // --- Step 0: Cloud Sync (Google Drive -> Local) ---
  console.log('🔄 Syncing new material from Google Drive...');
  try {
    execSync('python3 scripts/sync_clips_from_drive.py', { stdio: 'inherit' });
  } catch (e) {
    console.warn(`⚠️ Cloud sync failed: ${e.message}. Continuing with local files...`);
  }

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('No projects directory found.');
    return;
  }

  // プロジェクト一覧を取得
  const projects = fs.readdirSync(PROJECTS_DIR).filter(f => 
    fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory() &&
    fs.existsSync(path.join(PROJECTS_DIR, f, 'config.json'))
  );

  console.log(`Found ${projects.length} projects. Checking for updates...\n`);

  for (const projectId of projects) {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const configPath = path.join(projectPath, 'config.json');
    let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    console.log(`[${projectId}] Current Status: ${config.status}`);

    // --- Step 1: クリップの有無を確認し、自動同期 ---
    const clipsDir = path.join(projectPath, 'clips');
    if (fs.existsSync(clipsDir)) {
      const mp4Files = fs.readdirSync(clipsDir).filter(f => f.endsWith('.mp4'));
      
      // draftかつ動画がある、または動画数が不一致なら同期
      // ハイブリッド戦略: 手動でドライブに置かれた動画がローカルの 'clips' に同期された時点で clips_ready に移行させる
      if (mp4Files.length > 0 && (config.status === 'draft' || mp4Files.length !== config.clips.length)) {
        console.log(`  🎬 New manual clips detected. Syncing to project config...`);
        execSync(`node scripts/project-manager.js sync-clips ${projectId}`, { stdio: 'inherit' });
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); // 再読み込み
      }
    }

    // --- Step 2: テロップ生成 ---
    if (config.status === 'clips_ready') {
      console.log(`  💬 Generating captions...`);
      try {
        await captionGenerator.generateCaptionsForProject(projectId);
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); // 再読み込み
      } catch (e) {
        console.error(`  ❌ Caption generation failed: ${e.message}`);
        config.status = 'error';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        continue;
      }
    }

    // --- Step 3: レンダリング ---
    if (config.status === 'captions_ready') {
      console.log(`  🎥 Rendering final video (Premium)...`);
      const outputVideo = path.join(OUTPUT_DIR, `${projectId}_premium.mp4`);
      
      try {
        // Remotionにconfigを直接渡してレンダリング
        // 注意: inputProps経由でconfigを渡す
        const props = JSON.stringify({ config });
        execSync(
          `cd video-generator && npx remotion render ClipEditor "../out/${projectId}_premium.mp4" --props='${props}'`,
          { stdio: 'inherit' }
        );

        config.status = 'completed';
        config.updated_at = new Date().toISOString();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`  ✅ Successfully rendered: ${outputVideo}`);

        // --- Step 4: Cleanup (Drive Archive & Local Delete) ---
        console.log(`  🧹 Cleaning up materials...`);
        try {
          // Drive側: archived フォルダへ移動
          execSync(`python3 scripts/archive_drive_clips.py ${projectId}`, { stdio: 'inherit' });
          
          // ローカル側: clips フォルダ内のmp4を削除（容量節約）
          const clipsDir = path.join(projectPath, 'clips');
          const clips = fs.readdirSync(clipsDir).filter(f => f.endsWith('.mp4'));
          clips.forEach(clip => fs.unlinkSync(path.join(clipsDir, clip)));
          console.log(`  🗑️ Local clips cleared.`);
        } catch (cleanupErr) {
          console.warn(`  ⚠️ Cleanup failed/partially completed: ${cleanupErr.message}`);
        }
      } catch (e) {
        console.error(`  ❌ Rendering failed: ${e.message}`);
        config.status = 'error';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Batch Processing Completed');
  console.log('='.repeat(60));
}

if (require.main === module) {
  processPendingProjects().catch(console.error);
}
