/**
 * project-manager.js
 * 
 * プロジェクト管理（作成、一覧、クリップ同期）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECTS_DIR = './projects';

// ============================
// プロジェクト作成
// ============================

function createProject(name, brandId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10).replace(/-/g, '');
  const projectId = `${timestamp}_${brandId}_${name.replace(/\s+/g, '_')}`;
  const projectPath = path.join(PROJECTS_DIR, projectId);

  console.log(`Creating project: ${projectId}`);

  if (fs.existsSync(projectPath)) {
    console.error(`Error: Project already exists: ${projectId}`);
    process.exit(1);
  }

  // ディレクトリ構造作成
  const dirs = ['clips', 'images', 'audio', 'captions', 'output'];
  fs.mkdirSync(projectPath, { recursive: true });
  dirs.forEach(d => fs.mkdirSync(path.join(projectPath, d), { recursive: true }));

  // 初期config.json
  const config = {
    project_id: projectId,
    project_name: name,
    brand_id: brandId,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    video: {
      resolution: '1080x1920',
      fps: 30,
      aspect_ratio: '9:16'
    },
    clips: [],
    captions: [],
    audio: {
      use_veo_audio: true,
      bgm: {
        enabled: true,
        file: 'audio/bgm.mp3',
        volume: 0.2
      }
    }
  };

  fs.writeFileSync(path.join(projectPath, 'config.json'), JSON.stringify(config, null, 2));
  console.log(`✅ Project created at: ${projectPath}`);
}

// ============================
// プロジェクト一覧
// ============================

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('No projects found.');
    return;
  }

  const projects = fs.readdirSync(PROJECTS_DIR).filter(f => 
    fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory() &&
    fs.existsSync(path.join(PROJECTS_DIR, f, 'config.json'))
  );

  console.log('\n📋 Projects:');
  console.log('─'.repeat(40));

  projects.forEach(id => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, id, 'config.json')));
    const statusIcons = {
      draft: '📝',
      clips_ready: '🎬',
      captions_ready: '💬',
      completed: '✅',
      error: '❌'
    };
    const icon = statusIcons[config.status] || '❓';
    console.log(`${icon} ${id}`);
    console.log(`   Brand: ${config.brand_id} | Clips: ${config.clips.length} | Status: ${config.status}`);
    console.log(`   Updated: ${config.updated_at}\n`);
  });
}

// ============================
// クリップ同期（尺の自動検出）
// ============================

function syncClips(projectId) {
  const projectPath = path.join(PROJECTS_DIR, projectId);
  const configPath = path.join(projectPath, 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(`Error: Project not found: ${projectId}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const clipsDir = path.join(projectPath, 'clips');

  if (!fs.existsSync(clipsDir)) {
    fs.mkdirSync(clipsDir, { recursive: true });
  }

  console.log(`Syncing clips for project: ${projectId}`);

  // clipsフォルダ内のmp4ファイルをスキャン (scene_*.mp4)
  const files = fs.readdirSync(clipsDir)
    .filter(f => f.endsWith('.mp4') && f.startsWith('scene_'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
    });

  const updatedClips = [];

  files.forEach((file, index) => {
    const filePath = path.join(clipsDir, file);
    try {
      const duration = parseFloat(execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { encoding: 'utf-8' }
      ).trim());

      updatedClips.push({
        scene_id: parseInt(file.match(/\d+/)?.[0] || index + 1),
        file: `clips/${file}`,
        duration_sec: Math.round(duration * 100) / 100,
        transition_in: 'fade',
        transition_out: 'crossfade'
      });
      console.log(`  ✓ ${file}: ${duration}s`);
    } catch (e) {
      console.error(`  ❌ Failed to get duration for ${file}`);
    }
  });

  config.clips = updatedClips;
  config.status = updatedClips.length > 0 ? 'clips_ready' : 'draft';
  config.updated_at = new Date().toISOString();

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Synced ${updatedClips.length} clips and updated config.json`);
}

// ============================
// CLI実行
// ============================

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.log('Usage: node project-manager.js create <name> <brand_id>');
        return;
      }
      createProject(args[1], args[2]);
      break;
    case 'list':
      listProjects();
      break;
    case 'sync-clips':
      if (args.length < 2) {
        console.log('Usage: node project-manager.js sync-clips <project_id>');
        return;
      }
      syncClips(args[1]);
      break;
    default:
      console.log('Available commands: create, list, sync-clips');
  }
}

main();
