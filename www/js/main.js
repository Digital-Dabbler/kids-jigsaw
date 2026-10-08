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
})();
