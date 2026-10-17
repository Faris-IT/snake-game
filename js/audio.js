(function (M) {
  // Efek suara dibuat langsung dengan Web Audio API; tidak ada file audio.
  var ctx = null, enabled = true;

  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay, slideTo) {
    var c = ac();
    if (!c) return;
    var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || .05, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + .02);
  }

  var SOUNDS = {
    click: function () { tone(440, .04, 'sine', .03); },
    eat:   function () { tone(520, .09, 'square', .03, 0, 880); },
    item:  function () { tone(700, .08, 'triangle', .05); tone(1000, .12, 'triangle', .05, .08); },
    hit:   function () { tone(180, .25, 'sawtooth', .05, 0, 60); },
    win:   function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .16, 'triangle', .05, i * .12); }); },
    over:  function () { tone(330, .5, 'sawtooth', .05, 0, 90); }
  };

  M.audio = {
    setEnabled: function (b) { enabled = !!b; },
    isEnabled: function () { return enabled; },
    play: function (name) {
      if (!enabled || !SOUNDS[name]) return;
      try { SOUNDS[name](); } catch (e) {}
    }
  };
})(window.Mufa = window.Mufa || {});
