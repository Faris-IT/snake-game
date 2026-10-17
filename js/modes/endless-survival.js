(function (M) {
  var R = M.random, G = M.grid, WARN_MS = 2000;

  function interval(s) { return Math.max(2, Math.round(3 / s.diff.obstacles)); }

  // Rintangan baru selalu diberi peringatan (kotak merah berkedip) dan tidak boleh memutus arena.
  function addPending(s) {
    var cols = s.cols, rows = s.rows, area = cols * rows, head = s.snake[0];
    if (s.obstacles.size + s.zones.length >= area * .2) return;
    var taken = M.engine.occupied();
    for (var t = 0; t < 30; t++) {
      var horiz = Math.random() < .5, len = R.int(1, 3), x = R.int(0, cols - 1), y = R.int(0, rows - 1), cells = [];
      for (var i = 0; i < len; i++) {
        var px = horiz ? x + i : x, py = horiz ? y : y + i;
        if (px >= cols || py >= rows) break;
        cells.push({ x: px, y: py });
      }
      if (cells.some(function (c) { return taken.has(c.x + ',' + c.y) || Math.abs(c.x - head.x) + Math.abs(c.y - head.y) < 4; })) continue;
      var test = new Set(s.obstacles);
      s.zones.forEach(function (z) { test.add(z.x + ',' + z.y); });
      cells.forEach(function (c) { test.add(c.x + ',' + c.y); });
      if (G.bfs(cols, rows, test, head.x, head.y).count !== area - test.size) continue;
      cells.forEach(function (c) { s.zones.push({ x: c.x, y: c.y, phase: 'warn', ms: WARN_MS }); });
      return;
    }
  }

  M.defineMode({
    id: 'endless',
    speedEvery: 3,
    onStart: function (s) {
      s.nextAt = interval(s);
      s.readyText = 'Rintangan baru muncul seiring progres. Kotak merah berkedip akan menjadi dinding.';
    },
    onTick: function (s, dt) {
      for (var i = s.zones.length - 1; i >= 0; i--) {
        var z = s.zones[i];
        z.ms -= dt;
        if (z.ms > 0) continue;
        var onBody = s.snake.some(function (c) { return c.x === z.x && c.y === z.y; });
        if (onBody) { z.ms = 300; continue; } // tunda sampai ular meninggalkan sel
        s.obstacles.add(z.x + ',' + z.y);
        s.zones.splice(i, 1);
      }
    },
    onEat: function (s) {
      if (s.eaten >= s.nextAt) { s.nextAt += interval(s); addPending(s); }
      return { points: M.config.points.snack };
    },
    avoidCells: function (s) { return s.zones.map(function (z) { return z.x + ',' + z.y; }); },
    getObjective: function (s) {
      return [{ label: 'Rintangan', value: s.obstacles.size }, { label: 'Panjang', value: s.snake.length }];
    }
  });
})(window.Mufa = window.Mufa || {});
