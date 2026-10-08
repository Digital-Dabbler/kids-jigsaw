/* 展示用格式化。纯逻辑，Node 可测。 */
(function (global) {
  'use strict';

  function timeText(secs) {
    var s = Math.max(0, Math.round(secs));
    if (s < 60) return s + ' 秒';
    return Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒';
  }

  var api = { timeText: timeText };

  global.PG = global.PG || {};
  global.PG.format = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
