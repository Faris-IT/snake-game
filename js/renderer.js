(function (M) {
  var canvas, ctx, cell = 0, dpr = 1, cols = 0, rows = 0;
  var parts = [];
  var pal = { bg: '#0a1128', grid: 'rgba(120,160,255,.06)', hue: 145, head: '#7dffb2', food: '#ffd23f', obstacle: '#34456f' };

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  M.renderer = {
    init: function (c) { canvas = c; ctx = c.getContext('2d'); },
    setTheme: function (p) { pal = Object.assign({}, pal, p); },

    // Ukuran piksel menyesuaikan wadah; jumlah sel (aturan game) tidak berubah.
    resize: function (wrap, c, r) {
      cols = c; rows = r; dpr = window.devicePixelRatio || 1;
      cell = Math.max(8, Math.floor(Math.min(wrap.clientWidth / cols, wrap.clientHeight / rows)));
      canvas.style.width = cols * cell + 'px';
      canvas.style.height = rows * cell + 'px';
      canvas.width = Math.round(cols * cell * dpr);
      canvas.height = Math.round(rows * cell * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    burst: function (gx, gy) {
      for (var i = 0; i < 10; i++) {
        var a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 3;
        parts.push({ x: gx + .5, y: gy + .5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
      }
      if (parts.length > 80) parts.splice(0, parts.length - 80);
    },

    clearEffects: function () { parts.length = 0; },

    draw: function (s, dt) {
      if (!cell) return;
      var W = cols * cell, H = rows * cell, i;
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 1; i < cols; i++) { ctx.moveTo(i * cell + .5, 0); ctx.lineTo(i * cell + .5, H); }
      for (i = 1; i < rows; i++) { ctx.moveTo(0, i * cell + .5); ctx.lineTo(W, i * cell + .5); }
      ctx.stroke();

      if (!s) return;

      if (s.tiles) {
        s.tiles.forEach(function (t) {
          var tx = t.x * cell, ty = t.y * cell, forb = t.c === s.forbidden, warn = t.c === s.nextForbidden;
          ctx.globalAlpha = forb ? .6 : (warn ? .3 + .2 * Math.sin(performance.now() / 130) : .26);
          ctx.fillStyle = s.tileColors[t.c];
          ctx.fillRect(tx + 1, ty + 1, cell - 2, cell - 2);
          ctx.globalAlpha = 1;
          if (forb) {
            ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath();
            ctx.moveTo(tx + cell * .28, ty + cell * .28); ctx.lineTo(tx + cell * .72, ty + cell * .72);
            ctx.moveTo(tx + cell * .72, ty + cell * .28); ctx.lineTo(tx + cell * .28, ty + cell * .72);
            ctx.stroke();
          } else if (warn) {
            ctx.strokeStyle = 'rgba(255,77,94,.85)'; ctx.lineWidth = 1.5;
            ctx.setLineDash([cell * .2, cell * .15]);
            ctx.strokeRect(tx + 1.5, ty + 1.5, cell - 3, cell - 3);
            ctx.setLineDash([]);
          }
        });
      }

      ctx.fillStyle = pal.obstacle;
      s.obstacles.forEach(function (k) {
        var p = k.split(',');
        rr(p[0] * cell + 1, p[1] * cell + 1, cell - 2, cell - 2, cell * .2);
        ctx.fill();
      });

      (s.zones || []).forEach(function (z) {
        var zx = z.x * cell, zy = z.y * cell;
        if (z.phase === 'active') {
          ctx.fillStyle = 'rgba(255,77,94,.55)';
          ctx.fillRect(zx + 1, zy + 1, cell - 2, cell - 2);
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
          ctx.moveTo(zx + cell * .28, zy + cell * .28); ctx.lineTo(zx + cell * .72, zy + cell * .72);
          ctx.moveTo(zx + cell * .72, zy + cell * .28); ctx.lineTo(zx + cell * .28, zy + cell * .72);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(255,77,94,' + (.1 + .14 * (1 + Math.sin(performance.now() / 120)) / 2) + ')';
          ctx.fillRect(zx + 1, zy + 1, cell - 2, cell - 2);
          ctx.strokeStyle = 'rgba(255,77,94,.85)'; ctx.lineWidth = 1.5;
          ctx.setLineDash([cell * .2, cell * .15]);
          ctx.strokeRect(zx + 1.5, zy + 1.5, cell - 3, cell - 3);
          ctx.setLineDash([]);
        }
      });

      (s.portals || []).forEach(function (p, idx) {
        var o = s.portals[1 - idx];
        var blocked = s.snake.some(function (c) { return c.x === o.x && c.y === o.y; });
        var px = (p.x + .5) * cell, py = (p.y + .5) * cell, tt = performance.now() / 200 + idx;
        ctx.save();
        ctx.globalAlpha = blocked ? .35 : 1;
        ctx.shadowColor = p.color; ctx.shadowBlur = cell * .7;
        ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(2, cell * .12);
        ctx.beginPath(); ctx.arc(px, py, cell * .36, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, cell * .16 + Math.sin(tt) * cell * .04, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      if (s.door) {
        var dd = s.door, dc = dd.open ? '#22d3ee' : '#ff4d5e';
        ctx.save();
        if (dd.open) { ctx.shadowColor = dc; ctx.shadowBlur = cell * .9; }
        ctx.fillStyle = dd.open ? 'rgba(34,211,238,.85)' : 'rgba(255,77,94,.22)';
        rr(dd.x * cell + 2, dd.y * cell + 2, cell - 4, cell - 4, cell * .2);
        ctx.fill();
        ctx.strokeStyle = dc; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }

      (s.items || []).forEach(function (it) {
        if (it.ttl !== undefined && it.ttl < 2000 && Math.floor(it.ttl / 150) % 2) return; // berkedip sebelum hilang
        var ix = (it.x + .5) * cell, iy = (it.y + .5) * cell, r = cell * .38;
        ctx.save();
        ctx.shadowColor = it.color; ctx.shadowBlur = cell * .8;
        ctx.fillStyle = it.color;
        ctx.beginPath();
        ctx.moveTo(ix, iy - r); ctx.lineTo(ix + r, iy); ctx.lineTo(ix, iy + r); ctx.lineTo(ix - r, iy);
        ctx.closePath(); ctx.fill();
        if (it.label) {
          ctx.shadowBlur = 0; ctx.fillStyle = '#1a1030';
          ctx.font = 'bold ' + Math.floor(cell * .5) + 'px system-ui, sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(it.label, ix, iy + 1);
        }
        ctx.restore();
      });

      if (s.food) {
        var pulse = 1 + Math.sin(performance.now() / 180) * .08;
        var fc = s.food.color || pal.food;
        ctx.save();
        ctx.shadowColor = fc;
        ctx.shadowBlur = cell * .8;
        ctx.fillStyle = fc;
        ctx.beginPath();
        ctx.arc((s.food.x + .5) * cell, (s.food.y + .5) * cell, cell * .32 * pulse, 0, Math.PI * 2);
        ctx.fill();
        if (s.food.color) { ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.restore();
      }

      for (i = s.snake.length - 1; i >= 0; i--) {
        var seg = s.snake[i], pad = cell * (i === 0 ? .04 : .09);
        ctx.fillStyle = i === 0 ? pal.head : 'hsl(' + pal.hue + ',68%,' + Math.max(30, 50 - i * .7) + '%)';
        rr(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * .28);
        ctx.fill();
      }

      var h = s.snake[0], d = s.dir, cx = (h.x + .5) * cell, cy = (h.y + .5) * cell;
      var fx = d.x * cell * .12, fy = d.y * cell * .12, px = -d.y * cell * .18, py = d.x * cell * .18;
      ctx.fillStyle = '#06210f';
      [-1, 1].forEach(function (sg) {
        ctx.beginPath();
        ctx.arc(cx + fx + px * sg, cy + fy + py * sg, cell * .07, 0, Math.PI * 2);
        ctx.fill();
      });

      for (i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 2.2;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = pal.food;
        ctx.beginPath();
        ctx.arc(p.x * cell, p.y * cell, cell * .1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  };
})(window.Mufa = window.Mufa || {});
