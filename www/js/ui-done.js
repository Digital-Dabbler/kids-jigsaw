/* 结算 overlay：星星弹入、彩纸、下一关/再玩/回家。仅浏览器。 */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }

  var wired = false;
  var confettiRaf = null;

  function show(info) {
    el('done').classList.remove('hidden');
    el('peek-overlay').classList.add('hidden');
    el('done-time').textContent = '用时 ' + PG.format.timeText(info.secs);

    var wrap = el('stars');
    wrap.innerHTML = '';
    for (var i = 1; i <= 3; i++) {
      (function (i) {
        var s = document.createElement('span');
        s.className = 'star' + (i <= info.stars ? ' on' : '');
        s.textContent = '★';
        wrap.appendChild(s);
        if (i <= info.stars) {
          setTimeout(function () {
            s.classList.add('pop');
            PG.audio.play('star');
          }, 320 * i);
        }
      })(i);
    }

    var cur = PG.uiGame.current();
    el('next-level-btn').classList.toggle('hidden', !cur || cur.level >= PG.levels.COUNT);
    confetti();
  }

  function hide() {
    el('done').classList.add('hidden');
    if (confettiRaf) { cancelAnimationFrame(confettiRaf); confettiRaf = null; }
    el('confetti').classList.add('hidden');
  }

  function confetti() {
    var cv = el('confetti');
    cv.classList.remove('hidden');
    var dpr = Math.min(2, global.devicePixelRatio || 1);
    cv.width = Math.round(global.innerWidth * dpr);
    cv.height = Math.round(global.innerHeight * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var colors = ['#ffd93b', '#ff8f4c', '#6ee06e', '#5bc8f5', '#ff6f91', '#b28dff'];
    var ps = [];
    for (var i = 0; i < 110; i++) {
      ps.push({
        x: Math.random() * global.innerWidth,
        y: -20 - Math.random() * global.innerHeight * 0.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        vy: 2.2 + Math.random() * 3.2,
        vx: -1.2 + Math.random() * 2.4,
        rot: Math.random() * Math.PI,
        vr: -0.12 + Math.random() * 0.24,
        c: colors[i % colors.length]
      });
    }
    var t0 = performance.now();
    function frame(t) {
      ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t - t0 < 2600) {
        confettiRaf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
        cv.classList.add('hidden');
        confettiRaf = null;
      }
    }
    confettiRaf = requestAnimationFrame(frame);
  }

  function wire() {
    if (wired) return;
    wired = true;
    el('next-level-btn').addEventListener('click', function () {
      var cur = PG.uiGame.current();
      hide();
      if (cur && cur.level < PG.levels.COUNT) PG.uiGame.start(cur.page, cur.level + 1);
    });
    el('retry-btn').addEventListener('click', function () {
      var cur = PG.uiGame.current();
      hide();
      if (cur) PG.uiGame.start(cur.page, cur.level);
    });
    el('home-btn').addEventListener('click', function () {
      hide();
      PG.uiGame.goHome();
    });
  }
  wire();

  global.PG = global.PG || {};
  PG.uiDone = { show: show, hide: hide };
})(typeof window !== 'undefined' ? window : globalThis);
