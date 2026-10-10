// ===== Game Engine =====
const GameEngine = (() => {
  const state = {
    status: "menu",      // menu | playing | paused | game-over
    cols: CONFIG.GRID_COLS,
    rows: CONFIG.GRID_ROWS,
    body: [],
    dir: "right",
    nextDir: "right",
    snack: { x: 0, y: 0 },
    score: 0,
    eaten: 0,
    stepMs: CONFIG.BASE_STEP_MS,
    accMs: 0,
    lastTs: 0,
    mode: "classic",
    onGameOver: null,
    onScoreChange: null,
  };

  function reset(modeId = "classic") {
    state.mode = modeId;
    state.cols = CONFIG.GRID_COLS;
    state.rows = CONFIG.GRID_ROWS;
    state.score = 0;
    state.eaten = 0;
    state.stepMs = CONFIG.BASE_STEP_MS;
    state.accMs = 0;
    state.dir = "right";
    state.nextDir = "right";
    state.status = "playing";
    Input.clear();
    Input.setEnabled(true);

    const cx = Math.floor(state.cols / 2);
    const cy = Math.floor(state.rows / 2);
    state.body = [];
    for (let i = 0; i < CONFIG.START_LENGTH; i++) {
      state.body.push({ x: cx - i, y: cy });
    }
    spawnSnack();
    if (state.onScoreChange) state.onScoreChange(state.score);
  }

  function spawnSnack() {
    const empty = [];
    const occupied = new Set(state.body.map(s => `${s.x},${s.y}`));
    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
      }
    }
    if (!empty.length) return;
    state.snack = empty[Math.floor(Math.random() * empty.length)];
  }

  function tick() {
    // Terapkan arah berikutnya (cek larangan putar balik)
    const cur = CONFIG.DIRS[state.dir];
    const nxt = CONFIG.DIRS[state.nextDir];
    if (!(cur.x + nxt.x === 0 && cur.y + nxt.y === 0)) {
      state.dir = state.nextDir;
    }
    const delta = CONFIG.DIRS[state.dir];
    const head = state.body[0];
    const newHead = { x: head.x + delta.x, y: head.y + delta.y };

    const willEat = Collision.sameCell(newHead, state.snack);

    // Tabrakan
    if (Collision.isWall(newHead, state.cols, state.rows) ||
        Collision.isSelf(state.body, newHead, willEat)) {
      gameOver();
      return;
    }

    state.body.unshift(newHead);
    if (willEat) {
      state.score += CONFIG.SCORE_NORMAL;
      state.eaten++;
      if (state.eaten % CONFIG.SPEED_UP_EVERY === 0) {
        state.stepMs = Math.max(CONFIG.MIN_STEP_MS, state.stepMs - 8);
      }
      spawnSnack();
      if (state.onScoreChange) state.onScoreChange(state.score);
    } else {
      state.body.pop();
    }
  }

  function gameOver() {
    state.status = "game-over";
    Input.setEnabled(false);
    if (state.onGameOver) state.onGameOver(state.score);
  }

  function pause() {
    if (state.status !== "playing") return;
    state.status = "paused";
    Input.setEnabled(false);
  }
  function resume() {
    if (state.status !== "paused") return;
    state.status = "playing";
    state.lastTs = performance.now();
    Input.setEnabled(true);
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (state.status !== "playing") { state.lastTs = ts; return; }
    const dt = ts - (state.lastTs || ts);
    state.lastTs = ts;
    state.accMs += dt;

    while (state.accMs >= state.stepMs) {
      state.accMs -= state.stepMs;
      // Ambil arah dari antrean input
      const d = Input.consume();
      if (d) state.nextDir = d;
      if (state.status === "playing") tick();
    }
    Renderer.render(state);
  }

  function start() { state.lastTs = performance.now(); requestAnimationFrame(loop); }

  return { state, reset, pause, resume, start };
})();