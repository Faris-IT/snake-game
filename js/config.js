// ===== Konfigurasi global Mufa Snack =====
const CONFIG = {
  GRID_COLS: 28,
  GRID_ROWS: 22,
  CELL_SIZE: 24,           // akan di-scale otomatis
  BASE_STEP_MS: 140,       // interval simulasi awal (ms per sel)
  MIN_STEP_MS: 60,
  SPEED_UP_EVERY: 5,       // snack untuk naik kecepatan (Classic)
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
    bg:     "#0f1b33",
    grid:   "#14213d",
    snake:  "#3ef58b",
    head:   "#7bffb0",
    snack:  "#ffd23f",
    danger: "#ff4d5e",
    cyan:   "#2ee6ff",
  },
};

// Daftar mode — untuk sekarang hanya Classic yang aktif
const MODES = [
  { id: "classic", name: "Classic Snack",  desc: "Skor setinggi mungkin.", ready: true },
  { id: "time-rush", name: "Time Rush",    desc: "60 detik, kejar skor.",  ready: false },
  { id: "maze-runner", name: "Maze Runner",desc: "Labirin & target.",      ready: false },
  { id: "snack-hunter", name: "Snack Hunter", desc: "Kumpulkan 20 snack.", ready: false },
  { id: "danger-zone", name: "Danger Zone", desc: "Hindari zona bahaya.",  ready: false },
  { id: "portal-snack", name: "Portal Snack", desc: "Teleportasi portal.", ready: false },
  { id: "color-rules", name: "Color Rules", desc: "Aturan warna berganti.", ready: false },
  { id: "mystery-snack", name: "Mystery Snack", desc: "Efek acak.",        ready: false },
  { id: "no-growth", name: "No Growth",    desc: "Tanpa tumbuh panjang.",  ready: false },
  { id: "combo-chain", name: "Combo Chain", desc: "Rantai combo.",         ready: false },
  { id: "path-master", name: "Path Master", desc: "Checkpoint berurutan.", ready: false },
  { id: "endless-survival", name: "Endless Survival", desc: "Bertahan hidup.", ready: false },
];