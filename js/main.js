(function (M) {
  document.addEventListener('DOMContentLoaded', function () {
    M.renderer.init(document.getElementById('arena'));
    M.engine.init({ onState: M.ui.onState, onUpdate: M.ui.onUpdate, onEvent: M.ui.onEvent });
    M.input.init({
      onDir: function (d) { M.engine.turn(d); },
      onPause: function () { M.engine.togglePause(); },
      onEsc: function () { M.ui.handleEsc(); }
    });
    M.ui.init();
    window.addEventListener('resize', M.ui.onResize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) M.engine.pause(); // hemat kerja dan adil saat tab tidak aktif
    });
  });
})(window.Mufa = window.Mufa || {});
