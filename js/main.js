// ===== Bootstrap Mufa Snack =====
(function () {
  let currentModeId = "classic";
  let currentModeName = "Classic Snack";

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
      best: Scoring.getBest(currentModeId),
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

  GameEngine.state.onGameOver = (score) => {
    const isRecord = Scoring.submitScore(currentModeId, score);
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
    const isRecord = Scoring.submitScore(currentModeId, score);
    UI.showOverlay({
      title: "Victory! 🏆",
      sub: isRecord ? `🎉 Rekor baru! Skor ${score}` : `Skor akhir: ${score}`,
      actions: [
        { label: "Main Lagi", onClick: startGame },
        { label: "Menu", ghost: true, onClick: () => { UI.hideOverlay(); UI.showScreen("menu"); } },
      ],
    });
  };

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

  Input.attachSwipe(document.getElementById("canvas"));
  Input.attachButtons(document.getElementById("mobile-controls"));

  GameEngine.start();
})();