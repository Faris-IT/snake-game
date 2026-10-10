// ===== Renderer Canvas =====
const Renderer = (() => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let cell = CONFIG.CELL_SIZE;

  function resize(cols, rows) {
    const wrap = canvas.parentElement;
    const maxW = wrap.clientWidth - 16;
    const maxH = wrap.clientHeight - 16;
    cell = Math.floor(Math.min(maxW / cols, maxH / rows));
    cell = Math.max(cell, 8);
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

  function drawSnake(body) {
    for (let i = body.length - 1; i >= 0; i--) {
      const seg = body[i];
      const isHead = i === 0;
      ctx.fillStyle = isHead ? CONFIG.COLORS.head : CONFIG.COLORS.snake;
      if (isHead) { ctx.shadowColor = CONFIG.COLORS.snake; ctx.shadowBlur = 14; }
      else        { ctx.shadowBlur = 0; }
      const pad = isHead ? 1 : 2;
      roundRect(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2, 5);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawSnack(snack) {
    const cx = snack.x * cell + cell / 2;
    const cy = snack.y * cell + cell / 2;
    const r  = cell * 0.32;
    ctx.fillStyle = CONFIG.COLORS.snack;
    ctx.shadowColor = CONFIG.COLORS.snack;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function render(state) {
    clearGrid(state.cols, state.rows);
    drawSnack(state.snack);
    drawSnake(state.body);
  }

  return { resize, render, getCell: () => cell };
})();