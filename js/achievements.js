// ===== Definisi Achievements =====
const Achievements = (() => {
  const LIST = [
    { id: "first_snack", name: "First Snack",    desc: "Makan snack pertama kali.",     icon: "🍎" },
    { id: "first_game",  name: "Selamat Datang", desc: "Selesaikan sesi pertama.",      icon: "🎮" },
    { id: "score_100",   name: "Skor 100",       desc: "Capai skor 100 dalam mode apa pun.", icon: "💯" },
    { id: "score_500",   name: "Skor 500",       desc: "Capai skor 500 dalam mode apa pun.", icon: "🔥" },
    { id: "score_1000",  name: "Skor 1000",      desc: "Capai skor 1000 dalam mode apa pun.", icon: "💎" },
    { id: "survivor",    name: "Survivor",       desc: "Mainkan Endless Survival sampai skor 200.", icon: "🛡" },
    { id: "speed_runner",name: "Speed Runner",   desc: "Capai skor 200 di Time Rush.",  icon: "⚡" },
    { id: "explorer",    name: "Explorer",       desc: "Mainkan 6 mode berbeda.",       icon: "🧭" },
    { id: "collector",   name: "Kolektor",       desc: "Makan total 100 snack.",        icon: "📦" },
    { id: "master",      name: "Master Mufa",    desc: "Mainkan seluruh 12 mode.",      icon: "👑" },
  ];

  function checkOnGameEnd(opts) {
    // opts: { modeId, score, snacks, win }
    const stats = Storage.getStats();
    const unlocked = [];

    if (opts.snacks >= 1 && Storage.unlockAchievement("first_snack")) unlocked.push("first_snack");
    if (Storage.unlockAchievement("first_game")) unlocked.push("first_game");

    if (opts.score >= 100 && Storage.unlockAchievement("score_100")) unlocked.push("score_100");
    if (opts.score >= 500 && Storage.unlockAchievement("score_500")) unlocked.push("score_500");
    if (opts.score >= 1000 && Storage.unlockAchievement("score_1000")) unlocked.push("score_1000");

    if (opts.modeId === "endless-survival" && opts.score >= 200) {
      if (Storage.unlockAchievement("survivor")) unlocked.push("survivor");
    }
    if (opts.modeId === "time-rush" && opts.score >= 200) {
      if (Storage.unlockAchievement("speed_runner")) unlocked.push("speed_runner");
    }

    const distinctModes = Object.keys(stats.modeSessions || {}).length;
    if (distinctModes >= 6 && Storage.unlockAchievement("explorer")) unlocked.push("explorer");
    if (distinctModes >= 12 && Storage.unlockAchievement("master")) unlocked.push("master");

    if ((stats.totalSnacks || 0) >= 100 && Storage.unlockAchievement("collector")) unlocked.push("collector");

    return unlocked; // array of achievement ids yang baru terbuka
  }

  function checkOnSnack(totalSnacks) {
    // dipanggil tiap makan snack — bisa untuk achievement realtime
    if (totalSnacks >= 100 && Storage.unlockAchievement("collector")) return ["collector"];
    return [];
  }

  function getList() { return LIST; }
  function getById(id) { return LIST.find(a => a.id === id); }

  return { getList, getById, checkOnGameEnd, checkOnSnack };
})();