// ===== Bootstrap Mufa Snack =====
(function () {
  let currentModeId = "classic";
  let currentModeName = "Classic Snack";

  // Resize awal
  Renderer.resize(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);

  // Bangun menu
  UI.buildMenu((id, name) => {
    currentModeId = id;
    currentModeName = name;
    startGame();
  });

  function startGame() {
    UI.showScreen("game");
    UI.hideOverlay();
    Renderer.resize(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
    GameEngine.reset(currentModeId);
    UI.updateHUD({
      score: 0,
      best: Scoring.getBest(currentModeId),
      modeName: currentModeName,
      objective: "Kumpulkan snack sebanyak mungkin",
    });
  }

  // Callback engine
  GameEngine.state.onScoreChange = (score) => {
    UI.updateHUD({
      score,
      best: Scoring.getBest(currentModeId),
      modeName: currentModeName,
      objective: "Kumpulkan snack sebanyak mungkin",
    });
  };

  GameEngine.state.onGameOver = (score) => {
    const isRecord = Scoring.submitScore(currentModeId, score);
    UI.showOverlay({
      title: "Game Over",
      sub: isRecord ? `🎉 Rekor baru! Skor ${score}` : `Skor akhir: ${score}`,
      actions: [
        { label: "Main Lagi", onClick: startGame },
        { label: "Menu", ghost: true, onClick: () => {
            UI.hideOverlay(); UI.showScreen("menu");
        }},
      ],
    });
  };

  // Pause toggle
  window.addEventListener("mufa:toggle-pause", () => {
    const s = GameEngine.state.status;
    if (s === "playing") {
      GameEngine.pause();
      UI.showOverlay({
        title: "Jeda",
        sub: "Tekan Space untuk melanjutkan",
        actions: [
          { label: "Lanjut", onClick: () => { UI.hideOverlay(); GameEngine.resume(); } },
          { label: "Menu", ghost: true, onClick: () => {
              UI.hideOverlay(); UI.showScreen("menu");
          }},
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

  // Input touch
  Input.attachSwipe(document.getElementById("canvas"));
  Input.attachButtons(document.getElementById("mobile-controls"));

  // Mulai loop
  GameEngine.start();
})();