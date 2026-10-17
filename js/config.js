(function (M) {
  M.config = {
    cellTarget: { desktop: 24, mobile: 18 },
    gridMin: 12,
    gridMax: 32,
    initialLength: 3,
    maxStepsPerFrame: 5,
    points: { snack: 10, bonus: 30 },
    difficulties: {
      easy:   { label: 'Mudah',  startMs: 170, stepMs: 5,  minMs: 75, obstacles: 0.7 },
      normal: { label: 'Normal', startMs: 130, stepMs: 8,  minMs: 55, obstacles: 1 },
      hard:   { label: 'Sulit',  startMs: 95,  stepMs: 10, minMs: 40, obstacles: 1.3 }
    },
    themes: [
      { id: 'default', label: 'Default',
        vars: { '--bg': '#070b1a', '--panel': '#0f1830', '--panel-2': '#16224a', '--line': '#22335f', '--text': '#e8eefc', '--muted': '#8fa0c8', '--snake': '#3ddc84', '--snack': '#ffd23f', '--cyan': '#22d3ee' },
        canvas: { bg: '#0a1128', grid: 'rgba(120,160,255,.06)', hue: 145, head: '#7dffb2', food: '#ffd23f', obstacle: '#34456f' } },
      { id: 'ocean', label: 'Ocean', unlock: 'snack_100',
        vars: { '--bg': '#04141f', '--panel': '#082638', '--panel-2': '#0c3a54', '--line': '#14577a', '--text': '#e6f6ff', '--muted': '#86b4cc', '--snake': '#2ee6c5', '--snack': '#ffd86b', '--cyan': '#5cc8ff' },
        canvas: { bg: '#031722', grid: 'rgba(90,200,255,.07)', hue: 170, head: '#a6fff0', food: '#ffd86b', obstacle: '#1f5f7d' } },
      { id: 'sunset', label: 'Sunset', unlock: 'first_win',
        vars: { '--bg': '#17080f', '--panel': '#27101d', '--panel-2': '#3a1829', '--line': '#5c2a42', '--text': '#ffeef2', '--muted': '#c496a6', '--snake': '#ff6fa5', '--snack': '#ffd23f', '--cyan': '#ff9d5c' },
        canvas: { bg: '#1c0a14', grid: 'rgba(255,150,170,.06)', hue: 335, head: '#ffc2dc', food: '#ffd23f', obstacle: '#6d3a52' } },
      { id: 'neon', label: 'Neon', unlock: 'explorer',
        vars: { '--bg': '#04000d', '--panel': '#10052a', '--panel-2': '#1b0a40', '--line': '#4a1f9a', '--text': '#f0e8ff', '--muted': '#a58fd6', '--snake': '#39ff14', '--snack': '#ff2fd6', '--cyan': '#00f0ff' },
        canvas: { bg: '#07011a', grid: 'rgba(0,240,255,.09)', hue: 110, head: '#d4ffc6', food: '#ff2fd6', obstacle: '#3b1a78' } }
    ],
    // 12 mode. Mode yang file-nya belum terdaftar di M.modes otomatis tampil "Segera".
    modes: [
      { id: 'classic',  name: 'Classic Snack',    desc: 'Skor setinggi mungkin, tanpa batas waktu.' },
      { id: 'timeRush', name: 'Time Rush',        desc: 'Kejar skor sebelum 60 detik habis.' },
      { id: 'maze',     name: 'Maze Runner',      desc: 'Kumpulkan 5 snack, lalu cari pintu keluar.' },
      { id: 'hunter',   name: 'Snack Hunter',     desc: 'Kumpulkan 20 snack dengan 3 nyawa.' },
      { id: 'danger',   name: 'Danger Zone',      desc: 'Hindari zona bahaya yang terus muncul.' },
      { id: 'portal',   name: 'Portal Snack',     desc: 'Pakai portal untuk memperpendek rute.' },
      { id: 'color',    name: 'Color Rules',      desc: 'Ikuti aturan warna yang berganti.' },
      { id: 'mystery',  name: 'Mystery Snack',    desc: 'Snack dengan efek acak selama 90 detik.' },
      { id: 'noGrowth', name: 'No Growth',        desc: 'Ular tidak bertambah panjang.' },
      { id: 'combo',    name: 'Combo Chain',      desc: 'Jaga rantai snack hingga pengali ×5.' },
      { id: 'path',     name: 'Path Master',      desc: 'Kunjungi 5 checkpoint sesuai urutan.' },
      { id: 'endless',  name: 'Endless Survival', desc: 'Bertahan di arena yang makin sulit.' }
    ]
  };
})(window.Mufa = window.Mufa || {});
