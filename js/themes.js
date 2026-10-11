// ===== Tema Visual =====
const Themes = (() => {
  const LIST = {
    default: {
      name: "Default",
      bg:       "#0f1b33",
      grid:     "#14213d",
      snake:    "#3ef58b",
      head:     "#7bffb0",
      snack:    "#ffd23f",
      bonus:    "#ff8c42",
      danger:   "#ff4d5e",
      cyan:     "#2ee6ff",
      obstacle: "#3a4b6e",
      exit:     "#2ee6ff",
    },
    ocean: {
      name: "Ocean",
      bg:       "#0a1f33",
      grid:     "#123047",
      snake:    "#2ee6ff",
      head:     "#7bdcff",
      snack:    "#ffd23f",
      bonus:    "#ff8c42",
      danger:   "#ff4d5e",
      cyan:     "#3ef58b",
      obstacle: "#2a4a66",
      exit:     "#3ef58b",
    },
    sunset: {
      name: "Sunset",
      bg:       "#2a1030",
      grid:     "#3d1a3d",
      snake:    "#ff8c42",
      head:     "#ffb973",
      snack:    "#ffd23f",
      bonus:    "#ff5fa2",
      danger:   "#ff4d5e",
      cyan:     "#ffd23f",
      obstacle: "#5a2a5a",
      exit:     "#ffd23f",
    },
    neon: {
      name: "Neon",
      bg:       "#050510",
      grid:     "#1a1a2e",
      snake:    "#00ffd5",
      head:     "#7bfff0",
      snack:    "#ff00ff",
      bonus:    "#ffff00",
      danger:   "#ff0055",
      cyan:     "#00ffd5",
      obstacle: "#2a2a4e",
      exit:     "#00ffd5",
    },
  };

  function apply(themeId) {
    const theme = LIST[themeId] || LIST.default;
    Object.assign(CONFIG.COLORS, theme);
    document.body.dataset.theme = themeId;
  }

  function list() { return Object.entries(LIST).map(([id, t]) => ({ id, name: t.name })); }

  return { apply, list };
})();