// ===== UI: menu, HUD, overlay =====
const UI = (() => {
  const $ = (sel) => document.querySelector(sel);
  const screenMenu = $("#screen-menu");
  const screenGame = $("#screen-game");
  const modeList   = $("#mode-list");
  const overlay    = $("#overlay");
  const oTitle     = $("#overlay-title");
  const oSub       = $("#overlay-sub");
  const oActions   = $("#overlay-actions");
  const hudScore   = $("#hud-score");
  const hudBest    = $("#hud-best");
  const hudMode    = $("#hud-mode");
  const hudObj     = $("#hud-objective");

  function buildMenu(onPick) {
    modeList.innerHTML = "";
    MODES.forEach((m) => {
      const card = document.createElement("button");
      card.className = "mode-card";
      card.disabled = !m.ready;
      card.style.opacity = m.ready ? "1" : "0.45";
      card.innerHTML = `<div class="mc-title">${m.name}</div>
                        <div class="mc-desc">${m.ready ? m.desc : "Segera hadir"}</div>`;
      card.addEventListener("click", () => m.ready && onPick(m.id, m.name));
      modeList.appendChild(card);
    });
  }

  function showScreen(name) {
    screenMenu.classList.toggle("active", name === "menu");
    screenGame.classList.toggle("active", name === "game");
  }

  function updateHUD({ score, best, modeName, objective }) {
    hudScore.textContent = score;
    hudBest.textContent  = best;
    hudMode.textContent  = modeName;
    hudObj.textContent   = objective || "";
  }

  function showOverlay({ title, sub, actions }) {
    oTitle.textContent = title;
    oSub.textContent   = sub || "";
    oActions.innerHTML = "";
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.className = "btn" + (a.ghost ? " ghost" : "");
      b.textContent = a.label;
      b.addEventListener("click", a.onClick);
      oActions.appendChild(b);
    });
    overlay.hidden = false;
  }
  function hideOverlay() { overlay.hidden = true; }

  return { buildMenu, showScreen, updateHUD, showOverlay, hideOverlay };
})();