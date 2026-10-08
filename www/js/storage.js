/* 本地存储封装：进度/自定义图/声音开关。backend 可注入（测试用），全 try/catch 降级。 */
(function (global) {
  'use strict';

  var KEY_PROGRESS = 'puzzle.progress';
  var KEY_CUSTOM = 'puzzle.custom';
  var KEY_SOUND = 'puzzle.sound';

  function makeStorage(backend) {
    var mem = {};

    function rawGet(k) {
      if (backend) {
        try { return backend.getItem(k); } catch (e) { /* 隐私模式等 */ }
      }
      return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    }
    function rawSet(k, v) {
      if (backend) {
        try { backend.setItem(k, v); return true; } catch (e) { /* 配额满等 */ }
      }
      mem[k] = v;
      return false;
    }
    function rawDel(k) {
      if (backend) {
        try { backend.removeItem(k); } catch (e) { /* ignore */ }
      }
      delete mem[k];
    }
    function getJSON(k, dflt) {
      var s = rawGet(k);
      if (s == null) return dflt;
      try {
        var v = JSON.parse(s);
        return v == null ? dflt : v;
      } catch (e) {
        return dflt;
      }
    }

    function loadProgress() {
      var p = getJSON(KEY_PROGRESS, {});
      return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
    }
    function starsFor(imageId, level) {
      var p = loadProgress();
      return (p[imageId] && p[imageId][level]) || 0;
    }
    function saveStars(imageId, level, stars) {
      var p = loadProgress();
      if (!p[imageId] || typeof p[imageId] !== 'object') p[imageId] = {};
      if (stars > (p[imageId][level] || 0)) p[imageId][level] = stars;
      rawSet(KEY_PROGRESS, JSON.stringify(p));
    }

    function loadCustom() {
      var v = getJSON(KEY_CUSTOM, []);
      return Array.isArray(v) ? v : [];
    }
    // 返回是否成功持久化；失败时仍写入内存（本次会话可用）
    function addCustom(item) {
      var list = loadCustom();
      list.push(item);
      return rawSet(KEY_CUSTOM, JSON.stringify(list));
    }
    function removeCustom(id) {
      var list = loadCustom().filter(function (x) { return x.id !== id; });
      rawSet(KEY_CUSTOM, JSON.stringify(list));
    }

    function getSound() { return getJSON(KEY_SOUND, true) === true; }
    function setSound(on) { rawSet(KEY_SOUND, JSON.stringify(on === true)); }

    return {
      loadProgress: loadProgress,
      starsFor: starsFor,
      saveStars: saveStars,
      loadCustom: loadCustom,
      addCustom: addCustom,
      removeCustom: removeCustom,
      getSound: getSound,
      setSound: setSound,
      _raw: { get: rawGet, set: rawSet, del: rawDel }
    };
  }

  var def = null;
  function d() {
    if (!def) def = makeStorage(typeof localStorage !== 'undefined' ? localStorage : null);
    return def;
  }

  var api = { makeStorage: makeStorage, def: d };

  global.PG = global.PG || {};
  global.PG.storage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
