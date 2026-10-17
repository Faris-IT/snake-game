# Checklist pengujian sebelum rilis

Centang hanya setelah fitur benar-benar diuji di browser. Uji logika otomatis
(`node tests/logic.test.js`) membantu, tetapi tidak menggantikan uji manual.

## Gameplay inti
- [ ] Ular bergerak dan berbelok dengan benar.
- [ ] Snack tidak muncul di dalam tubuh ular atau rintangan.
- [ ] Skor dan panjang ular bertambah sesuai aturan mode.
- [ ] Tabrakan dan kondisi menang/kalah terdeteksi dengan benar.
- [ ] Jeda, lanjut, dan restart tidak membuat sesi ganda.

## Mode permainan
- [ ] Semua 12 mode memiliki aturan dan tujuan yang jelas.
- [ ] Timer berhenti ketika game dijeda.
- [ ] Nyawa dan target misi dihitung dengan benar.
- [ ] Portal tidak memindahkan ular ke lokasi yang terisi.
- [ ] Maze dan checkpoint dapat diselesaikan.

## UI dan kompatibilitas
- [ ] Keyboard berfungsi pada desktop.
- [ ] Kontrol sentuh berfungsi pada mobile.
- [ ] Layout menyesuaikan layar kecil dan besar.
- [ ] Tidak ada tombol utama yang tidak berfungsi.
- [ ] Tidak ada error JavaScript di console.

## Penyimpanan dan rilis
- [ ] Rekor terbaik tersimpan setelah reload.
- [ ] Pengaturan dan achievements tersimpan dengan benar.
- [ ] Pemain bisa memulai sesi baru tanpa memuat ulang halaman.
- [ ] Game berjalan tanpa aset eksternal atau backend.
- [ ] README menjelaskan kontrol, mode, dan cara menjalankan game.

## Tambahan tahap 6 (uji manual)
- [ ] Menu tidak menampilkan scrollbar di layar desktop umum.
- [ ] Panel Statistik, Pencapaian, Pengaturan, dan Bantuan terbuka dan tertutup (tombol Tutup, Esc, klik latar).
- [ ] Suara bisa dimatikan dan tetap mati setelah reload.
- [ ] Tema yang terkunci tidak bisa dipilih; tema terbuka setelah pencapaiannya diraih.
- [ ] Tombol arah layar: Otomatis, Aktif, dan Mati berfungsi.
- [ ] Menggeser di arena tidak menggulir halaman di mobile.
- [ ] Tombol "Hapus semua data" meminta konfirmasi dan mengosongkan rekor.
- [ ] Layar dirotasi atau diubah ukurannya saat bermain tanpa merusak posisi game.
