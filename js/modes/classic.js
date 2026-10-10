// ===== Mode: Classic Snack =====
ModeRegistry.register({
  id: "classic",
  name: "Classic Snack",
  desc: "Skor setinggi mungkin.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 1 },

  getObjective() {
    return "Kumpulkan snack sebanyak mungkin";
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
      if (ctx.eaten % 5 === 0) {
        ctx.stepMs = Math.max(ctx.minStepMs, ctx.stepMs - 8);
      }
    }
  },
});