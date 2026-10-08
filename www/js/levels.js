/* 关卡表与派生计算。纯逻辑，Node 可 require 供测试。 */
(function (global) {
  'use strict';

  // cols x rows 为横图网格；k = 每块参考秒数（星星评级用）
  var LEVELS = [
    { id: 1, cols: 4, rows: 2, k: 10 },
    { id: 2, cols: 5, rows: 3, k: 8 },
    { id: 3, cols: 6, rows: 4, k: 6 },
    { id: 4, cols: 8, rows: 5, k: 5 },
    { id: 5, cols: 10, rows: 6, k: 4 },
    { id: 6, cols: 12, rows: 8, k: 3 },
    { id: 7, cols: 20, rows: 12, k: 2 },
    { id: 8, cols: 40, rows: 25, k: 1.5 }
  ];

  function get(level) {
    var l = LEVELS[level - 1];
    if (!l) throw new Error('unknown level: ' + level);
    return l;
  }

  function pieces(level) {
    var l = get(level);
    return l.cols * l.rows;
  }

  // aspect = 图宽/图高；竖图转置行列
  function gridFor(level, aspect) {
    var l = get(level);
    if (aspect >= 1) return { cols: l.cols, rows: l.rows };
    return { cols: l.rows, rows: l.cols };
  }

  function parSeconds(level) {
    return pieces(level) * get(level).k;
  }

  function starsFor(level, seconds) {
    var par = parSeconds(level);
    if (seconds <= par) return 3;
    if (seconds <= par * 2) return 2;
    return 1;
  }

  var api = {
    LEVELS: LEVELS,
    COUNT: LEVELS.length,
    get: get,
    pieces: pieces,
    gridFor: gridFor,
    parSeconds: parSeconds,
    starsFor: starsFor
  };

  global.PG = global.PG || {};
  global.PG.levels = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
