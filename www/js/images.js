/* 图案清单：内置图（commit 6 填充 BUILTIN）+ 自定义图合并。list 为纯逻辑可测。 */
(function (global) {
  'use strict';

  var BUILTIN = [
    { id: 'b1', name: '小恐龙', src: 'assets/builtin/b1.jpg' },
    { id: 'b2', name: '海底世界', src: 'assets/builtin/b2.jpg' },
    { id: 'b3', name: '农场伙伴', src: 'assets/builtin/b3.jpg' },
    { id: 'b4', name: '太空火箭', src: 'assets/builtin/b4.jpg' },
    { id: 'b5', name: '熊猫竹林', src: 'assets/builtin/b5.jpg' },
    { id: 'b6', name: '糖果城堡', src: 'assets/builtin/b6.jpg' }
  ];

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
