(function (M) {
  M.defineMode({
    id: 'noGrowth',
    grow: false,        // ular tetap sepanjang awal
    speedEvery: 10,     // kecepatan naik setiap 10 snack
    onStart: function (s) {
      var area = s.cols * s.rows;
      var want = Math.max(3, Math.round(7 * (area / 400) * s.diff.obstacles));
      s.obstacles = M.grid.walls(s.cols, s.rows, M.engine.clearZone(s), want, 4);
      s.readyText = 'Ular tidak bertambah panjang. Fokus pada jalur tercepat.';
    },
    getObjective: function (s) { return [{ label: 'Snack', value: s.eaten }]; }
  });
})(window.Mufa = window.Mufa || {});
