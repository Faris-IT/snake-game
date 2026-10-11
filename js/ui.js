// ===== UI: menu, HUD, overlay, modal =====
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

  const modal      = $("#modal");
  const modalTitle = $("#modal-title");
  const modalBody  = $("#modal-body");
  const modalClose = $("#modal-close");

  function buildMenu(onPick) {
    modeList.innerHTML = "";
    ModeRegistry.list().forEach((m) => {
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
    hudScore.textContent = score ?? 0;
    hudBest.textContent  = best ?? 0;
    hudMode.textContent  = modeName ?? "";
    hudObj.textContent   = objective ?? "";
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

  // ===== Modal =====
  function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modal.hidden = false;
  }
  function closeModal() { modal.hidden = true; }

  // ===== Statistik =====
  function showStatsModal() {
    const s = Storage.getStats();
    const fav = Storage.getFavoriteMode();
    const favName = fav && ModeRegistry.get(fav) ? ModeRegistry.get(fav).name : "—";
    const html = `
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-num">${s.totalGames}</span><span class="stat-label">Total Sesi</span></div>
        <div class="stat-item"><span class="stat-num">${s.totalSnacks}</span><span class="stat-label">Total Snack</span></div>
        <div class="stat-item"><span class="stat-num">${s.totalWins}</span><span class="stat-label">Total Kemenangan</span></div>
        <div class="stat-item"><span class="stat-num">${favName}</span><span class="stat-label">Mode Favorit</span></div>
      </div>
      <h3 class="modal-h3">Rekor per Mode</h3>
      <ul class="best-list">
        ${ModeRegistry.list().map(m => `
          <li><span>${m.name}</span><strong>${Storage.getBest(m.id)}</strong></li>
        `).join("")}
      </ul>
    `;
    openModal("Statistik", html);
  }

  // ===== Achievements =====
  function showAchievementsModal() {
    const list = Achievements.getList();
    const html = `
      <ul class="achv-list">
        ${list.map(a => {
          const unlocked = Storage.isAchievementUnlocked(a.id);
          return `
            <li class="achv-item ${unlocked ? "unlocked" : "locked"}">
              <span class="achv-icon">${a.icon}</span>
              <div class="achv-info">
                <strong>${a.name}</strong>
                <span>${a.desc}</span>
              </div>
              <span class="achv-status">${unlocked ? "✓" : "🔒"}</span>
            </li>
          `;
        }).join("")}
      </ul>
    `;
    openModal("Achievements", html);
  }

  // ===== Pengaturan =====
  function showSettingsModal(onChange) {
    const s = Storage.getSettings();
    const themeList = Themes.list();
    const html = `
      <div class="setting-row">
        <label>Suara</label>
        <button class="toggle ${s.sound ? "on" : "off"}" id="set-sound">${s.sound ? "ON" : "OFF"}</button>
      </div>
      <div class="setting-row">
        <label>Tema Visual</label>
        <div class="theme-list">
          ${themeList.map(t => `
            <button class="theme-btn ${s.theme === t.id ? "active" : ""}" data-theme="${t.id}">
              ${t.name}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="setting-row">
        <label>Bahasa</label>
        <select id="set-lang">
          <option value="id" ${s.language === "id" ? "selected" : ""}>Indonesia</option>
          <option value="en" ${s.language === "en" ? "selected" : ""}>English</option>
        </select>
      </div>
    `;
    openModal("Pengaturan", html);

    // Sound toggle
    const soundBtn = document.getElementById("set-sound");
    soundBtn.addEventListener("click", () => {
      const cur = Storage.getSettings().sound;
      const next = !cur;
      Storage.updateSetting("sound", next);
      soundBtn.textContent = next ? "ON" : "OFF";
      soundBtn.className = "toggle " + (next ? "on" : "off");
      if (onChange) onChange({ sound: next });
    });

    // Theme
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const themeId = btn.dataset.theme;
        Storage.updateSetting("theme", themeId);
        Themes.apply(themeId);
        document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Language (belum diterapkan sepenuhnya)
    document.getElementById("set-lang").addEventListener("change", (e) => {
      Storage.updateSetting("language", e.target.value);
    });
  }

  // ===== Toast Achievements =====
  function showAchievementToast(achv) {
    const toast = document.createElement("div");
    toast.className = "toast-achv";
    toast.innerHTML = `
      <span class="toast-icon">${achv.icon}</span>
      <div>
        <strong>${achv.name}</strong>
        <small>${achv.desc}</small>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  return {
    buildMenu, showScreen, updateHUD,
    showOverlay, hideOverlay,
    openModal, closeModal,
    showStatsModal, showAchievementsModal, showSettingsModal,
    showAchievementToast,
  };
})();