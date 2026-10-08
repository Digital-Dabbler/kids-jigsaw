/* 主页：图案轮播（内置+自定义+上传卡）、关卡徽章、声音开关图标、toast。仅浏览器。 */
(function (global) {
  'use strict';

  var UPLOAD_PAGE = { id: '__upload', kind: 'upload', name: '上传照片' };

  function el(id) { return document.getElementById(id); }

  function toast(msg) {
    var t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  function downscale(img, maxSide, q) {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    var s = Math.min(1, maxSide / Math.max(w, h));
    var cw = Math.max(1, Math.round(w * s));
    var ch = Math.max(1, Math.round(h * s));
    var cv = document.createElement('canvas');
    cv.width = cw;
    cv.height = ch;
    cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
    return cv.toDataURL('image/jpeg', q);
  }

  function fileToCustom(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('not-image'));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          resolve({
            id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
            name: (file.name || '').replace(/\.[^.]+$/, '') || '我的图',
            full: downscale(img, 2048, 0.9),
            thumb: downscale(img, 240, 0.8)
          });
        } catch (e) {
          reject(e);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('decode-failed'));
      };
      img.src = url;
    });
  }

  function init(deps) {
    var storage = deps.storage;
    var onPlay = deps.onPlay;
    var state = { pages: [], idx: 0, level: 1 };

    var slot = el('preview-slot');
    var counter = el('page-counter');
    var delBtn = el('del-custom');
    var levelRow = el('level-row');
    var startBtn = el('start-btn');
    var fileInput = el('file-input');

    function pages() {
      return PG.images.list(storage.loadCustom()).concat([UPLOAD_PAGE]);
    }

    function refresh() {
      state.pages = pages();
      if (state.idx >= state.pages.length) state.idx = 0;
      render();
    }

    function render() {
      var page = state.pages[state.idx];
      // 预览卡
      slot.innerHTML = '';
      if (page.kind === 'upload') {
        var up = document.createElement('button');
        up.type = 'button';
        up.className = 'upload-big';
        up.innerHTML = '<span class="plus">＋</span><span>上传照片</span>';
        up.addEventListener('click', function () { fileInput.click(); });
        slot.appendChild(up);
      } else {
        var img = document.createElement('img');
        img.src = page.thumb;
        img.alt = page.name;
        slot.appendChild(img);
      }
      counter.textContent = (state.idx + 1) + '/' + state.pages.length;
      delBtn.classList.toggle('hidden', page.kind !== 'custom');

      // 关卡徽章
      levelRow.innerHTML = '';
      for (var lv = 1; lv <= PG.levels.COUNT; lv++) {
        (function (lv) {
          var stars = page.kind === 'upload' ? 0 : storage.starsFor(page.id, lv);
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'badge' + (lv === state.level ? ' badge-cur' : stars > 0 ? ' badge-done' : '');
          b.setAttribute('aria-label', '难度 C' + lv);
          b.innerHTML = '<span class="badge-num">' + lv + '</span>' +
            (stars > 0 ? '<span class="stars-chip">★' + stars + '</span>' : '');
          b.addEventListener('click', function () {
            state.level = lv;
            render();
          });
          levelRow.appendChild(b);
        })(lv);
      }

      startBtn.disabled = page.kind === 'upload';
      startBtn.classList.toggle('btn-disabled', page.kind === 'upload');
    }

    el('prev-img').addEventListener('click', function () {
      state.idx = (state.idx - 1 + state.pages.length) % state.pages.length;
      render();
    });
    el('next-img').addEventListener('click', function () {
      state.idx = (state.idx + 1) % state.pages.length;
      render();
    });
    delBtn.addEventListener('click', function () {
      var page = state.pages[state.idx];
      if (page.kind !== 'custom') return;
      storage.removeCustom(page.id);
      toast('已删除「' + page.name + '」');
      refresh();
    });
    startBtn.addEventListener('click', function () {
      var page = state.pages[state.idx];
      if (page.kind === 'upload') return;
      onPlay(page, state.level);
    });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      fileToCustom(file).then(function (item) {
        var persisted = storage.addCustom(item);
        if (!persisted) toast('图片较大，仅本次可用（未保存）');
        state.idx = state.pages.length - 1; // 刷新后定位到新图
        refresh();
        state.idx = state.pages.length - 2 >= 0 ? state.pages.length - 2 : 0;
        render();
      }).catch(function (e) {
        toast(e && e.message === 'not-image' ? '请选择图片文件' : '图片读取失败，换一张试试');
      });
    });

    return {
      refresh: refresh,
      getSelection: function () {
        return { page: state.pages[state.idx], level: state.level };
      }
    };
  }

  var api = { init: init, toast: toast };

  global.PG = global.PG || {};
  global.PG.uiHome = api;
})(typeof window !== 'undefined' ? window : globalThis);
