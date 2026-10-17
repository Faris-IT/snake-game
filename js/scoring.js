(function (M) {
  M.scoring = {
    add: function (s, points) { s.score += points; },
    formatTime: function (ms) {
      var t = Math.max(0, Math.ceil(ms / 1000));
      return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    },
    // Interval langkah (ms): makin kecil makin cepat. Mode boleh mengganti lewat mode.speedMs(s).
    speedMs: function (s) {
      if (s.mode.speedMs) return s.mode.speedMs(s);
      var level = Math.floor(s.eaten / s.mode.speedEvery);
      return Math.max(s.diff.minMs, s.diff.startMs - level * s.diff.stepMs);
    }
  };
})(window.Mufa = window.Mufa || {});
