// ===== Game Engine (mendukung sistem mode) =====
const GameEngine = (() => {
  const state = {
    status: "menu",
    cols: CONFIG.GRID_COLS,
    rows: CONFIG.GRID_ROWS,
    body: [],
    dir: "right",
    nextDir: "right",
    snack: null,
    bonus: null,
    obstacles: [],
    tiles: [],
    portals: [],
    exit: null,
    exitUnlocked: false,
    score: 0,
    eaten: 0,
    stepMs: CONFIG.BASE_STEP_MS,
    minStepMs: CONFIG.MIN_STEP_MS,
    accMs: 0,
    lastTs: 0,
    elapsedMs: 0,
    lives: 1,
    maxLives: 1,
    growOnEat: true,
    mode: null,
    modeId: "classic",
    onGameOver: null,
    onVictory: null,
    onScoreChange: null,
    onHudChange: null,
    onSnackEaten: null,   // callback tambahan untuk achievements & partikel
  };

  const helpers = {
    spawnSnackAt(pos) { state.snack = pos; },
    spawnSnackRandom() { state.snack = GameEngine.pickEmptyCell(); },
    spawnBonusRandom() { state.bonus = GameEngine.pickEmptyCell(); },
    clearBonus() { state.bonus = null; },
    setTiles(list) { state.tiles = list || []; },
    clearTiles() { state.tiles = []; },
    getOccupied() {
      const set = new Set();
      state.body.forEach(s => set.add(`${s.x},${s.y}`));
      state.obstacles.forEach(o => set.add(`${o.x},${o.y}`));
      if (state.snack) set.add(`${state.snack.x},${state.snack.y}`);
      if (state.bonus) set.add(`${state.bonus.x},${state.bonus.y}`);
      if (state.exit)  set.add(`${state.exit.x},${state.exit.y}`);
      return set;
    },
    endGame() { gameOver(); },
    endVictory() { gameVictory(); },
    emitHud() { if (state.onHudChange) state.onHudChange(state); },
  };

  function pickEmptyCell() {
    const occupied = helpers.getOccupied();
    const empty = [];
    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
      }
    }
    if (!empty.length) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function makeCtx() {
    return Object.assign(state, helpers);
  }

  function reset(modeId = "classic") {
    const mode = ModeRegistry.get(modeId);
    if (!mode) { console.warn("Mode tidak ditemukan:", modeId); return; }

    state.mode = mode;
    state.modeId = modeId;

    state.cols = CONFIG.GRID_COLS;
    state.rows = CONFIG.GRID_ROWS;
    state.body = [];
    state.obstacles = [];
    state.tiles = [];
    state.portals = [];
    state.snack = null;
    state.bonus = null;
    state.exit = null;
    state.exitUnlocked = false;
    state.score = 0;
    state.eaten = 0;
    state.stepMs = (mode.config && mode.config.stepMs) || CONFIG.BASE_STEP_MS;
    state.minStepMs = (mode.config && mode.config.minStepMs) || CONFIG.MIN_STEP_MS;
    state.accMs = 0;
    state.elapsedMs = 0;
    state.lives = (mode.config && mode.config.lives) || 1;
    state.maxLives = state.lives;
    state.growOnEat = (mode.config && mode.config.growOnEat) !== false;
    state.dir = (mode.config && mode.config.startDir) || "right";
    state.nextDir = state.dir;
    state.status = "playing";

    Input.clear();
    Input.setEnabled(true);
    Particles.clear();

    const cx = Math.floor(state.cols / 2);
    const cy = Math.floor(state.rows / 2);
    const startLen = (mode.config && mode.config.startLength) || CONFIG.START_LENGTH;
    for (let i = 0; i < startLen; i++) {
      state.body.push({ x: cx - i, y: cy });
    }

    if (mode.onStart) mode.onStart(makeCtx());

    if (mode.spawnSnack) mode.spawnSnack(makeCtx());
    else if (!state.snack) helpers.spawnSnackRandom();

    if (state.onScoreChange) state.onScoreChange(state.score);
    helpers.emitHud();
  }

  function tick(dt) {
    const mode = state.mode;
    if (!mode) return;
    const ctx = makeCtx();

    state.elapsedMs += dt;

    if (mode.onTick) mode.onTick(ctx, dt);

    if (mode.isLose && mode.isLose(ctx)) { gameOver(); return; }
    if (mode.isWin  && mode.isWin(ctx))  { gameVictory(); return; }

    const cur = CONFIG.DIRS[state.dir];
    const nxt = CONFIG.DIRS[state.nextDir];
    if (!(cur.x + nxt.x === 0 && cur.y + nxt.y === 0)) {
      state.dir = state.nextDir;
    }
    const delta = CONFIG.DIRS[state.dir];
    const head = state.body[0];
    const newHead = { x: head.x + delta.x, y: head.y + delta.y };

    const willEatSnack = Collision.sameCell(newHead, state.snack);
    const willEatBonus = Collision.sameCell(newHead, state.bonus);
    const willEat = willEatSnack || willEatBonus;
    const willGrow = willEat && state.growOnEat;

    if (Collision.isWall(newHead, state.cols, state.rows)) {
      if (mode.onCollision && mode.onCollision(ctx, "wall")) return;
      gameOver(); return;
    }
    if (Collision.cellIn(newHead, state.obstacles)) {
      if (mode.onCollision && mode.onCollision(ctx, "obstacle")) return;
      gameOver(); return;
    }
    if (Collision.isSelf(state.body, newHead, willGrow)) {
      if (mode.onCollision && mode.onCollision(ctx, "self")) return;
      gameOver(); return;
    }

    state.body.unshift(newHead);

    if (mode.onAfterMove) mode.onAfterMove(ctx, newHead);

    const headNow = state.body[0];
    const ateSnack = Collision.sameCell(headNow, state.snack);
    const ateBonus = Collision.sameCell(headNow, state.bonus);

    if (ateSnack) {
      state.eaten++;
      if (mode.onEat) mode.onEat(ctx, "snack");
      else state.score += CONFIG.SCORE_NORMAL;
      // Partikel + callback
      Particles.emit(
        headNow.x * Renderer.getCell() + Renderer.getCell() / 2,
        headNow.y * Renderer.getCell() + Renderer.getCell() / 2,
        CONFIG.COLORS.snack, 10
      );
      if (state.onSnackEaten) state.onSnackEaten(state);
      state.snack = null;
      if (mode.spawnSnack) mode.spawnSnack(ctx);
      else if (!state.snack) helpers.spawnSnackRandom();
      if (state.onScoreChange) state.onScoreChange(state.score);
    } else if (ateBonus) {
      if (mode.onEat) mode.onEat(ctx, "bonus");
      else state.score += CONFIG.SCORE_BONUS;
      Particles.emit(
        headNow.x * Renderer.getCell() + Renderer.getCell() / 2,
        headNow.y * Renderer.getCell() + Renderer.getCell() / 2,
        CONFIG.COLORS.bonus, 16
      );
      state.bonus = null;
      if (state.onScoreChange) state.onScoreChange(state.score);
    }

    if (!willGrow) state.body.pop();

    helpers.emitHud();
  }

  function gameOver() {
    state.status = "game-over";
    Input.setEnabled(false);
    if (state.onGameOver) state.onGameOver(state.score, state);
  }
  function gameVictory() {
    state.status = "victory";
    Input.setEnabled(false);
    if (state.onVictory) state.onVictory(state.score, state);
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
    if (state.status !== "playing") {
      state.lastTs = ts;
      Renderer.render(state);
      return;
    }
    const dt = ts - (state.lastTs || ts);
    state.lastTs = ts;
    state.accMs += dt;
    Particles.update(dt);

    while (state.accMs >= state.stepMs) {
      state.accMs -= state.stepMs;
      const d = Input.consume();
      if (d) state.nextDir = d;
      if (state.status === "playing") tick(state.stepMs);
      else break;
    }
    Renderer.render(state);
  }

  function start() {
    state.lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  return {
    state, reset, pause, resume, start,
    pickEmptyCell, makeCtx, helpers,
  };
})();