/* 对局模型：网格矩形、命中测试、放置进度。纯逻辑，Node 可测。 */
(function (global) {
  'use strict';

  function getRng() {
    if (global.PG && global.PG.rng) return global.PG.rng;
    if (typeof require === 'function') return require('./rng.js');
    return null;
  }

  function pieceRect(board, cols, rows, r, c) {
    return {
      x: board.x + (board.w * c) / cols,
      y: board.y + (board.h * r) / rows,
      w: board.w / cols,
      h: board.h / rows
    };
  }

  // order = 打散顺序（第 k 个散落点对应 pieces[order[k]]）
  function createModel(cols, rows, rnd) {
    var n = cols * rows;
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    var order = getRng().shuffle(idx, rnd);
    return {
      cols: cols,
      rows: rows,
      n: n,
      placed: new Array(n).fill(false),
      placedCount: 0,
      order: order
    };
  }

  function place(model, idx) {
    if (model.placed[idx]) return model.placedCount;
    model.placed[idx] = true;
    model.placedCount++;
    return model.placedCount;
  }

  function isDone(model) {
    return model.placedCount >= model.n;
  }

  function progress(model) {
    return model.placedCount / model.n;
  }

  // items 按绘制顺序（末尾为最上层）；返回最上层未放置且覆盖 (x,y) 的 idx，无则 -1
  function hitTest(x, y, items, hw, hh) {
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      if (it.placed) continue;
      if (Math.abs(x - it.cx) <= hw && Math.abs(y - it.cy) <= hh) return it.idx;
    }
    return -1;
  }

  var api = {
    pieceRect: pieceRect,
    createModel: createModel,
    place: place,
    isDone: isDone,
    progress: progress,
    hitTest: hitTest
  };

  global.PG = global.PG || {};
  global.PG.game = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
