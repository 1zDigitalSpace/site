/* Hyalite v0.5.0 enhancement; all content and interaction live in main.js. */
(() => {
  'use strict';
  const glass = window.Hyalite;
  if (!glass?.supported() || !('IntersectionObserver' in window)) return;
  const compact = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lowPower = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
  const targets = new Map();
  const queue = new Map();
  let pump = 0;
  let observer, started = false;
  const idle = callback => 'requestIdleCallback' in window
    ? requestIdleCallback(callback, { timeout: 600 }) : setTimeout(callback, 32);

  // Share a small per-frame budget as more surfaces come into view.
  function schedule(el, callback) {
    queue.set(el, callback);
    if (pump) return;
    pump = requestAnimationFrame(() => idle(() => {
      pump = 0;
      const startedAt = performance.now();
      for (const [target, build] of queue) {
        queue.delete(target);
        build();
        if (performance.now() - startedAt >= 6) break;
      }
      if (queue.size) {
        const [target, build] = queue.entries().next().value;
        schedule(target, build);
      }
    }));
  }

  function options(kind) {
    const light = compact.matches || lowPower;
    const motion = !reduced.matches && !document.body.classList.contains('motion-paused');
    const base = { dispersion: 0, sat: 1, smooth: 0, slope: 1.3,
      shade: .18, rim: .85, edge: .2, settle: 140,
      materialize: motion ? 320 : 0 };
    if (kind === 'nav') return { ...base, bevel: light ? 12 : 18,
      thickness: light ? 18 : 28, blur: light ? 5 : 4 };
    if (kind === 'control') return { ...base, bevel: light ? 9 : 13,
      thickness: light ? 18 : 30, blur: .6, dispersion: light ? 0 : .5, rim: 1.1 };
    if (kind === 'label') return { ...base, bevel: light ? 10 : 16,
      thickness: light ? 18 : 30, blur: 1, rim: 1.15 };
    return { ...base, bevel: light ? 12 : 17, thickness: light ? 15 : 22,
      slope: .8, smooth: 1, blur: .8, shade: .1, rim: 1.05 };
  }
  function detach(el, state) {
    queue.delete(el);
    state.pending = null;
    glass.detach(el);
    el.classList.remove('has-refraction');
    if (state.kind === 'photo') el.parentElement.classList.remove('has-refraction-frame');
  }
  function observeTargets() {
    observer?.disconnect();
    targets.forEach((state, el) => detach(el, state));
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const el = entry.target, state = targets.get(el);
        if (!entry.isIntersecting) { detach(el, state); continue; }
        if (state.pending !== null || el.classList.contains('has-refraction')) continue;
        state.pending = true;
        schedule(el, () => {
          state.pending = null;
          try {
            glass.attach(el, options(state.kind));
            if (!el.style.getPropertyValue('--hyalite')) return;
            el.classList.add('has-refraction');
            if (state.kind === 'photo') el.parentElement.classList.add('has-refraction-frame');
          } catch (error) {
            detach(el, state);
            console.warn('Refraction unavailable; retaining CSS glass.', error);
          }
        });
      }
    }, { rootMargin: '180px 0px' });
    targets.forEach((state, el) => {
      const enabled = state.kind !== 'photo' || el.parentElement.classList.contains('vibe-main')
        || (!compact.matches && !lowPower);
      if (state.kind === 'photo') el.classList.toggle('is-available', enabled);
      if (enabled) observer.observe(el);
    });
  }
  function start() {
    if (started) return;
    started = true;
    document.querySelectorAll('.nav, .gallery-arrow, .gallery-expand').forEach(el => {
      targets.set(el, { kind: el.classList.contains('nav') ? 'nav' : 'control', pending: null });
    });
    document.querySelectorAll('.orbit-label').forEach(el => {
      targets.set(el, { kind: 'label', pending: null });
    });
    document.querySelectorAll('.vibe-fig').forEach(figure => {
      const ring = document.createElement('span');
      ring.className = 'photo-refraction';
      ring.setAttribute('aria-hidden', 'true');
      figure.appendChild(ring);
      targets.set(ring, { kind: 'photo', pending: null });
    });
    observeTargets();
    compact.addEventListener('change', observeTargets);
    reduced.addEventListener('change', observeTargets);
    // Honor the existing pause control without changing the scroll animation.
    new MutationObserver(records => {
      if (records.some(record => (record.oldValue || '').split(/\s+/).includes('motion-paused')
        !== document.body.classList.contains('motion-paused'))) observeTargets();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }
  if (!document.documentElement.classList.contains('is-booting')) idle(start);
  else window.addEventListener('digitalspace:ready', () => idle(start), { once: true });
})();
