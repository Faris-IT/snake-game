(function (M) {
  function win(mode) { return function (s) { return s.modeId === mode && s.result === 'victory'; }; }

  // test(s, stats) dievaluasi setiap sesi selesai, setelah statistik diperbarui.
  var LIST = [
    { id: 'first_snack',  name: 'First Snack',        desc: 'Makan snack pertamamu.',                          test: function (s, st) { return st.snacks >= 1; } },
    { id: 'speed_runner', name: 'Speed Runner',       desc: 'Selesaikan satu sesi Time Rush hingga waktu habis.', test: function (s) { return s.modeId === 'timeRush' && s.endTitle === 'Waktu Habis'; } },
    { id: 'survivor',     name: 'Survivor',           desc: 'Capai 300 poin di Endless Survival.',             test: function (s) { return s.modeId === 'endless' && s.score >= 300; } },
    { id: 'first_win',    name: 'Pemenang',           desc: 'Menangkan mode apa pun.',                         test: function (s) { return s.result === 'victory'; } },
    { id: 'maze_runner',  name: 'Pelari Labirin',     desc: 'Capai Level 5 di Maze Runner.',                   test: function (s) { return s.modeId === 'maze' && s.level >= 5; } },
    { id: 'hunter',       name: 'Pemburu Snack',      desc: 'Selesaikan target Snack Hunter.',                 test: win('hunter') },
    { id: 'portal',       name: 'Penjelajah Portal',  desc: 'Selesaikan misi Portal Snack.',                   test: win('portal') },
    { id: 'chameleon',    name: 'Bunglon',            desc: 'Selesaikan misi Color Rules.',                    test: win('color') },
    { id: 'path',         name: 'Penata Jalur',       desc: 'Capai Level 3 di Path Master.',                   test: function (s) { return s.modeId === 'path' && s.level >= 3; } },
    { id: 'combo5',       name: 'Combo Master',       desc: 'Capai pengali ×5 di Combo Chain.',                test: function (s) { return s.modeId === 'combo' && (s.maxCombo || 0) >= 5; } },
    { id: 'snack_100',    name: 'Pemakan Snack',      desc: 'Makan 100 snack secara total.',                   test: function (s, st) { return st.snacks >= 100; } },
    { id: 'veteran',      name: 'Veteran',            desc: 'Mainkan 25 sesi.',                                test: function (s, st) { return st.games >= 25; } },
    { id: 'explorer',     name: 'Penjelajah Mode',    desc: 'Mainkan semua 12 mode.',                          test: function (s, st) { return Object.keys(st.byMode).length >= M.config.modes.length; } }
  ];

  M.achievements = {
    list: LIST,
    byId: function (id) { return LIST.filter(function (a) { return a.id === id; })[0]; },
    // Mengembalikan id pencapaian yang baru terbuka pada sesi ini.
    check: function (s) {
      var st = M.storage.getStats(), out = [];
      LIST.forEach(function (a) {
        if (M.storage.isUnlocked(a.id)) return;
        var ok = false;
        try { ok = a.test(s, st); } catch (e) {}
        if (ok) { M.storage.unlock(a.id); out.push(a.id); }
      });
      return out;
    }
  };
})(window.Mufa = window.Mufa || {});
