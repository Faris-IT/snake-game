(function (M) {
  var TARGET = 20, LIVES = 3, BONUS_EVERY = 9000, BONUS_TTL = 7000, BONUS_COLOR = '#ff8a3d';

  M.defineMode({
    id: 'hunter',
    onStart: function (s) {
      s.lives = LIVES;
      s.bonusTimer = BONUS_EVERY;
      s.readyText = 'Kumpulkan ' + TARGET + ' snack. Snack oranye bernilai 30 poin, tapi tidak dihitung ke target.';
    },
    onTick: function (s, dt) {
      for (var i = s.items.length - 1; i >= 0; i--) {
        s.items[i].ttl -= dt;
        if (s.items[i].ttl <= 0) s.items.splice(i, 1);
      }
      if (s.items.length) return;
      s.bonusTimer -= dt;
      if (s.bonusTimer > 0) return;
      s.bonusTimer = BONUS_EVERY;
      var c = M.random.emptyCell(s.cols, s.rows, M.engine.occupied());
      if (c) s.items.push({ type: 'bonus', x: c.x, y: c.y, points: M.config.points.bonus, ttl: BONUS_TTL, color: BONUS_COLOR });
    },
    onEat: function (s) {
      var done = s.eaten >= TARGET;
      return { points: M.config.points.snack, end: done ? 'victory' : null, title: 'Target Selesai!' };
    },
    onCollision: function (s, type) {
      s.items = [];
      s.bonusTimer = BONUS_EVERY;
      return M.engine.loseLife('Nyawa berkurang', 'Sisa {n} nyawa. Skor dan progres tetap aman.') ? 'game-over' : 'handled';
    },
    getObjective: function (s) {
      return [
        { label: 'Target', value: s.eaten + '/' + TARGET },
        { label: 'Nyawa', value: '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(LIVES - Math.max(0, s.lives)) }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
