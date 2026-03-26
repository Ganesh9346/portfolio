(function () {
  const body = document.body;
  const introEl = document.getElementById('cinematicIntro');
  const skipBtn = document.getElementById('skipIntro');
  const stage = document.querySelector('.cinematic-stage');
  const laptopScreen = document.querySelector('.laptop-screen');
  const params = new URLSearchParams(window.location.search);

  const introOff = params.get('intro') === 'off';
  const embedMode = params.get('embed') === '1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (embedMode) {
    body.classList.add('embed-portfolio');
  }

  if (!introEl) {
    body.classList.remove('intro-active');
    return;
  }

  if (introOff || embedMode || reducedMotion) {
    introEl.remove();
    body.classList.remove('intro-active');
    return;
  }

  let finished = false;
  const timers = [];

  function queue(ms, fn) {
    const id = window.setTimeout(fn, ms);
    timers.push(id);
  }

  function clearAllTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers.length = 0;
  }

  function easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (1 - t) * (1 - t) * (1 - t) * (1 - t);
  }

  function endIntro() {
    if (finished) return;
    finished = true;
    clearAllTimers();

    body.classList.add('intro-phase-end');
    introEl.classList.add('done');
    body.classList.remove('intro-active', 'intro-phase-work', 'intro-phase-zoom', 'intro-phase-portal');

    window.setTimeout(() => {
      introEl.remove();
      body.classList.remove('intro-phase-end');
    }, 1000);
  }

  // Phase 1: Work animation (0-2s)
  body.classList.add('intro-phase-work');

  // Phase 2: Camera zoom into laptop (2-4s)
  queue(2000, function () {
    body.classList.remove('intro-phase-work');
    body.classList.add('intro-phase-zoom');
  });

  // Phase 3: Laptop expands to fullscreen (4-7s)
  queue(4000, function () {
    body.classList.add('intro-phase-portal');
  });

  // Phase 4: Fade out and end
  queue(7200, endIntro);

  if (skipBtn) {
    skipBtn.addEventListener('click', endIntro);
  }
})();
