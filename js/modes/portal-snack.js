(function (M) {
  var R = M.random, G = M.grid, TARGET = 15, COLORS = ['#22d3ee', '#b388ff'];

  function setup(s) {
    var keep = M.engine.clearZone(s), area = s.cols * s.rows;
    var want = Math.max(3, Math.round(6 * (area / 400) * s.diff.obstacles));
    s.obstacles = G.walls(s.cols, s.rows, keep, want, 4);

    // Dua portal berjauhan, tidak di rintangan/area awal, dan tidak menempel batas arena.
    var minDist = Math.max(s.cols, s.rows) / 2, a, b, ok = false;
    function pick() {
      for (var i = 0; i < 100; i++) {
        var c = { x: R.int(1, s.cols - 2), y: R.int(1, s.rows - 2) }, k = c.x + ',' + c.y;
        if (!keep.has(k) && !s.obstacles.has(k)) return c;
      }
      return { x: 1, y: 1 };
    }
    for (var t = 0; t < 200 && !ok; t++) {
      a = pick(); b = pick();
      ok = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) >= minDist;
    }
    s.portals = [{ x: a.x, y: a.y, color: COLORS[0] }, { x: b.x, y: b.y, color: COLORS[1] }];
  }

  M.defineMode({
    id: 'portal',
    setup: setup,
    onStart: function (s) {
      setup(s);
      s.readyText = 'Masuk satu portal untuk keluar di pasangannya. Arah gerak tetap sama.';
    },
    // Portal hanya aktif jika titik keluar tidak ditempati ular atau rintangan.
    onBeforeMove: function (s, next) {
      for (var i = 0; i < 2; i++) {
        var p = s.portals[i];
        if (p.x !== next.x || p.y !== next.y) continue;
        var o = s.portals[1 - i], k = o.x + ',' + o.y;
        var taken = s.obstacles.has(k) || s.snake.some(function (c) { return c.x === o.x && c.y === o.y; });
        return taken ? next : { x: o.x, y: o.y };
      }
      return next;
    },
    onEat: function (s) {
      return { points: M.config.points.snack, end: s.eaten >= TARGET ? 'victory' : null, title: 'Misi Selesai!' };
    },
    avoidCells: function (s) { return s.portals.map(function (p) { return p.x + ',' + p.y; }); },
    getObjective: function (s) {
      return [{ label: 'Target', value: s.eaten + '/' + TARGET }, { label: 'Panjang', value: s.snake.length }];
    }
  });
})(window.Mufa = window.Mufa || {});
