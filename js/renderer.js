// ===== Renderer Canvas =====
const Renderer = (() => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let cell = CONFIG.CELL_SIZE;

  function resize(cols, rows) {
    const wrap = canvas.parentElement;
    const maxW = wrap.clientWidth - 16;
    const maxH = wrap.clientHeight - 16;
    cell = Math.max(8, Math.floor(Math.min(maxW / cols, maxH / rows)));
    canvas.width  = cols * cell;
    canvas.height = rows * cell;
  }

  function clearGrid(cols, rows) {
    ctx.fillStyle = CONFIG.COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = CONFIG.COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath(); ctx.moveTo(x * cell + 0.5, 0); ctx.lineTo(x * cell + 0.5, rows * cell); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cell + 0.5); ctx.lineTo(cols * cell, y * cell + 0.5); ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  function drawTiles(tiles) {
    if (!tiles || !tiles.length) return;
    for (const t of tiles) {
      const px = t.x * cell;
      const py = t.y * cell;
      let fill = null;
      if (t.kind === "danger")       fill = "rgba(255, 77, 94, 0.35)";
      else if (t.kind === "warning") fill = "rgba(255, 200, 60, 0.35)";
      else if (t.kind === "red")     fill = "rgba(255, 77, 94, 0.30)";
      else if (t.kind === "blue")    fill = "rgba(46, 230, 255, 0.30)";
      else if (t.kind === "green")   fill = "rgba(62, 245, 139, 0.30)";
      else if (t.kind === "purple")  fill = "rgba(180, 120, 255, 0.30)";
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
    }
  }

  function drawObstacles(list) {
    if (!list || !list.length) return;
    ctx.fillStyle = CONFIG.COLORS.obstacle;
    for (const o of list) {
      roundRect(o.x * cell + 1, o.y * cell + 1, cell - 2, cell - 2, 3);
      ctx.fill();
    }
  }

  function drawPortals(portals) {
    if (!portals || !portals.length) return;
    const pairColors = ["#b478ff", "#ff8c42", "#2ee6ff", "#ff5fa2"];
    portals.forEach((p, i) => {
      const c = pairColors[i % pairColors.length];
      [p.a, p.b].forEach((pos) => {
        if (!pos) return;
        const cx = pos.x * cell + cell / 2;
        const cy = pos.y * cell + cell / 2;
        const r  = cell * 0.42;
        ctx.strokeStyle = c;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c + "40";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = c + "90";
        ctx.fill();
      });
    });
  }

  function drawExit(pos, unlocked) {
    if (!pos) return;
    ctx.strokeStyle = unlocked ? CONFIG.COLORS.exit : "#44506e";
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x * cell + 3, pos.y * cell + 3, cell - 6, cell - 6);
    if (unlocked) {
      ctx.fillStyle = "rgba(46,230,255,0.25)";
      ctx.fillRect(pos.x * cell + 3, pos.y * cell + 3, cell - 6, cell - 6);
    }
  }

  function drawSnake(body) {
    for (let i = body.length - 1; i >= 0; i--) {
      const seg = body[i];
      const isHead = i === 0;
      ctx.fillStyle = isHead ? CONFIG.COLORS.head : CONFIG.COLORS.snake;
      ctx.shadowBlur = isHead ? 14 : 0;
      ctx.shadowColor = CONFIG.COLORS.snake;
      const pad = isHead ? 1 : 2;
      roundRect(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2, 5);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawSnack(snack) {
    if (!snack) return;
    const cx = snack.x * cell + cell / 2;
    const cy = snack.y * cell + cell / 2;
    const r  = cell * 0.32;
    ctx.fillStyle = CONFIG.COLORS.snack;
    ctx.shadowColor = CONFIG.COLORS.snack;
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawBonus(bonus) {
    if (!bonus) return;
    const cx = bonus.x * cell + cell / 2;
    const cy = bonus.y * cell + cell / 2;
    const r  = cell * 0.36;
    ctx.fillStyle = CONFIG.COLORS.bonus;
    ctx.shadowColor = CONFIG.COLORS.bonus;
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `${Math.floor(cell * 0.55)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, cy + 1);
  }

  function drawBlindOverlay(state) {
    if (!state._blindOverlay) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const head = state.body[0];
    if (head) {
      const cx = head.x * cell + cell / 2;
      const cy = head.y * cell + cell / 2;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const grd = ctx.createRadialGradient(cx, cy, cell * 0.5, cx, cy, cell * 2.5);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function render(state) {
    clearGrid(state.cols, state.rows);
    drawTiles(state.tiles);
    drawObstacles(state.obstacles);
    drawPortals(state.portals);
    drawExit(state.exit, state.exitUnlocked);
    drawSnack(state.snack);
    drawBonus(state.bonus);
    drawSnake(state.body);
    // Partikel di atas ular
    if (typeof Particles !== "undefined") Particles.draw(ctx, cell);
    drawBlindOverlay(state);
  }

  return { resize, render, getCell: () => cell };
})();