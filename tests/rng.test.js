const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../www/js/rng.js');

test('同种子同序列', () => {
  const a = R.mulberry32(42);
  const b = R.mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('不同种子序列不同', () => {
  const a = R.mulberry32(1);
  const b = R.mulberry32(2);
  let same = 0;
  for (let i = 0; i < 50; i++) if (a() === b()) same++;
  assert.ok(same < 5);
});

test('值域 [0,1)', () => {
  const r = R.mulberry32(7);
  for (let i = 0; i < 10000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1);
  }
});

test('shuffle 是置换且不改动原数组', () => {
  const r = R.mulberry32(3);
  const src = [1, 2, 3, 4, 5, 6, 7, 8];
  const out = R.shuffle(src, r);
  assert.deepEqual(out.slice().sort((x, y) => x - y), src);
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('int 范围与整数性', () => {
  const r = R.mulberry32(9);
  for (let i = 0; i < 1000; i++) {
    const v = R.int(r, 5);
    assert.ok(Number.isInteger(v) && v >= 0 && v < 5);
  }
});
