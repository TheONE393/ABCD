import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const WATCH_DIRS = [
  path.resolve('public/images'),
  path.resolve('src/data'),
];

console.log('👀 [Auto-Sync] Watching for photo & data changes in Windows Explorer...');
console.log('   Any files dropped into public/images or src/data will be pushed to GitHub automatically.\n');

let debounceTimer = null;
let isSyncing = false;

function triggerSync() {
  if (isSyncing) return;
  
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Wait 4 seconds after the last file modification to allow file copy to finish
  debounceTimer = setTimeout(() => {
    runGitSync();
  }, 4000);
}

function runGitSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Check if there are changes in public/images or src/data
    const status = execSync('git status --porcelain public/images src/data', { encoding: 'utf-8' }).trim();
    if (!status) {
      isSyncing = false;
      return;
    }

    console.log('📸 [Auto-Sync] Detected file changes in Explorer:');
    console.log(status.split('\n').map(l => `   ${l}`).join('\n'));
    console.log('🚀 [Auto-Sync] Staging and committing...');

    execSync('git add public/images src/data', { stdio: 'inherit' });
    
    const commitMsg = `Update lab photos/data via Explorer (${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

    console.log('☁️  [Auto-Sync] Pushing to GitHub (origin main)...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('✅ [Auto-Sync] Success! GitHub & Cloudflare have received the changes and will rebuild.\n');
  } catch (err) {
    console.error('⚠️  [Auto-Sync] Sync failed or no changes to push:', err.message || err);
  } finally {
    isSyncing = false;
  }
}

// Attach watchers
for (const dir of WATCH_DIRS) {
  if (fs.existsSync(dir)) {
    try {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        // Ignore temporary/hidden files
        if (filename.startsWith('.') || filename.endsWith('.tmp') || filename.includes('~')) return;
        console.log(`⚡ [Explorer Change] ${eventType}: ${filename}`);
        triggerSync();
      });
    } catch (e) {
      console.warn(`[Auto-Sync] Could not watch ${dir}:`, e.message);
    }
  }
}

// Initial check on start
triggerSync();
