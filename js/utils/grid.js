(function (M) {
  M.grid = {
    DIRS: {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
    },
    key: function (x, y) { return x + ',' + y; },
    isOpposite: function (a, b) { return a.x + b.x === 0 && a.y + b.y === 0; },
    same: function (a, b) { return a.x === b.x && a.y === b.y; }
  };
})(window.Mufa = window.Mufa || {});

(function (M) {
  var D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // BFS dari (sx, sy). blocked = Set "x,y". Mengembalikan { dist, count } (dist -1 = tak terjangkau).
  M.grid.bfs = function (cols, rows, blocked, sx, sy) {
    var dist = new Int16Array(cols * rows).fill(-1), q = [sx + sy * cols];
    dist[q[0]] = 0;
    for (var h = 0; h < q.length; h++) {
      var c = q[h], x = c % cols, y = (c / cols) | 0;
      for (var k = 0; k < 4; k++) {
        var nx = x + D4[k][0], ny = y + D4[k][1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        var ni = nx + ny * cols;
        if (dist[ni] >= 0 || blocked.has(nx + ',' + ny)) continue;
        dist[ni] = dist[c] + 1; q.push(ni);
      }
    }
    return { dist: dist, count: q.length };
  };

  // Dinding pendek acak. Dinding yang memutus arena dibatalkan, jadi semua sel kosong tetap terhubung.
  M.grid.walls = function (cols, rows, keep, want, maxLen) {
    var cx = Math.floor(cols / 2), cy = Math.floor(rows / 2), obs = new Set(), added = 0, tries = 0;
    while (added < want && tries < want * 30) {
      tries++;
      var horiz = Math.random() < .5, len = M.random.int(2, maxLen);
      var x = M.random.int(0, cols - 1), y = M.random.int(0, rows - 1), cells = [];
      for (var i = 0; i < len; i++) {
        var px = horiz ? x + i : x, py = horiz ? y : y + i;
        if (px >= cols || py >= rows) break;
        cells.push(px + ',' + py);
      }
      if (cells.length < 2) continue;
      if (!cells.every(function (k) { return !keep.has(k) && !obs.has(k); })) continue;
      cells.forEach(function (k) { obs.add(k); });
      if (M.grid.bfs(cols, rows, obs, cx, cy).count === cols * rows - obs.size) added++;
      else cells.forEach(function (k) { obs.delete(k); });
    }
    return obs;
  };
})(window.Mufa = window.Mufa || {});

(function (M) {
  // Sel jauh dari titik awal (jarak BFS >= 70% jarak terjauh), di luar area keep. Untuk pintu keluar.
  M.grid.farCell = function (cols, rows, obs, keep) {
    var cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    var d = M.grid.bfs(cols, rows, obs, cx, cy).dist, max = 0, far = [], best = null, i;
    for (i = 0; i < d.length; i++) if (d[i] > max) max = d[i];
    for (i = 0; i < d.length; i++) {
      var x = i % cols, y = (i / cols) | 0;
      if (d[i] < 0 || keep.has(x + ',' + y)) continue;
      if (d[i] >= max * .7) far.push({ x: x, y: y });
      if (!best || d[i] > d[best.x + best.y * cols]) best = { x: x, y: y };
    }
    return far.length ? far[M.random.int(0, far.length - 1)] : best;
  };
})(window.Mufa = window.Mufa || {});

(function (M) {
  // Sel yang jauh dari titik awal (tengah arena), tidak di area keep. Dipakai untuk pintu keluar.
  M.grid.farCell = function (cols, rows, obs, keep) {
    var cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    var d = M.grid.bfs(cols, rows, obs, cx, cy).dist, max = 0, far = [], best = null, i;
    for (i = 0; i < d.length; i++) if (d[i] > max) max = d[i];
    for (i = 0; i < d.length; i++) {
      var x = i % cols, y = (i / cols) | 0;
      if (d[i] < 0 || keep.has(x + ',' + y)) continue;
      if (d[i] >= max * .7) far.push({ x: x, y: y });
      if (!best || d[i] > d[best.x + best.y * cols]) best = { x: x, y: y };
    }
    return far.length ? far[M.random.int(0, far.length - 1)] : best;
  };
})(window.Mufa = window.Mufa || {});
