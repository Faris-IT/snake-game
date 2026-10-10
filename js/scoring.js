// ===== Sistem skor & rekor (localStorage) =====
const Scoring = (() => {
  const KEY = "mufa-snack.best.v1";

  function loadBest() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }
  function saveBest(map) {
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
  }
  function getBest(modeId) {
    return loadBest()[modeId] || 0;
  }
  function submitScore(modeId, score) {
    const map = loadBest();
    if (score > (map[modeId] || 0)) {
      map[modeId] = score;
      saveBest(map);
      return true; // new record
    }
    return false;
  }
  return { getBest, submitScore };
})();