// ===== Input keyboard + touch, dengan antrean arah =====
const Input = (() => {
  const queue = [];
  let enabled = false;

  const KEY_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right",
  };

  function push(dir) {
    if (!enabled) return;
    if (!CONFIG.DIRS[dir]) return;
    // Hindari dua arah sama berturut-turut
    const last = queue.length ? queue[queue.length - 1] : null;
    if (last === dir) return;
    if (queue.length < 2) queue.push(dir);
  }
  function consume() {
    const d = queue.shift() || null;
    if (d && window._mufaReverseInput) {
      window._mufaReverseInput = false; // pakai sekali saja
      const map = { up: "down", down: "up", left: "right", right: "left" };
      return map[d] || d;
    }
    return d;
  }
  function clear() {
    queue.length = 0;
  }
  function setEnabled(v) {
    enabled = v;
    if (!v) clear();
  }

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if (KEY_MAP[e.key]) {
      e.preventDefault();
      push(KEY_MAP[e.key]);
    }
    if (e.key === " " || e.key === "Escape") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("mufa:toggle-pause"));
    }
  });

  // Touch swipe pada canvas
  function attachSwipe(el) {
    let sx = 0,
      sy = 0,
      tracking = false;
    el.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        sx = t.clientX;
        sy = t.clientY;
        tracking = true;
      },
      { passive: true },
    );
    el.addEventListener(
      "touchmove",
      (e) => {
        if (!tracking) return;
        const t = e.touches[0];
        const dx = t.clientX - sx,
          dy = t.clientY - sy;
        if (Math.hypot(dx, dy) < 24) return;
        tracking = false;
        if (Math.abs(dx) > Math.abs(dy)) push(dx > 0 ? "right" : "left");
        else push(dy > 0 ? "down" : "up");
      },
      { passive: true },
    );
    el.addEventListener(
      "touchend",
      () => {
        tracking = false;
      },
      { passive: true },
    );
  }

  // Tombol D-pad
  function attachButtons(root) {
    root.querySelectorAll(".dpad").forEach((btn) => {
      const dir = btn.dataset.dir;
      const fire = (e) => {
        e.preventDefault();
        push(dir);
      };
      btn.addEventListener("touchstart", fire, { passive: false });
      btn.addEventListener("mousedown", fire);
    });
  }

  return { push, consume, clear, setEnabled, attachSwipe, attachButtons };
})();