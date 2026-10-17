(function (M) {
  var KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
  };

  function inGame() {
    return document.getElementById('screen-game').classList.contains('active') &&
      document.getElementById('panel').classList.contains('hidden');
  }

  M.input = {
    // handlers: { onDir(name), onPause(), onEsc() }
    init: function (h) {
      window.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Escape') { h.onEsc(); return; }
        if (!inGame()) return; // di menu dan panel, tombol bekerja seperti biasa
        var dir = KEYS[e.key];
        if (dir) { e.preventDefault(); h.onDir(dir); return; }
        if (e.code === 'Space') {
          e.preventDefault();
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          h.onPause();
        }
      });

      // Geser di area arena (tidak mengganggu tombol pada overlay)
      var wrap = document.getElementById('arena-wrap'), sx = 0, sy = 0, on = false, TH = 24;
      wrap.addEventListener('touchstart', function (e) {
        if (e.target.closest('.overlay')) { on = false; return; }
        on = true; e.preventDefault();
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      }, { passive: false });
      wrap.addEventListener('touchmove', function (e) {
        if (!on) return;
        e.preventDefault();
        var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) < TH && Math.abs(dy) < TH) return;
        h.onDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        sx = t.clientX; sy = t.clientY;
      }, { passive: false });
      wrap.addEventListener('touchend', function () { on = false; });

      document.querySelectorAll('.dpad button').forEach(function (b) {
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); h.onDir(b.dataset.dir); });
      });
    }
  };
})(window.Mufa = window.Mufa || {});
