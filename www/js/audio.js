/* WebAudio 合成音效：无音频资产。首次 pointerdown 由 main.js 调 unlock()。 */
(function (global) {
  'use strict';

  var ctx = null;

  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(c, freq, dur, type, gain, when) {
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(when);
    o.stop(when + dur + 0.02);
  }

  function enabled() {
    return !(global.PG && PG.main && PG.main.storage && !PG.main.storage.getSound());
  }

  function play(name) {
    if (!enabled()) return;
    var c = ac();
    if (!c) return;
    var t = c.currentTime;
    if (name === 'pick') tone(c, 660, 0.07, 'square', 0.12, t);
    else if (name === 'snap') { tone(c, 880, 0.06, 'triangle', 0.25, t); tone(c, 1320, 0.05, 'triangle', 0.15, t + 0.05); }
    else if (name === 'deny') tone(c, 220, 0.12, 'sine', 0.18, t);
    else if (name === 'star') tone(c, 1568, 0.12, 'sine', 0.25, t);
    else if (name === 'win') [523, 659, 784, 1047].forEach(function (f, i) { tone(c, f, 0.18, 'triangle', 0.22, t + i * 0.12); });
  }

  var api = { unlock: ac, play: play };

  global.PG = global.PG || {};
  global.PG.audio = api;
})(typeof window !== 'undefined' ? window : globalThis);
