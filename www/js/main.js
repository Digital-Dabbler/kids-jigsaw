/* 启动入口：存储、声音开关、主页装配。游戏屏接线在 commit 4 补全。 */
(function () {
  'use strict';

  var storage = PG.storage.def();

  function applySoundIcon() {
    var on = storage.getSound();
    document.querySelectorAll('.js-sound').forEach(function (b) {
      b.textContent = on ? '🔊' : '🔇';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.js-sound').forEach(function (b) {
    b.addEventListener('click', function () {
      storage.setSound(!storage.getSound());
      applySoundIcon();
      if (PG.audio) PG.audio.play('pick');
    });
  });

  var home = PG.uiHome.init({
    storage: storage,
    onPlay: function (page, level) {
      if (PG.uiGame && PG.uiGame.start) {
        PG.uiGame.start(page, level);
      } else {
        PG.uiHome.toast('游戏屏即将上线');
      }
    }
  });
  home.refresh();
  applySoundIcon();

  PG.main = { home: home, storage: storage, applySoundIcon: applySoundIcon };

  // PWA：仅安全上下文注册 SW（file:// 跳过）
  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 离线缓存不可用不致命 */ });
    });
  }

  // 首次手势解锁音频
  var unlockOnce = function () {
    if (PG.audio) PG.audio.unlock();
    window.removeEventListener('pointerdown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce);
})();
