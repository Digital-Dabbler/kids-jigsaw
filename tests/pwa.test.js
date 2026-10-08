const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const www = path.join(__dirname, '..', 'www');

test('manifest 为合法 JSON 且字段齐全', () => {
  const m = JSON.parse(fs.readFileSync(path.join(www, 'manifest.webmanifest'), 'utf8'));
  assert.ok(m.name && m.short_name);
  assert.equal(m.display, 'standalone');
  assert.ok(m.start_url);
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 2);
  for (const ic of m.icons) {
    assert.ok(fs.existsSync(path.join(www, ic.src)), '图标缺失 ' + ic.src);
    assert.match(ic.sizes, /^\d+x\d+$/);
  }
});

test('sw.js 语法合法且预缓存清单覆盖壳与内置图', () => {
  const src = fs.readFileSync(path.join(www, 'sw.js'), 'utf8');
  new vm.Script(src); // 编译即语法检查，不执行
  for (const f of ['index.html', 'css/style.css', 'js/main.js', 'js/ui-game.js', 'assets/builtin/b1.jpg', 'assets/builtin/b6.jpg', 'manifest.webmanifest']) {
    assert.ok(src.includes('./' + f), 'SHELL 未覆盖 ' + f);
  }
});

test('index.html 已挂 manifest 与 apple 图标', () => {
  const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes('apple-touch-icon'));
});
