// ===== Mode: Time Rush =====
ModeRegistry.register({
  id: "time-rush",
  name: "Time Rush",
  desc: "60 detik, kejar skor.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 1, durationMs: 60000 },

  onStart(ctx) {
    ctx.timeLeft = 60;
    ctx._lastSpeedUpSec = 0;
  },

  onTick(ctx) {
    const left = Math.max(0, 60 - ctx.elapsedMs / 1000);
    ctx.timeLeft = Math.ceil(left);

    const sec = Math.floor(ctx.elapsedMs / 1000);
    if (sec > 0 && sec % 10 === 0 && sec !== ctx._lastSpeedUpSec) {
      ctx._lastSpeedUpSec = sec;
      ctx.stepMs = Math.max(ctx.minStepMs, ctx.stepMs - 8);
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") ctx.score += CONFIG.SCORE_NORMAL;
  },

  isLose(ctx) {
    return ctx.elapsedMs >= 60000;
  },

  getObjective(ctx) {
    return "⏱ " + (ctx.timeLeft ?? 60) + "s";
  },
});