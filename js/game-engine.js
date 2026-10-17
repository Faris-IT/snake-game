(function (M) {
  var DIRS = M.grid.DIRS;
  var s = null, raf = 0, last = 0, acc = 0, hooks = {};

  // Kontrak mode. Setiap mode hanya menimpa hook yang dibutuhkan.
  var DEFAULTS = {
    grow: true,
    speedEvery: 5,
    onStart: function (s) {},
    onTick: function (s, dt) {},                 // tiap frame saat playing (berhenti saat jeda)
    onMove: function (s, head) {},
    onBeforeMove: function (s, next) { return next; },   // boleh mengubah sel tujuan (portal)
    onFoodSpawn: function (s, food) {},                  // boleh mengubah snack baru (warna)
    avoidCells: function (s) { return []; },             // sel "x,y" yang tidak boleh ditempati snack/item               // setelah ular bergerak
    onEat: function (s) { return { points: M.config.points.snack }; },   // boleh menambah end/title
    onItem: function (s, item) { return { points: item.points || 0 }; },
    onCollision: function (s, type) { return 'game-over'; },  // 'game-over' atau nilai lain jika mode menangani sendiri
    getObjective: function (s) { return [{ label: 'Panjang', value: s.snake.length }]; }
  };

  M.defineMode = function (def) {
    var m = Object.assign({}, DEFAULTS, def);
    (M.modes = M.modes || {})[m.id] = m;
    return m;
  };

  function emit(name) { if (hooks.onEvent) hooks.onEvent(name); }

  function setState(st) {
    if (!s) return;
    s.state = st;
    if (hooks.onState) hooks.onState(s);
  }

  function clearZone(sess) {
    var cx = Math.floor(sess.cols / 2), cy = Math.floor(sess.rows / 2), set = new Set();
    for (var x = cx - 4; x <= cx + 6; x++)
      for (var y = cy - 2; y <= cy + 2; y++) set.add(x + ',' + y);
    return set;
  }

  function occupied() {
    var set = new Set(s.obstacles);
    s.snake.forEach(function (c) { set.add(c.x + ',' + c.y); });
    s.items.forEach(function (c) { set.add(c.x + ',' + c.y); });
    if (s.food) set.add(s.food.x + ',' + s.food.y);
    if (s.door) set.add(s.door.x + ',' + s.door.y);
    s.mode.avoidCells(s).forEach(function (k) { set.add(k); });
    return set;
  }

  function spawnFood() {
    s.food = null;
    if (s.noFood) return true;
    s.food = M.random.emptyCell(s.cols, s.rows, occupied());
    if (s.food) s.mode.onFoodSpawn(s, s.food);
    return !!s.food;
  }

  function placeSnake() {
    var cx = Math.floor(s.cols / 2), cy = Math.floor(s.rows / 2);
    s.snake = [];
    for (var i = 0; i < M.config.initialLength; i++) s.snake.push({ x: cx - i, y: cy });
    s.dir = { x: 1, y: 0 };
    s.queue = [];
    acc = 0;
  }

  function finish(status, title) {
    if (!s || s.state === 'game-over' || s.state === 'victory') return;
    s.result = status;
    s.endTitle = title || null;
    s.newBest = M.storage.recordResult(s.modeId, s.diffKey, s.score, s.eaten, status === 'victory');
    s.best = Math.max(s.best, s.score);
    s.unlocked = M.achievements ? M.achievements.check(s) : [];
    emit(status === 'victory' ? 'win' : 'over');
    setState(status);
  }

  function itemIndex(p) {
    for (var i = 0; i < s.items.length; i++) if (s.items[i].x === p.x && s.items[i].y === p.y) return i;
    return -1;
  }

  function step() {
    if (s.queue.length) s.dir = s.queue.shift();
    var head = s.snake[0];
    var next = { x: head.x + s.dir.x, y: head.y + s.dir.y };
    next = s.mode.onBeforeMove(s, next);
    var ate = !!s.food && next.x === s.food.x && next.y === s.food.y;
    var ii = itemIndex(next), item = ii >= 0 ? s.items[ii] : null;
    var grow = (ate && s.mode.grow !== false) || (!!item && !!item.grow);

    var hit = M.collision.check(s, next, grow);
    if (hit) {
      var out = s.mode.onCollision(s, hit);
      if (out === 'game-over') finish('game-over');
      return; // selain 'game-over', mode sudah menangani sendiri (misalnya kehilangan nyawa)
    }

    s.snake.unshift(next);
    if (!grow) s.snake.pop();

    if (item) {
      s.items.splice(ii, 1);
      var ri = s.mode.onItem(s, item);
      M.scoring.add(s, ri.points || 0);
      M.renderer.burst(next.x, next.y);
      emit('item');
    }

    if (ate) {
      s.eaten++;
      var r = s.mode.onEat(s);
      M.scoring.add(s, r.points || 0);
      M.renderer.burst(next.x, next.y);
      emit('eat');
      if (r.end) { finish(r.end, r.title); return; }
      if (!spawnFood()) { finish('victory'); return; } // papan penuh
    }

    s.mode.onMove(s, next);
    if (s.state !== 'playing') return;
    if (hooks.onUpdate) hooks.onUpdate(s);
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(ts - last, 100);
    last = ts;
    if (s && s.state === 'playing') {
      acc += dt;
      s.timeMs += dt;
      s.mode.onTick(s, dt);
      var ms = M.scoring.speedMs(s), n = 0, max = M.config.maxStepsPerFrame;
      while (s.state === 'playing' && acc >= ms && n < max) { acc -= ms; step(); n++; }
      if (n === max) acc = 0;
      if (hooks.onUpdate) hooks.onUpdate(s);
    }
    M.renderer.draw(s, dt / 1000);
  }

  function startLoop() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stopLoop() { cancelAnimationFrame(raf); raf = 0; }

  M.engine = {
    init: function (h) { hooks = h; },
    getSession: function () { return s; },

    // Helper untuk mode
    end: function (status, title) { finish(status, title); },
    resetSnake: function () { placeSnake(); setState('ready'); },
    // Tahan permainan tanpa mereset ular (misalnya setelah perisai terpakai)
    hold: function () { acc = 0; s.queue = []; emit('hit'); setState('ready'); },
    // Kurangi satu nyawa. Mengembalikan true jika nyawa habis; jika tidak, ular dan snack direset.
    loseLife: function (title, text) {
      s.lives--;
      if (s.lives <= 0) return true;
      emit('hit');
      s.readyTitle = title;
      s.readyText = (text || '').replace('{n}', s.lives);
      placeSnake(); spawnFood(); setState('ready');
      return false;
    },
    respawnFood: spawnFood,
    occupied: occupied,
    clearZone: clearZone,

    start: function (modeId, diffKey, cols, rows) {
      var mode = M.modes[modeId];
      s = {
        mode: mode, modeId: modeId, diffKey: diffKey, diff: M.config.difficulties[diffKey],
        cols: cols, rows: rows, snake: [], dir: { x: 1, y: 0 }, queue: [],
        food: null, items: [], door: null, zones: [], portals: null, tiles: null, noFood: false, obstacles: new Set(),
        score: 0, eaten: 0, timeMs: 0, state: 'ready', result: null, newBest: false,
        readyTitle: null, readyText: null, endTitle: null, unlocked: [],
        best: M.storage.getBest(modeId, diffKey)
      };
      placeSnake();
      M.renderer.clearEffects();
      mode.onStart(s);
      spawnFood();
      startLoop(); // tidak membuat loop ganda
      setState('ready');
      if (hooks.onUpdate) hooks.onUpdate(s);
    },

    restart: function () { if (s) this.start(s.modeId, s.diffKey, s.cols, s.rows); },
    stop: function () { stopLoop(); s = null; },

    turn: function (name) {
      if (!s || (s.state !== 'ready' && s.state !== 'playing')) return;
      var d = DIRS[name];
      var ref = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
      if (ref.x === d.x && ref.y === d.y) { if (s.state === 'ready') setState('playing'); return; }
      if (M.grid.isOpposite(ref, d)) return;   // tolak putar balik langsung
      if (s.queue.length >= 2) return;         // antrean input maksimal 2
      s.queue.push(d);
      if (s.state === 'ready') setState('playing');
    },

    pause: function () { if (s && s.state === 'playing') setState('paused'); },
    resume: function () { if (s && s.state === 'paused') setState('playing'); },
    togglePause: function () {
      if (!s) return;
      if (s.state === 'playing') setState('paused');
      else if (s.state === 'paused') setState('playing');
    }
  };
})(window.Mufa = window.Mufa || {});
