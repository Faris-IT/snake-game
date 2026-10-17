(function (M) {
  var dict = {
    id: {
      'common.close': 'Tutup',
      'menu.difficulty': 'Kesulitan', 'menu.modes': 'Pilih mode', 'menu.play': 'Play',
      'menu.stats': 'Statistik', 'menu.achievements': 'Pencapaian', 'menu.settings': 'Pengaturan',
      'menu.help': 'Bantuan', 'menu.soon': 'Segera',
      'hud.score': 'Skor', 'hud.best': 'Rekor', 'hud.pause': 'Jeda', 'hud.resume': 'Lanjut',
      'hud.restart': 'Ulang', 'hud.menu': 'Menu',
      'ov.ready': 'Siap?', 'ov.readyHint': 'Tekan tombol arah atau geser layar untuk mulai.',
      'ov.paused': 'Jeda', 'ov.pausedText': 'Permainan dihentikan.',
      'ov.resume': 'Lanjut', 'ov.restart': 'Ulang', 'ov.menu': 'Menu',
      'ov.gameOver': 'Game Over', 'ov.victory': 'Menang!',
      'ov.scoreLine': 'Skor {score} · Rekor {best}', 'ov.newBest': ' · Rekor baru!',
      'ov.sessionLine': 'Snack {snacks} · Waktu {time}',
      'ov.playAgain': 'Main Lagi', 'ov.chooseMode': 'Pilih Mode',
      'ov.achievement': 'Pencapaian baru: {name}', 'ov.themeUnlocked': 'Tema {name} terbuka!',
      'stats.title': 'Statistik', 'stats.games': 'Total permainan', 'stats.snacks': 'Total snack',
      'stats.wins': 'Total kemenangan', 'stats.favorite': 'Mode favorit',
      'stats.records': 'Rekor terbaik', 'stats.mode': 'Mode', 'stats.sessions': 'Sesi',
      'ach.title': 'Pencapaian', 'ach.progress': '{n} dari {total} pencapaian terbuka',
      'set.title': 'Pengaturan', 'set.sound': 'Suara', 'set.on': 'Aktif', 'set.off': 'Mati',
      'set.theme': 'Tema', 'set.locked': 'terkunci', 'set.themeLocked': '{theme}: buka lewat pencapaian "{name}"',
      'set.dpad': 'Tombol arah layar', 'set.auto': 'Otomatis', 'set.lang': 'Bahasa',
      'set.controls': 'Kontrol',
      'set.controlsText': 'Keyboard: Panah atau WASD untuk bergerak, Space untuk jeda, Esc untuk menu jeda. Sentuh: geser di arena atau pakai tombol arah di layar.',
      'set.reset': 'Hapus semua data', 'set.resetConfirm': 'Klik lagi untuk konfirmasi',
      'help.title': 'Cara Bermain',
      'help.goal': 'Kendalikan ular, kumpulkan snack, dan hindari bahaya. Setiap mode punya tujuan dan aturan sendiri; baca teks singkat sebelum mulai. Rekor disimpan terpisah untuk setiap mode dan tingkat kesulitan.',
      'help.keyboard': 'Panah atau WASD untuk bergerak. Space untuk jeda atau lanjut. Esc membuka menu jeda.',
      'help.touch': 'Geser ke atas, bawah, kiri, atau kanan di area arena, atau gunakan tombol arah di layar.',
      'help.kbTitle': 'Keyboard', 'help.touchTitle': 'Layar sentuh', 'help.modesTitle': 'Daftar mode'
    }
  };
  var cur = 'id', names = { id: 'Indonesia' };

  M.i18n = {
    // Menambah bahasa: M.i18n.register('en', 'English', { 'menu.play': 'Play', ... })
    register: function (id, label, d) { dict[id] = d; names[id] = label; },
    languages: function () { return Object.keys(dict).map(function (k) { return { id: k, label: names[k] }; }); },
    setLang: function (l) { if (dict[l]) cur = l; },
    getLang: function () { return cur; },
    t: function (key, vars) {
      var s = (dict[cur] && dict[cur][key]) || dict.id[key] || key;
      if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
      return s;
    },
    applyStatic: function () {
      document.documentElement.lang = cur;
      document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = M.i18n.t(el.dataset.i18n); });
    }
  };
})(window.Mufa = window.Mufa || {});
