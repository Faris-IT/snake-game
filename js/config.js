// ===== Konfigurasi global Mufa Snack =====
const CONFIG = {
  GRID_COLS: 28,
  GRID_ROWS: 22,
  CELL_SIZE: 24,
  BASE_STEP_MS: 140,
  MIN_STEP_MS: 55,
  SCORE_NORMAL: 10,
  SCORE_BONUS: 30,
  START_LENGTH: 3,
  DIRS: {
    up:    { x: 0,  y: -1 },
    down:  { x: 0,  y: 1  },
    left:  { x: -1, y: 0  },
    right: { x: 1,  y: 0  },
  },
  COLORS: {
    bg:       "#0f1b33",
    grid:     "#14213d",
    snake:    "#3ef58b",
    head:     "#7bffb0",
    snack:    "#ffd23f",
    bonus:    "#ff8c42",
    danger:   "#ff4d5e",
    cyan:     "#2ee6ff",
    obstacle: "#3a4b6e",
    exit:     "#2ee6ff",
  },
};