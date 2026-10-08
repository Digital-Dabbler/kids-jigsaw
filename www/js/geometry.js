/* 拼图几何：边模式（榫头互补）、散落布局、吸附判定、棋盘矩形。纯逻辑，Node 可测。 */
(function (global) {
  'use strict';

  // 生成每格 edges=[top,right,bottom,left]，值 0=边界 / +1=凸 / -1=凹
  // 相邻共享边互补：A.bottom === -B.top，A.right === -B.left
  function edgePattern(cols, rows, rnd) {
    var H = []; // H[r][c]: 行 r-1 与行 r 之间的水平边, r=1..rows-1
    var V = []; // V[r][c]: 列 c-1 与列 c 之间的垂直边, c=1..cols-1
    var r, c;
    for (r = 1; r < rows; r++) {
      H[r] = [];
      for (c = 0; c < cols; c++) H[r][c] = rnd() < 0.5 ? 1 : -1;
    }
    for (r = 0; r < rows; r++) {
      V[r] = [];
      for (c = 1; c < cols; c++) V[r][c] = rnd() < 0.5 ? 1 : -1;
    }
    var cells = [];
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        cells.push({
          r: r,
          c: c,
          edges: [
            r === 0 ? 0 : -H[r][c],
            c === cols - 1 ? 0 : V[r][c + 1],
            r === rows - 1 ? 0 : H[r + 1][c],
            c === 0 ? 0 : -V[r][c]
          ]
        });
      }
    }
    return { cols: cols, rows: rows, cells: cells };
  }

  function cellAt(pattern, r, c) {
    return pattern.cells[r * pattern.cols + c];
  }

  // jittered grid 散落：n 个点铺满 w×h（留 margin），保证不重叠可抓取
  function scatterLayout(n, w, h, rnd, margin) {
    var m = margin || 0;
    var gcols = Math.max(1, Math.ceil(Math.sqrt(n * (w / h))));
    var grows = Math.max(1, Math.ceil(n / gcols));
    var cw = (w - 2 * m) / gcols;
    var ch = (h - 2 * m) / grows;
    var pts = [];
    var i = 0;
    for (var gr = 0; gr < grows && i < n; gr++) {
      for (var gc = 0; gc < gcols && i < n; gc++, i++) {
        var x = m + cw * (gc + 0.5) + (rnd() - 0.5) * 0.6 * cw;
        var y = m + ch * (gr + 0.5) + (rnd() - 0.5) * 0.6 * ch;
        pts.push({
          x: Math.min(w - m, Math.max(m, x)),
          y: Math.min(h - m, Math.max(m, y))
        });
      }
    }
    return pts;
  }

  function snapCheck(dx, dy, tol) {
    return Math.hypot(dx, dy) < tol;
  }

  // 图片适配进 area 的 maxFrac 比例内，居中
  function boardRect(imgW, imgH, areaW, areaH, maxFrac) {
    var f = maxFrac == null ? 0.9 : maxFrac;
    var s = Math.min((areaW * f) / imgW, (areaH * f) / imgH);
    var w = imgW * s;
    var h = imgH * s;
    return { x: (areaW - w) / 2, y: (areaH - h) / 2, w: w, h: h };
  }

  var api = {
    edgePattern: edgePattern,
    cellAt: cellAt,
    scatterLayout: scatterLayout,
    snapCheck: snapCheck,
    boardRect: boardRect
  };

  global.PG = global.PG || {};
  global.PG.geometry = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
