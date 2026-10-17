(function (M) {
  var R = M.random, G = M.grid;
  var NEED = 5, LIVES = 3, MAX_LEVEL = 10, CP_POINTS = 20, CLEAR_BONUS = 50;

  function setupLevel(s) {
    var keep = M.engine.clearZone(s), area = s.cols * s.rows, lvl = s.level;
    var want = Math.max(2, Math.min(40, Math.round((3 + lvl * 2) * (area / 400) * s.diff.obstacles)));
    s.obstacles = G.walls(s.cols, s.rows, keep, want, 3 + Math.min(lvl, 6));
    var f = G.farCell(s.cols, s.rows, s.obstacles, keep);
    s.door = { x: f.x, y: f.y, open: false };
    s.items = [];
    s.cpIndex = 0;
    s.noFood = true; // mode ini tidak memakai snack biasa
    s.readyTitle = 'Level ' + lvl;
    s.readyText = 'Kunjungi checkpoint 1 sampai ' + NEED + ' berurutan, lalu masuk ke pintu keluar.';
  }

  // Checkpoint berikutnya muncul hanya di sel yang bisa dijangkau dari kepala ular saat ini.
  function nextCheckpoint(s) {
    var head = s.snake[0], blocked = M.engine.occupied(), keep = M.engine.clearZone(s);
    var d = G.bfs(s.cols, s.rows, blocked, head.x, head.y).dist, near = [], any = [];
    for (var i = 0; i < d.length; i++) {
      var x = i % s.cols, y = (i / s.cols) | 0, k = x + ',' + y;
      if (d[i] < 1 || blocked.has(k) || keep.has(k)) continue;
      (d[i] >= 4 ? near : any).push({ x: x, y: y });
    }
    var pool = near.length ? near : any;
    if (!pool.length) return;
    var c = pool[R.int(0, pool.length - 1)];
    s.items.push({ type: 'checkpoint', x: c.x, y: c.y, points: CP_POINTS, grow: true, color: '#22d3ee', label: String(s.cpIndex + 1) });
  }

  M.defineMode({
    id: 'path',
    setupLevel: setupLevel,
    onStart: function (s) {
      s.level = 1; s.lives = LIVES;
      setupLevel(s);
      nextCheckpoint(s);
    },
    onItem: function (s, item) {
      s.cpIndex++;
      if (s.cpIndex >= NEED) s.door.open = true; else nextCheckpoint(s);
      return { points: CP_POINTS };
    },
    onMove: function (s, head) {
      if (!s.door.open || head.x !== s.door.x || head.y !== s.door.y) return;
      M.scoring.add(s, CLEAR_BONUS);
      if (s.level >= MAX_LEVEL) { M.engine.end('victory', 'Semua Level Selesai!'); return; }
      s.level++;
      setupLevel(s);
      M.engine.resetSnake();
      nextCheckpoint(s);
    },
    onCollision: function (s, type) {
      return M.engine.loseLife('Tabrakan!', 'Sisa {n} nyawa. Progres checkpoint tetap.') ? 'game-over' : 'handled';
    },
    getObjective: function (s) {
      return [
        { label: 'Level', value: s.level + '/' + MAX_LEVEL },
        { label: s.door.open ? 'Pintu' : 'Checkpoint', value: s.door.open ? 'Terbuka!' : s.cpIndex + '/' + NEED },
        { label: 'Nyawa', value: '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(LIVES - Math.max(0, s.lives)) }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
