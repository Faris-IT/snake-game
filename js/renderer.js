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
      ctx.beginPath();
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, rows * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(cols * cell, y * cell + 0.5);
      ctx.stroke();
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

  function drawObstacles(list) {
    if (!list || !list.length) return;
    ctx.fillStyle = CONFIG.COLORS.obstacle;
    for (const o of list) {
      roundRect(o.x * cell + 1, o.y * cell + 1, cell - 2, cell - 2, 3);
      ctx.fill();
    }
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
    ctx.fillStyle = snack.kind === "bonus" ? CONFIG.COLORS.bonus : CONFIG.COLORS.snack;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function render(state) {
    clearGrid(state.cols, state.rows);
    drawObstacles(state.obstacles);
    drawExit(state.exit, state.exitUnlocked);
    drawSnack(state.snack);
    drawBonus(state.bonus);
    drawSnake(state.body);
  }

  return { resize, render, getCell: () => cell };
})();