/**
 * scripts/sync_belt_folders.js
 *
 * Single source of truth sync mechanism for CareCredits.
 * Copies canonical root frontend files (index.html, wallet.html, app.js, pool.html,
 * pool.js, pools.js, style.css, utils.js, directory.js, caregivers.js)
 * into /Level 1/ and /Level 3/ folders with auto-sync comment headers.
 *
 * Usage:
 *   npm run sync-belt-folders          # Syncs root files to /Level 1/ and /Level 3/
 *   npm run check-belt-sync            # CI mode: fails if /Level 1/ or /Level 3/ are out of sync
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LEVEL1_DIR = path.join(ROOT_DIR, 'Level 1');
const LEVEL3_DIR = path.join(ROOT_DIR, 'Level 3');

const SHARED_FILES = [
  'index.html',
  'wallet.html',
  'pool.html',
  'app.js',
  'pool.js',
  'pools.js',
  'style.css',
  'utils.js',
  'directory.js',
  'caregivers.js',
];

const TARGET_FOLDERS = [
  { name: 'Level 1', path: LEVEL1_DIR },
  { name: 'Level 3', path: LEVEL3_DIR },
];

function getCommentHeader(filename) {
  const ext = path.extname(filename).toLowerCase();
  const notice = "AUTO-SYNCED SNAPSHOT — DO NOT EDIT DIRECTLY. Source of truth: repo root. Run 'npm run sync-belt-folders' after changing root files.";

  if (ext === '.js') {
    return `// ${notice}\n\n`;
  } else if (ext === '.html') {
    return `<!-- ${notice} -->\n`;
  } else if (ext === '.css') {
    return `/* ${notice} */\n\n`;
  }
  return '';
}

function processContent(sourceContent, filename) {
  const header = getCommentHeader(filename);
  // Strip any existing comment header if present to avoid duplication
  let cleanContent = sourceContent;
  const noticeText = "AUTO-SYNCED SNAPSHOT — DO NOT EDIT DIRECTLY.";
  if (cleanContent.includes(noticeText)) {
    const lines = cleanContent.split('\n');
    if (lines[0].includes(noticeText) || lines[1]?.includes(noticeText)) {
      // Find where clean content begins
      const headerEndIndex = cleanContent.indexOf(noticeText);
      const afterNotice = cleanContent.slice(headerEndIndex);
      const nextLineIdx = afterNotice.indexOf('\n');
      cleanContent = afterNotice.slice(nextLineIdx + 1).replace(/^\n+/, '');
    }
  }
  return header + cleanContent;
}

function sync() {
  console.log('🔄 Syncing canonical root files to /Level 1/ and /Level 3/...');
  let syncedCount = 0;

  for (const folder of TARGET_FOLDERS) {
    if (!fs.existsSync(folder.path)) {
      fs.mkdirSync(folder.path, { recursive: true });
    }

    for (const filename of SHARED_FILES) {
      const sourcePath = path.join(ROOT_DIR, filename);
      const targetPath = path.join(folder.path, filename);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`⚠️ Source file ${filename} missing at root.`);
        continue;
      }

      const rawSource = fs.readFileSync(sourcePath, 'utf8');
      const syncedContent = processContent(rawSource, filename);

      fs.writeFileSync(targetPath, syncedContent, 'utf8');
      syncedCount++;
    }
  }

  console.log(`✅ Successfully synced ${syncedCount} files across Level 1 and Level 3!`);
}

function check() {
  console.log('🔍 Checking sync status between root and belt folders...');
  let outOfSync = false;

  for (const folder of TARGET_FOLDERS) {
    for (const filename of SHARED_FILES) {
      const sourcePath = path.join(ROOT_DIR, filename);
      const targetPath = path.join(folder.path, filename);

      if (!fs.existsSync(targetPath)) {
        console.error(`❌ Missing synced file: ${folder.name}/${filename}`);
        outOfSync = true;
        continue;
      }

      const rawSource = fs.readFileSync(sourcePath, 'utf8');
      const expectedTarget = processContent(rawSource, filename);
      const actualTarget = fs.readFileSync(targetPath, 'utf8');

      if (expectedTarget !== actualTarget) {
        console.error(`❌ Out of sync: ${folder.name}/${filename} does not match root /${filename}`);
        outOfSync = true;
      }
    }
  }

  if (outOfSync) {
    console.error('\n❌ CI SYNC CHECK FAILED: Level 1 or Level 3 files have drifted from root!');
    console.error("Please run 'npm run sync-belt-folders' locally and commit the changes.\n");
    process.exit(1);
  } else {
    console.log('✅ CI SYNC CHECK PASSED: All /Level 1/ and /Level 3/ files match root sources of truth perfectly!');
  }
}

const isCheckMode = process.argv.includes('--check');

if (isCheckMode) {
  check();
} else {
  sync();
}
