(function (M) {
  var DURATION = 60000, SPEED_EVERY_MS = 10000;

  function fmt(ms) {
    var t = Math.ceil(ms / 1000);
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }

  M.defineMode({
    id: 'timeRush',
    onStart: function (s) { s.remainingMs = DURATION; },
    onTick: function (s, dt) {
      s.remainingMs -= dt; // hanya jalan saat playing, jadi berhenti saat jeda
      if (s.remainingMs <= 0) { s.remainingMs = 0; M.engine.end('game-over', 'Waktu Habis'); }
    },
    speedMs: function (s) {
      var level = Math.floor((DURATION - s.remainingMs) / SPEED_EVERY_MS);
      return Math.max(s.diff.minMs, s.diff.startMs - level * s.diff.stepMs);
    },
    getObjective: function (s) {
      return [{ label: 'Waktu', value: fmt(s.remainingMs) }, { label: 'Panjang', value: s.snake.length }];
    }
  });
})(window.Mufa = window.Mufa || {});
