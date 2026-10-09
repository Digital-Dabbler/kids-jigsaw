const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const H = (...p) => path.join(root, 'harmony', ...p);

test('鸿蒙壳工程关键文件齐备', () => {
  for (const f of [
    H('build-profile.json5'),
    H('hvigorfile.ts'),
    H('oh-package.json5'),
    H('AppScope', 'app.json5'),
    H('AppScope', 'resources', 'base', 'media', 'app_icon.png'),
    H('entry', 'build-profile.json5'),
    H('entry', 'src', 'main', 'module.json5'),
    H('entry', 'src', 'main', 'ets', 'entryability', 'EntryAbility.ets'),
    H('entry', 'src', 'main', 'ets', 'pages', 'Index.ets'),
    H('entry', 'src', 'main', 'resources', 'base', 'profile', 'main_pages.json'),
    path.join(root, 'tools', 'sync-harmony-assets.ps1')
  ]) {
    assert.ok(fs.existsSync(f), '缺少 ' + f);
  }
});

test('壳工程指向 rawfile/www 且打通相册选图', () => {
  const idx = fs.readFileSync(H('entry', 'src', 'main', 'ets', 'pages', 'Index.ets'), 'utf8');
  assert.ok(idx.includes("$rawfile('www/index.html')"));
  assert.ok(idx.includes('onShowFileSelector'));
  assert.ok(idx.includes('PhotoViewPicker'));
  assert.ok(idx.includes('domStorageAccess(true)'));
  const mod = fs.readFileSync(H('entry', 'src', 'main', 'module.json5'), 'utf8');
  assert.ok(mod.includes('EntryAbility'));
  const app = fs.readFileSync(H('AppScope', 'app.json5'), 'utf8');
  assert.ok(app.includes('com.digitaldabbler.kidsjigsaw'));
});
