const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../www/js/format.js');

test('timeText：秒与分秒', () => {
  assert.equal(F.timeText(0), '0 秒');
  assert.equal(F.timeText(7.4), '7 秒');
  assert.equal(F.timeText(59.4), '59 秒');
  assert.equal(F.timeText(59.6), '1 分 0 秒'); // 先四舍五入再格式化，不出现"60 秒"
  assert.equal(F.timeText(60), '1 分 0 秒');
  assert.equal(F.timeText(83), '1 分 23 秒');
  assert.equal(F.timeText(-5), '0 秒');
});
