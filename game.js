/* ==========================================================================
   BNIIINE — Merge game logic
   Vanilla ES module, saved via localStorage, mobile + desktop.
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
  const MAX_TIER   = CHAINS.spice.length;   // 5

  const REWARD = { 1: 3, 2: 8, 3: 20, 4: 50, 5: 140 };  // coins by tier fulfilled
  const CRATE_COST = 25;
  const FREE_CRATE_INTERVAL_MS = 60 * 1000;
  const START_COINS = 120;

  const BOARD_COLS = 6;
  const BOARD_ROWS = 7;

  const CHEF_LINES = [
    'Ahlan! Two cumin seeds make ras el hanout.',
    'Three merges deep — the tagine sings.',
    'A closed spice crate hides three surprises.',
    'Tip: tap the order card, then tap a matching dish.',
    'From the medina of Marrakech to the souks of Tunis.',
    'Bismillah — let us cook something legendary.',
    'The zellige patterns love a full board. Don\'t stall!',
  ];

  // ---------- STATE ----------

  const STATE_KEY = 'bniiine.state.v1';
  const state = {
    coins: START_COINS,
    board: makeEmptyBoard(),
    orders: [],
    discovered: Object.fromEntries(CHAIN_KEYS.map(c => [c, new Array(MAX_TIER).fill(false)])),
    nextFreeCrate: Date.now() + FREE_CRATE_INTERVAL_MS,
    seed: Date.now(),
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
        board: state.board,
        orders: state.orders,
        discovered: state.discovered,
        nextFreeCrate: state.nextFreeCrate,
      }));
    } catch (_) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.board)) return false;
      Object.assign(state, s);
      // Regenerate orders if empty on load
      if (!Array.isArray(state.orders) || !state.orders.length) state.orders = [];
      return true;
    } catch (_) { return false; }
  }

  // ---------- UTIL ----------

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function rand(n) { return Math.floor(Math.random() * n); }
  function choice(arr) { return arr[rand(arr.length)]; }

  function chainDef(chain, tier) {
    return CHAINS[chain][tier - 1];
  }

  function isBoardFull() {
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (!state.board[r][c]) return false;
    return true;
  }

  function findEmptyCells() {
    const empty = [];
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (!state.board[r][c]) empty.push([r, c]);
    return empty;
  }

  // ---------- RENDER ----------

  const boardEl        = $('#board');
  const coinValEl      = $('#coinVal');
  const unlockedEl     = $('#unlockedCount');
  const totalCountEl   = $('#totalCount');
  const ordersEl       = $('#orders');
  const bookGridEl     = $('#bookGrid');
  const bubbleEl       = $('#bubble');
  const statusEl       = $('#status');
  const toastsEl       = $('#toasts');
  const freeCrateBtn   = $('#freeCrateBtn');
  const freeCrateLbl   = $('#freeCrateLbl');

  const crateModal     = $('#crateModal');
  const crateReveal    = $('#crateReveal');
  const crateItems     = $('#crateItems');
  const crateContinue  = $('#crateContinue');

  const bookModal      = $('#bookModal');
  const bookBtn        = $('#bookBtn');
  const bookClose      = $('#bookClose');
  const crateBtn       = $('#crateBtn');

  totalCountEl.textContent = CHAIN_KEYS.length * MAX_TIER;

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

  function tagTile(el, r, c) {
    el.dataset.r = String(r);
    el.dataset.c = String(c);
  }

  function cellAt(r, c) {
    return boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  }

  let tileIdSeq = 1;

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
    const total = CHAIN_KEYS.length * MAX_TIER;
    let unlocked = 0;
    CHAIN_KEYS.forEach(k => state.discovered[k].forEach(v => { if (v) unlocked++; }));
    unlockedEl.textContent = unlocked;
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
      el.addEventListener('click', () => selectOrder(i));
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

  // ---------- INTERACTION: TAP-TAP + DRAG ----------

  let selectedCell = null;   // { r, c }
  let activeOrderIdx = -1;

  function highlightSelection() {
    $$('.tile.is-selected', boardEl).forEach(el => el.classList.remove('is-selected'));
    if (selectedCell) {
      const t = tileAt(selectedCell.r, selectedCell.c);
      if (t) t.classList.add('is-selected');
    }
  }

  function tileAt(r, c) {
    return boardEl.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
  }

  function cellFromEvent(evt) {
    const rect = boardEl.getBoundingClientRect();
    const x = evt.clientX - rect.left - 8;   // subtract padding
    const y = evt.clientY - rect.top  - 8;
    const cellPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    const gap    = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
    const c = Math.floor(x / (cellPx + gap));
    const r = Math.floor(y / (cellPx + gap));
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) return null;
    return { r, c };
  }

  function onCellTap(r, c) {
    const item = state.board[r][c];

    // Order-fulfill flow
    if (activeOrderIdx >= 0 && item) {
      const order = state.orders[activeOrderIdx];
      if (order && item.chain === order.chain && item.tier === order.tier) {
        fulfillOrder(activeOrderIdx, r, c);
        return;
      } else {
        setStatus('That dish does not match the order. Try another.');
        // fall through to normal selection
      }
    }

    if (!selectedCell) {
      if (item) {
        selectedCell = { r, c };
        highlightSelection();
        setStatus(`Selected ${chainDef(item.chain, item.tier).name}. Tap a matching tile to merge.`);
      }
      return;
    }

    // A tile is already selected
    if (selectedCell.r === r && selectedCell.c === c) {
      selectedCell = null;
      highlightSelection();
      setStatus('Selection cleared.');
      return;
    }

    const source = state.board[selectedCell.r][selectedCell.c];
    if (!source) { selectedCell = null; highlightSelection(); return; }

    if (!item) {
      // Move to empty cell
      moveTile(selectedCell.r, selectedCell.c, r, c);
      selectedCell = null;
      highlightSelection();
      return;
    }

    // Both cells have tiles
    if (item.chain === source.chain && item.tier === source.tier && source.tier < MAX_TIER) {
      mergeTiles(selectedCell.r, selectedCell.c, r, c);
    } else {
      // Switch selection
      selectedCell = { r, c };
      highlightSelection();
      setStatus(`Selected ${chainDef(item.chain, item.tier).name}.`);
    }
  }

  function moveTile(fromR, fromC, toR, toC) {
    const item = state.board[fromR][fromC];
    state.board[toR][toC] = item;
    state.board[fromR][fromC] = null;
    const tile = tileAt(fromR, fromC);
    const dstCell = cellAt(toR, toC);
    if (tile && dstCell) {
      tagTile(tile, toR, toC);
      dstCell.appendChild(tile);
    }
    setStatus(`Moved ${chainDef(item.chain, item.tier).name}.`);
    saveState();
  }

  function mergeTiles(srcR, srcC, dstR, dstC) {
    const src = state.board[srcR][srcC];
    const dst = state.board[dstR][dstC];
    if (!src || !dst) return;
    if (src.chain !== dst.chain || src.tier !== dst.tier) return;
    if (dst.tier >= MAX_TIER) return;

    const newTier = dst.tier + 1;
    const merged = { chain: dst.chain, tier: newTier, id: tileIdSeq++ };
    state.board[srcR][srcC] = null;
    state.board[dstR][dstC] = merged;

    // Animate
    const srcTile = tileAt(srcR, srcC);
    const dstTile = tileAt(dstR, dstC);
    if (srcTile) srcTile.remove();
    if (dstTile) {
      const burst = document.createElement('div');
      burst.className = 'burst';
      dstTile.appendChild(burst);
      setTimeout(() => burst.remove(), 700);

      // Replace visual
      const def = chainDef(merged.chain, merged.tier);
      dstTile.dataset.tier = String(newTier);
      dstTile.setAttribute('aria-label', `${def.name}, tier ${newTier}`);
      dstTile.classList.remove('is-selected', 'is-spawning');
      // trigger reflow
      void dstTile.offsetWidth;
      dstTile.classList.add('is-spawning');
      dstTile.innerHTML = `
        <svg class="tile__art" viewBox="0 0 64 64" aria-hidden="true"><use href="${def.icon}"/></svg>
        <span class="tile__tier">T${newTier}</span>
      `;
    }

    const def = chainDef(merged.chain, merged.tier);
    const wasNew = !state.discovered[merged.chain][merged.tier - 1];
    if (wasNew) {
      state.discovered[merged.chain][merged.tier - 1] = true;
      showToast(`Discovered ${def.name}!`, 'info');
      setBubble(`${def.name} unlocked! Every dish joins your empire.`);
    } else {
      setStatus(`Merged into ${def.name} (T${merged.tier}).`);
    }

    if (merged.tier === MAX_TIER) {
      showDelicious();
      screenShake();
    }

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

  // ---------- POINTER (drag) ----------

  let dragState = null;

  function onPointerDown(evt) {
    if (evt.button !== undefined && evt.button !== 0) return;
    const tile = evt.target.closest('.tile');
    if (!tile) {
      // click on empty cell — treat as tap
      const cell = evt.target.closest('.cell');
      if (cell) {
        const r = +cell.dataset.r, c = +cell.dataset.c;
        onCellTap(r, c);
      }
      return;
    }
    const c = parseInt(tile.dataset.c, 10);
    const r = parseInt(tile.dataset.r, 10);
    dragState = {
      startR: r, startC: c, tile, moved: false,
      startX: evt.clientX, startY: evt.clientY,
    };
    tile.setPointerCapture?.(evt.pointerId);
  }

  function onPointerMove(evt) {
    if (!dragState) return;
    const dx = evt.clientX - dragState.startX;
    const dy = evt.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(dx, dy) > 10) {
      dragState.moved = true;
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
    tile.style.transform = '';
    tile.classList.remove('is-picked');
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
        }
      }
    }
    dragState = null;
  }

  // ---------- ORDERS ----------

  function generateOrder() {
    // Bias order to a discovered tier or one just above
    const chain = choice(CHAIN_KEYS);
    const maxDiscoveredTier = Math.max(1,
      state.discovered[chain].reduce((max, v, i) => v ? Math.max(max, i + 1) : max, 1));
    const tier = Math.max(1, Math.min(MAX_TIER, maxDiscoveredTier - rand(2) + 1));
    return {
      chain,
      tier,
      reward: REWARD[tier],
    };
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
      setStatus(`Now select a ${def.name} (Tier ${o.tier}) from the board.`);
    } else {
      setStatus('Order deselected.');
    }
  }

  function fulfillOrder(idx, r, c) {
    const order = state.orders[idx];
    const item  = state.board[r][c];
    if (!order || !item) return;
    // Remove tile
    state.board[r][c] = null;
    const tile = tileAt(r, c);
    if (tile) {
      // fly-away
      const rect = tile.getBoundingClientRect();
      tile.remove();
      flyCoinsFrom(rect.left + rect.width / 2, rect.top + rect.height / 2, order.reward);
    }
    state.coins += order.reward;
    state.orders.splice(idx, 1);
    activeOrderIdx = -1;
    showToast(`+${order.reward} served!`, 'default');
    setBubble(`Excellent! The customer devoured the ${chainDef(order.chain, order.tier).name}.`);
    ensureOrders();
    updateHUD();
    saveState();
  }

  // ---------- SPICE CRATE ----------

  function openCrate(free) {
    if (!free) {
      if (state.coins < CRATE_COST) {
        showToast('Not enough coins.', 'warn');
        return;
      }
      state.coins -= CRATE_COST;
      updateHUD();
    }

    // Choose drops — 3 items biased to tier 1-2, sometimes a higher tier
    const drops = [];
    for (let i = 0; i < 3; i++) {
      const chain = choice(CHAIN_KEYS);
      let tier = 1;
      const roll = Math.random();
      if (roll > 0.9)      tier = 3;
      else if (roll > 0.65) tier = 2;
      drops.push({ chain, tier });
    }

    // Build modal reveal
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

    // trigger open after brief moment
    setTimeout(() => crateReveal.classList.add('is-open'), 400);

    crateContinue.onclick = () => {
      crateModal.classList.remove('is-open');
      crateModal.setAttribute('aria-hidden', 'true');
      // Place items on the board
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
      setBubble('Fresh spices delivered from the souk!');
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

  setInterval(updateFreeCrateBtn, 1000);

  // ---------- FEEDBACK: TOASTS, BUBBLE, COINS, DELICIOUS ----------

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setBubble(text) {
    bubbleEl.textContent = text;
  }

  function showToast(text, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'info' ? ' toast--info' : (kind === 'warn' ? ' toast--warn' : ''));
    el.innerHTML = `<svg viewBox="0 0 64 64"><use href="#i-sparkle"/></svg><span>${text}</span>`;
    toastsEl.appendChild(el);
    setTimeout(() => el.remove(), 2200);
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
        { transform: 'translate(0,0) scale(1)',      opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.3 - 40}px) scale(1.2)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px)   scale(0.6)`, opacity: 0 },
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
      { transform: 'translate(0,0)' },
      { transform: 'translate(-6px, 2px)' },
      { transform: 'translate(6px, -2px)' },
      { transform: 'translate(-3px, 1px)' },
      { transform: 'translate(0,0)' },
    ], { duration: 350, easing: 'ease-out' });
  }

  // ---------- BOOT ----------

  function seedInitialBoard() {
    // 3 groups of 3 tier-1 items so player can immediately merge
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
      if (!bubbleEl.dataset.pinned) {
        idx = (idx + 1) % CHEF_LINES.length;
        setBubble(CHEF_LINES[idx]);
      }
    }, 12000);
  }

  function attachHandlers() {
    boardEl.addEventListener('pointerdown', onPointerDown);
    boardEl.addEventListener('pointermove', onPointerMove);
    boardEl.addEventListener('pointerup',   onPointerUp);
    boardEl.addEventListener('pointercancel', onPointerUp);

    // Keyboard: allow Escape to deselect
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        selectedCell = null;
        activeOrderIdx = -1;
        highlightSelection();
        renderOrders();
        setStatus('Selection cleared.');
      }
    });

    crateBtn.addEventListener('click', () => openCrate(false));
    freeCrateBtn.addEventListener('click', () => {
      if (Date.now() >= state.nextFreeCrate) openCrate(true);
    });

    bookBtn.addEventListener('click', () => {
      renderBook();
      bookModal.classList.add('is-open');
      bookModal.setAttribute('aria-hidden', 'false');
    });
    bookClose.addEventListener('click', () => {
      bookModal.classList.remove('is-open');
      bookModal.setAttribute('aria-hidden', 'true');
    });

    // Close modals when clicking backdrop
    [bookModal, crateModal].forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target === m) {
          m.classList.remove('is-open');
          m.setAttribute('aria-hidden', 'true');
        }
      });
    });

    $('#startBtn').addEventListener('click', () => {
      const title = $('#titleScreen');
      title.classList.add('is-gone');
      $('#app').setAttribute('aria-hidden', 'false');
      // Start music/mood-ish? None here (audio not autoplayable safely).
    });
  }

  function boot() {
    const loaded = loadState();
    if (!loaded) seedInitialBoard();
    // Re-hydrate ids
    for (let r = 0; r < BOARD_ROWS; r++)
      for (let c = 0; c < BOARD_COLS; c++)
        if (state.board[r][c] && !state.board[r][c].id) state.board[r][c].id = tileIdSeq++;

    ensureOrders();
    renderBoard();
    updateHUD();
    renderBook();
    updateFreeCrateBtn();
    spawnAmbientParticles();
    rotateChefLines();
    attachHandlers();

    // First hint about controls
    setStatus('Tap or drag two matching ingredients to merge.');
  }

  boot();
})();
