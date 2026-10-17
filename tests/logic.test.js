// Uji logika tanpa browser (hanya untuk pengembangan): node tests/logic.test.js
// Memuat skrip game sesuai urutan di index.html, kecuali ui.js dan main.js yang butuh DOM.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let cb = null; const store = new Map();
const ctx = {
  console, performance: { now: () => 0 }, requestAnimationFrame: f => { cb = f; return 1 }, cancelAnimationFrame() {},
  localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  Set, Map, Math, Int16Array, JSON, Object, Array, Date
};
ctx.window = ctx; vm.createContext(ctx);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
for (const f of scripts) if (!/js\/(ui|main)\.js$/.test(f)) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });

let fail = 0, total = 0;
const ok = (name, cond) => { total++; if (!cond) { fail++; console.log('GAGAL:', name); } };
const M = ctx.Mufa, events = [];
M.renderer = { burst() {}, clearEffects() {}, draw() {}, resize() {}, setTheme() {} };
M.engine.init({ onState() {}, onUpdate() {}, onEvent: n => events.push(n) });
let ts = 0; const fr = (n = 1) => { for (let i = 0; i < n; i++) { ts += 200; cb(ts); } };
const S = () => M.engine.getSession();
const reach = (c, r, blocked) => M.grid.bfs(c, r, blocked, Math.floor(c / 2), Math.floor(r / 2)).count === c * r - blocked.size;

// Semua file js terdaftar di index.html
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.relative(root, path.join(d, e.name)).replace(/\\/g, '/')); })(path.join(root, 'js'));
ok('semua js terdaftar di index.html', files.every(f => scripts.includes(f)));
ok('12 mode terdaftar', M.config.modes.every(m => M.modes[m.id]));

// Arena valid untuk semua ukuran dan kesulitan
for (const [c, r] of [[12, 12], [20, 20], [32, 32], [12, 32], [32, 12]]) for (const d of ['easy', 'normal', 'hard']) {
  M.engine.start('maze', d, c, r); let s = S();
  for (let l = 1; l <= 10; l++) { s.level = l; M.modes.maze.setupLevel(s); ok(`maze ${c}x${r} ${d} L${l}`, reach(c, r, s.obstacles) && !s.obstacles.has(s.door.x + ',' + s.door.y)); }
  M.engine.start('path', d, c, r); s = S();
  for (let l = 1; l <= 10; l++) { s.level = l; M.modes.path.setupLevel(s); ok(`path ${c}x${r} ${d} L${l}`, reach(c, r, s.obstacles)); }
  M.engine.start('portal', d, c, r); s = S(); ok(`portal ${c}x${r} ${d}`, reach(c, r, s.obstacles) && s.portals.every(p => !s.obstacles.has(p.x + ',' + p.y)));
  M.engine.start('noGrowth', d, c, r); s = S(); ok(`noGrowth ${c}x${r} ${d}`, reach(c, r, s.obstacles));
  M.engine.start('color', d, c, r); s = S();
  for (const col of ['blue', 'purple', 'orange']) { const b = new Set(); s.tileMap.forEach((v, k) => { if (v === col) b.add(k); }); ok(`color ${c}x${r} ${d} ${col}`, reach(c, r, b)); }
}

// Core: makan snack, tumbuh, tabrakan dinding, event, rekor, achievement
M.engine.start('classic', 'normal', 20, 20); let s = S(), h = s.snake[0]; s.food = { x: h.x + 1, y: h.y };
M.engine.turn('right'); fr(2); ok('classic skor 10', s.score === 10); ok('classic tumbuh', s.snake.length === 4); ok('event eat', events.includes('eat'));
for (let i = 0; i < 40 && s.state !== 'game-over'; i++) fr();
ok('classic game over di dinding', s.state === 'game-over'); ok('event over', events.includes('over'));
ok('rekor tersimpan', M.storage.getBest('classic', 'normal') === 10); ok('First Snack terbuka', s.unlocked.includes('first_snack') && M.storage.isUnlocked('first_snack'));
// Tidak ada input saat game over, dan putar balik ditolak
const before = s.dir.x; M.engine.turn('up'); ok('input ditolak saat game over', s.queue.length === 0 && s.dir.x === before);
M.engine.start('classic', 'normal', 20, 20); s = S(); M.engine.turn('right'); M.engine.turn('left'); ok('putar balik ditolak', s.queue.length === 0);
// Jeda menghentikan simulasi
M.engine.start('timeRush', 'normal', 20, 20); s = S(); M.engine.turn('up'); M.engine.pause(); const r0 = s.remainingMs; fr(3); ok('timer berhenti saat jeda', s.remainingMs === r0);
M.engine.resume(); s.remainingMs = 50; fr(); ok('time rush waktu habis', s.state === 'game-over' && s.endTitle === 'Waktu Habis'); ok('Speed Runner terbuka', M.storage.isUnlocked('speed_runner'));
// Restart tidak menggandakan loop
let n = 0; const rafBackup = ctx.requestAnimationFrame; ctx.requestAnimationFrame = f => { n++; cb = f; return 1; };
M.engine.start('classic', 'normal', 20, 20); M.engine.restart(); M.engine.restart(); fr(); ctx.requestAnimationFrame = rafBackup; ok('satu loop saja', n <= 4);

