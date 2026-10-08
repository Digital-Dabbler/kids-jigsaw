/* 图案清单：内置图（commit 6 填充 BUILTIN）+ 自定义图合并。list 为纯逻辑可测。 */
(function (global) {
  'use strict';

  var BUILTIN = []; // [{id,name,src}]，资源提交后填充

  function list(custom) {
    var out = BUILTIN.map(function (b) {
      return { id: b.id, kind: 'builtin', name: b.name, src: b.src, thumb: b.src };
    });
    (custom || []).forEach(function (c) {
      out.push({ id: c.id, kind: 'custom', name: c.name || '我的图', src: c.full, thumb: c.thumb });
    });
    return out;
  }

  var api = { BUILTIN: BUILTIN, list: list };

  global.PG = global.PG || {};
  global.PG.images = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
