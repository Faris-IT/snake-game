(function (M) {
  var R = M.random, LIVES = 3, FIRST_MS = 5000, WAVE_MS = 8000, WARN_MS = 2000, ACTIVE_MS = 5000;

  function inActive(s, p) {
    return s.zones.some(function (z) { return z.phase === 'active' && z.x === p.x && z.y === p.y; });
  }

  // Mengembalikan true jika nyawa habis. Zona dibersihkan agar ular tidak muncul kembali di bahaya.
  function hurt(s) {
    s.zones = [];
    s.waveTimer = WAVE_MS;
    return M.engine.loseLife('Terkena bahaya', 'Sisa {n} nyawa. Semua zona dibersihkan.');
  }

  function spawnWave(s) {
    s.wave++;
    var n = Math.max(1, Math.round((1 + Math.floor(s.wave / 3)) * s.diff.obstacles));
    var maxCells = Math.floor(s.cols * s.rows * .25), have = {}, side = s.wave >= 4 ? 4 : 3;
    s.zones.forEach(function (z) { have[z.x + ',' + z.y] = 1; });
    for (var k = 0; k < n && s.zones.length < maxCells; k++) {
      var w = R.int(2, side), h = R.int(2, side), x0 = R.int(0, s.cols - w), y0 = R.int(0, s.rows - h);
      for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) {
        if (have[x + ',' + y] || (s.food && s.food.x === x && s.food.y === y)) continue;
        have[x + ',' + y] = 1;
        s.zones.push({ x: x, y: y, phase: 'warn', ms: WARN_MS });
      }
    }
  }

  M.defineMode({
    id: 'danger',
    onStart: function (s) {
      s.lives = LIVES; s.wave = 0; s.waveTimer = FIRST_MS;
      s.readyText = 'Zona merah berkedip akan aktif dalam 2 detik. Segera tinggalkan.';
    },
    onTick: function (s, dt) {
      s.waveTimer -= dt;
      if (s.waveTimer <= 0) { s.waveTimer = WAVE_MS; spawnWave(s); }
      var activated = false;
      for (var i = s.zones.length - 1; i >= 0; i--) {
        var z = s.zones[i];
        z.ms -= dt;
        if (z.ms > 0) continue;
        if (z.phase === 'warn') { z.phase = 'active'; z.ms = ACTIVE_MS; activated = true; }
        else s.zones.splice(i, 1);
      }
      if (activated && inActive(s, s.snake[0]) && hurt(s)) M.engine.end('game-over');
    },
    onMove: function (s, head) {
      if (inActive(s, head) && hurt(s)) M.engine.end('game-over');
    },
    onCollision: function (s, type) { return hurt(s) ? 'game-over' : 'handled'; },
    avoidCells: function (s) { return s.zones.map(function (z) { return z.x + ',' + z.y; }); },
    getObjective: function (s) {
      return [
        { label: 'Waktu', value: M.scoring.formatTime(s.timeMs) },
        { label: 'Nyawa', value: '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(LIVES - Math.max(0, s.lives)) }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
