const test = require('node:test');
const assert = require('node:assert/strict');
const IM = require('../www/js/images.js');

test('list：内置在前、自定义追加、名字兜底', () => {
  const saved = IM.BUILTIN.slice();
  IM.BUILTIN.length = 0;
  IM.BUILTIN.push({ id: 'b1', name: '小恐龙', src: 'assets/builtin/b1.jpg' });
  try {
    const only = IM.list([]);
    assert.deepEqual(only, [{ id: 'b1', kind: 'builtin', name: '小恐龙', src: 'assets/builtin/b1.jpg', thumb: 'assets/builtin/b1.jpg' }]);
    const withCustom = IM.list([{ id: 'c1', name: '', thumb: 't', full: 'f' }]);
    assert.equal(withCustom.length, 2);
    assert.equal(withCustom[1].kind, 'custom');
    assert.equal(withCustom[1].name, '我的图');
    assert.equal(withCustom[1].src, 'f');
  } finally {
    IM.BUILTIN.length = 0;
    saved.forEach((b) => IM.BUILTIN.push(b));
  }
});

test('list：空输入安全', () => {
  assert.deepEqual(IM.list(undefined), IM.list([]));
});
