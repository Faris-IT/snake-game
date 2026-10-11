// ===== Mode: Combo Chain =====
ModeRegistry.register({
  id: "combo-chain",
  name: "Combo Chain",
  desc: "Rantai combo, jangan putus.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 1 },

  onStart(ctx) {
    ctx.combo = 1;
    ctx.comboTimer = 0;
    ctx.comboWindow = 5000; // 5 detik
    ctx.maxCombo = 5;
    ctx.lastComboScore = 0;
  },

  onTick(ctx, dt) {
    if (ctx.combo > 1) {
      ctx.comboTimer += dt;
      if (ctx.comboTimer >= ctx.comboWindow) {
        ctx.combo = 1;
        ctx.comboTimer = 0;
        ctx.lastComboScore = 0;
      }
    }
  },

  onEat(ctx, kind) {
    if (kind !== "snack") return;
    const points = CONFIG.SCORE_NORMAL * ctx.combo;
    ctx.score += points;
    ctx.lastComboScore = points;
    ctx.comboTimer = 0;
    if (ctx.combo < ctx.maxCombo) ctx.combo++;
  },

  getObjective(ctx) {
    const remain = ctx.combo > 1
      ? Math.ceil((ctx.comboWindow - ctx.comboTimer) / 1000)
      : 0;
    const comboStr = ctx.combo > 1
      ? "🔥 ×" + ctx.combo + (remain > 0 ? " (" + remain + "s)" : "")
      : "×1";
    return "Combo " + comboStr + " · +" + ctx.lastComboScore + " terakhir";
  },
});