const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../www/js/storage.js');

function mapBackend() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
}
function throwingBackend() {
  return {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('denied'); }
  };
}

test('正常 backend：星星取最佳合并', () => {
  const s = S.makeStorage(mapBackend());
  assert.equal(s.starsFor('b1', 1), 0);
  s.saveStars('b1', 1, 2);
  s.saveStars('b1', 1, 3);
  s.saveStars('b1', 1, 1); // 不降级
  assert.equal(s.starsFor('b1', 1), 3);
  assert.deepEqual(s.loadProgress(), { b1: { 1: 3 } });
});

test('坏 JSON 当空处理', () => {
  const b = mapBackend();
  b.setItem('puzzle.progress', '{bad');
  b.setItem('puzzle.custom', 'null');
  const s = S.makeStorage(b);
  assert.deepEqual(s.loadProgress(), {});
  assert.deepEqual(s.loadCustom(), []);
});

test('backend 全抛错：降级内存模式不炸', () => {
  const s = S.makeStorage(throwingBackend());
  s.saveStars('b2', 3, 2);
  assert.equal(s.starsFor('b2', 3), 2);
  const persisted = s.addCustom({ id: 'x1', name: 't', thumb: 't', full: 'f' });
  assert.equal(persisted, false);
  assert.equal(s.loadCustom().length, 1); // 内存仍可用
  s.removeCustom('x1');
  assert.equal(s.loadCustom().length, 0);
  s.setSound(false);
  assert.equal(s.getSound(), false);
});

test('自定义图增删', () => {
  const s = S.makeStorage(mapBackend());
  assert.equal(s.addCustom({ id: 'a', name: 'A', thumb: '1', full: '2' }), true);
  s.addCustom({ id: 'b', name: 'B', thumb: '1', full: '2' });
  assert.equal(s.loadCustom().length, 2);
  s.removeCustom('a');
  assert.deepEqual(s.loadCustom().map((x) => x.id), ['b']);
});

test('声音开关默认开、可持久化', () => {
  const s = S.makeStorage(mapBackend());
  assert.equal(s.getSound(), true);
  s.setSound(false);
  assert.equal(s.getSound(), false);
  const s2 = S.makeStorage(mapBackend());
  assert.equal(s2.getSound(), true); // 新 backend 默认
});
