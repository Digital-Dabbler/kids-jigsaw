const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../www/js/pieces.js');
const R = require('../www/js/rng.js');

test('路径命令全部有限数', () => {
  const rnd = R.mulberry32(21);
  for (let i = 0; i < 50; i++) {
    const edges = [0, 1, -1, 0].map(() => Math.floor(rnd() * 3) - 1);
    const cmds = P.piecePathCommands(60, 40, edges);
    for (const c of cmds) {
      for (const k of Object.keys(c)) {
        if (k === 'op' || k === 'ccw') continue;
        assert.ok(Number.isFinite(c[k]), `${k}=${c[k]}`);
      }
    }
  }
});

test('结构：move + 每边 2 line(+1 arc) + close，且闭合回原点', () => {
  const edges = [1, -1, 0, 1];
  const cmds = P.piecePathCommands(60, 40, edges);
  assert.equal(cmds[0].op, 'move');
  assert.deepEqual([cmds[0].x, cmds[0].y], [0, 0]);
  assert.equal(cmds[cmds.length - 1].op, 'close');
  const arcs = cmds.filter((c) => c.op === 'arc');
  assert.equal(arcs.length, edges.filter((e) => e !== 0).length);
  const lines = cmds.filter((c) => c.op === 'line');
  assert.equal(lines.length, 8);
  const last = lines[lines.length - 1];
  assert.deepEqual([last.x, last.y], [0, 0]);
});

test('榫头半径：横边 0.18w、竖边 0.18h；pad 足够', () => {
  const cmds = P.piecePathCommands(100, 50, [1, 1, 1, 1]);
  const arcs = cmds.filter((c) => c.op === 'arc');
  assert.equal(arcs[0].r, 18); // top
  assert.equal(arcs[1].r, 9);  // right
  assert.equal(arcs[2].r, 18); // bottom
  assert.equal(arcs[3].r, 9);  // left
  assert.ok(P.padFor(100, 50) >= 18);
});

test('互补边：同中心同半径、方向相反', () => {
  const a = P.piecePathCommands(60, 40, [1, 0, 0, 0]).filter((c) => c.op === 'arc')[0];
  const b = P.piecePathCommands(60, 40, [-1, 0, 0, 0]).filter((c) => c.op === 'arc')[0];
  assert.equal(a.x, b.x);
  assert.equal(a.y, b.y);
  assert.equal(a.r, b.r);
  assert.notEqual(a.ccw, b.ccw);
});

test('edgeRadius 与 padFor 单调', () => {
  assert.ok(P.edgeRadius(100, 50, 0) > P.edgeRadius(50, 50, 0));
  assert.ok(P.padFor(10, 20) > P.padFor(10, 10));
});
