/* 测试入口：进程内依次加载各测试文件。
 * 不用 `node --test tests/`：它会为每个文件 spawn 管道 stdio 子进程，
 * 在 DSH 受限沙箱下 named pipes 被禁，必然 spawn EPERM。 */
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.test.js')).sort();
for (const f of files) require(path.join(__dirname, f));
