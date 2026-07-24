/* ==========================================================================
   BNIIINE — Merge game logic
   Splash → tutorial → merge board with juice: audio, haptics, XP, achievements,
   undo, long-press sell, chef reactions, settings. Vanilla, localStorage-saved.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- DATA ----------

  const CHAINS = {
    spice: [
      { key: 'cumin',        name: 'Cumin Seed',      icon: '#i-cumin',        arabic: 'كمّون' },
      { key: 'ras',          name: 'Ras el Hanout',   icon: '#i-ras',          arabic: 'راس الحانوت' },
      { key: 'harissa',      name: 'Harissa Jar',     icon: '#i-harissa',      arabic: 'هريسة' },
      { key: 'spiceChest',   name: 'Spice Chest',     icon: '#i-spice-chest',  arabic: 'صندوق البهارات' },
      { key: 'grandMasala',  name: 'Grand Masala',    icon: '#i-grand-masala', arabic: 'ملك التوابل' },
    ],
    grain: [
      { key: 'wheat',         name: 'Wheat Grain',       icon: '#i-wheat',           arabic: 'قمح' },
      { key: 'semolina',      name: 'Semolina',          icon: '#i-semolina',        arabic: 'سميدة' },
      { key: 'couscous',      name: 'Fresh Couscous',    icon: '#i-couscous',        arabic: 'كسكس' },
      { key: 'royalCouscous', name: 'Royal Couscous',    icon: '#i-royal-couscous',  arabic: 'كسكس ملكي' },
      { key: 'berberFeast',   name: 'Berber Feast',      icon: '#i-berber-feast',    arabic: 'وليمة بربرية' },
    ],
    meat: [
      { key: 'chicken',       name: 'Farm Chicken',      icon: '#i-chicken',         arabic: 'دجاج' },
      { key: 'kefta',         name: 'Kefta Skewer',      icon: '#i-kefta',           arabic: 'كفتة' },
      { key: 'merguez',       name: 'Merguez Sausage',   icon: '#i-merguez',         arabic: 'مرقاز' },
      { key: 'tagineChicken', name: 'Chicken Tagine',    icon: '#i-tagine-chicken',  arabic: 'طاجين دجاج' },
      { key: 'lambTagine',    name: 'Grand Lamb Tagine', icon: '#i-lamb-tagine',     arabic: 'طاجين حمل' },
    ],
  };

  const CHAIN_KEYS = Object.keys(CHAINS);
  const MAX_TIER   = CHAINS.spice.length;
  const REWARD = { 1: 3, 2: 8, 3: 20, 4: 50, 5: 140 };
  const XP_FOR_MERGE = { 2: 5, 3: 15, 4: 40, 5: 100 };
  const SELL_PRICE = { 1: 1, 2: 3, 3: 8, 4: 20, 5: 60 };
  const CRATE_COST = 25;
  const FREE_CRATE_INTERVAL_MS = 60 * 1000;
  const START_COINS = 120;
  const DAILY_COINS = 50;
  const BOARD_COLS = 5;
  const BOARD_ROWS = 6;
  const LONG_PRESS_MS = 600;

  const LEVEL_TITLES = [
    'Kitchen Apprentice',
    'Souk Trader',
    'Riad Cook',
    'Kasbah Chef',
    'Master of the Tagine',
    'Emir of Spices',
    'Grand Vizier of Cuisine',
    'Sultan of the Souk',
    'Culinary Emperor',
    'Legend of Marrakech',
  ];

  // Total XP required to reach level n+1 from level 1
  function totalXpForLevel(n) { return 50 * n * (n + 1); }

  const CHEF_LINES_IDLE = [
    'Ahlan wa sahlan! Welcome to my kitchen.',
    'Merge two cumin seeds — that is the beginning of everything.',
    'The souk hides three surprises in every spice crate.',
    'A tap on an order, then on a matching dish — the customer smiles.',
    'From Marrakech to Tunis, we spread the fragrance.',
    'Bismillah — let us cook something legendary today.',
    'The zellige floor loves a busy board. Don\'t let it stall.',
    'A tile you don\'t need? Hold it, and it becomes coins.',
    'A grand tagine needs patience. Merge, and merge again.',
  ];

  const CHEF_MERGE_LINES = {
    spice: {
      2: ['Ras el hanout — the shopkeeper\'s secret blend.', 'Now it smells like Fes.'],
      3: ['Harissa! Careful, my friend, this jar bites back.', 'A little heat wakes the whole dish.'],
      4: ['The spice chest opens. Wonders inside.', 'This is what the caravans brought from Timbuktu.'],
      5: ['✨ GRAND MASALA — you are royalty of the souk!', 'The sultans wept when they tasted this.'],
    },
    grain: {
      2: ['Semolina — fine as desert sand.', 'The Berbers taught us this.'],
      3: ['Fresh couscous! The steam alone is a prayer.', 'Fluffy, golden, ready.'],
      4: ['Royal couscous — the guests will not stop bowing.', 'This is Friday-in-the-riad food.'],
      5: ['✨ BERBER FEAST — three tiers, one legend!', 'Whole villages come for this.'],
    },
    meat: {
      2: ['Kefta on the skewer — the coals are ready.', 'Cumin, parsley, love.'],
      3: ['Merguez! You can hear the sizzle from here.', 'A little dangerous. A lot delicious.'],
      4: ['Chicken tagine — preserved lemon sings.', 'Now the neighbors will visit.'],
      5: ['✨ GRAND LAMB TAGINE — feast of Eid!', 'Slow-cooked with prunes and honor.'],
    },
  };

  const CHEF_ORDER_LINES = [
    'Excellent! The customer devoured every bite.',
    'They tipped and asked when we open the second riad.',
    'Alhamdulillah — another happy stomach.',
    'The grandmother said it reminded her of her mother\'s kitchen.',
  ];

  const CHEF_CRATE_LINES = [
    'Fresh spices, straight from the souk!',
    'Bismillah — let\'s see what the crate brought us.',
    'The caravan just arrived. Look at these colors.',
  ];

  const CHEF_LEVELUP_LINES = [
    'You have earned a new title! The souk speaks your name.',
    'The Sultan\'s emissary is asking after you.',
    'This kitchen has become a school. Everyone is watching.',
  ];

  const ACHIEVEMENTS = [
    { key: 'firstMerge',    name: 'First Merge',         desc: 'Combine two ingredients.',           icon: '#i-sparkle',  check: s => s.stats.merges >= 1 },
    { key: 'discovery5',    name: 'Souk Regular',         desc: 'Discover 5 dishes.',                 icon: '#i-book',     check: s => discoveredCount() >= 5 },
    { key: 'discovery10',   name: 'Well-Read Cook',       desc: 'Discover 10 dishes.',                icon: '#i-book',     check: s => discoveredCount() >= 10 },
    { key: 'discoveryAll',  name: 'Grand Master',         desc: 'Discover every dish in the book.',   icon: '#i-trophy',   check: s => discoveredCount() >= CHAIN_KEYS.length * MAX_TIER },
    { key: 'grandMasala',   name: 'Spice Sultan',         desc: 'Unlock Grand Masala.',               icon: '#i-grand-masala', check: s => s.discovered.spice[MAX_TIER - 1] },
    { key: 'berberFeast',   name: 'Feast of the Ancients',desc: 'Cook the Berber Feast.',             icon: '#i-berber-feast', check: s => s.discovered.grain[MAX_TIER - 1] },
    { key: 'lambTagine',    name: 'Emir of Tagine',       desc: 'Cook the Grand Lamb Tagine.',        icon: '#i-lamb-tagine',  check: s => s.discovered.meat[MAX_TIER - 1] },
    { key: 'coins500',      name: 'Merchant',             desc: 'Earn 500 coins total.',              icon: '#i-coin',     check: s => s.stats.coinsEarned >= 500 },
    { key: 'orders25',      name: 'Popular Riad',         desc: 'Fulfill 25 orders.',                 icon: '#i-tea',      check: s => s.stats.ordersDone >= 25 },
    { key: 'level5',        name: 'Kasbah Chef',          desc: 'Reach Rank 5.',                      icon: '#i-trophy',   check: s => s.level >= 5 },
    { key: 'sell',          name: 'Merchant\'s Wisdom',    desc: 'Sell a tile for coins.',             icon: '#i-coin',     check: s => s.stats.sold >= 1 },
    { key: 'undo',          name: 'Cook Twice',            desc: 'Use Undo.',                          icon: '#i-undo',     check: s => s.stats.undos >= 1 },
  ];

  // ---------- STATE ----------

  const STATE_KEY = 'bniiine.state.v2';
  const state = {
    coins: START_COINS,
    xp: 0,
    level: 1,
    board: makeEmptyBoard(),
    orders: [],
    discovered: Object.fromEntries(CHAIN_KEYS.map(c => [c, new Array(MAX_TIER).fill(false)])),
    achievements: {},
    nextFreeCrate: Date.now() + FREE_CRATE_INTERVAL_MS,
    stats: { merges: 0, ordersDone: 0, coinsEarned: 0, sold: 0, undos: 0, sessions: 0, crateOpens: 0 },
    settings: { sfx: true, music: false, haptics: true, motion: false, hiContrast: false, tutorialDone: false },
    lastDailyClaim: null,
    challenge: null,   // { day: 'YYYY-M-D', key, progress, done }
  };

  function makeEmptyBoard() {
    const b = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const row = [];
      for (let c = 0; c < BOARD_COLS; c++) row.push(null);
      b.push(row);
    }
    return b;
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        coins: state.coins,
        xp: state.xp,
        level: state.level,
        board: state.board,
        orders: state.orders,
        discovered: state.discovered,
        achievements: state.achievements,
        nextFreeCrate: state.nextFreeCrate,
        stats: state.stats,
        settings: state.settings,
        lastDailyClaim: state.lastDailyClaim,
        challenge: state.challenge,
      }));
    } catch (_) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.board)) return false;
      // shallow merge; keep defaults for anything missing (future settings)
      Object.keys(s).forEach(k => { state[k] = s[k]; });
      state.settings = Object.assign({ sfx: true, music: false, haptics: true, motion: false, hiContrast: false, tutorialDone: false }, s.settings || {});
      state.stats    = Object.assign({ merges: 0, ordersDone: 0, coinsEarned: 0, sold: 0, undos: 0, sessions: 0, crateOpens: 0 }, s.stats || {});
      state.achievements = s.achievements || {};
      if (!Array.isArray(state.orders)) state.orders = [];
      // Grid-dimension migration: if a returning player saved a board with
      // different dimensions, discard just the board and reseed with the
      // current constants — keeps coins/XP/rank/discoveries intact.
      const savedRows = state.board.length;
      const savedCols = state.board[0] ? state.board[0].length : 0;
      if (savedRows !== BOARD_ROWS || savedCols !== BOARD_COLS) {
        state.board = makeEmptyBoard();
        seedInitialBoard();
      }
      return true;
    } catch (_) { return false; }
  }

  // ---------- UTIL ----------

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  function rand(n) { return Math.floor(Math.random() * n); }
  function choice(arr) { return arr[rand(arr.length)]; }
  function chainDef(chain, tier) { return CHAINS[chain][tier - 1]; }
  function isBoardFull() {
    for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) if (!state.board[r][c]) return false;
    return true;
  }
  function findEmptyCells() {
    const e = [];
    for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) if (!state.board[r][c]) e.push([r, c]);
    return e;
  }
  function discoveredCount() {
    let n = 0;
    CHAIN_KEYS.forEach(k => state.discovered[k].forEach(v => { if (v) n++; }));
    return n;
  }

  // ==========================================================================
  // AUDIO ENGINE (WebAudio synth — no assets)
  // ==========================================================================
  const AudioFX = (function () {
    let ctx = null;
    let musicNodes = null;

    function ensureCtx() {
      if (ctx) return ctx;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
      return ctx;
    }

    function tone(freq, dur, type = 'sine', gain = 0.1, delay = 0) {
      if (!ctx) return;
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }

    function noise(dur, gain = 0.05, filterFreq = 800) {
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufLen = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = filterFreq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(filt).connect(g).connect(ctx.destination);
      src.start();
    }

    return {
      resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
      init: ensureCtx,
      tap() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(560 + Math.random() * 140, 0.035, 'square', 0.06);
      },
      click() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(1050, 0.025, 'square', 0.08);
        tone(1600, 0.04, 'sine', 0.05, 0.02);
      },
      merge(tier) {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        const base = 260 + tier * 55;
        tone(base,        0.14, 'sine',     0.15);
        tone(base * 1.26, 0.14, 'sine',     0.12, 0.05);
        tone(base * 1.5,  0.18, 'triangle', 0.10, 0.10);
      },
      legendary() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(90,  1.6, 'sine',     0.28);
        tone(180, 1.4, 'sine',     0.18);
        tone(360, 1.2, 'triangle', 0.10);
        tone(540, 1.0, 'sine',     0.06);
        setTimeout(() => tone(800,  0.4, 'sine', 0.08), 380);
        setTimeout(() => tone(1200, 0.3, 'sine', 0.06), 600);
      },
      coin() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(1300, 0.055, 'triangle', 0.12);
        tone(1800, 0.06,  'sine',     0.09, 0.03);
      },
      crate() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        noise(0.4, 0.06, 600);
        setTimeout(() => tone(400, 0.09, 'sawtooth', 0.10), 100);
        setTimeout(() => tone(600, 0.10, 'triangle', 0.10), 260);
        setTimeout(() => tone(900, 0.15, 'sine',     0.12), 400);
      },
      orderDone() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(700,  0.10, 'triangle', 0.14);
        tone(900,  0.12, 'sine',     0.10, 0.08);
        tone(1200, 0.14, 'sine',     0.08, 0.16);
      },
      error() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(200, 0.12, 'sawtooth', 0.10);
        tone(150, 0.15, 'sawtooth', 0.08, 0.08);
      },
      levelUp() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        [392, 494, 587, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.15, i * 0.12));
        tone(587, 0.6, 'sine', 0.08, 0.48);
      },
      sell() {
        if (!state.settings.sfx) return;
        ensureCtx(); if (!ctx) return;
        tone(500, 0.06, 'triangle', 0.10);
        tone(1200, 0.08, 'sine', 0.10, 0.04);
      },
      startMusic() {
        if (!state.settings.music) return;
        ensureCtx();
        if (!ctx || musicNodes) return;
        // Middle-Eastern-flavored ambient drone (D + Bb harmonic minor colors)
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 3);
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 700;
        master.connect(filt).connect(ctx.destination);
        const oscs = [];
        [146.83, 220.00, 261.63, 349.23].forEach(f => {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = f;
          o.detune.value = Math.random() * 10 - 5;
          o.connect(master);
          o.start();
          oscs.push(o);
        });
        // slow LFO on filter
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain).connect(filt.frequency);
        lfo.start();
        musicNodes = { master, oscs, filt, lfo };
      },
      stopMusic() {
        if (!musicNodes || !ctx) return;
        const now = ctx.currentTime;
        musicNodes.master.gain.linearRampToValueAtTime(0, now + 1);
        const nodes = musicNodes;
        musicNodes = null;
        setTimeout(() => {
          nodes.oscs.forEach(o => { try { o.stop(); } catch (_) {} });
          try { nodes.lfo.stop(); } catch (_) {}
        }, 1200);
      },
    };
  })();

  // ==========================================================================
  // HAPTICS
  // ==========================================================================
  const Haptics = {
    tap()       { if (state.settings.haptics && navigator.vibrate) navigator.vibrate(6); },
    merge()     { if (state.settings.haptics && navigator.vibrate) navigator.vibrate([12, 18, 12]); },
    legendary() { if (state.settings.haptics && navigator.vibrate) navigator.vibrate([25, 30, 60, 30, 100]); },
    error()     { if (state.settings.haptics && navigator.vibrate) navigator.vibrate([10, 30, 10]); },
    sell()      { if (state.settings.haptics && navigator.vibrate) navigator.vibrate(20); },
    levelUp()   { if (state.settings.haptics && navigator.vibrate) navigator.vibrate([15, 20, 15, 20, 60]); },
  };

  // ==========================================================================
  // COMBO — merges within 3s stack a multiplier
  // ==========================================================================
  const COMBO_WINDOW_MS = 3000;
  const combo = { count: 0, timer: null };

  function bumpCombo() {
    combo.count += 1;
    clearTimeout(combo.timer);
    combo.timer = setTimeout(() => {
      if (combo.count >= 2) showComboEnd(combo.count);
      combo.count = 0;
    }, COMBO_WINDOW_MS);
    if (combo.count >= 2) {
      showComboFlash(combo.count);
      pulseBoard();
    }
  }

  function comboMultiplier() {
    if (combo.count >= 5) return 3;
    if (combo.count >= 4) return 2.5;
    if (combo.count >= 3) return 2;
    if (combo.count >= 2) return 1.5;
    return 1;
  }

  function showComboFlash(n) {
    const el = document.createElement('div');
    el.className = 'combo' + (n >= 4 ? ' combo--big' : '');
    el.textContent = `COMBO ×${n}!`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
    if (n >= 4) AudioFX.legendary();
    else AudioFX.merge(n);
  }

  function showComboEnd(n) {
    if (n < 3) return;
    const el = document.createElement('div');
    el.className = 'combo combo--big';
    el.textContent = `+${n} CHAIN!`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function pulseBoard() {
    const frame = document.querySelector('.board-frame');
    if (!frame) return;
    frame.classList.remove('is-combo');
    void frame.offsetWidth;
    frame.classList.add('is-combo');
    setTimeout(() => frame.classList.remove('is-combo'), 900);
  }

  // ==========================================================================
  // CHEF LIFE — blink, eye tracking, wave, cheer, wipe, shrug
  // ==========================================================================
  const Chef = (function () {
    let fig = null, faceImg = null, faceSrc = null;
    let idleTimer = null;
    let holdTimer = null;

    const FACES = {
      idle:       'mascot-karim-idle',
      cheer:      'mascot-karim-cheer',
      wipe:       'mascot-karim-wipe',
      thoughtful: 'mascot-karim-thoughtful',
    };

    // Preload all 4 face images so state changes are instant
    Object.values(FACES).forEach(base => {
      const w = new Image(); w.src = `assets/${base}.webp`;
      const p = new Image(); p.src = `assets/${base}.png`;
    });

    function setFace(name, holdMs) {
      if (!faceImg) return;
      const base = FACES[name] || FACES.idle;
      faceImg.src = `assets/${base}.png`;
      if (faceSrc) faceSrc.srcset = `assets/${base}.webp`;
      fig && fig.classList.add('is-swap');
      setTimeout(() => fig && fig.classList.remove('is-swap'), 220);
      clearTimeout(holdTimer);
      if (holdMs && name !== 'idle') {
        holdTimer = setTimeout(() => setFace('idle'), holdMs);
      }
    }

    function scheduleIdle() {
      clearTimeout(idleTimer);
      const next = 12000 + Math.random() * 10000;
      idleTimer = setTimeout(() => {
        if (Math.random() < 0.5) shrug();
        scheduleIdle();
      }, next);
    }

    // Public API — same names as before so no other code changes
    function blink() { /* covered by face-swap; no-op kept for callers */ }
    function wave()  { /* the idle face already shows a warm wave; no-op */ }
    function cheer() { setFace('cheer', 1600); }
    function wipe()  { setFace('wipe',  1600); }
    function shrug() { setFace('thoughtful', 1600); }

    function init() {
      fig     = $('#chefFigure');
      faceImg = $('#chefFaceImg');
      faceSrc = $('#chefFaceSrc');
      if (!fig) return;
      scheduleIdle();
    }

    return { init, blink, wave, cheer, wipe, shrug, setFace };
  })();

  // ==========================================================================
  // POWERUPS
  // ==========================================================================
  const POWERUPS = [
    { key: 'hint',    name: 'Chef\'s Hint',    desc: 'Highlight the best merge on the board for 4 seconds.', icon: '#i-sparkle',      cost: 25,  cooldown: 20 },
    { key: 'crate',   name: 'Instant Crate',   desc: 'Open a spice crate right now (bypasses the free timer).', icon: '#i-crate-closed', cost: 50,  cooldown: 45 },
    { key: 'compact', name: 'Compact Board',   desc: 'Slide every tile toward the top-left to free space.',  icon: '#i-book',          cost: 60,  cooldown: 30 },
    { key: 'wild',    name: 'Wildcard Spice',  desc: 'Spawn three random tier-2 ingredients on empty cells.',icon: '#i-grand-masala',  cost: 100, cooldown: 60 },
  ];

  const powerupCd = Object.fromEntries(POWERUPS.map(p => [p.key, 0]));

  function renderPowerups() {
    const holder = $('#powerups');
    if (!holder) return;
    holder.innerHTML = '';
    const now = Date.now();
    POWERUPS.forEach(p => {
      const remaining = Math.max(0, Math.ceil((powerupCd[p.key] - now) / 1000));
      const disabled = state.coins < p.cost || remaining > 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'powerup' + (remaining > 0 ? ' is-cooling' : '');
      btn.disabled = disabled;
      btn.innerHTML = `
        <span class="powerup__icon"><svg viewBox="0 0 64 64"><use href="${p.icon}"/></svg></span>
        <span class="powerup__name">${p.name}</span>
        <span class="powerup__desc">${p.desc}</span>
        <span class="powerup__cost"><svg viewBox="0 0 64 64"><use href="#i-coin"/></svg>${p.cost}</span>
        ${remaining > 0 ? `<span class="powerup__cd">${remaining}s</span>` : ''}
      `;
      btn.addEventListener('click', () => usePowerup(p.key));
      holder.appendChild(btn);
    });
  }

  function usePowerup(key) {
    const p = POWERUPS.find(x => x.key === key);
    if (!p) return;
    const now = Date.now();
    if (powerupCd[key] > now) return;
    if (state.coins < p.cost) {
      AudioFX.error(); Haptics.error();
      showToast('Not enough coins.', 'warn');
      return;
    }
    state.coins -= p.cost;
    powerupCd[key] = now + p.cooldown * 1000;
    AudioFX.click(); Haptics.tap();
    applyPowerup(key);
    updateHUD();
    renderPowerups();
    saveState();
  }

  function applyPowerup(key) {
    if (key === 'hint') {
      const pair = findBestMerge();
      if (!pair) { showToast('No merge available.', 'warn'); return; }
      const a = tileAt(pair.a.r, pair.a.c);
      const b = tileAt(pair.b.r, pair.b.c);
      [a, b].forEach(t => { if (t) { t.classList.add('reveal-highlight'); setTimeout(() => t.classList.remove('reveal-highlight'), 4000); } });
      setStatus('Chef\'s hint: try merging these two.');
    } else if (key === 'crate') {
      state.nextFreeCrate = 0;
      openCrate(true);
    } else if (key === 'compact') {
      compactBoard();
      showToast('Board compacted.', 'info');
    } else if (key === 'wild') {
      let placed = 0;
      for (let i = 0; i < 3; i++) {
        const chain = choice(CHAIN_KEYS);
        if (spawnItem(chain, 2)) placed++;
      }
      showToast(placed ? `Spawned ${placed} tier-2 ingredients!` : 'Board is full.', placed ? 'info' : 'warn');
      setBubble('The spice trader owed me a favor.');
    }
  }

  function findBestMerge() {
    let best = null, bestTier = 0;
    const cellsWith = [];
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (state.board[r][c]) cellsWith.push({ r, c, item: state.board[r][c] });
    for (let i = 0; i < cellsWith.length; i++) {
      for (let j = i + 1; j < cellsWith.length; j++) {
        const A = cellsWith[i], B = cellsWith[j];
        if (A.item.chain === B.item.chain && A.item.tier === B.item.tier && A.item.tier < MAX_TIER) {
          if (A.item.tier > bestTier) { bestTier = A.item.tier; best = { a: A, b: B }; }
        }
      }
    }
    return best;
  }

  function compactBoard() {
    // Move every tile up-left, filling from row 0 column 0
    const items = [];
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (state.board[r][c]) { items.push(state.board[r][c]); state.board[r][c] = null; }
    let idx = 0;
    for (let r = 0; r < BOARD_ROWS && idx < items.length; r++)
      for (let c = 0; c < BOARD_COLS && idx < items.length; c++)
        state.board[r][c] = items[idx++];
    renderBoard();
    saveState();
  }

  // ==========================================================================
  // DAILY CHALLENGE
  // ==========================================================================
  const CHALLENGES = [
    { key: 'serve3',     name: 'Serve 3 orders',           goal: 3,  metric: 'orders' },
    { key: 'merge10',    name: 'Merge 10 times',           goal: 10, metric: 'merges' },
    { key: 'discover2',  name: 'Discover 2 new dishes',    goal: 2,  metric: 'discoveries' },
    { key: 'crates2',    name: 'Open 2 spice crates',      goal: 2,  metric: 'crates' },
    { key: 'coins200',   name: 'Earn 200 coins',           goal: 200,metric: 'coins' },
    { key: 'combo3',     name: 'Chain a Combo ×3',         goal: 3,  metric: 'combo' },
    { key: 'sell5',      name: 'Sell 5 tiles',             goal: 5,  metric: 'sold' },
    { key: 'legendary1', name: 'Cook a legendary dish',    goal: 1,  metric: 'legendary' },
  ];

  const CHALLENGE_REWARD = 250;

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

  function hashToInt(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function ensureChallenge() {
    const t = todayKey();
    if (!state.challenge || state.challenge.day !== t) {
      const idx = hashToInt(t) % CHALLENGES.length;
      const def = CHALLENGES[idx];
      state.challenge = { day: t, key: def.key, progress: 0, done: false };
      saveState();
    }
    renderChallenge();
  }

  function renderChallenge() {
    if (!state.challenge) return;
    const def = CHALLENGES.find(c => c.key === state.challenge.key);
    if (!def) return;
    const nameEl = $('#challengeName');
    const progEl = $('#challengeProgress');
    const fillEl = $('#challengeFill');
    const card   = $('#challengeCard');
    if (!nameEl || !progEl || !fillEl || !card) return;
    nameEl.textContent = def.name;
    const cur = Math.min(state.challenge.progress, def.goal);
    progEl.textContent = `${cur} / ${def.goal}`;
    fillEl.style.right = (100 - (cur / def.goal * 100)) + '%';
    card.classList.toggle('is-done', !!state.challenge.done);
  }

  function tickChallenge(metric, amount = 1) {
    if (!state.challenge || state.challenge.done) return;
    const def = CHALLENGES.find(c => c.key === state.challenge.key);
    if (!def || def.metric !== metric) return;
    state.challenge.progress = Math.min(def.goal, state.challenge.progress + amount);
    if (state.challenge.progress >= def.goal) {
      state.challenge.done = true;
      state.coins += CHALLENGE_REWARD;
      state.stats.coinsEarned += CHALLENGE_REWARD;
      AudioFX.levelUp();
      Haptics.levelUp();
      showToast(`🏆 Daily Challenge — +${CHALLENGE_REWARD} coins!`, 'info');
      setBubble('Daily challenge complete! The souk celebrates you.');
      confettiBurst(window.innerWidth / 2, 150, 40);
      updateHUD();
    }
    renderChallenge();
    saveState();
  }

  // ==========================================================================
  // DOM REFS (grabbed after DOM ready — booted below)
  // ==========================================================================
  let boardEl, coinValEl, unlockedEl, totalCountEl, ordersEl, bookGridEl,
      bubbleEl, statusEl, toastsEl, freeCrateBtn, freeCrateLbl,
      crateModal, crateReveal, crateItems, crateContinue,
      bookModal, bookBtn, bookClose, crateBtn,
      levelBar, levelNum, levelFill, levelTitleEl, xpVal, xpMax,
      undoBtn, settingsBtn, settingsModal, settingsClose,
      achievementsBtn, achievementsModal, achievementsClose, achievementsGrid, statsGrid,
      setSfx, setMusic, setHaptics, setMotion, setHiContrast,
      setTutorialBtn, setResetBtn,
      tutorial, tutorialSpot, tutorialCard, tutorialStep, tutorialTotal,
      tutorialTitle, tutorialBody, tutorialSkip, tutorialNext,
      longPressRing,
      splashEl, splashFill, splashHint, splashParticles,
      shopBtn, shopModal, shopClose;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  let tileIdSeq = 1;

  function makeCell(r, c) {
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.r = String(r);
    el.dataset.c = String(c);
    el.setAttribute('role', 'gridcell');
    el.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}`);
    return el;
  }

  function makeTile(item) {
    const el = document.createElement('button');
    el.className = 'tile is-spawning';
    el.type = 'button';
    el.dataset.chain = item.chain;
    el.dataset.tier  = String(item.tier);
    el.dataset.id    = String(item.id);
    const def = chainDef(item.chain, item.tier);
    el.setAttribute('aria-label', `${def.name}, tier ${item.tier}`);
    el.innerHTML = `
      <svg class="tile__art" viewBox="0 0 64 64" aria-hidden="true"><use href="${def.icon}"/></svg>
      <span class="tile__tier">T${item.tier}</span>
    `;
    return el;
  }

  function tagTile(el, r, c) { el.dataset.r = String(r); el.dataset.c = String(c); }
  function cellAt(r, c) { return boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`); }
  function tileAt(r, c) { return boardEl.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`); }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.setProperty('--board-cols', BOARD_COLS);
    boardEl.style.setProperty('--board-rows', BOARD_ROWS);
    boardEl.style.setProperty('grid-template-columns', `repeat(${BOARD_COLS}, var(--cell))`);
    boardEl.style.setProperty('grid-template-rows',    `repeat(${BOARD_ROWS}, var(--cell))`);
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const cell = makeCell(r, c);
        boardEl.appendChild(cell);
        const item = state.board[r][c];
        if (item) {
          if (!item.id) item.id = tileIdSeq++;
          const tile = makeTile(item);
          tagTile(tile, r, c);
          cell.appendChild(tile);
        }
      }
    }
  }

  function updateHUD() {
    coinValEl.textContent = state.coins;
    unlockedEl.textContent = discoveredCount();
    totalCountEl.textContent = CHAIN_KEYS.length * MAX_TIER;
    // Level bar
    const prevLevelTotal = totalXpForLevel(state.level - 1);
    const nextLevelTotal = totalXpForLevel(state.level);
    const inLevel = state.xp - prevLevelTotal;
    const perLevel = nextLevelTotal - prevLevelTotal;
    const pct = Math.max(0, Math.min(100, (inLevel / perLevel) * 100));
    levelNum.textContent = state.level;
    xpVal.textContent = inLevel;
    xpMax.textContent = perLevel;
    levelTitleEl.textContent = LEVEL_TITLES[Math.min(state.level - 1, LEVEL_TITLES.length - 1)];
    levelFill.style.right = (100 - pct) + '%';
    undoBtn.disabled = undoStack.length === 0;
  }

  function renderOrders() {
    ordersEl.innerHTML = '';
    state.orders.forEach((o, i) => {
      const def = chainDef(o.chain, o.tier);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'order';
      if (activeOrderIdx === i) el.classList.add('is-active');
      el.dataset.idx = String(i);
      el.setAttribute('aria-label', `Order: ${def.name}, tier ${o.tier}, reward ${o.reward}`);
      el.innerHTML = `
        <span class="order__icon"><svg viewBox="0 0 64 64"><use href="${def.icon}"/></svg></span>
        <span class="order__info">
          <span class="order__name">${def.name}</span>
          <span class="order__tier">Tier ${o.tier}</span>
        </span>
        <span class="order__reward">
          <svg viewBox="0 0 64 64"><use href="#i-coin"/></svg>${o.reward}
        </span>
      `;
      el.addEventListener('click', () => { AudioFX.click(); selectOrder(i); });
      ordersEl.appendChild(el);
    });
  }

  function renderBook() {
    bookGridEl.innerHTML = '';
    CHAIN_KEYS.forEach(chain => {
      CHAINS[chain].forEach((def, i) => {
        const tier = i + 1;
        const unlocked = state.discovered[chain][i];
        const card = document.createElement('div');
        card.className = 'book__card' + (unlocked ? '' : ' book__card--locked');
        card.innerHTML = `
          <div class="book__art"><svg viewBox="0 0 64 64"><use href="${def.icon}"/></svg></div>
          <div class="book__name">${unlocked ? def.name : '???'}</div>
          <div class="book__tier">Tier ${tier}</div>
        `;
        bookGridEl.appendChild(card);
      });
    });
  }

  function renderAchievements() {
    achievementsGrid.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const unlocked = !!state.achievements[a.key];
      const el = document.createElement('div');
      el.className = 'achievement ' + (unlocked ? 'achievement--unlocked' : 'achievement--locked');
      el.innerHTML = `
        <div class="achievement__icon">
          <svg viewBox="0 0 64 64"><use href="${unlocked ? a.icon : '#i-lock'}"/></svg>
        </div>
        <div class="achievement__name">${unlocked ? a.name : '???'}</div>
        <div class="achievement__desc">${a.desc}</div>
      `;
      achievementsGrid.appendChild(el);
    });
    // Stats
    const stats = [
      { lbl: 'Rank',        val: state.level },
      { lbl: 'Merges',      val: state.stats.merges },
      { lbl: 'Orders Done', val: state.stats.ordersDone },
      { lbl: 'Coins Earned',val: state.stats.coinsEarned },
      { lbl: 'Crates Opened', val: state.stats.crateOpens },
      { lbl: 'Tiles Sold',  val: state.stats.sold },
    ];
    statsGrid.innerHTML = stats.map(s => `<div class="stat"><span class="stat__val">${s.val}</span><span class="stat__lbl">${s.lbl}</span></div>`).join('');
  }

  // ==========================================================================
  // XP + LEVELS
  // ==========================================================================

  function addXP(amount, sourceRect) {
    state.xp += amount;
    // Level up loop (in case of huge XP jump)
    while (state.xp >= totalXpForLevel(state.level) && state.level < LEVEL_TITLES.length) {
      state.level += 1;
      onLevelUp();
    }
    if (sourceRect) floatText(sourceRect.left + sourceRect.width / 2, sourceRect.top, `+${amount} XP`, 'xp');
    updateHUD();
  }

  function onLevelUp() {
    AudioFX.levelUp();
    Haptics.levelUp();
    levelBar.classList.add('is-levelup');
    setTimeout(() => levelBar.classList.remove('is-levelup'), 1200);
    const title = LEVEL_TITLES[Math.min(state.level - 1, LEVEL_TITLES.length - 1)];
    showToast(`Rank ${state.level} — ${title}!`, 'info');
    setBubble(choice(CHEF_LEVELUP_LINES));
    confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 50);
  }

  // ==========================================================================
  // ACHIEVEMENTS
  // ==========================================================================

  function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
      if (!state.achievements[a.key] && a.check(state)) {
        state.achievements[a.key] = Date.now();
        showToast(`🏆 ${a.name}`, 'info');
        confettiBurst(window.innerWidth / 2, 120, 24);
      }
    });
  }

  // ==========================================================================
  // UNDO
  // ==========================================================================

  const undoStack = [];
  function pushUndo(label) {
    undoStack.length = 0;   // single-step undo
    undoStack.push({
      label,
      snap: JSON.parse(JSON.stringify({
        coins: state.coins,
        xp:    state.xp,
        level: state.level,
        board: state.board,
        orders: state.orders,
        discovered: state.discovered,
      })),
    });
  }
  function undo() {
    if (!undoStack.length) return;
    const { snap } = undoStack.pop();
    Object.assign(state, snap);
    state.stats.undos += 1;
    renderBoard();
    renderOrders();
    updateHUD();
    checkAchievements();
    saveState();
    setStatus('Undone.');
    AudioFX.click();
  }

  // ==========================================================================
  // FEEDBACK: TOAST / BUBBLE / STATUS / COINS / DELICIOUS / CONFETTI / FLOAT
  // ==========================================================================

  function setStatus(text) { if (statusEl) statusEl.textContent = text; }
  function setBubble(text) { if (bubbleEl) bubbleEl.textContent = text; }

  function showToast(text, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'info' ? ' toast--info' : (kind === 'warn' ? ' toast--warn' : ''));
    el.innerHTML = `<svg viewBox="0 0 64 64"><use href="#i-sparkle"/></svg><span>${text}</span>`;
    toastsEl.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function floatText(x, y, text, kind) {
    const el = document.createElement('div');
    el.className = 'float-text' + (kind === 'coin' ? ' float-text--coin' : (kind === 'sell' ? ' float-text--sell' : (kind === 'warn' ? ' float-text--warn' : '')));
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  function flyCoinsFrom(x, y, amount) {
    const coinCount = Math.min(6, Math.max(3, Math.ceil(amount / 10)));
    const meter = coinValEl.closest('.meter');
    const target = meter ? meter.getBoundingClientRect() : { top: 40, left: window.innerWidth / 2, width: 40, height: 40 };
    const tx = target.left + target.width / 2;
    const ty = target.top  + target.height / 2;
    for (let i = 0; i < coinCount; i++) {
      const c = document.createElement('div');
      c.className = 'coin-fly';
      c.innerHTML = '<svg viewBox="0 0 64 64" width="34" height="34"><use href="#i-coin"/></svg>';
      c.style.left = (x - 17) + 'px';
      c.style.top  = (y - 17) + 'px';
      document.body.appendChild(c);
      const dx = tx - x + (Math.random() * 40 - 20);
      const dy = ty - y + (Math.random() * 40 - 20);
      c.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.3 - 40}px) scale(1.2)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0 },
      ], { duration: 900 + i * 60, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => c.remove();
    }
  }

  function showDelicious() {
    const el = document.createElement('div');
    el.className = 'delicious';
    el.textContent = 'DELICIOUS!';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function screenShake() {
    const target = $('#app');
    if (!target) return;
    target.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(-6px, 2px)' },
      { transform: 'translate(6px, -2px)' }, { transform: 'translate(-3px, 1px)' },
      { transform: 'translate(0,0)' },
    ], { duration: 350, easing: 'ease-out' });
  }

  function confettiBurst(x, y, count) {
    if (state.settings.motion) count = Math.min(count, 8);
    const colors = ['#FFD166', '#E8A62B', '#C4622D', '#2A9D8F', '#1C4E80', '#7A1E28'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.left = (x - 5) + 'px';
      p.style.top  = (y - 7) + 'px';
      document.body.appendChild(p);
      const dx = (Math.random() - 0.5) * 500;
      const dy = -Math.random() * 300 - 120;
      const rot = (Math.random() - 0.5) * 720;
      p.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx * 1.2}px, ${dy + 400}px) rotate(${rot * 1.2}deg)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 400, easing: 'cubic-bezier(.2, .7, .3, 1)' }).onfinish = () => p.remove();
    }
  }

  // ==========================================================================
  // INTERACTION: TAP-TAP + DRAG + LONG-PRESS-TO-SELL
  // ==========================================================================

  let selectedCell = null;
  let activeOrderIdx = -1;
  let dragState = null;
  let longPressTimer = null;

  function highlightSelection() {
    $$('.tile.is-selected', boardEl).forEach(el => el.classList.remove('is-selected'));
    if (selectedCell) {
      const t = tileAt(selectedCell.r, selectedCell.c);
      if (t) t.classList.add('is-selected');
    }
  }

  function cellFromEvent(evt) {
    const rect = boardEl.getBoundingClientRect();
    const x = evt.clientX - rect.left - 8;
    const y = evt.clientY - rect.top  - 8;
    const cellPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    const gap    = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
    const c = Math.floor(x / (cellPx + gap));
    const r = Math.floor(y / (cellPx + gap));
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) return null;
    return { r, c };
  }

  function invalidShake(el) {
    if (!el) return;
    el.classList.add('is-invalid-shake');
    setTimeout(() => el.classList.remove('is-invalid-shake'), 400);
    AudioFX.error();
    Haptics.error();
  }

  function onCellTap(r, c) {
    const item = state.board[r][c];

    if (activeOrderIdx >= 0 && item) {
      const order = state.orders[activeOrderIdx];
      if (order && item.chain === order.chain && item.tier === order.tier) {
        fulfillOrder(activeOrderIdx, r, c);
        return;
      } else {
        setStatus('That dish does not match the order.');
        invalidShake(tileAt(r, c));
      }
    }

    if (!selectedCell) {
      if (item) {
        selectedCell = { r, c };
        highlightSelection();
        AudioFX.tap();
        Haptics.tap();
        setStatus(`Selected ${chainDef(item.chain, item.tier).name}. Tap a match to merge.`);
        if (TutorialV2 && TutorialV2.active) TutorialV2.onEvent('select', { chain: item.chain, tier: item.tier });
      }
      return;
    }

    if (selectedCell.r === r && selectedCell.c === c) {
      selectedCell = null;
      highlightSelection();
      setStatus('Selection cleared.');
      return;
    }

    const source = state.board[selectedCell.r][selectedCell.c];
    if (!source) { selectedCell = null; highlightSelection(); return; }

    if (!item) {
      moveTile(selectedCell.r, selectedCell.c, r, c);
      selectedCell = null; highlightSelection();
      return;
    }

    if (item.chain === source.chain && item.tier === source.tier && source.tier < MAX_TIER) {
      mergeTiles(selectedCell.r, selectedCell.c, r, c);
    } else {
      selectedCell = { r, c };
      highlightSelection();
      AudioFX.tap();
      Haptics.tap();
      setStatus(`Selected ${chainDef(item.chain, item.tier).name}.`);
    }
  }

  function moveTile(fromR, fromC, toR, toC) {
    const item = state.board[fromR][fromC];
    pushUndo('move');
    state.board[toR][toC] = item;
    state.board[fromR][fromC] = null;
    const tile = tileAt(fromR, fromC);
    const dstCell = cellAt(toR, toC);
    if (tile && dstCell) {
      tagTile(tile, toR, toC);
      dstCell.appendChild(tile);
    }
    setStatus(`Moved ${chainDef(item.chain, item.tier).name}.`);
    AudioFX.tap();
    Haptics.tap();
    saveState();
    updateHUD();
  }

  function mergeTiles(srcR, srcC, dstR, dstC) {
    const src = state.board[srcR][srcC];
    const dst = state.board[dstR][dstC];
    if (!src || !dst) return;
    if (src.chain !== dst.chain || src.tier !== dst.tier) return;
    if (dst.tier >= MAX_TIER) return;

    pushUndo('merge');

    const newTier = dst.tier + 1;
    const merged = { chain: dst.chain, tier: newTier, id: tileIdSeq++ };
    state.board[srcR][srcC] = null;
    state.board[dstR][dstC] = merged;
    state.stats.merges += 1;

    const srcTile = tileAt(srcR, srcC);
    const dstTile = tileAt(dstR, dstC);
    if (srcTile) srcTile.remove();
    if (dstTile) {
      const burst = document.createElement('div');
      burst.className = 'burst';
      dstTile.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
      const def = chainDef(merged.chain, merged.tier);
      dstTile.dataset.tier = String(newTier);
      dstTile.setAttribute('aria-label', `${def.name}, tier ${newTier}`);
      dstTile.classList.remove('is-selected', 'is-spawning');
      void dstTile.offsetWidth;
      dstTile.classList.add('is-spawning');
      dstTile.innerHTML = `
        <svg class="tile__art" viewBox="0 0 64 64" aria-hidden="true"><use href="${def.icon}"/></svg>
        <span class="tile__tier">T${newTier}</span>
      `;
    }

    // Combo bump first so subsequent XP + coin math sees the correct multiplier
    bumpCombo();
    const mult = comboMultiplier();

    // Feedback: audio, haptics, XP, chef reaction
    if (merged.tier === MAX_TIER) {
      AudioFX.legendary();
      Haptics.legendary();
      Chef.wipe();
    } else {
      AudioFX.merge(merged.tier);
      Haptics.merge();
    }

    const baseXP = XP_FOR_MERGE[merged.tier] || 5;
    const xpGain = Math.round(baseXP * mult);
    const rectRef = dstTile ? dstTile.getBoundingClientRect() : null;
    addXP(xpGain, rectRef);

    const def = chainDef(merged.chain, merged.tier);
    const wasNew = !state.discovered[merged.chain][merged.tier - 1];
    if (wasNew) {
      state.discovered[merged.chain][merged.tier - 1] = true;
      showToast(`Discovered ${def.name}!`, 'info');
      if (rectRef) confettiBurst(rectRef.left + rectRef.width / 2, rectRef.top + rectRef.height / 2, 22);
      const lines = (CHEF_MERGE_LINES[merged.chain] || {})[merged.tier] || [];
      if (lines.length) setBubble(choice(lines));
      else setBubble(`${def.name} unlocked!`);
      Chef.cheer();
      tickChallenge('discoveries', 1);
    } else {
      setStatus(`Merged into ${def.name}.`);
    }

    if (merged.tier === MAX_TIER) {
      showDelicious();
      screenShake();
      if (rectRef) confettiBurst(rectRef.left + rectRef.width / 2, rectRef.top + rectRef.height / 2, 40);
      tickChallenge('legendary', 1);
    }

    tickChallenge('merges', 1);
    if (combo.count >= 3) tickChallenge('combo', 1);

    // Interactive tutorial hook
    if (TutorialV2 && TutorialV2.active) TutorialV2.onEvent('merge', { chain: merged.chain, tier: merged.tier });

    checkAchievements();
    updateHUD();
    renderBook();
    saveState();
  }

  function spawnItem(chain, tier) {
    const empty = findEmptyCells();
    if (!empty.length) return null;
    const [r, c] = choice(empty);
    const item = { chain, tier, id: tileIdSeq++ };
    state.board[r][c] = item;
    const tile = makeTile(item);
    tagTile(tile, r, c);
    const cell = cellAt(r, c);
    if (cell) cell.appendChild(tile);
    setTimeout(() => tile.classList.remove('is-spawning'), 500);
    return { r, c };
  }

  // ---------- POINTER + LONG-PRESS ----------

  function startLongPress(evt, tile, r, c) {
    clearTimeout(longPressTimer);
    const rect = tile.getBoundingClientRect();
    longPressRing.style.left = (rect.left + rect.width / 2) + 'px';
    longPressRing.style.top  = (rect.top  + rect.height / 2) + 'px';
    // Force reflow before adding the active class so the animation restarts
    void longPressRing.offsetWidth;
    longPressRing.classList.add('is-active');
    longPressTimer = setTimeout(() => {
      // Complete long-press → SELL
      longPressRing.classList.remove('is-active');
      sellTile(r, c);
      dragState = null;
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressRing.classList.remove('is-active');
  }

  function sellTile(r, c) {
    const item = state.board[r][c];
    if (!item) return;
    pushUndo('sell');
    const price = SELL_PRICE[item.tier] || 1;
    state.board[r][c] = null;
    state.stats.sold += 1;
    state.stats.coinsEarned += price;
    state.coins += price;
    const tile = tileAt(r, c);
    if (tile) {
      const rect = tile.getBoundingClientRect();
      floatText(rect.left + rect.width / 2, rect.top, `+${price}`, 'sell');
      tile.remove();
    }
    AudioFX.sell();
    Haptics.sell();
    tickChallenge('sold', 1);
    tickChallenge('coins', price);
    checkAchievements();
    updateHUD();
    setStatus(`Sold ${chainDef(item.chain, item.tier).name} for ${price} coins.`);
    saveState();
  }

  function onPointerDown(evt) {
    if (evt.button !== undefined && evt.button !== 0) return;
    AudioFX.resume();
    const tile = evt.target.closest('.tile');
    if (!tile) {
      const cell = evt.target.closest('.cell');
      if (cell) {
        const r = +cell.dataset.r, c = +cell.dataset.c;
        onCellTap(r, c);
      }
      return;
    }
    const c = parseInt(tile.dataset.c, 10);
    const r = parseInt(tile.dataset.r, 10);
    dragState = { startR: r, startC: c, tile, moved: false, startX: evt.clientX, startY: evt.clientY };
    tile.classList.add('is-pressed');
    tile.setPointerCapture?.(evt.pointerId);
    startLongPress(evt, tile, r, c);
  }

  function onPointerMove(evt) {
    if (!dragState) return;
    const dx = evt.clientX - dragState.startX;
    const dy = evt.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(dx, dy) > 10) {
      dragState.moved = true;
      cancelLongPress();
      dragState.tile.classList.remove('is-pressed');
      dragState.tile.classList.add('is-picked');
    }
    if (dragState.moved) {
      dragState.tile.style.transform = `translate(${dx}px, ${dy}px) scale(1.12) rotate(-3deg)`;
      const target = cellFromEvent(evt);
      $$('.cell.is-target, .cell.is-invalid', boardEl).forEach(el => el.classList.remove('is-target', 'is-invalid'));
      if (target) {
        const cellEl = boardEl.querySelector(`.cell[data-r="${target.r}"][data-c="${target.c}"]`);
        if (cellEl) {
          const src = state.board[dragState.startR][dragState.startC];
          const dst = state.board[target.r][target.c];
          if (!dst) cellEl.classList.add('is-target');
          else if (src && dst.chain === src.chain && dst.tier === src.tier && src.tier < MAX_TIER) cellEl.classList.add('is-target');
          else if (target.r !== dragState.startR || target.c !== dragState.startC) cellEl.classList.add('is-invalid');
        }
      }
    }
  }

  function onPointerUp(evt) {
    if (!dragState) return;
    const { tile, startR, startC, moved } = dragState;
    cancelLongPress();
    tile.style.transform = '';
    tile.classList.remove('is-pressed', 'is-picked');
    $$('.cell.is-target, .cell.is-invalid', boardEl).forEach(el => el.classList.remove('is-target', 'is-invalid'));

    if (!moved) {
      onCellTap(startR, startC);
    } else {
      const target = cellFromEvent(evt);
      if (target && (target.r !== startR || target.c !== startC)) {
        const src = state.board[startR][startC];
        const dst = state.board[target.r][target.c];
        if (!dst) {
          moveTile(startR, startC, target.r, target.c);
        } else if (src && dst.chain === src.chain && dst.tier === src.tier && src.tier < MAX_TIER) {
          mergeTiles(startR, startC, target.r, target.c);
        } else {
          invalidShake(tileAt(startR, startC));
        }
      }
    }
    dragState = null;
  }

  // ==========================================================================
  // ORDERS
  // ==========================================================================

  function generateOrder() {
    const chain = choice(CHAIN_KEYS);
    const maxDiscoveredTier = Math.max(1, state.discovered[chain].reduce((max, v, i) => v ? Math.max(max, i + 1) : max, 1));
    const tier = Math.max(1, Math.min(MAX_TIER, maxDiscoveredTier - rand(2) + 1));
    return { chain, tier, reward: REWARD[tier] };
  }

  function ensureOrders() {
    while (state.orders.length < 3) state.orders.push(generateOrder());
    renderOrders();
  }

  function selectOrder(idx) {
    activeOrderIdx = (activeOrderIdx === idx) ? -1 : idx;
    renderOrders();
    if (activeOrderIdx >= 0) {
      const o = state.orders[idx];
      const def = chainDef(o.chain, o.tier);
      setStatus(`Now tap a ${def.name} (Tier ${o.tier}) on the board.`);
    } else {
      setStatus('Order deselected.');
    }
  }

  function fulfillOrder(idx, r, c) {
    const order = state.orders[idx];
    const item  = state.board[r][c];
    if (!order || !item) return;
    pushUndo('order');
    state.board[r][c] = null;
    const tile = tileAt(r, c);
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (tile) {
      const rect = tile.getBoundingClientRect();
      x = rect.left + rect.width / 2; y = rect.top + rect.height / 2;
      tile.remove();
    }
    flyCoinsFrom(x, y, order.reward);
    state.coins += order.reward;
    state.stats.coinsEarned += order.reward;
    state.stats.ordersDone  += 1;
    state.orders.splice(idx, 1);
    activeOrderIdx = -1;
    AudioFX.orderDone();
    Haptics.merge();
    Chef.wave();
    addXP(Math.round(order.reward / 3), tile ? tile.getBoundingClientRect() : null);
    showToast(`+${order.reward} coins served!`);
    setBubble(choice(CHEF_ORDER_LINES));
    tickChallenge('orders', 1);
    tickChallenge('coins', order.reward);
    if (TutorialV2 && TutorialV2.active) TutorialV2.onEvent('order', {});
    ensureOrders();
    checkAchievements();
    updateHUD();
    saveState();
  }

  // ==========================================================================
  // SPICE CRATE
  // ==========================================================================

  function openCrate(free) {
    if (!free) {
      if (state.coins < CRATE_COST) {
        AudioFX.error();
        Haptics.error();
        showToast('Not enough coins.', 'warn');
        return;
      }
      state.coins -= CRATE_COST;
      updateHUD();
    }
    state.stats.crateOpens += 1;
    AudioFX.crate();
    Haptics.tap();
    tickChallenge('crates', 1);
    if (TutorialV2 && TutorialV2.active) TutorialV2.onEvent('crate', {});

    const drops = [];
    for (let i = 0; i < 3; i++) {
      const chain = choice(CHAIN_KEYS);
      let tier = 1;
      const roll = Math.random();
      if (roll > 0.9)      tier = 3;
      else if (roll > 0.65) tier = 2;
      drops.push({ chain, tier });
    }

    crateItems.innerHTML = '';
    drops.forEach(d => {
      const def = chainDef(d.chain, d.tier);
      const item = document.createElement('div');
      item.className = 'crate-reveal__item';
      item.innerHTML = `<svg viewBox="0 0 64 64"><use href="${def.icon}"/></svg>`;
      crateItems.appendChild(item);
    });

    crateReveal.classList.remove('is-open');
    crateModal.classList.add('is-open');
    crateModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      crateReveal.classList.add('is-open');
      AudioFX.coin();
    }, 400);

    crateContinue.onclick = () => {
      AudioFX.click();
      crateModal.classList.remove('is-open');
      crateModal.setAttribute('aria-hidden', 'true');
      let placed = 0;
      drops.forEach((d, i) => {
        setTimeout(() => {
          if (spawnItem(d.chain, d.tier)) placed++;
          if (i === drops.length - 1) {
            if (!placed) showToast('Board is full — freed nothing.', 'warn');
            saveState();
          }
        }, i * 120);
      });
      setBubble(choice(CHEF_CRATE_LINES));
    };

    if (free) {
      state.nextFreeCrate = Date.now() + FREE_CRATE_INTERVAL_MS;
      saveState();
      updateFreeCrateBtn();
    } else {
      saveState();
    }
  }

  function updateFreeCrateBtn() {
    const now = Date.now();
    if (now >= state.nextFreeCrate) {
      freeCrateBtn.disabled = false;
      freeCrateLbl.textContent = 'Free crate ready!';
    } else {
      freeCrateBtn.disabled = true;
      const secs = Math.max(0, Math.ceil((state.nextFreeCrate - now) / 1000));
      freeCrateLbl.textContent = `Free crate in ${secs}s`;
    }
  }

  // ==========================================================================
  // SETTINGS
  // ==========================================================================

  function applySettings() {
    document.body.classList.toggle('hi-contrast', !!state.settings.hiContrast);
    document.body.classList.toggle('reduced-motion', !!state.settings.motion);
    if (state.settings.music) AudioFX.startMusic(); else AudioFX.stopMusic();
    refreshToggles();
  }

  function refreshToggles() {
    setSfx.setAttribute('aria-checked',        state.settings.sfx        ? 'true' : 'false');
    setMusic.setAttribute('aria-checked',      state.settings.music      ? 'true' : 'false');
    setHaptics.setAttribute('aria-checked',    state.settings.haptics    ? 'true' : 'false');
    setMotion.setAttribute('aria-checked',     state.settings.motion     ? 'true' : 'false');
    setHiContrast.setAttribute('aria-checked', state.settings.hiContrast ? 'true' : 'false');
  }

  function wireSettings() {
    function bindToggle(el, key) {
      el.addEventListener('click', () => {
        state.settings[key] = !state.settings[key];
        AudioFX.click();
        applySettings();
        saveState();
      });
    }
    bindToggle(setSfx,        'sfx');
    bindToggle(setMusic,      'music');
    bindToggle(setHaptics,    'haptics');
    bindToggle(setMotion,     'motion');
    bindToggle(setHiContrast, 'hiContrast');

    setTutorialBtn.addEventListener('click', () => {
      AudioFX.click();
      closeModal(settingsModal);
      state.settings.tutorialDone = false;
      saveState();
      Tutorial.run();
    });
    setResetBtn.addEventListener('click', () => {
      AudioFX.click();
      if (!confirm('Reset all progress? This cannot be undone.')) return;
      localStorage.removeItem(STATE_KEY);
      location.reload();
    });
  }

  // ==========================================================================
  // TUTORIAL
  // ==========================================================================

  // Interactive tutorial: waits for the user to actually perform each action.
  const TutorialV2 = {
    active: false,
    idx: 0,
    steps: [
      {
        title: 'Welcome!',
        body: 'This is your merge kitchen. First, let\'s combine two ingredients. Tap the pulsing tile.',
        hint: 'Tap this tile',
        findTargets: () => {
          const t = document.querySelector('.tile[data-chain="spice"][data-tier="1"]');
          return t ? [t] : [];
        },
        waitFor: 'select-target',
        canSkipIfMissing: true,
      },
      {
        title: 'Merge it!',
        body: 'Now tap another matching cumin to merge them into ras el hanout.',
        hint: 'Tap another cumin',
        findTargets: () => $$('.tile[data-chain="spice"][data-tier="1"]'),
        waitFor: 'merge',
        canSkipIfMissing: true,
      },
      {
        title: 'Serve the souk',
        body: 'Customers order dishes on the left. Tap any order card to select it, then tap a matching tile on the board.',
        hint: 'Tap an order',
        findTargets: () => [document.querySelector('.order')],
        waitFor: 'order',
        canSkipIfMissing: false,
        allowNextButton: true,
      },
      {
        title: 'Open a Spice Crate',
        body: 'When you need more tiles, open a Spice Crate — one is free every minute.',
        hint: 'Tap Spice Crate',
        findTargets: () => [document.getElementById('crateBtn')],
        waitFor: 'crate',
        canSkipIfMissing: false,
      },
      {
        title: 'You\'re ready!',
        body: 'Long-press a tile to sell. Chain merges within 3 seconds for combo bonuses. Powerups are in the sparkle button. Enjoy!',
        hint: null,
        findTargets: () => [],
        waitFor: 'next',
        allowNextButton: true,
      },
    ],

    run() {
      TutorialV2.active = true;
      TutorialV2.idx = 0;
      tutorial.classList.add('is-open');
      tutorial.setAttribute('aria-hidden', 'false');
      tutorialTotal.textContent = TutorialV2.steps.length;
      TutorialV2.show();
    },

    show() {
      const s = TutorialV2.steps[TutorialV2.idx];
      if (!s) return TutorialV2.finish();

      tutorialStep.textContent  = TutorialV2.idx + 1;
      tutorialTitle.textContent = s.title;
      tutorialBody.textContent  = s.body;
      tutorialNext.textContent  = (TutorialV2.idx === TutorialV2.steps.length - 1) ? 'Start cooking' : 'Next';
      tutorialNext.style.display = (s.waitFor === 'next' || s.allowNextButton) ? 'inline-flex' : 'none';

      // Clear old highlights and hint
      $$('.tut-target').forEach(el => el.classList.remove('tut-target'));
      const tutHint = $('#tutHint');
      const tutHintBody = $('#tutHintBody');
      if (tutHint) tutHint.classList.remove('is-open');

      const targets = (s.findTargets && s.findTargets().filter(Boolean)) || [];
      if (!targets.length && s.canSkipIfMissing) {
        // Advance to next automatically if there's nothing to point at
        setTimeout(() => TutorialV2.next(), 50);
        return;
      }

      targets.forEach(el => el.classList.add('tut-target'));
      // Position hint above the first target
      if (targets[0] && tutHint && tutHintBody) {
        const r = targets[0].getBoundingClientRect();
        tutHint.style.left = (r.left + r.width / 2) + 'px';
        tutHint.style.top  = r.top + 'px';
        tutHintBody.textContent = s.hint || '';
        if (s.hint) tutHint.classList.add('is-open');
      }

      // Position spotlight
      if (targets[0]) {
        const r = targets[0].getBoundingClientRect();
        const size = Math.max(140, Math.min(360, Math.max(r.width, r.height) * 1.6));
        tutorialSpot.style.left = (r.left + r.width / 2) + 'px';
        tutorialSpot.style.top  = (r.top  + r.height / 2) + 'px';
        tutorialSpot.style.width  = size + 'px';
        tutorialSpot.style.height = size + 'px';
      } else {
        tutorialSpot.style.width = '0px';
        tutorialSpot.style.height = '0px';
      }
    },

    onEvent(kind, payload) {
      if (!TutorialV2.active) return;
      const s = TutorialV2.steps[TutorialV2.idx];
      if (!s) return;
      // 'select-target' means user tapped the pulsing tile — the merge step waits for the actual merge
      if (s.waitFor === kind || (s.waitFor === 'select-target' && kind === 'select')) {
        TutorialV2.next();
      }
    },

    next() {
      if (TutorialV2.idx < TutorialV2.steps.length - 1) {
        TutorialV2.idx += 1;
        TutorialV2.show();
      } else {
        TutorialV2.finish();
      }
    },

    finish() {
      TutorialV2.active = false;
      $$('.tut-target').forEach(el => el.classList.remove('tut-target'));
      const tutHint = $('#tutHint');
      if (tutHint) tutHint.classList.remove('is-open');
      tutorial.classList.remove('is-open');
      tutorial.setAttribute('aria-hidden', 'true');
      state.settings.tutorialDone = true;
      saveState();
    },
  };
  // Backwards-compat alias — Settings modal calls Tutorial.run
  const Tutorial = TutorialV2;

  function wireTutorial() {
    tutorialNext.addEventListener('click', () => { AudioFX.click(); TutorialV2.next(); });
    tutorialSkip.addEventListener('click', () => { AudioFX.click(); TutorialV2.finish(); });
  }

  // ==========================================================================
  // MODALS
  // ==========================================================================

  function openModal(m)  { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); }
  function closeModal(m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); }

  // ==========================================================================
  // DAILY REWARD + AMBIENT
  // ==========================================================================

  function checkDailyReward() {
    const today = new Date().toDateString();
    if (state.lastDailyClaim === today) return;
    state.lastDailyClaim = today;
    state.coins += DAILY_COINS;
    state.stats.coinsEarned += DAILY_COINS;
    updateHUD();
    saveState();
    setTimeout(() => {
      showToast(`Daily gift: +${DAILY_COINS} coins`, 'info');
      AudioFX.coin();
      confettiBurst(window.innerWidth / 2, 120, 20);
      setBubble('The market gifted you a purse of coins this morning.');
    }, 800);
  }

  function spawnAmbientParticles() {
    const holder = $('#particles');
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * -18) + 's';
      p.style.opacity = String(0.4 + Math.random() * 0.5);
      holder.appendChild(p);
    }
  }

  function rotateChefLines() {
    let idx = 0;
    setInterval(() => {
      if (!bubbleEl.dataset.pinned && !tutorial.classList.contains('is-open')) {
        idx = (idx + 1) % CHEF_LINES_IDLE.length;
        setBubble(CHEF_LINES_IDLE[idx]);
      }
    }, 12000);
  }

  // ==========================================================================
  // SPLASH FLOW
  // ==========================================================================

  function runSplash(onDone) {
    // Random hint rotation
    const hints = [
      'Warming the tagine…',
      'Grinding cumin and coriander…',
      'Rolling msemen dough…',
      'Steeping mint for the tea…',
      'Polishing the zellige tiles…',
      'Lighting the lanterns…',
    ];
    let hintIdx = 0;
    const hintTimer = setInterval(() => {
      hintIdx = (hintIdx + 1) % hints.length;
      if (splashHint) splashHint.textContent = hints[hintIdx];
    }, 550);

    // Splash sparks
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('span');
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.animationDuration = (2 + Math.random() * 3) + 's';
      s.style.animationDelay = (Math.random() * 3) + 's';
      splashParticles.appendChild(s);
    }

    // Progress bar over ~2.4s
    const startedAt = Date.now();
    const duration = 2400;
    const raf = () => {
      const t = Math.min(1, (Date.now() - startedAt) / duration);
      splashFill.style.right = (100 - t * 100) + '%';
      if (t < 1) requestAnimationFrame(raf);
      else {
        clearInterval(hintTimer);
        setTimeout(() => {
          splashEl.classList.add('is-gone');
          setTimeout(onDone, 700);
        }, 250);
      }
    };
    requestAnimationFrame(raf);
  }

  // ==========================================================================
  // SEEDING + BOOT
  // ==========================================================================

  function seedInitialBoard() {
    const startingDrops = [
      { chain: 'spice', tier: 1 }, { chain: 'spice', tier: 1 }, { chain: 'spice', tier: 1 },
      { chain: 'grain', tier: 1 }, { chain: 'grain', tier: 1 }, { chain: 'grain', tier: 1 },
      { chain: 'meat',  tier: 1 }, { chain: 'meat',  tier: 1 }, { chain: 'meat',  tier: 1 },
      { chain: 'spice', tier: 2 }, { chain: 'grain', tier: 2 },
    ];
    startingDrops.forEach(d => {
      const empty = findEmptyCells();
      if (!empty.length) return;
      const [r, c] = choice(empty);
      state.board[r][c] = { chain: d.chain, tier: d.tier, id: tileIdSeq++ };
    });
  }

  function grabDom() {
    boardEl        = $('#board');
    coinValEl      = $('#coinVal');
    unlockedEl     = $('#unlockedCount');
    totalCountEl   = $('#totalCount');
    ordersEl       = $('#orders');
    bookGridEl     = $('#bookGrid');
    bubbleEl       = $('#bubble');
    statusEl       = $('#status');
    toastsEl       = $('#toasts');
    freeCrateBtn   = $('#freeCrateBtn');
    freeCrateLbl   = $('#freeCrateLbl');
    crateModal     = $('#crateModal');
    crateReveal    = $('#crateReveal');
    crateItems     = $('#crateItems');
    crateContinue  = $('#crateContinue');
    bookModal      = $('#bookModal');
    bookBtn        = $('#bookBtn');
    bookClose      = $('#bookClose');
    crateBtn       = $('#crateBtn');

    levelBar       = $('#levelBar');
    levelNum       = $('#levelNum');
    levelFill      = $('#levelFill');
    levelTitleEl   = $('#levelTitle');
    xpVal          = $('#xpVal');
    xpMax          = $('#xpMax');
    undoBtn        = $('#undoBtn');
    settingsBtn    = $('#settingsBtn');
    settingsModal  = $('#settingsModal');
    settingsClose  = $('#settingsClose');
    achievementsBtn   = $('#achievementsBtn');
    achievementsModal = $('#achievementsModal');
    achievementsClose = $('#achievementsClose');
    achievementsGrid  = $('#achievementsGrid');
    statsGrid         = $('#statsGrid');

    setSfx         = $('#setSfx');
    setMusic       = $('#setMusic');
    setHaptics     = $('#setHaptics');
    setMotion      = $('#setMotion');
    setHiContrast  = $('#setHiContrast');
    setTutorialBtn = $('#setTutorialBtn');
    setResetBtn    = $('#setResetBtn');

    tutorial       = $('#tutorial');
    tutorialSpot   = $('#tutorialSpot');
    tutorialCard   = $('#tutorialCard');
    tutorialStep   = $('#tutorialStep');
    tutorialTotal  = $('#tutorialTotal');
    tutorialTitle  = $('#tutorialTitle');
    tutorialBody   = $('#tutorialBody');
    tutorialSkip   = $('#tutorialSkip');
    tutorialNext   = $('#tutorialNext');

    longPressRing  = $('#longPressRing');

    splashEl        = $('#splash');
    splashFill      = $('#splashFill');
    splashHint      = $('#splashHint');
    splashParticles = $('#splashParticles');

    shopBtn    = $('#shopBtn');
    shopModal  = $('#shopModal');
    shopClose  = $('#shopClose');
  }

  function attachHandlers() {
    boardEl.addEventListener('pointerdown', onPointerDown);
    boardEl.addEventListener('pointermove', onPointerMove);
    boardEl.addEventListener('pointerup',   onPointerUp);
    boardEl.addEventListener('pointercancel', onPointerUp);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        selectedCell = null; activeOrderIdx = -1;
        highlightSelection(); renderOrders();
        setStatus('Selection cleared.');
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); undo();
      }
    });

    crateBtn.addEventListener('click', () => { AudioFX.resume(); AudioFX.click(); openCrate(false); });
    freeCrateBtn.addEventListener('click', () => { AudioFX.click(); if (Date.now() >= state.nextFreeCrate) openCrate(true); });

    bookBtn.addEventListener('click', () => { AudioFX.click(); renderBook(); openModal(bookModal); });
    bookClose.addEventListener('click', () => { AudioFX.click(); closeModal(bookModal); });

    settingsBtn.addEventListener('click', () => { AudioFX.click(); openModal(settingsModal); });
    settingsClose.addEventListener('click', () => { AudioFX.click(); closeModal(settingsModal); });

    achievementsBtn.addEventListener('click', () => { AudioFX.click(); renderAchievements(); openModal(achievementsModal); });
    achievementsClose.addEventListener('click', () => { AudioFX.click(); closeModal(achievementsModal); });

    shopBtn.addEventListener('click', () => { AudioFX.click(); renderPowerups(); openModal(shopModal); });
    shopClose.addEventListener('click', () => { AudioFX.click(); closeModal(shopModal); });
    // Refresh powerup cooldown labels every second while shop is open
    setInterval(() => { if (shopModal.classList.contains('is-open')) renderPowerups(); }, 1000);

    undoBtn.addEventListener('click', () => { AudioFX.click(); undo(); });

    [bookModal, crateModal, settingsModal, achievementsModal, shopModal].forEach(m => {
      m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
    });

    $('#startBtn').addEventListener('click', () => {
      AudioFX.click();
      AudioFX.resume();
      const title = $('#titleScreen');
      title.classList.add('is-gone');
      $('#app').setAttribute('aria-hidden', 'false');
      if (state.settings.music) AudioFX.startMusic();
      // Show tutorial on first play
      if (!state.settings.tutorialDone) {
        setTimeout(() => TutorialV2.run(), 600);
      }
    });

    wireSettings();
    wireTutorial();
  }

  function boot() {
    grabDom();
    const loaded = loadState();
    state.stats.sessions = (state.stats.sessions || 0) + 1;
    if (!loaded) seedInitialBoard();
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (state.board[r][c] && !state.board[r][c].id) state.board[r][c].id = tileIdSeq++;

    ensureOrders();
    renderBoard();
    updateHUD();
    renderBook();
    ensureChallenge();
    updateFreeCrateBtn();
    setInterval(updateFreeCrateBtn, 1000);
    spawnAmbientParticles();
    rotateChefLines();
    applySettings();
    attachHandlers();
    Chef.init();
    setStatus('Tap or drag two matching ingredients to merge.');

    runSplash(() => {
      // Daily gift after splash so it feels rewarding
      checkDailyReward();
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
  if (document.readyState !== 'loading') boot();
})();