// Snack Hunter: nyawa dan menang
M.engine.start('hunter', 'normal', 20, 20); for (let i = 0; i < 600 && S().state !== 'game-over'; i++) { if (S().state === 'ready') M.engine.turn('up'); fr(); }
ok('hunter game over setelah 3 nyawa', S().state === 'game-over' && S().lives === 0);
M.engine.start('hunter', 'normal', 20, 20); s = S(); s.eaten = 19; h = s.snake[0]; s.food = { x: h.x + 1, y: h.y }; M.engine.turn('right'); fr(2);
ok('hunter menang di 20 snack', s.state === 'victory' && s.score === 10); ok('Pemburu Snack + Pemenang', M.storage.isUnlocked('hunter') && M.storage.isUnlocked('first_win'));
// Danger Zone
M.engine.start('danger', 'normal', 20, 20); s = S(); h = s.snake[0]; s.zones = [{ x: h.x + 1, y: h.y, phase: 'active', ms: 5000 }]; M.engine.turn('right'); fr(2);
ok('danger kurangi nyawa', s.lives === 2 && s.state === 'ready' && s.zones.length === 0);
// Portal
M.engine.start('portal', 'normal', 20, 20); s = S(); s.obstacles = new Set(); s.food = { x: 0, y: 0 };
s.portals = [{ x: 8, y: 10, color: 'a' }, { x: 16, y: 10, color: 'b' }]; s.snake = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }]; M.engine.turn('right'); fr(2); ok('portal teleport', s.snake[0].x === 16 && s.snake[0].y === 10);
M.engine.start('portal', 'normal', 20, 20); s = S(); s.obstacles = new Set(); s.food = { x: 0, y: 0 };
s.portals = [{ x: 8, y: 10, color: 'a' }, { x: 16, y: 10, color: 'b' }]; s.snake = [{ x: 7, y: 10 }, { x: 16, y: 10 }, { x: 15, y: 10 }]; M.engine.turn('right'); fr(2); ok('portal diblokir', s.snake[0].x === 8);
// Mystery: perisai
M.engine.start('mystery', 'normal', 20, 20); s = S(); s.shield = true; s.snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }]; M.engine.turn('right'); fr(2);
ok('perisai menahan tabrakan', s.state === 'ready' && !s.shield);
// Color Rules: sel terlarang
M.engine.start('color', 'normal', 20, 20); s = S(); h = s.snake[0]; s.tileMap.set((h.x + 1) + ',' + h.y, s.forbidden); M.engine.turn('right'); fr(2); ok('color kurangi nyawa', s.lives === 2);
// Combo
M.engine.start('combo', 'normal', 20, 20); s = S(); h = s.snake[0]; s.food = { x: h.x + 1, y: h.y }; M.engine.turn('right'); fr(2); h = s.snake[0]; s.food = { x: h.x + 1, y: h.y }; fr(2);
ok('combo x2 = 30 poin', s.score === 30 && s.combo === 2); M.modes.combo.onTick(s, 6000); ok('combo reset', s.combo === 1);
// No Growth
M.engine.start('noGrowth', 'normal', 20, 20); s = S(); s.obstacles = new Set(); h = s.snake[0]; s.food = { x: h.x + 1, y: h.y }; M.engine.turn('right'); fr(2); ok('noGrowth tidak tumbuh', s.snake.length === 3 && s.score === 10);
// Path Master
M.engine.start('path', 'normal', 20, 20); s = S(); s.obstacles = new Set(); h = s.snake[0];
s.items = [{ type: 'checkpoint', x: h.x + 1, y: h.y, points: 20, grow: true, color: 'c', label: '1' }]; M.engine.turn('right'); fr(2);
ok('checkpoint dihitung dan berikutnya muncul', s.cpIndex === 1 && s.items.length === 1);
s.cpIndex = 5; h = s.snake[0]; s.door = { x: h.x + 1, y: h.y, open: true }; s.items = []; fr(2); ok('naik level', s.level === 2 && s.state === 'ready');
// Endless: rintangan tidak memutus arena dan ada peringatan
M.engine.start('endless', 'hard', 20, 20); s = S(); let conn = true;
for (let i = 0; i < 150; i++) { s.eaten = s.nextAt; M.modes.endless.onEat(s); if (i === 0) ok('endless ada peringatan', s.zones.length > 0 && s.obstacles.size === 0); M.modes.endless.onTick(s, 2500); const d = s.snake[0]; if (M.grid.bfs(20, 20, s.obstacles, d.x, d.y).count !== 400 - s.obstacles.size) conn = false; }
ok('endless arena tetap terhubung', conn);
// Mystery: distribusi efek
M.engine.start('mystery', 'normal', 20, 20); s = S(); const cnt = {};
for (let i = 0; i < 4000; i++) { s.fx = ''; s.snake = Array.from({ length: 30 }, (_, j) => ({ x: j % 20, y: Math.floor(j / 20) })); M.modes.mystery.onItem(s, {}); cnt[s.fx] = (cnt[s.fx] || 0) + 1; }
ok('distribusi efek mystery', Math.abs(cnt['Bonus +50'] / 4000 - .4) < .05 && Math.abs(cnt['Perlambatan'] / 4000 - .2) < .05);
// Penyimpanan: pengaturan, reset
M.storage.setSetting('theme', 'ocean'); ok('pengaturan tersimpan', JSON.parse(store.get('mufa-snack:v1')).settings.theme === 'ocean');
M.storage.reset(); ok('reset data', M.storage.getBest('classic', 'normal') === 0 && !M.storage.isUnlocked('first_snack') && M.storage.getStats().games === 0);
// i18n
ok('i18n kunci dan variabel', M.i18n.t('ov.scoreLine', { score: 5, best: 9 }) === 'Skor 5 · Rekor 9' && M.i18n.t('tidak.ada') === 'tidak.ada');

console.log(`${total - fail}/${total} uji lolos`);
process.exit(fail ? 1 : 0);
