const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../www/js/geometry.js');
const R = require('../www/js/rng.js');

test('edgePattern：边界为 0、内部为 ±1', () => {
  const p = G.edgePattern(4, 3, R.mulberry32(1));
  assert.equal(p.cells.length, 12);
  for (const cell of p.cells) {
    if (cell.r === 0) assert.equal(cell.edges[0], 0);
    if (cell.r === p.rows - 1) assert.equal(cell.edges[2], 0);
    if (cell.c === 0) assert.equal(cell.edges[3], 0);
    if (cell.c === p.cols - 1) assert.equal(cell.edges[1], 0);
    for (const e of cell.edges) assert.ok(e === 0 || e === 1 || e === -1);
  }
  // 内部边非零
  const mid = G.cellAt(p, 1, 1);
  for (const e of mid.edges) assert.notEqual(e, 0);
});

test('edgePattern：相邻共享边互补', () => {
  const p = G.edgePattern(6, 4, R.mulberry32(7));
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      const cell = G.cellAt(p, r, c);
      if (r + 1 < p.rows) assert.equal(cell.edges[2], -G.cellAt(p, r + 1, c).edges[0]);
      if (c + 1 < p.cols) assert.equal(cell.edges[1], -G.cellAt(p, r, c + 1).edges[3]);
    }
  }
});

test('edgePattern：同种子确定', () => {
  const a = G.edgePattern(5, 3, R.mulberry32(99)).cells.map((c) => c.edges.join(''));
  const b = G.edgePattern(5, 3, R.mulberry32(99)).cells.map((c) => c.edges.join(''));
  assert.deepEqual(a, b);
});

test('scatterLayout：n=1000 全部在界内且数量正确', () => {
  const pts = G.scatterLayout(1000, 800, 600, R.mulberry32(5), 8);
  assert.equal(pts.length, 1000);
  for (const p of pts) {
    assert.ok(p.x >= 8 && p.x <= 792, `x=${p.x}`);
    assert.ok(p.y >= 8 && p.y <= 592, `y=${p.y}`);
  }
});

test('scatterLayout：n=96 最小间距 >= 0.39*min(cw,ch)', () => {
  const w = 800, h = 600, m = 10, n = 96;
  const pts = G.scatterLayout(n, w, h, R.mulberry32(11), m);
  const gcols = Math.ceil(Math.sqrt(n * (w / h)));
  const grows = Math.ceil(n / gcols);
  const cw = (w - 2 * m) / gcols;
  const ch = (h - 2 * m) / grows;
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    }
  }
  assert.ok(min >= 0.39 * Math.min(cw, ch), `min=${min}`);
});

test('snapCheck 阈值边界', () => {
  assert.ok(G.snapCheck(0, 0, 10));
  assert.ok(G.snapCheck(7, 0, 10));
  assert.ok(!G.snapCheck(10, 0, 10));
  assert.ok(G.snapCheck(6, 6, 10));   // 8.49 < 10
  assert.ok(!G.snapCheck(8, 8, 10));  // 11.3 > 10
});

test('boardRect 适配居中', () => {
  const r = G.boardRect(4, 3, 100, 100, 0.9);
  assert.ok(Math.abs(r.w - 90) < 1e-9);
  assert.ok(Math.abs(r.h - 67.5) < 1e-9);
  assert.ok(Math.abs(r.x - 5) < 1e-9);
  assert.ok(Math.abs(r.y - 16.25) < 1e-9);
  const r2 = G.boardRect(3, 4, 100, 100);
  assert.ok(Math.abs(r2.h - 90) < 1e-9 && Math.abs(r2.w - 67.5) < 1e-9);
});
