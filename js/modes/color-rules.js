(function (M) {
  var R = M.random, G = M.grid, TARGET = 15, LIVES = 3, CHANGE_MS = 10000, WARN_MS = 2000, BONUS = 20;
  var COLORS = {
    blue:   { name: 'Biru',   hex: '#3b82f6' },
    purple: { name: 'Ungu',   hex: '#a855f7' },
    orange: { name: 'Oranye', hex: '#f59e0b' }
  };
  var KEYS = Object.keys(COLORS);

  function other(exclude) {
    var a = KEYS.filter(function (k) { return k !== exclude; });
    return a[R.int(0, a.length - 1)];
  }

  // Petak warna acak. Untuk setiap warna yang mungkin terlarang, sisa arena harus tetap terhubung.
  function buildTiles(s) {
    var keep = M.engine.clearZone(s), cols = s.cols, rows = s.rows, area = cols * rows;
    var cx = Math.floor(cols / 2), cy = Math.floor(rows / 2), cover = .28 * s.diff.obstacles, map;
    for (var attempt = 0; attempt < 200; attempt++) {
      map = new Map();
      var goal = Math.floor(area * cover), guard = 0;
      while (map.size < goal && guard++ < 200) {
        var w = R.int(2, 4), h = R.int(2, 4), x0 = R.int(0, cols - w), y0 = R.int(0, rows - h), c = KEYS[R.int(0, 2)];
        for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++)
          if (!keep.has(x + ',' + y)) map.set(x + ',' + y, c);
      }
      var valid = KEYS.every(function (col) {
        var blocked = new Set();
        map.forEach(function (v, k) { if (v === col) blocked.add(k); });
        return G.bfs(cols, rows, blocked, cx, cy).count === area - blocked.size;
      });
      if (valid) break;
      cover *= .98;
    }
    s.tileMap = map;
    s.tiles = [];
    map.forEach(function (c, k) { var p = k.split(','); s.tiles.push({ x: +p[0], y: +p[1], c: c }); });
  }

  function hurt(s) {
    return M.engine.loseLife('Sel terlarang!', 'Sisa {n} nyawa. Skor dan progres tetap aman.');
  }

  function onForbidden(s, p) { return s.tileMap.get(p.x + ',' + p.y) === s.forbidden; }

  M.defineMode({
    id: 'color',
    onStart: function (s) {
      s.lives = LIVES; s.ruleMs = 0;
      s.tileColors = {};
      KEYS.forEach(function (k) { s.tileColors[k] = COLORS[k].hex; });
      buildTiles(s);
      s.forbidden = KEYS[R.int(0, 2)];
      s.targetColor = other(s.forbidden);
      s.nextForbidden = null;
      s.readyText = 'Hindari sel warna terlarang (bertanda X). Snack warna bonus memberi +' + BONUS + ' poin.';
    },
    onTick: function (s, dt) {
      s.ruleMs += dt;
      if (!s.nextForbidden && s.ruleMs >= CHANGE_MS - WARN_MS) s.nextForbidden = other(s.forbidden);
      if (s.ruleMs < CHANGE_MS) return;
      s.ruleMs = 0;
      s.forbidden = s.nextForbidden; s.nextForbidden = null;
      s.targetColor = other(s.forbidden);
      if (s.food && onForbidden(s, s.food)) M.engine.respawnFood();
      if (onForbidden(s, s.snake[0]) && hurt(s)) M.engine.end('game-over');
    },
    onMove: function (s, head) {
      if (onForbidden(s, head) && hurt(s)) M.engine.end('game-over');
    },
    onCollision: function (s, type) { return hurt(s) ? 'game-over' : 'handled'; },
    onFoodSpawn: function (s, food) {
      // Setengah dari snack berwarna sesuai target bonus saat ini.
      var key = Math.random() < .5 ? s.targetColor : KEYS[R.int(0, 2)];
      food.colorKey = key; food.color = COLORS[key].hex;
    },
    onEat: function (s) {
      var bonus = s.food && s.food.colorKey === s.targetColor ? BONUS : 0;
      return { points: M.config.points.snack + bonus, end: s.eaten >= TARGET ? 'victory' : null, title: 'Misi Selesai!' };
    },
    avoidCells: function (s) {
      var out = [];
      if (!s.tiles) return out;
      s.tiles.forEach(function (t) { if (t.c === s.forbidden || t.c === s.nextForbidden) out.push(t.x + ',' + t.y); });
      return out;
    },
    getObjective: function (s) {
      var rule = COLORS[s.forbidden].name + (s.nextForbidden ? ' → ' + COLORS[s.nextForbidden].name : '');
      return [
        { label: 'Target', value: s.eaten + '/' + TARGET },
        { label: 'Nyawa', value: '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(LIVES - Math.max(0, s.lives)) },
        { label: 'Terlarang', value: rule },
        { label: 'Bonus +' + BONUS, value: COLORS[s.targetColor].name }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
