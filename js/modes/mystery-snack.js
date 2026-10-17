(function (M) {
  var R = M.random, DURATION = 90000, SPAWN_MS = 8000, TTL = 10000, SLOW_MS = 6000, SLOW_X = 1.6, COLOR = '#c084fc';
  // Distribusi tetap (total 100). Semua efek menguntungkan atau netral; tidak ada efek berbahaya.
  var EFFECTS = [{ id: 'bonus', w: 40 }, { id: 'shrink', w: 20 }, { id: 'slow', w: 20 }, { id: 'shield', w: 20 }];

  function roll() {
    var r = Math.random() * 100, acc = 0;
    for (var i = 0; i < EFFECTS.length; i++) { acc += EFFECTS[i].w; if (r < acc) return EFFECTS[i].id; }
    return 'bonus';
  }

  function toast(s, text) { s.fx = text; s.fxMs = 2500; }

  M.defineMode({
    id: 'mystery',
    onStart: function (s) {
      s.remainingMs = DURATION; s.slowMs = 0; s.shield = false; s.spawnTimer = SPAWN_MS; s.fx = ''; s.fxMs = 0;
      s.readyText = 'Snack ungu "?" memberi efek acak: bonus poin, ular memendek, perlambatan, atau perisai.';
    },
    onTick: function (s, dt) {
      s.remainingMs -= dt;
      if (s.remainingMs <= 0) { s.remainingMs = 0; M.engine.end('game-over', 'Waktu Habis'); return; }
      s.slowMs = Math.max(0, s.slowMs - dt);
      s.fxMs = Math.max(0, s.fxMs - dt);
      for (var i = s.items.length - 1; i >= 0; i--) {
        s.items[i].ttl -= dt;
        if (s.items[i].ttl <= 0) s.items.splice(i, 1);
      }
      if (s.items.length) return;
      s.spawnTimer -= dt;
      if (s.spawnTimer > 0) return;
      s.spawnTimer = SPAWN_MS;
      var c = M.random.emptyCell(s.cols, s.rows, M.engine.occupied());
      if (c) s.items.push({ type: 'mystery', x: c.x, y: c.y, points: 0, ttl: TTL, color: COLOR, label: '?' });
    },
    onItem: function (s, item) {
      var e = roll(), pts = 0;
      if (e === 'bonus') { pts = 50; toast(s, 'Bonus +50'); }
      else if (e === 'shrink') {
        var cut = Math.min(3, s.snake.length - M.config.initialLength);
        if (cut > 0) s.snake.length -= cut;
        toast(s, 'Ular memendek');
      }
      else if (e === 'slow') { s.slowMs = SLOW_MS; toast(s, 'Perlambatan'); }
      else { s.shield = true; toast(s, 'Perisai aktif'); }
      return { points: pts };
    },
    onCollision: function (s, type) {
      if (!s.shield) return 'game-over';
      s.shield = false;
      s.readyTitle = 'Perisai terpakai';
      s.readyText = 'Satu tabrakan ditahan.';
      M.engine.hold();
      return 'handled';
    },
    speedMs: function (s) {
      var level = Math.floor(s.eaten / 5);
      var base = Math.max(s.diff.minMs, s.diff.startMs - level * s.diff.stepMs);
      return s.slowMs > 0 ? base * SLOW_X : base;
    },
    getObjective: function (s) {
      var parts = [];
      if (s.fxMs > 0) parts.push(s.fx);
      if (s.slowMs > 0 && s.fx !== 'Perlambatan') parts.push('Lambat ' + Math.ceil(s.slowMs / 1000) + 'd');
      if (s.shield && s.fx !== 'Perisai aktif') parts.push('Perisai');
      return [
        { label: 'Waktu', value: M.scoring.formatTime(s.remainingMs) },
        { label: 'Efek', value: parts.length ? parts.join(' · ') : '—' },
        { label: 'Panjang', value: s.snake.length }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
