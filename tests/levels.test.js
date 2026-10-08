const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../www/js/levels.js');

test('端点：C1=8 块、C8=1000 块', () => {
  assert.equal(L.pieces(1), 8);
  assert.equal(L.pieces(8), 1000);
});

test('共 8 关且块数单调递增', () => {
  assert.equal(L.COUNT, 8);
  for (let i = 2; i <= 8; i++) assert.ok(L.pieces(i) > L.pieces(i - 1), `C${i} 应多于 C${i - 1}`);
});

test('竖图转置行列', () => {
  assert.deepEqual(L.gridFor(3, 0.5), { cols: 4, rows: 6 });
  assert.deepEqual(L.gridFor(3, 2), { cols: 6, rows: 4 });
  assert.deepEqual(L.gridFor(3, 1), { cols: 6, rows: 4 });
});

test('gridFor 块数不变量', () => {
  for (let lv = 1; lv <= 8; lv++) {
    for (const a of [0.6, 1, 1.8]) {
      const g = L.gridFor(lv, a);
      assert.equal(g.cols * g.rows, L.pieces(lv));
    }
  }
});

test('par 为正且每块参考秒数随关卡递减', () => {
  for (let lv = 1; lv <= 8; lv++) assert.ok(L.parSeconds(lv) > 0);
  for (let lv = 2; lv <= 8; lv++) assert.ok(L.get(lv).k < L.get(lv - 1).k);
});

test('starsFor 阈值：<=par 三星、<=2par 两星、否则一星', () => {
  const par = L.parSeconds(1);
  assert.equal(L.starsFor(1, 0), 3);
  assert.equal(L.starsFor(1, par), 3);
  assert.equal(L.starsFor(1, par * 1.5), 2);
  assert.equal(L.starsFor(1, par * 2), 2);
  assert.equal(L.starsFor(1, par * 2 + 1), 1);
});

test('未知关卡抛错', () => {
  assert.throws(() => L.pieces(9), /unknown level/);
  assert.throws(() => L.pieces(0), /unknown level/);
});
