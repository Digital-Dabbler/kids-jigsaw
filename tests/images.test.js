const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const IM = require('../www/js/images.js');

test('BUILTIN 6 张且文件真实存在', () => {
  assert.equal(IM.BUILTIN.length, 6);
  for (const b of IM.BUILTIN) {
    const p = path.join(__dirname, '..', 'www', b.src);
    assert.ok(fs.existsSync(p), '缺少文件 ' + b.src);
    assert.ok(fs.statSync(p).size > 10000, b.src + ' 体积异常');
  }
});

test('list：内置在前、自定义追加、名字兜底', () => {
  const only = IM.list([]);
  assert.equal(only.length, 6);
  assert.equal(only[0].kind, 'builtin');
  assert.equal(only[0].thumb, only[0].src);
  const withCustom = IM.list([{ id: 'c1', name: '', thumb: 't', full: 'f' }]);
  assert.equal(withCustom.length, 7);
  assert.equal(withCustom[6].kind, 'custom');
  assert.equal(withCustom[6].name, '我的图');
  assert.equal(withCustom[6].src, 'f');
});

test('list：空输入安全', () => {
  assert.deepEqual(IM.list(undefined), IM.list([]));
});
