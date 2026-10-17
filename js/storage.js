(function (M) {
  var KEY = 'mufa-snack:v1';

  function fresh() {
    return {
      settings: { mode: 'classic', difficulty: 'normal', theme: 'default', lang: 'id', sound: true, dpad: 'auto' },
      stats: { games: 0, snacks: 0, wins: 0, byMode: {} },
      best: {},
      achievements: {}
    };
  }

  function load() {
    var d = fresh();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        Object.assign(d.settings, p.settings);
        Object.assign(d.stats, p.stats);
        d.best = p.best || {};
        d.achievements = p.achievements || {};
      }
    } catch (e) { /* localStorage tidak tersedia atau rusak: mulai dari data baru */ }
    return d;
  }

  var data = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  M.storage = {
    getBest: function (mode, diff) { return data.best[mode + ':' + diff] || 0; },
    // Mengembalikan true jika skor ini rekor baru.
    recordResult: function (mode, diff, score, snacks, won) {
      data.stats.games++;
      data.stats.snacks += snacks;
      if (won) data.stats.wins++;
      data.stats.byMode[mode] = (data.stats.byMode[mode] || 0) + 1;
      var k = mode + ':' + diff, isNew = score > (data.best[k] || 0);
      if (isNew) data.best[k] = score;
      save();
      return isNew;
    },
    getStats: function () { return data.stats; },
    getSetting: function (k) { return data.settings[k]; },
    setSetting: function (k, v) { data.settings[k] = v; save(); },
    isUnlocked: function (id) { return !!data.achievements[id]; },
    unlock: function (id) { if (!data.achievements[id]) { data.achievements[id] = Date.now(); save(); } },
    reset: function () { data = fresh(); save(); }
  };
})(window.Mufa = window.Mufa || {});
