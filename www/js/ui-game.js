/* 游戏屏：Canvas 渲染、拖拽吸附、HUD、预览。仅浏览器。 */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }

  var S = null; // 当前对局状态
  var wired = false;

  function start(page, level) {
    el('home').classList.add('hidden');
    el('game').classList.remove('hidden');
    el('done').classList.add('hidden');
    el('hud-level').textContent = 'C' + level;

    var img = new Image();
    img.onload = function () { setup(page, level, img); };
    img.onerror = function () {
      PG.uiHome.toast('图案加载失败');
      goHome();
    };
    img.src = page.src;
  }

  function setup(page, level, img) {
    var wrap = el('board-wrap');
    var canvas = el('board');
    var areaW = wrap.clientWidth;
    var areaH = wrap.clientHeight;
    var dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = Math.round(areaW * dpr);
    canvas.height = Math.round(areaH * dpr);

    var grid = PG.levels.gridFor(level, img.naturalWidth / img.naturalHeight);
    var board = PG.geometry.boardRect(img.naturalWidth, img.naturalHeight, areaW, areaH, 0.62);
    var pieceW = board.w / grid.cols;
    var pieceH = board.h / grid.rows;
    var pad = PG.pieces.padFor(pieceW, pieceH);

    var seed = (Date.now() ^ (level * 2654435761)) & 0x7fffffff;
    var rnd = PG.rng.mulberry32(seed);
    var pattern = PG.geometry.edgePattern(grid.cols, grid.rows, rnd);
    var model = PG.game.createModel(grid.cols, grid.rows, rnd);

    // 散落点（打散顺序由 model.order 指定）
    var pts = PG.geometry.scatterLayout(model.n, areaW, areaH, rnd, pad + 4);

    var items = [];
    for (var i = 0; i < model.n; i++) items.push({ idx: i, cx: 0, cy: 0, nx: 0, ny: 0, placed: false });
    for (var k = 0; k < model.n; k++) {
      var it = items[model.order[k]];
      it.cx = pts[k].x; it.cy = pts[k].y;
      it.nx = pts[k].x / areaW; it.ny = pts[k].y / areaH;
    }

    S = {
      page: page, level: level, img: img,
      areaW: areaW, areaH: areaH, dpr: dpr,
      grid: grid, board: board, pieceW: pieceW, pieceH: pieceH, pad: pad,
      boardCanvas: makeBoardCanvas(img, board),
      pattern: pattern, model: model, items: items,
      sprites: new Array(model.n), drag: null,
      startAt: performance.now()
    };
    renderSprites(0);
    updateHud();
    draw();
  }

  // 棋盘尺度的源画布：sprite 从它裁切（renderPieceSprite 要求源与块同尺度）
  function makeBoardCanvas(img, board) {
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(board.w));
    cv.height = Math.max(1, Math.round(board.h));
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv;
  }

  // 分批预渲染 sprite，避免千块一次性卡死
  function renderSprites(from) {
    var batch = 60;
    var to = Math.min(S.model.n, from + batch);
    for (var i = from; i < to; i++) {
      var cell = PG.geometry.cellAt(S.pattern, Math.floor(i / S.grid.cols), i % S.grid.cols);
      S.sprites[i] = PG.pieces.renderPieceSprite(
        S.boardCanvas,
        (i % S.grid.cols) * S.pieceW,
        Math.floor(i / S.grid.cols) * S.pieceH,
        S.pieceW, S.pieceH, cell.edges, S.dpr
      );
    }
    if (to < S.model.n) {
      setTimeout(function () { renderSprites(to); }, 0);
    } else if (S.drag === null) {
      draw();
    }
  }

  function targetCenter(it) {
    var rect = PG.game.pieceRect(S.board, S.grid.cols, S.grid.rows, Math.floor(it.idx / S.grid.cols), it.idx % S.grid.cols);
    return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  }

  function draw() {
    if (!S) return;
    var canvas = el('board');
    var ctx = canvas.getContext('2d');
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    ctx.clearRect(0, 0, S.areaW, S.areaH);

    // ghost 底图 + 网格
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.drawImage(S.img, S.board.x, S.board.y, S.board.w, S.board.h);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (var c = 1; c < S.grid.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(S.board.x + (S.board.w * c) / S.grid.cols, S.board.y);
      ctx.lineTo(S.board.x + (S.board.w * c) / S.grid.cols, S.board.y + S.board.h);
      ctx.stroke();
    }
    for (var r = 1; r < S.grid.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(S.board.x, S.board.y + (S.board.h * r) / S.grid.rows);
      ctx.lineTo(S.board.x + S.board.w, S.board.y + (S.board.h * r) / S.grid.rows);
      ctx.stroke();
    }
    ctx.restore();

    var i, it, sp;
    // 已放置
    for (i = 0; i < S.items.length; i++) {
      it = S.items[i];
      if (!it.placed) continue;
      sp = S.sprites[i];
      if (!sp) continue;
      var tc = targetCenter(it);
      ctx.drawImage(sp, tc.x - sp.width / (2 * S.dpr), tc.y - sp.height / (2 * S.dpr), sp.width / S.dpr, sp.height / S.dpr);
    }
    // 未放置（拖拽中的最后画）
    for (i = 0; i < S.items.length; i++) {
      it = S.items[i];
      if (it.placed || (S.drag && S.drag.idx === i)) continue;
      sp = S.sprites[i];
      if (!sp) continue;
      ctx.drawImage(sp, it.cx - sp.width / (2 * S.dpr), it.cy - sp.height / (2 * S.dpr), sp.width / S.dpr, sp.height / S.dpr);
    }
    if (S.drag) {
      it = S.items[S.drag.idx];
      sp = S.sprites[S.drag.idx];
      if (sp) {
        ctx.save();
        ctx.translate(it.cx, it.cy);
        ctx.scale(1.06, 1.06);
        ctx.drawImage(sp, -sp.width / (2 * S.dpr), -sp.height / (2 * S.dpr), sp.width / S.dpr, sp.height / S.dpr);
        ctx.restore();
      }
    }
  }

  function updateHud() {
    el('progress-fill').style.width = Math.round(PG.game.progress(S.model) * 100) + '%';
    el('progress-text').textContent = S.model.placedCount + '/' + S.model.n;
  }

  function pointerPos(ev) {
    var rect = el('board').getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  function wire() {
    if (wired) return;
    wired = true;
    var canvas = el('board');

    canvas.addEventListener('pointerdown', function (ev) {
      if (!S) return;
      var p = pointerPos(ev);
      var idx = PG.game.hitTest(p.x, p.y, S.items, S.pieceW / 2 + S.pad * 0.7, S.pieceH / 2 + S.pad * 0.7);
      if (idx < 0) return;
      ev.preventDefault();
      canvas.setPointerCapture(ev.pointerId);
      S.drag = { idx: idx, ox: p.x - S.items[idx].cx, oy: p.y - S.items[idx].cy };
      PG.audio.play('pick');
      draw();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!S || !S.drag) return;
      var p = pointerPos(ev);
      var it = S.items[S.drag.idx];
      it.cx = Math.max(S.pad, Math.min(S.areaW - S.pad, p.x - S.drag.ox));
      it.cy = Math.max(S.pad, Math.min(S.areaH - S.pad, p.y - S.drag.oy));
      draw();
    });
    function drop(ev) {
      if (!S || !S.drag) return;
      var idx = S.drag.idx;
      S.drag = null;
      var it = S.items[idx];
      var tc = targetCenter(it);
      var tol = 0.45 * Math.min(S.pieceW, S.pieceH);
      if (PG.geometry.snapCheck(it.cx - tc.x, it.cy - tc.y, tol)) {
        PG.game.place(S.model, idx);
        it.placed = true;
        PG.audio.play('snap');
        updateHud();
        if (PG.game.isDone(S.model)) finish();
      } else {
        PG.audio.play('deny');
      }
      draw();
    }
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);

    var peek = el('peek-btn');
    var showPeek = function (ev) { ev.preventDefault(); el('peek-img').src = S ? S.img.src : ''; el('peek-overlay').classList.remove('hidden'); };
    var hidePeek = function () { el('peek-overlay').classList.add('hidden'); };
    peek.addEventListener('pointerdown', showPeek);
    peek.addEventListener('pointerup', hidePeek);
    peek.addEventListener('pointerleave', hidePeek);
    peek.addEventListener('pointercancel', hidePeek);

    el('back-btn').addEventListener('click', goHome);

    var rt = null;
    global.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(relayout, 150);
    });
  }

  function relayout() {
    if (!S || el('game').classList.contains('hidden')) return;
    var wrap = el('board-wrap');
    var canvas = el('board');
    var areaW = wrap.clientWidth;
    var areaH = wrap.clientHeight;
    if (!areaW || !areaH) return;
    S.areaW = areaW; S.areaH = areaH;
    canvas.width = Math.round(areaW * S.dpr);
    canvas.height = Math.round(areaH * S.dpr);
    S.board = PG.geometry.boardRect(S.img.naturalWidth, S.img.naturalHeight, areaW, areaH, 0.62);
    S.pieceW = S.board.w / S.grid.cols;
    S.pieceH = S.board.h / S.grid.rows;
    S.pad = PG.pieces.padFor(S.pieceW, S.pieceH);
    S.boardCanvas = makeBoardCanvas(S.img, S.board);
    S.items.forEach(function (it) {
      if (!it.placed) { it.cx = it.nx * areaW; it.cy = it.ny * areaH; }
    });
    renderSprites(0);
    draw();
  }

  function finish() {
    var secs = (performance.now() - S.startAt) / 1000;
    var stars = PG.levels.starsFor(S.level, secs);
    PG.main.storage.saveStars(S.page.id, S.level, stars);
    S.drag = null;
    PG.audio.play('win');
    if (PG.uiDone) {
      PG.uiDone.show({ level: S.level, stars: stars, secs: secs });
    } else {
      PG.uiHome.toast('完成！' + secs.toFixed(0) + ' 秒');
    }
  }

  function goHome() {
    S = null;
    el('game').classList.add('hidden');
    el('home').classList.remove('hidden');
    PG.main.home.refresh();
  }

  wire();

  global.PG = global.PG || {};
  PG.uiGame = {
    start: start,
    current: function () { return S ? { page: S.page, level: S.level } : null; },
    goHome: goHome
  };
})(typeof window !== 'undefined' ? window : globalThis);
