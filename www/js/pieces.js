/* 棋子路径（圆形榫头）与 sprite 渲染。
 * piecePathCommands 为纯逻辑（Node 可测）；tracePath/renderPieceSprite 仅浏览器。 */
(function (global) {
  'use strict';

  var R_FRAC = 0.18; // 榫头半径 = 边长 * 0.18

  function edgeRadius(w, h, edgeIndex) {
    // 0=top,1=right,2=bottom,3=left
    return (edgeIndex === 0 || edgeIndex === 2) ? w * R_FRAC : h * R_FRAC;
  }

  function padFor(w, h) {
    return 0.2 * Math.max(w, h);
  }

  // 局部坐标 (0,0)-(w,h) 的路径命令序列；edges=[top,right,bottom,left]
  function piecePathCommands(w, h, edges) {
    var cmds = [{ op: 'move', x: 0, y: 0 }];
    addEdge(cmds, 0, 0, w, 0, edges[0], edgeRadius(w, h, 0));
    addEdge(cmds, w, 0, w, h, edges[1], edgeRadius(w, h, 1));
    addEdge(cmds, w, h, 0, h, edges[2], edgeRadius(w, h, 2));
    addEdge(cmds, 0, h, 0, 0, edges[3], edgeRadius(w, h, 3));
    cmds.push({ op: 'close' });
    return cmds;
  }

  function addEdge(cmds, x1, y1, x2, y2, e, r) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.hypot(dx, dy);
    var ux = dx / len;
    var uy = dy / len;
    var mx = (x1 + x2) / 2;
    var my = (y1 + y2) / 2;
    var theta = Math.atan2(dy, dx);
    cmds.push({ op: 'line', x: mx - ux * r, y: my - uy * r });
    if (e) {
      // 凸(e>0)：向外半圆；凹(e<0)：向内半圆
      cmds.push({
        op: 'arc',
        x: mx, y: my, r: r,
        a0: theta + Math.PI,
        a1: theta + (e > 0 ? 2 * Math.PI : 0),
        ccw: e < 0
      });
    }
    cmds.push({ op: 'line', x: x2, y: y2 });
  }

  // ---- 浏览器部分 ----
  function tracePath(ctx, cmds, ox, oy) {
    ctx.beginPath();
    for (var i = 0; i < cmds.length; i++) {
      var c = cmds[i];
      if (c.op === 'move') ctx.moveTo(ox + c.x, oy + c.y);
      else if (c.op === 'line') ctx.lineTo(ox + c.x, oy + c.y);
      else if (c.op === 'arc') ctx.arc(ox + c.x, oy + c.y, c.r, c.a0, c.a1, c.ccw);
      else if (c.op === 'close') ctx.closePath();
    }
  }

  // 从源图裁出一块并预渲染为带白边+投影的 sprite（含 pad 外扩）
  function renderPieceSprite(src, gx, gy, gw, gh, edges, dpr) {
    var pad = padFor(gw, gh);
    var cv = document.createElement('canvas');
    cv.width = Math.ceil((gw + 2 * pad) * dpr);
    cv.height = Math.ceil((gh + 2 * pad) * dpr);
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    var cmds = piecePathCommands(gw, gh, edges);
    // 投影轮廓
    ctx.save();
    tracePath(ctx, cmds, pad, pad);
    ctx.shadowColor = 'rgba(20,50,80,0.35)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
    // 裁图
    ctx.save();
    tracePath(ctx, cmds, pad, pad);
    ctx.clip();
    ctx.drawImage(src, pad - gx, pad - gy);
    ctx.restore();
    // 白描边
    tracePath(ctx, cmds, pad, pad);
    ctx.lineWidth = Math.max(1.5, Math.min(gw, gh) * 0.04);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineJoin = 'round';
    ctx.stroke();
    cv.pgPad = pad;
    return cv;
  }

  var api = {
    R_FRAC: R_FRAC,
    edgeRadius: edgeRadius,
    padFor: padFor,
    piecePathCommands: piecePathCommands,
    tracePath: tracePath,
    renderPieceSprite: renderPieceSprite
  };

  global.PG = global.PG || {};
  global.PG.pieces = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
