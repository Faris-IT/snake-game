// ===== Bootstrap Mufa Snack =====
(function () {
  let currentModeId = "classic";
  let currentModeName = "Classic Snack";

  // Terapkan tema dari settings
  const initSettings = Storage.getSettings();
  Themes.apply(initSettings.theme || "default");

  Renderer.resize(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);

  UI.buildMenu((id, name) => {
    currentModeId = id;
    currentModeName = name;
    startGame();
  });

  function refreshHud() {
    const s = GameEngine.state;
    const mode = s.mode;
    const objective = mode && mode.getObjective ? mode.getObjective(GameEngine.makeCtx()) : "";
    UI.updateHUD({
      score: s.score,
      best: Storage.getBest(currentModeId),
      modeName: currentModeName,
      objective,
    });
  }

  function startGame() {
    UI.showScreen("game");
    UI.hideOverlay();
    Renderer.resize(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    GameEngine.reset(currentModeId);
    refreshHud();
  }

  GameEngine.state.onScoreChange = () => refreshHud();
  GameEngine.state.onHudChange   = () => refreshHud();

  // Callback saat snack dimakan (untuk achievements realtime)
  GameEngine.state.onSnackEaten = (state) => {
    // Bisa dipakai untuk memicu achievement realtime jika perlu
  };

  // ===== Handler Game Over / Victory =====
  function handleSessionEnd({ win }) {
    const s = GameEngine.state;
    const isRecord = Storage.submitScore(currentModeId, s.score);

    // Simpan statistik
    Storage.recordSession(currentModeId, {
      snacks: s.eaten,
      win,
    });

    // Cek achievements
    const newlyUnlocked = Achievements.checkOnGameEnd({
      modeId: currentModeId,
      score: s.score,
      snacks: s.eaten,
      win,
    });

    // Tampilkan toast untuk setiap achievement baru
    newlyUnlocked.forEach((id) => {
      const a = Achievements.getById(id);
      if (a) UI.showAchievementToast(a);
    });

    return isRecord;
  }

  GameEngine.state.onGameOver = (score) => {
    const isRecord = handleSessionEnd({ win: false });
    UI.showOverlay({
      title: "Game Over",
      sub: isRecord ? `🎉 Rekor baru! Skor ${score}` : `Skor akhir: ${score}`,
      actions: [
        { label: "Main Lagi", onClick: startGame },
        { label: "Menu", ghost: true, onClick: () => { UI.hideOverlay(); UI.showScreen("menu"); } },
      ],
    });
  };

  GameEngine.state.onVictory = (score) => {
    const isRecord = handleSessionEnd({ win: true });
    UI.showOverlay({
      title: "Victory! 🏆",
      sub: isRecord ? `🎉 Rekor baru! Skor ${score}` : `Skor akhir: ${score}`,
      actions: [
        { label: "Main Lagi", onClick: startGame },
        { label: "Menu", ghost: true, onClick: () => { UI.hideOverlay(); UI.showScreen("menu"); } },
      ],
    });
  };

  // ===== Pause =====
  window.addEventListener("mufa:toggle-pause", () => {
    const s = GameEngine.state.status;
    if (s === "playing") {
      GameEngine.pause();
      UI.showOverlay({
        title: "Jeda",
        sub: "Tekan Space untuk melanjutkan",
        actions: [
          { label: "Lanjut", onClick: () => { UI.hideOverlay(); GameEngine.resume(); } },
          { label: "Menu", ghost: true, onClick: () => { UI.hideOverlay(); UI.showScreen("menu"); } },
        ],
      });
    } else if (s === "paused") {
      UI.hideOverlay();
      GameEngine.resume();
    }
  });

  document.getElementById("btn-pause").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("mufa:toggle-pause"));
  });

  // ===== Menu footer buttons =====
  document.getElementById("btn-stats").addEventListener("click", () => UI.showStatsModal());
  document.getElementById("btn-settings").addEventListener("click", () => UI.showSettingsModal());
  document.getElementById("btn-achievements").addEventListener("click", () => UI.showAchievementsModal());

  Input.attachSwipe(document.getElementById("canvas"));
  Input.attachButtons(document.getElementById("mobile-controls"));

  GameEngine.start();
})();