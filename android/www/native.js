/* ==========================================================================
   BNIINE ANDROID — Capacitor bridge
   Wires the shared game.js to native Android APIs: haptics, splash, back
   button, wake lock, status bar, screen orientation.
   Loaded AFTER game.js so it patches into modules the game already exposes.
   ========================================================================== */

(async function () {
  'use strict';

  // Capacitor is injected by @capacitor/core when the WebView starts. If we're
  // running in a plain browser (dev preview), Capacitor won't be defined and
  // we just no-op everything — the game still runs with its web fallbacks.
  const cap = (typeof window !== 'undefined' && window.Capacitor) || null;
  const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());

  if (!isNative) {
    console.info('[native] Not running on native Android; skipping Capacitor bridge.');
    return;
  }

  // --- Lazy-import Capacitor plugins so a missing plugin doesn't blow up boot
  async function load(mod) {
    try { return await import(mod); } catch (e) { console.warn('[native] plugin missing:', mod, e); return null; }
  }

  const [
    Haptics,
    App,
    KeepAwake,
    SplashScreen,
    StatusBar,
    ScreenOrientation,
  ] = await Promise.all([
    load('@capacitor/haptics'),
    load('@capacitor/app'),
    load('@capacitor/keep-awake'),
    load('@capacitor/splash-screen'),
    load('@capacitor/status-bar'),
    load('@capacitor/screen-orientation'),
  ]);

  // --- Splash: hide as soon as the game's own HTML splash starts
  try {
    await SplashScreen?.SplashScreen.hide({ fadeOutDuration: 250 });
  } catch (_) {}

  // --- Status bar: warm-brown, matches the game palette
  try {
    await StatusBar?.StatusBar.setStyle({ style: 'DARK' });
    await StatusBar?.StatusBar.setBackgroundColor({ color: '#2B1810' });
    await StatusBar?.StatusBar.setOverlaysWebView({ overlay: false });
  } catch (_) {}

  // --- Force portrait so the whole UI stays in one layout
  try {
    await ScreenOrientation?.ScreenOrientation.lock({ orientation: 'portrait' });
  } catch (_) {}

  // --- Keep screen on while the game is focused so nobody times out mid-merge
  try {
    await KeepAwake?.KeepAwake.keepAwake();
  } catch (_) {}

  // --- Native haptics: patch the game's Haptics wrapper (defined in game.js)
  // so tap / merge / legendary all go through native taptic engines.
  if (Haptics?.Haptics && window.__bniine_haptics_ready === undefined) {
    const H = Haptics.Haptics;
    const Style = Haptics.ImpactStyle || { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' };
    const NotificationType = Haptics.NotificationType || { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' };

    // Wrap navigator.vibrate so the existing game code (which calls it) is
    // automatically routed through native haptics without touching game.js.
    const originalVibrate = navigator.vibrate?.bind(navigator);
    navigator.vibrate = (pattern) => {
      try {
        if (!Array.isArray(pattern)) pattern = [pattern];
        const total = pattern.reduce((a, b, i) => (i % 2 === 0 ? a + b : a), 0);
        if (total > 60) H.impact({ style: Style.Heavy });
        else if (total > 20) H.impact({ style: Style.Medium });
        else H.impact({ style: Style.Light });
      } catch (_) { if (originalVibrate) originalVibrate(pattern); }
      return true;
    };

    // Expose a stronger celebration for level-ups and legendary discoveries
    window.__bniine_native_haptics = {
      levelUp:   () => { try { H.notification({ type: NotificationType.Success }); } catch (_) {} },
      legendary: () => { try { H.notification({ type: NotificationType.Success }); H.impact({ style: Style.Heavy }); } catch (_) {} },
      error:     () => { try { H.notification({ type: NotificationType.Error }); } catch (_) {} },
    };
    window.__bniine_haptics_ready = true;
  }

  // --- Android hardware back button: close open modals first, then confirm exit
  App?.App.addListener('backButton', ({ canGoBack }) => {
    // Priority order: any open modal → close it. Otherwise a double-tap-to-exit.
    const openModal = document.querySelector('.modal.is-open');
    if (openModal) {
      const closeBtn = openModal.querySelector('.modal__close');
      if (closeBtn) { closeBtn.click(); return; }
      openModal.classList.remove('is-open');
      openModal.setAttribute('aria-hidden', 'true');
      return;
    }
    const openTutorial = document.querySelector('.tutorial.is-open');
    if (openTutorial) {
      document.getElementById('tutorialSkip')?.click();
      return;
    }
    // No modal open — ask to exit
    if (window.__bniine_back_pressed_at && Date.now() - window.__bniine_back_pressed_at < 2000) {
      App.App.exitApp();
    } else {
      window.__bniine_back_pressed_at = Date.now();
      showExitToast();
    }
  });

  function showExitToast() {
    const t = document.createElement('div');
    t.className = 'toast toast--info';
    t.style.pointerEvents = 'none';
    t.innerHTML = '<span>Press back again to exit</span>';
    (document.getElementById('toasts') || document.body).appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  // --- Release wake lock when the app is backgrounded, restore on resume
  App?.App.addListener('appStateChange', async (state) => {
    try {
      if (state.isActive) {
        await KeepAwake?.KeepAwake.keepAwake();
      } else {
        await KeepAwake?.KeepAwake.allowSleep();
      }
    } catch (_) {}
  });

  console.info('[native] Bniine native bridge ready.');
})();
