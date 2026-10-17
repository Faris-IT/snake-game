(function (M) {
  var WINDOW_MS = 5000, MAX = 5;

  M.defineMode({
    id: 'combo',
    onStart: function (s) {
      s.combo = 1; s.comboMs = 0;
      s.readyText = 'Makan snack berikutnya dalam 5 detik untuk menaikkan pengali hingga ×5.';
    },
    onTick: function (s, dt) {
      if (s.comboMs <= 0) return;
      s.comboMs -= dt;
      if (s.comboMs <= 0) { s.comboMs = 0; s.combo = 1; }
    },
    onEat: function (s) {
      s.combo = s.comboMs > 0 ? Math.min(MAX, s.combo + 1) : 1;
      s.comboMs = WINDOW_MS;
      s.maxCombo = Math.max(s.maxCombo || 1, s.combo);
      return { points: M.config.points.snack * s.combo };
    },
    getObjective: function (s) {
      return [
        { label: 'Combo', value: '×' + s.combo },
        { label: 'Sisa', value: s.comboMs > 0 ? (s.comboMs / 1000).toFixed(1) + 'd' : '—' }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
