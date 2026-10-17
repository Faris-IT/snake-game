(function (M) {
  var R = M.random, NEED = 5, MAX_LEVEL = 10, CLEAR_BONUS = 50;
  var D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // BFS dari sel awal; mengembalikan jarak tiap sel (-1 = tidak terjangkau) dan jumlah sel terjangkau.
  function bfs(cols, rows, obs, sx, sy) {
    var dist = new Int16Array(cols * rows).fill(-1), q = [sx + sy * cols];
    dist[q[0]] = 0;
    for (var h = 0; h < q.length; h++) {
      var c = q[h], x = c % cols, y = (c / cols) | 0;
      for (var k = 0; k < 4; k++) {
        var nx = x + D4[k][0], ny = y + D4[k][1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        var ni = nx + ny * cols;
        if (dist[ni] >= 0 || obs.has(nx + ',' + ny)) continue;
        dist[ni] = dist[c] + 1; q.push(ni);
      }
    }
    return { dist: dist, count: q.length };
  }

  // Rintangan berupa dinding pendek. Setiap dinding dibatalkan jika membuat sebagian arena terputus,
  // sehingga semua sel kosong (snack dan pintu) selalu bisa dijangkau.
  function generate(s, level) {
    var cols = s.cols, rows = s.rows, cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    var keep = M.engine.clearZone(s), obs = new Set();
    var want = Math.round((3 + level * 2) * (cols * rows / 400) * s.diff.obstacles);
    want = Math.max(2, Math.min(40, want));
    var added = 0, tries = 0;
    while (added < want && tries < want * 30) {
      tries++;
      var horiz = Math.random() < .5, len = R.int(2, 3 + Math.min(level, 6));
      var x = R.int(0, cols - 1), y = R.int(0, rows - 1), cells = [], i;
      for (i = 0; i < len; i++) {
        var px = horiz ? x + i : x, py = horiz ? y : y + i;
        if (px >= cols || py >= rows) break;
        cells.push(px + ',' + py);
      }
      if (cells.length < 2) continue;
      if (!cells.every(function (k) { return !keep.has(k) && !obs.has(k); })) continue;
      cells.forEach(function (k) { obs.add(k); });
      if (bfs(cols, rows, obs, cx, cy).count === cols * rows - obs.size) added++;
      else cells.forEach(function (k) { obs.delete(k); });
    }
    // Pintu keluar: sel jauh dari titik awal
    var d = bfs(cols, rows, obs, cx, cy).dist, max = 0, far = [], best = null;
    for (i = 0; i < d.length; i++) if (d[i] > max) max = d[i];
    for (i = 0; i < d.length; i++) {
      var fx = i % cols, fy = (i / cols) | 0;
      if (d[i] < 0 || keep.has(fx + ',' + fy)) continue;
      if (d[i] >= max * .7) far.push({ x: fx, y: fy });
      if (!best || d[i] > d[best.x + best.y * cols]) best = { x: fx, y: fy };
    }
    return { obstacles: obs, door: far.length ? far[R.int(0, far.length - 1)] : best };
  }

  function setupLevel(s) {
    var g = generate(s, s.level);
    s.obstacles = g.obstacles;
    s.door = { x: g.door.x, y: g.door.y, open: false };
    s.collected = 0;
    s.noFood = false;
    s.readyTitle = 'Level ' + s.level;
    s.readyText = 'Kumpulkan ' + NEED + ' snack, lalu masuk ke pintu keluar.';
  }

  M.defineMode({
    id: 'maze',
    setupLevel: setupLevel,
    onStart: function (s) { s.level = 1; setupLevel(s); },
    onEat: function (s) {
      s.collected++;
      if (s.collected >= NEED) { s.door.open = true; s.noFood = true; }
      return { points: M.config.points.snack };
    },
    onMove: function (s, head) {
      if (!s.door.open || head.x !== s.door.x || head.y !== s.door.y) return;
      M.scoring.add(s, CLEAR_BONUS);
      if (s.level >= MAX_LEVEL) { M.engine.end('victory', 'Semua Level Selesai!'); return; }
      s.level++;
      setupLevel(s);
      M.engine.resetSnake();
      M.engine.respawnFood();
    },
    getObjective: function (s) {
      return [
        { label: 'Level', value: s.level + '/' + MAX_LEVEL },
        { label: s.door.open ? 'Pintu' : 'Snack', value: s.door.open ? 'Terbuka!' : s.collected + '/' + NEED }
      ];
    }
  });
})(window.Mufa = window.Mufa || {});
