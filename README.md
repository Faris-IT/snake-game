# 🐍 MUFA SNACK

<div align="center">

**Arcade · Snake · Strategy · Survival**

Game arcade Snake dengan **12 mode permainan**, **10 achievements**, dan **4 tema visual** — dibangun murni menggunakan HTML, CSS, dan JavaScript.

Tanpa framework. Tanpa backend. Tanpa aset eksternal.

[![▶ Mainkan Sekarang](https://img.shields.io/badge/▶_Mainkan-Sekarang-3ef58b?style=for-the-badge)](https://faris-it.github.io/snake-game/)
[![JavaScript](https://img.shields.io/badge/Made_with-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-0-2ee6ff?style=for-the-badge)](https://github.com/Faris-IT/snake-game)

</div>

---

## 🎮 Apa Itu Mufa Snack?

**Mufa Snack** adalah pengembangan modern dari game klasik *Snake*. Bukan hanya satu mode permainan, Mufa Snack menghadirkan **12 mode dengan aturan, tujuan, dan strategi yang berbeda**.

Ada mode untuk mengejar skor tertinggi, bertahan hidup, menyelesaikan misi, menghindari bahaya, hingga merencanakan jalur terbaik.

Seluruh grafis, animasi, dan efek visual dibuat secara programatis menggunakan **Canvas API dan CSS**. Tidak ada file gambar, sprite, atau audio eksternal yang diperlukan.

Cukup buka `index.html` di browser dan mulai bermain!

## ✨ Fitur

- 🎲 **12 mode permainan** dengan aturan dan tantangan berbeda.
- 🏆 **10 achievements** dengan notifikasi toast.
- 📊 **Statistik lokal**, meliputi total sesi, snack yang dikumpulkan, kemenangan, mode favorit, dan rekor setiap mode.
- 🎨 **4 tema visual**: Default, Ocean, Sunset, dan Neon.
- ✨ **Efek partikel** saat mengumpulkan snack.
- 📱 **Responsif** untuk desktop dan perangkat mobile.
- ⌨️ **Kontrol desktop** menggunakan tombol panah atau WASD.
- 📲 **Kontrol mobile** menggunakan swipe atau D-pad.
- ⚡ **Ringan** tanpa framework, library eksternal, atau proses build.
- 💾 **Penyimpanan lokal** untuk statistik, pengaturan, achievements, dan rekor.
- 🌐 **Dapat dimainkan secara lokal** tanpa koneksi internet setelah seluruh file tersedia.

## 🕹️ Cara Bermain

| Aksi | Desktop | Mobile |
|---|---|---|
| Bergerak | `↑` `↓` `←` `→` atau `W` `A` `S` `D` | Swipe atau D-pad |
| Jeda / lanjut | `Space` atau `Esc` | Tombol ⏸ |

Kendalikan ular untuk **mengumpulkan snack, menyelesaikan target mode, dan menghindari bahaya**.

Setiap mode memiliki tujuan dan aturan yang berbeda. Perhatikan HUD selama permainan untuk mengetahui target, skor, waktu, nyawa, atau objektif yang sedang aktif.

## 🎯 12 Mode Permainan

| No. | Mode | Tujuan |
|---:|---|---|
| 1 | 🍎 **Classic Snack** | Mendapatkan skor setinggi mungkin. |
| 2 | ⏱️ **Time Rush** | Meraih skor maksimal dalam 60 detik. |
| 3 | 🌀 **Maze Runner** | Mengumpulkan 5 snack dan mencapai pintu keluar labirin. |
| 4 | 🎯 **Snack Hunter** | Mengumpulkan 20 snack dengan 3 nyawa. |
| 5 | 🔥 **Danger Zone** | Bertahan sambil menghindari zona bahaya yang terus muncul. |
| 6 | 🌌 **Portal Snack** | Mengumpulkan 15 snack dengan bantuan 4 pasang portal. |
| 7 | 🎨 **Color Rules** | Beradaptasi dengan aturan warna yang berganti setiap 10 detik. |
| 8 | ❓ **Mystery Snack** | Menghadapi efek acak dan mengambil risiko secara strategis. |
| 9 | 📏 **No Growth** | Mengejar skor tanpa memperpanjang tubuh ular. |
| 10 | 🔥 **Combo Chain** | Mempertahankan rangkaian combo hingga pengali ×5. |
| 11 | 🚩 **Path Master** | Mengunjungi 5 checkpoint secara berurutan. |
| 12 | ♾️ **Endless Survival** | Bertahan selama mungkin dan mengejar rekor pribadi. |

## 🚀 Menjalankan Secara Lokal

Tidak diperlukan instalasi framework, package manager, atau dependensi tambahan.

### 1. Clone repository

```bash
git clone https://github.com/Faris-IT/snake-game.git
```

### 2. Masuk ke direktori proyek

```bash
cd snake-game
```

### 3. Jalankan game

Buka file `index.html` menggunakan browser.

### Alternatif: menggunakan server lokal

Untuk pengujian melalui localhost, jalankan:

```bash
python -m http.server 8080
```

Kemudian buka alamat berikut di browser:

http://localhost:8080

Jika perintah `python` tidak tersedia, kamu dapat mencoba `python3` atau menggunakan server lokal dari editor kode.

## 📁 Struktur Proyek

```text
snake-game/
├── index.html
├── css/
│   ├── reset.css
│   ├── style.css
│   └── responsive.css
└── js/
    ├── config.js
    ├── storage.js
    ├── themes.js
    ├── particles.js
    ├── achievements.js
    ├── scoring.js
    ├── collision.js
    ├── input.js
    ├── renderer.js
    ├── game-engine.js
    ├── ui.js
    ├── main.js
    └── modes/
        └── (12 file mode permainan)
```

**Catatan:** Nama file di atas menggambarkan struktur yang direncanakan berdasarkan arsitektur proyek. Pastikan nama dan isi folder disesuaikan dengan file yang benar-benar tersedia di repository.

## 🏗️ Arsitektur

Mufa Snack menggunakan satu **game engine bersama** untuk mengatur pergerakan ular, tabrakan, rendering, dan siklus permainan.

Setiap mode memiliki konfigurasi serta aturan tersendiri melalui API internal. Contoh bentuk objek mode:

```javascript
{
  id,
  name,
  desc,
  ready,

  config: {
    stepMs,
    growOnEat,
    lives
  },

  onStart(ctx),
  onTick(ctx, dt),
  onAfterMove(ctx),
  onEat(ctx, kind),
  onCollision(ctx),
  spawnSnack(ctx),
  getObjective(ctx),
  isWin(ctx),
  isLose(ctx)
}
```

Fungsi-fungsi tersebut menggambarkan antarmuka internal mode; detail implementasinya mengikuti kode aktual masing-masing mode.

Arsitektur modular ini memisahkan mekanik permainan dari aturan mode sehingga perubahan pada satu mode tidak harus mengubah seluruh game engine.

## 🛠️ Teknologi

- **HTML5** — struktur halaman dan elemen Canvas.
- **CSS3** — layout, tema visual, animasi, dan modal.
- **JavaScript (ES6+)** — logika permainan, sistem mode modular, dan penyimpanan lokal.
- **Canvas API** — rendering arena, grid, ular, snack, dan efek partikel.
- **localStorage** — penyimpanan statistik, pengaturan, achievements, dan rekor pada browser.

### Tanpa dependensi eksternal

Mufa Snack tidak membutuhkan:

- Framework JavaScript.
- Library eksternal.
- `package.json`.
- `node_modules`.
- Proses bundling atau build.
- Backend atau database online.
- Aset gambar dan audio eksternal.

## 💾 Penyimpanan Data

Game menggunakan `localStorage` untuk menyimpan progres pemain secara lokal.

Data yang disimpan dapat mencakup:

- Rekor skor setiap mode.
- Statistik permainan.
- Achievements yang telah diperoleh.
- Tema visual dan pengaturan.

Data lokal terikat pada browser dan perangkat yang digunakan. Data tidak otomatis tersinkronisasi ke perangkat lain dan dapat hilang jika penyimpanan browser dihapus.

## 🌐 Deployment

Mufa Snack dapat di-host menggunakan layanan hosting statis yang mendukung HTML, CSS, dan JavaScript.

Versi online dapat dimainkan melalui:

**[🎮 Mainkan Mufa Snack](https://faris-it.github.io/snake-game/)**

Jika alamat deployment berubah, perbarui tautan tersebut sesuai URL terbaru.

## 🗺️ Pengembangan Selanjutnya

Ide pengembangan lanjutan untuk versi mendatang:

- 🌐 Integrasi dengan platform Mufa Games.
- 🏆 Sinkronisasi achievements lintas game.
- 📊 Leaderboard terpusat.
- 🎮 Sistem statistik lintas game.
- 🎨 Tema visual tambahan.
- 🕹️ Mode permainan baru.

Fitur online seperti leaderboard dan sinkronisasi memerlukan integrasi dengan layanan atau backend yang sesuai dan tidak termasuk dalam sistem penyimpanan lokal versi mandiri.

---

<div align="center">

**Dibuat dengan ❤️ oleh [Faris](https://github.com/Faris-IT)**

⭐ Jika kamu menyukai proyek ini, pertimbangkan untuk memberikan **Star** pada repository!

[![▶ Mainkan Mufa Snack](https://img.shields.io/badge/🎮_Mainkan-Mufa_Snack-3ef58b?style=for-the-badge)](https://faris-it.github.io/snake-game/)

</div>
