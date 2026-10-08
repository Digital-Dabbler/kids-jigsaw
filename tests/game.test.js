const test = require('node:test');
const assert = require('node:assert/strict');
require('../www/js/rng.js');
const G = require('../www/js/game.js');
const R = require('../www/js/rng.js');

test('pieceRect 铺满棋盘且不重叠', () => {
  const board = { x: 10, y: 20, w: 100, h: 50 };
  const cols = 4, rows = 2;
  let area = 0;
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const q = G.pieceRect(board, cols, rows, r, c);
      rects.push(q);
      area += q.w * q.h;
    }
  }
  assert.ok(Math.abs(area - board.w * board.h) < 1e-9);
  assert.deepEqual(G.pieceRect(board, cols, rows, 0, 0), { x: 10, y: 20, w: 25, h: 25 });
  assert.deepEqual(G.pieceRect(board, cols, rows, 1, 3), { x: 85, y: 45, w: 25, h: 25 });
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap);
    }
  }
});

test('createModel：order 为置换、初始未放置', () => {
  const m = G.createModel(4, 2, R.mulberry32(5));
  assert.equal(m.n, 8);
  assert.deepEqual(m.order.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(m.placedCount, 0);
  assert.ok(!G.isDone(m));
  assert.equal(G.progress(m), 0);
});

test('place/isDone/progress：重复放置不重复计数', () => {
  const m = G.createModel(2, 2, R.mulberry32(5));
  G.place(m, 0);
  G.place(m, 0);
  assert.equal(m.placedCount, 1);
  assert.equal(G.progress(m), 0.25);
  G.place(m, 1); G.place(m, 2); G.place(m, 3);
  assert.ok(G.isDone(m));
  assert.equal(G.progress(m), 1);
});

test('hitTest：最上层优先、跳过已放置、未命中 -1', () => {
  const items = [
    { idx: 0, cx: 100, cy: 100, placed: false },
    { idx: 1, cx: 100, cy: 100, placed: false }
  ];
  assert.equal(G.hitTest(100, 100, items, 10, 10), 1);
  items[1].placed = true;
  assert.equal(G.hitTest(100, 100, items, 10, 10), 0);
  assert.equal(G.hitTest(111, 100, items, 10, 10), -1);
  assert.equal(G.hitTest(100, 100, [], 10, 10), -1);
});
