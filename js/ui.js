(function (M) {
  var $ = function (id) { return document.getElementById(id); };
  var t = function () { return M.i18n.t.apply(null, arguments); };
  var MODES = {};
  M.config.modes.forEach(function (m) { MODES[m.id] = m; });
  var selMode, selDiff, lastScore = 0, openerBtn = null, panelKind = null, resetTimer = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function setText(node, v) { v = String(v); if (node.textContent !== v) node.textContent = v; }
  function btn(text, cls, fn) {
    var b = el('button', 'btn ' + (cls || ''), text);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }
  function hearts(n, max) { n = Math.max(0, n); return '♥'.repeat(n) + '♡'.repeat(max - n); }

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('active', s.id === 'screen-' + name);
    });
  }

  /* ---------- tema & pengaturan ---------- */
  function themeById(id) {
    return M.config.themes.filter(function (x) { return x.id === id; })[0] || M.config.themes[0];
  }
  function themeUnlocked(th) { return !th.unlock || M.storage.isUnlocked(th.unlock); }

  function applyTheme(id) {
    var th = themeById(id);
    if (!themeUnlocked(th)) th = M.config.themes[0];
    var root = document.documentElement;
    Object.keys(th.vars).forEach(function (k) { root.style.setProperty(k, th.vars[k]); });
    M.renderer.setTheme(th.canvas);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th.vars['--bg']);
  }

  function applySettings() {
    M.audio.setEnabled(M.storage.getSetting('sound') !== false);
    document.body.dataset.dpad = M.storage.getSetting('dpad') || 'auto';
    applyTheme(M.storage.getSetting('theme'));
  }

  /* ---------- menu ---------- */
  function buildMenu() {
    var dg = $('difficulty'); dg.innerHTML = '';
    Object.keys(M.config.difficulties).forEach(function (k) {
      var b = btn(M.config.difficulties[k].label, 'chip', function () {
        selDiff = k; M.storage.setSetting('difficulty', k); refreshMenu();
      });
      b.dataset.key = k; dg.appendChild(b);
    });
    var mg = $('mode-grid'); mg.innerHTML = '';
    M.config.modes.forEach(function (m) {
      var ok = !!M.modes[m.id];
      var b = el('button', 'mode-card'); b.type = 'button'; b.dataset.id = m.id; b.disabled = !ok;
      b.appendChild(el('b', '', m.name));
      b.appendChild(el('small', '', m.desc));
      b.appendChild(el('span', 'badge' + (ok ? '' : ' soon'), ok ? '' : t('menu.soon')));
      b.addEventListener('click', function () {
        selMode = m.id; M.storage.setSetting('mode', m.id); refreshMenu();
      });
      mg.appendChild(b);
    });
    refreshMenu();
  }

  function refreshMenu() {
    document.querySelectorAll('#difficulty .chip').forEach(function (c) {
      c.classList.toggle('selected', c.dataset.key === selDiff);
    });
    document.querySelectorAll('.mode-card').forEach(function (c) {
      c.classList.toggle('selected', c.dataset.id === selMode);
      if (!c.disabled) {
        var best = M.storage.getBest(c.dataset.id, selDiff);
        c.querySelector('.badge').textContent = best ? '★ ' + best : '';
      }
    });
  }

  /* ---------- panel ---------- */
  var TITLES = { stats: 'stats.title', ach: 'ach.title', settings: 'set.title', help: 'help.title' };

  function openPanel(kind, opener) {
    panelKind = kind; openerBtn = opener || null;
    $('panel').classList.remove('hidden');
    renderPanel();
    $('panel-close').focus();
  }
  function closePanel() {
    $('panel').classList.add('hidden');
    panelKind = null;
    clearTimeout(resetTimer);
    if (openerBtn) openerBtn.focus();
  }
  function panelOpen() { return !$('panel').classList.contains('hidden'); }

  function renderPanel() {
    var body = $('panel-body'), sc = body.scrollTop;
    body.innerHTML = '';
    setText($('panel-title'), t(TITLES[panelKind]));
    ({ stats: statsPanel, ach: achPanel, settings: settingsPanel, help: helpPanel })[panelKind](body);
    body.scrollTop = sc;
  }

  function statsPanel(body) {
    var st = M.storage.getStats(), fav = '—', max = 0;
    Object.keys(st.byMode).forEach(function (k) {
      if (MODES[k] && st.byMode[k] > max) { max = st.byMode[k]; fav = MODES[k].name; }
    });
    var g = el('div', 'stat-grid');
    [[t('stats.games'), st.games], [t('stats.snacks'), st.snacks], [t('stats.wins'), st.wins], [t('stats.favorite'), fav]]
      .forEach(function (p) {
        var c = el('div', 'stat-card'); c.appendChild(el('span', '', p[0])); c.appendChild(el('b', '', p[1])); g.appendChild(c);
      });
    body.appendChild(g);
    body.appendChild(el('h3', 'sub-title', t('stats.records')));

    var keys = Object.keys(M.config.difficulties), wrap = el('div', 'tbl-wrap'), tb = el('table', 'tbl');
    var hr = el('tr');
    [t('stats.mode')].concat(keys.map(function (k) { return M.config.difficulties[k].label; }), [t('stats.sessions')])
      .forEach(function (h) { hr.appendChild(el('th', '', h)); });
    tb.appendChild(hr);
    M.config.modes.forEach(function (m) {
      var r = el('tr'); r.appendChild(el('td', '', m.name));
      keys.forEach(function (k) { var b = M.storage.getBest(m.id, k); r.appendChild(el('td', '', b || '—')); });
      r.appendChild(el('td', '', st.byMode[m.id] || 0));
      tb.appendChild(r);
    });
    wrap.appendChild(tb); body.appendChild(wrap);
  }

  function achPanel(body) {
    var list = M.achievements.list, n = list.filter(function (a) { return M.storage.isUnlocked(a.id); }).length;
    body.appendChild(el('p', 'note', t('ach.progress', { n: n, total: list.length })));
    list.forEach(function (a) {
      var done = M.storage.isUnlocked(a.id), row = el('div', 'ach ' + (done ? 'done' : 'locked'));
      row.appendChild(el('span', 'ach-mark', done ? '✓' : '•'));
      var txt = el('div'); txt.appendChild(el('b', '', a.name)); txt.appendChild(el('small', '', a.desc));
      row.appendChild(txt); body.appendChild(row);
    });
  }

  function seg(opts, cur, pick) {
    var d = el('div', 'seg');
    opts.forEach(function (o) {
      var b = btn(o.label, o.value === cur ? 'on' : '', function () { pick(o.value); });
      b.disabled = !!o.disabled;
      d.appendChild(b);
    });
    return d;
  }
  function row(label, ctrl) {
    var r = el('div', 'row'); r.appendChild(el('span', 'row-label', label)); r.appendChild(ctrl); return r;
  }

  function settingsPanel(body) {
    body.appendChild(row(t('set.sound'), seg(
      [{ value: 'on', label: t('set.on') }, { value: 'off', label: t('set.off') }],
      M.storage.getSetting('sound') !== false ? 'on' : 'off',
      function (v) { M.storage.setSetting('sound', v === 'on'); applySettings(); renderPanel(); })));

    var curTheme = M.storage.getSetting('theme');
    body.appendChild(row(t('set.theme'), seg(
      M.config.themes.map(function (th) {
        return { value: th.id, label: th.label + (themeUnlocked(th) ? '' : ' (' + t('set.locked') + ')'), disabled: !themeUnlocked(th) };
      }), curTheme,
      function (v) { M.storage.setSetting('theme', v); applySettings(); renderPanel(); })));
    M.config.themes.forEach(function (th) {
      if (themeUnlocked(th)) return;
      body.appendChild(el('p', 'note', t('set.themeLocked', { theme: th.label, name: M.achievements.byId(th.unlock).name })));
    });

    body.appendChild(row(t('set.dpad'), seg(
      [{ value: 'auto', label: t('set.auto') }, { value: 'on', label: t('set.on') }, { value: 'off', label: t('set.off') }],
      M.storage.getSetting('dpad') || 'auto',
      function (v) { M.storage.setSetting('dpad', v); applySettings(); renderPanel(); })));

    var langs = M.i18n.languages().map(function (l) { return { value: l.id, label: l.label }; });
    if (!langs.some(function (l) { return l.value === 'en'; }))
      langs.push({ value: 'en', label: 'English (' + t('menu.soon') + ')', disabled: true });
    body.appendChild(row(t('set.lang'), seg(langs, M.i18n.getLang(), function (v) {
      M.i18n.setLang(v); M.storage.setSetting('lang', v);
      M.i18n.applyStatic(); buildMenu(); renderPanel();
    })));

    var ctl = el('div'); ctl.appendChild(el('p', 'note', t('set.controlsText')));
    body.appendChild(ctl);

    var reset = btn(t('set.reset'), 'warn', function () {
      if (reset.dataset.armed) {
        M.storage.reset(); selMode = 'classic'; selDiff = 'normal';
        applySettings(); refreshMenu(); renderPanel();
      } else {
        reset.dataset.armed = '1'; reset.textContent = t('set.resetConfirm');
        resetTimer = setTimeout(function () { delete reset.dataset.armed; reset.textContent = t('set.reset'); }, 3000);
      }
    });
    var rr = el('div', 'row'); rr.appendChild(reset); body.appendChild(rr);
  }

  function helpPanel(body) {
    var h = el('div', 'help');
    h.appendChild(el('p', '', t('help.goal')));
    h.appendChild(el('h3', '', t('help.kbTitle'))); h.appendChild(el('p', '', t('help.keyboard')));
    h.appendChild(el('h3', '', t('help.touchTitle'))); h.appendChild(el('p', '', t('help.touch')));
    h.appendChild(el('h3', '', t('help.modesTitle')));
    var ul = el('ul');
    M.config.modes.forEach(function (m) {
      var li = el('li'); li.appendChild(el('b', '', m.name + ' — ')); li.appendChild(el('small', '', m.desc)); ul.appendChild(li);
    });
    h.appendChild(ul); body.appendChild(h);
  }

  /* ---------- permainan ---------- */
  function startGame() {
    showScreen('game');
    var wrap = $('arena-wrap'), c = M.config;
    var target = window.innerWidth < 600 ? c.cellTarget.mobile : c.cellTarget.desktop;
    var clamp = function (v) { return Math.max(c.gridMin, Math.min(c.gridMax, v)); };
    var cols = clamp(Math.floor(wrap.clientWidth / target)), rows = clamp(Math.floor(wrap.clientHeight / target));
    M.renderer.resize(wrap, cols, rows);
    lastScore = 0;
    M.engine.start(selMode, selDiff, cols, rows);
  }

  function backToMenu() { M.engine.stop(); showScreen('menu'); refreshMenu(); }

  function hud(s) {
    setText($('hud-score'), s.score);
    setText($('hud-best'), Math.max(s.best, s.score));
    var items = s.mode.getObjective(s), box = $('hud-extra');
    if (!Array.isArray(items)) items = [items];
    while (box.children.length < items.length) {
      var d = el('div', 'hud-item'); d.appendChild(el('span', 'label')); d.appendChild(el('b'));
      box.appendChild(d);
    }
    while (box.children.length > items.length) box.lastChild.remove();
    items.forEach(function (it, i) {
      setText(box.children[i].firstChild, it.label);
      setText(box.children[i].lastChild, it.value);
    });
    if (s.score !== lastScore) {
      lastScore = s.score;
      var e = $('hud-score'); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump');
    }
    setText($('btn-pause'), t(s.state === 'paused' ? 'hud.resume' : 'hud.pause'));
  }

  function overlay(s) {
    var ov = $('overlay'), a = $('ov-actions');
    a.innerHTML = '';
    ov.classList.remove('danger', 'win');
    if (s.state === 'playing') { ov.classList.add('hidden'); return; }
    ov.classList.remove('hidden');
    if (s.state === 'ready') {
      setText($('ov-title'), s.readyTitle || t('ov.ready'));
      setText($('ov-text'), (s.readyText ? s.readyText + ' ' : '') + t('ov.readyHint'));
    } else if (s.state === 'paused') {
      setText($('ov-title'), t('ov.paused'));
      setText($('ov-text'), t('ov.pausedText'));
      a.appendChild(btn(t('ov.resume'), 'primary', function () { M.engine.resume(); }));
      a.appendChild(btn(t('ov.restart'), '', function () { M.engine.restart(); }));
      a.appendChild(btn(t('ov.menu'), '', backToMenu));
    } else {
      var win = s.state === 'victory';
      ov.classList.add(win ? 'win' : 'danger');
      setText($('ov-title'), s.endTitle || t(win ? 'ov.victory' : 'ov.gameOver'));
      var lines = [
        t('ov.scoreLine', { score: s.score, best: s.best }) + (s.newBest ? t('ov.newBest') : ''),
        t('ov.sessionLine', { snacks: s.eaten, time: M.scoring.formatTime(s.timeMs) })
      ];
      (s.unlocked || []).forEach(function (id) {
        lines.push('★ ' + t('ov.achievement', { name: M.achievements.byId(id).name }));
        M.config.themes.forEach(function (th) { if (th.unlock === id) lines.push(t('ov.themeUnlocked', { name: th.label })); });
      });
      setText($('ov-text'), lines.join('\n'));
      a.appendChild(btn(t('ov.playAgain'), 'primary', function () { M.engine.restart(); }));
      a.appendChild(btn(t('ov.chooseMode'), '', backToMenu));
    }
  }

  function shake() {
    var box = document.querySelector('.arena-box');
    box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
  }

  M.ui = {
    init: function () {
      M.i18n.setLang(M.storage.getSetting('lang'));
      selMode = M.storage.getSetting('mode'); selDiff = M.storage.getSetting('difficulty');
      if (!M.modes[selMode]) selMode = 'classic';
      if (!M.config.difficulties[selDiff]) selDiff = 'normal';
      applySettings();
      M.i18n.applyStatic();
      buildMenu();
      $('btn-play').addEventListener('click', startGame);
      $('btn-pause').addEventListener('click', function () { M.engine.togglePause(); });
      $('btn-restart').addEventListener('click', function () { M.engine.restart(); });
      $('btn-menu').addEventListener('click', backToMenu);
      [['btn-stats', 'stats'], ['btn-ach', 'ach'], ['btn-settings', 'settings'], ['btn-help', 'help']].forEach(function (p) {
        $(p[0]).addEventListener('click', function () { openPanel(p[1], $(p[0])); });
      });
      $('panel-close').addEventListener('click', closePanel);
      $('panel').addEventListener('click', function (e) { if (e.target === $('panel')) closePanel(); });
      document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('button')) M.audio.play('click');
      });
    },
    onState: function (s) { hud(s); overlay(s); },
    onUpdate: hud,
    onEvent: function (name) {
      if (name === 'eat' || name === 'item') M.audio.play(name);
      else if (name === 'hit') { M.audio.play('hit'); shake(); }
      else if (name === 'win') M.audio.play('win');
      else if (name === 'over') { M.audio.play('over'); shake(); }
    },
    handleEsc: function () {
      if (panelOpen()) closePanel(); else M.engine.pause();
    },
    onResize: function () {
      var s = M.engine.getSession();
      if (s) M.renderer.resize($('arena-wrap'), s.cols, s.rows);
    }
  };
})(window.Mufa = window.Mufa || {});
