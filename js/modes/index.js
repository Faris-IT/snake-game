// ===== Registri Mode =====
const ModeRegistry = (() => {
  const modes = new Map();
  function register(mode) { modes.set(mode.id, mode); }
  function get(id) { return modes.get(id); }
  function list() { return Array.from(modes.values()); }
  return { register, get, list };
})();