// ===== Storage: statistik, achievements, pengaturan =====
const Storage = (() => {
  const KEY_STATS = "mufa-snack.stats.v1";
  const KEY_ACHV  = "mufa-snack.achievements.v1";
  const KEY_SET   = "mufa-snack.settings.v1";
  const KEY_BEST  = "mufa-snack.best.v1";

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  // ===== Stats =====
  const defaultStats = {
    totalGames: 0,
    totalSnacks: 0,
    totalWins: 0,
    modeSessions: {},   // { modeId: count }
    modeWins: {},       // { modeId: count }
    firstPlayedAt: null,
    lastPlayedAt: null,
  };
  function getStats() { return Object.assign({}, defaultStats, load(KEY_STATS, {})); }
  function saveStats(s) { save(KEY_STATS, s); }
  function recordSession(modeId, opts = {}) {
    const s = getStats();
    s.totalGames++;
    s.totalSnacks += opts.snacks || 0;
    s.modeSessions[modeId] = (s.modeSessions[modeId] || 0) + 1;
    if (opts.win) {
      s.totalWins++;
      s.modeWins[modeId] = (s.modeWins[modeId] || 0) + 1;
    }
    if (!s.firstPlayedAt) s.firstPlayedAt = Date.now();
    s.lastPlayedAt = Date.now();
    saveStats(s);
  }
  function getFavoriteMode() {
    const s = getStats();
    let best = null, bestCount = 0;
    for (const [id, count] of Object.entries(s.modeSessions || {})) {
      if (count > bestCount) { best = id; bestCount = count; }
    }
    return best;
  }
  function resetStats() { saveStats({}); }

  // ===== Best scores =====
  function loadBest() { return load(KEY_BEST, {}); }
  function getBest(modeId) { return loadBest()[modeId] || 0; }
  function submitScore(modeId, score) {
    const map = loadBest();
    if (score > (map[modeId] || 0)) {
      map[modeId] = score;
      save(KEY_BEST, map);
      return true;
    }
    return false;
  }

  // ===== Achievements =====
  const defaultAchv = { unlocked: {} }; // { achvId: timestamp }
  function getAchievements() { return Object.assign({}, defaultAchv, load(KEY_ACHV, {})); }
  function saveAchievements(a) { save(KEY_ACHV, a); }
  function unlockAchievement(id) {
    const a = getAchievements();
    if (a.unlocked[id]) return false;
    a.unlocked[id] = Date.now();
    saveAchievements(a);
    return true;
  }
  function isAchievementUnlocked(id) {
    return !!getAchievements().unlocked[id];
  }
  function resetAchievements() { saveAchievements({}); }

  // ===== Settings =====
  const defaultSettings = {
    sound: true,
    theme: "default",
    language: "id",
  };
  function getSettings() { return Object.assign({}, defaultSettings, load(KEY_SET, {})); }
  function saveSettings(s) { save(KEY_SET, s); }
  function updateSetting(key, value) {
    const s = getSettings();
    s[key] = value;
    saveSettings(s);
    return s;
  }

  return {
    // stats
    getStats, saveStats, recordSession, getFavoriteMode, resetStats,
    // best
    getBest, submitScore,
    // achievements
    getAchievements, unlockAchievement, isAchievementUnlocked, resetAchievements,
    // settings
    getSettings, saveSettings, updateSetting,
  };
})();