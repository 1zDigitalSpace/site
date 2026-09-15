'use strict';

/* A frame-timed terminal, followed by a continuous dissolve into the homepage. */
(() => {
  const loader = document.getElementById('preloader');
  if (!loader) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const skip = document.getElementById('skipBoot');
  const originalInert = [...document.body.children]
    .filter(el => el !== loader && el.tagName !== 'SCRIPT')
    .map(el => [el, el.inert]);
  originalInert.forEach(([el]) => { el.inert = true; el.dataset.bootInert = ''; });
  skip.focus({ preventScroll: true });
  const specs = [
    { prompt: '$', text: './boot.sh --start', command: true },
    { prompt: '>', text: 'BOOT DIGITAL_SPACE OS v2.1 ...' },
    { prompt: '>', text: 'LOADING MODULES [ 数码科技 | 电子技术 | 信息编程 ] ... OK' },
    { prompt: '>', text: 'MOUNTING /dev/creativity ... OK' },
    { prompt: '>', text: 'LOADING passion.sys ...... OK' },
    { prompt: '$', text: './digital-space --enter', command: true },
    { prompt: '>', text: 'WELCOME, GEEK.' }
  ];
  const box = document.getElementById('bootLines');
  const rows = specs.map(spec => {
    const row = document.createElement('div');
    row.className = `boot-row is-pending${spec.command ? ' boot-command' : ''}`;
    const prompt = document.createElement('span');
    prompt.className = 'boot-prompt'; prompt.textContent = spec.prompt;
    const text = document.createElement('span'); text.className = 'boot-row-text';
    const source = document.createElement('span'); source.className = 'boot-source'; source.textContent = spec.text;
    const live = document.createElement('span'); live.className = 'boot-live';
    text.append(source, live); row.append(prompt, text); box.append(row);
    return { ...spec, row, live, characters: Array.from(spec.text) };
  });
  let frame = 0, ended = false, assetReady = false;
  let line = 0, character = 0, typed = 0, progress = 0, readyHold = 0;
  let delay = 250, lastTime = performance.now();
  const total = rows.reduce((sum, row) => sum + row.characters.length, 0);
  const state = document.getElementById('bootState');
  function fillTerminal() {
    rows.forEach(({ row, live, text }) => {
      row.classList.remove('is-pending'); live.classList.remove('is-writing'); live.textContent = text;
    });
  }
  function beginExit(userAction = false) {
    if (ended) return;
    ended = true;
    clearTimeout(maximumWait); clearTimeout(window.__bootFailsafe);
    cancelAnimationFrame(frame);
    document.getElementById('bootNumber').textContent = '100';
    document.getElementById('preBarFill').style.transform = 'scaleX(1)';
    state.textContent = 'READY';
    loader.classList.add('is-exiting'); loader.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-booting'); root.classList.add('is-revealing');
    originalInert.forEach(([el, inert]) => { el.inert = inert; delete el.dataset.bootInert; });
    if (document.activeElement === skip) {
      skip.blur();
      if (userAction) document.querySelector('.nav-logo').focus({ preventScroll: true });
    }
    dispatchEvent(new Event('digitalspace:ready'));
    setTimeout(() => { loader.remove(); root.classList.remove('is-revealing'); }, reduced ? 0 : 1250);
  }
  function draw(now) {
    const dt = Math.min(now - lastTime, 64); lastTime = now;
    if (ended) return;
    delay -= dt;
    while (delay <= 0 && line < rows.length) {
      const current = rows[line];
      state.textContent = 'RUNNING';
      current.row.classList.remove('is-pending'); current.live.classList.add('is-writing');
      current.live.textContent = current.characters.slice(0, ++character).join('');
      typed++;
      if (character >= current.characters.length) {
        current.live.classList.remove('is-writing'); line++; character = 0;
        delay += current.command ? 170 : 95;
      } else delay += current.command ? 25 : 12;
    }
    const complete = line >= rows.length && assetReady;
    const target = complete ? 100 : Math.min(96, 4 + typed / total * 92);
    progress += (target - progress) * (1 - Math.exp(-dt / 125));
    document.getElementById('bootNumber').textContent = String(Math.floor(progress)).padStart(2, '0');
    document.getElementById('preBarFill').style.transform = `scaleX(${progress / 100})`;
    if (complete && progress > 99.75) {
      state.textContent = 'READY'; readyHold += dt;
      if (readyHold >= 200) { beginExit(); return; }
    }
    frame = requestAnimationFrame(draw);
  }
  const maximumWait = setTimeout(() => { fillTerminal(); beginExit(); }, 6500);
  skip.addEventListener('click', () => beginExit(true));
  loader.addEventListener('keydown', event => {
    if (event.key === 'Escape') beginExit(true);
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  const assets = [document.fonts?.ready, ...[...document.querySelectorAll('.hero-logo-img, #galleryImage')].map(img => {
    img.loading = 'eager'; return img.decode().catch(() => {});
  })];
  Promise.race([Promise.allSettled(assets), new Promise(resolve => setTimeout(resolve, 3000))])
    .then(() => { assetReady = true; });
  if (reduced) { fillTerminal(); setTimeout(() => beginExit(), 100); }
  else frame = requestAnimationFrame(draw);
})();

/* No scroll hijacking or rendering dependencies. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = $('#home');
  const nav = $('#nav');
  const menu = $('#navLinks');
  const toggle = $('#navToggle');
  const links = $$('.nav-link');
  const sections = $$('header[id], main > section[id]');
  let motionPaused = false;
  let heroVisible = true;
  let pageReady = !document.documentElement.classList.contains('is-booting');
  let syncTerminal = () => {};
  let syncGallery = () => {};
  let updateVibe = () => {};
  let syncVibe = () => {};
  addEventListener('digitalspace:ready', () => { pageReady = true; syncMotion(); });

  function setMenu(open, restoreFocus = false) {
    menu.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) setMenu(false);
  });
  nav.addEventListener('focusout', event => {
    if (!nav.contains(event.relatedTarget)) setMenu(false);
  });
  matchMedia('(max-width: 760px)').addEventListener('change', () => setMenu(false));

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in-view');
        reveal.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    document.body.classList.add('motion-ready');
    $$('.reveal').forEach(element => reveal.observe(element));
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      syncMotion();
    }).observe(hero);
  }

  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const y = scrollY;
    const total = document.documentElement.scrollHeight - innerHeight;
    $('#scrollProgress').style.transform = `scaleX(${total > 0 ? y / total : 0})`;
    nav.classList.toggle('scrolled', y > 24);
    $('#backTop').classList.toggle('show', y > 600);
    let current = 'home';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= innerHeight * .36) current = section.id;
    }
    for (const link of links) {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    updateVibe();
  }
  function queueScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });
  updateScroll();
  $('#backTop').addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    $('.nav-logo').focus({ preventScroll: true });
  });

  // Subtle pointer parallax acts on the sculpture only, never on reading text.
  hero.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || motionPaused) return;
    const bounds = hero.getBoundingClientRect();
    $('.hero-art').style.setProperty('--px', `${(event.clientX / bounds.width - .5) * 9}deg`);
    $('.hero-art').style.setProperty('--py', `${-(event.clientY / bounds.height - .5) * 7}deg`);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    $('.hero-art').style.setProperty('--px', '0deg');
    $('.hero-art').style.setProperty('--py', '0deg');
  });

  // All five original lines are retained. Suspend the timer off-screen.
  const phrases = [
    '星河揽梦，电掣流光',
    'E quindi uscimmo a riveder le stelle.',
    '不浪费每一寸晶圆。',
    '啊啊 这个这个 这个这个我们 这个这个啊 这个是吧 啊 这个这个啊啊 这个啊',
    '你好李鑫'
  ];
  let phraseIndex = 0;
  let character = phrases[0].length;
  let deleting = true;
  let typingTimer;
  function type() {
    const phrase = phrases[phraseIndex];
    character += deleting ? -1 : 1;
    $('#typedText').textContent = phrase.slice(0, character);
    let delay = deleting ? 32 : 85;
    if (deleting && character <= 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 380;
    } else if (!deleting && character >= phrase.length) {
      deleting = true;
      delay = 3500;
    }
    typingTimer = setTimeout(type, delay);
  }

  const motionButton = document.createElement('button');
  motionButton.className = 'motion-toggle mono';
  motionButton.setAttribute('aria-pressed', 'false');
  motionButton.textContent = 'Ⅱ 暂停动效';
  $('.hero-bottom').insertBefore(motionButton, $('.hero-page'));
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.textContent = motionPaused ? '▷ 播放动效' : 'Ⅱ 暂停动效';
    syncMotion();
  });
  function syncMotion() {
    clearTimeout(typingTimer);
    if (reducedMotion.matches) {
      $('#typedText').textContent = phrases[phraseIndex];
      character = phrases[phraseIndex].length;
      deleting = true;
    }
    const pause = reducedMotion.matches || motionPaused || document.hidden || !pageReady;
    document.body.classList.toggle('motion-paused', pause);
    $$('.orbital-sculpture, .orbit-label').forEach(el => {
      el.style.animationPlayState = pause || !heroVisible ? 'paused' : 'running';
    });
    if (!pause && heroVisible) typingTimer = setTimeout(type, 3500);
    syncTerminal();
    syncVibe();
    syncGallery();
  }
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();

  // Keep the original URL; a remote avatar outage gets a readable placeholder.
  $$('.friend-avatar, .avatar').forEach(img => {
    function fallback() {
      if (img.nextElementSibling?.classList.contains('avatar-fallback')) return;
      const placeholder = document.createElement('span');
      placeholder.className = `${img.className} avatar-fallback`;
      placeholder.textContent = img.classList.contains('friend-avatar') ? img.alt.slice(0, 2) : 'DS';
      placeholder.setAttribute('aria-label', img.alt);
      img.hidden = true;
      img.after(placeholder);
    }
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });

  // An uncropped featured image, backed by the ten original photographs.
  const shots = $$('.gallery-thumbs .shot');
  const album = shots.map(figure => ({ image: $('img', figure), trigger: figure }));
  const moments = $$('.vibe-fig').map(figure => ({ image: $('img', figure), trigger: figure }));
  let albumIndex = 0;
  let galleryVersion = 0;
  let galleryTimer = 0, galleryLoading = false;
  let galleryPaused = false, galleryRemaining = 3000, galleryDeadline = 0;
  let galleryProgressAnimation = null, galleryFadeAnimations = [];
  let galleryVisible = !('IntersectionObserver' in window);
  const albumImage = $('#galleryImage');
  const galleryPauseButton = $('#galleryPause');
  const galleryProgress = $('#galleryTimeFill');
  const galleryAmbient = $('.gallery-ambient');
  $('#galleryPlayback').hidden = false;
  function stopGalleryCountdown(reset = false) {
    if (galleryTimer) galleryRemaining = Math.max(0, galleryDeadline - performance.now());
    clearTimeout(galleryTimer);
    galleryTimer = 0;
    galleryProgressAnimation?.pause();
    if (reset) {
      galleryRemaining = 3000;
      galleryProgressAnimation?.cancel();
      galleryProgressAnimation = null;
    }
  }
  function finishGalleryFade() {
    galleryFadeAnimations.forEach(animation => animation.cancel());
    galleryFadeAnimations = [];
    $$('.gallery-previous, .gallery-ambient-previous').forEach(el => el.remove());
  }
  syncGallery = () => {
    stopGalleryCountdown();
    const motionStopped = motionPaused || reducedMotion.matches;
    const paused = galleryPaused || motionStopped;
    galleryPauseButton.disabled = motionStopped;
    galleryPauseButton.textContent = paused ? '▷ 播放' : 'Ⅱ 暂停';
    galleryPauseButton.setAttribute('aria-label', paused ? '继续自动播放' : '暂停自动播放');
    $('#galleryPlaybackStatus').textContent = motionStopped ? '动效已暂停' : galleryPaused ? '已暂停' : '自动播放 · 3 秒';
    $('#galleryCaption').setAttribute('aria-live', paused ? 'polite' : 'off');
    if (motionStopped) finishGalleryFade();
    if (!galleryVisible || galleryLoading || !pageReady || document.hidden || paused
      || document.body.classList.contains('modal-open')) return;
    galleryProgressAnimation?.cancel();
    galleryProgressAnimation = galleryProgress.animate([
      { transform: `scaleX(${1 - galleryRemaining / 3000})` }, { transform: 'scaleX(1)' }
    ], { duration: galleryRemaining, easing: 'linear', fill: 'forwards' });
    galleryDeadline = performance.now() + galleryRemaining;
    galleryTimer = setTimeout(() => {
      galleryTimer = 0;
      selectPhoto(albumIndex + 1);
    }, galleryRemaining);
  };
  galleryPauseButton.addEventListener('click', () => {
    galleryPaused = !galleryPaused;
    syncGallery();
  });
  function imageUrl(image) { return image.currentSrc || image.src; }
  async function selectPhoto(index, focus = false) {
    stopGalleryCountdown(true);
    galleryLoading = true;
    albumIndex = (index + album.length) % album.length;
    const version = ++galleryVersion;
    const item = album[albumIndex];
    shots.forEach((shot, i) => shot.setAttribute('aria-pressed', String(i === albumIndex)));
    const next = new Image();
    next.src = imageUrl(item.image);
    await next.decode().catch(() => {});
    if (version !== galleryVersion) return;
    finishGalleryFade();
    const animate = !reducedMotion.matches && !motionPaused && albumImage.src !== next.src;
    let previousImage, previousAmbient;
    if (animate) {
      previousImage = albumImage.cloneNode();
      previousImage.removeAttribute('id');
      previousImage.className = 'gallery-previous';
      previousImage.alt = '';
      previousImage.setAttribute('aria-hidden', 'true');
      albumImage.after(previousImage);
      previousAmbient = galleryAmbient.cloneNode();
      previousAmbient.classList.add('gallery-ambient-previous');
      galleryAmbient.after(previousAmbient);
    }
    albumImage.src = next.src;
    albumImage.alt = item.image.alt;
    galleryAmbient.style.backgroundImage = `url("${next.src}")`;
    if (animate) {
      const timing = { duration: 650, easing: 'cubic-bezier(.22,.61,.36,1)' };
      const incoming = albumImage.animate([{ opacity: 0 }, { opacity: 1 }], timing);
      const outgoing = previousImage.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, fill: 'forwards' });
      const ambient = previousAmbient.animate([
        { opacity: getComputedStyle(previousAmbient).opacity }, { opacity: 0 }
      ], { ...timing, fill: 'forwards' });
      galleryFadeAnimations = [incoming, outgoing, ambient];
      outgoing.finished.then(() => {
        if (version === galleryVersion) finishGalleryFade();
      }).catch(() => {});
    }
    $('#galleryCaption').textContent = item.image.alt;
    $('#galleryCount').textContent = `${String(albumIndex + 1).padStart(2, '0')} / ${album.length}`;
    $('#galleryOpen').setAttribute('aria-label', `放大查看：${item.image.alt}`);
    const strip = $('.gallery-thumbs');
    const selected = shots[albumIndex];
    strip.scrollTo({ left: selected.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + selected.clientWidth / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    if (focus) selected.focus({ preventScroll: true });
    galleryLoading = false;
    syncGallery();
  }
  shots.forEach((figure, index) => {
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `选择照片 ${index + 1}：${$('img', figure).alt}`);
    figure.setAttribute('aria-pressed', String(index === 0));
    figure.addEventListener('click', () => selectPhoto(index));
    figure.addEventListener('keydown', event => {
      if (['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) event.preventDefault();
      if (event.key === 'Enter' || event.key === ' ') selectPhoto(index);
      if (event.key === 'ArrowLeft') selectPhoto(index - 1, true);
      if (event.key === 'ArrowRight') selectPhoto(index + 1, true);
      if (event.key === 'Home') selectPhoto(0, true);
      if (event.key === 'End') selectPhoto(album.length - 1, true);
    });
  });
  $('#galleryPrev').addEventListener('click', () => selectPhoto(albumIndex - 1));
  $('#galleryNext').addEventListener('click', () => selectPhoto(albumIndex + 1));
  $('.gallery-ambient').style.backgroundImage = `url("${albumImage.src}")`;
  if ('IntersectionObserver' in window) {
    const preloadAlbum = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      album.forEach(({ image }) => { image.loading = 'eager'; });
      preloadAlbum.disconnect();
    }, { rootMargin: '600px 0px' });
    preloadAlbum.observe($('.about-photos'));
    const galleryVisibility = new IntersectionObserver(entries => {
      galleryVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
      syncGallery();
    }, { threshold: [0, .15] });
    galleryVisibility.observe($('#galleryFrame'));
  }
  syncGallery();

  let activeDialog = null;
  let previousFocus = null;
  let previousInert = [];
  function openDialog(dialog, trigger) {
    if (activeDialog) closeDialog();
    previousFocus = trigger || document.activeElement;
    activeDialog = dialog;
    dialog.classList.add('open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    syncGallery();
    previousInert = [...document.body.children]
      .filter(el => el !== dialog && el.tagName !== 'SCRIPT')
      .map(el => [el, el.inert]);
    previousInert.forEach(([el]) => { el.inert = true; });
    // Wait for visibility to commit before moving focus out of inert content.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (activeDialog === dialog) $('button', dialog).focus({ preventScroll: true });
    }));
  }
  function closeDialog() {
    if (!activeDialog) return;
    activeDialog.classList.remove('open');
    activeDialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    previousInert.forEach(([el, inert]) => { el.inert = inert; });
    activeDialog = null;
    syncGallery();
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  $$('[data-join-modal]').forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    // A hidden mobile-menu link cannot receive restored focus.
    openDialog($('#joinModal'), getComputedStyle(toggle).display !== 'none' && menu.contains(trigger) ? toggle : trigger);
  }));
  $('#joinModalClose').addEventListener('click', closeDialog);
  $('.lb-close').addEventListener('click', closeDialog);
  [$('#joinModal'), $('#lightbox')].forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  }));
  let viewerItems = [], viewerIndex = 0, viewerVersion = 0;
  function setZoom(zoom) {
    $('#lbViewport').classList.toggle('zoomed', zoom);
    $('#lbZoom').setAttribute('aria-pressed', String(zoom));
    $('#lbZoom').setAttribute('aria-label', zoom ? '适应屏幕大小' : '放大至原始尺寸');
    $('#lbZoom span').textContent = zoom ? '适应' : '原图';
    $('#lbImg').style.setProperty('--image-width', `${$('#lbImg').naturalWidth}px`);
    $('#lbViewport').scrollTo(0, 0);
  }
  async function renderViewer(index) {
    viewerIndex = (index + viewerItems.length) % viewerItems.length;
    const version = ++viewerVersion;
    const item = viewerItems[viewerIndex];
    const image = new Image();
    image.src = imageUrl(item.image);
    await image.decode().catch(() => {});
    if (version !== viewerVersion) return;
    setZoom(false);
    $('#lbImg').src = image.src;
    $('#lbImg').alt = item.image.alt;
    $('#lbCap').textContent = item.image.alt;
    $('#lbCount').textContent = `${String(viewerIndex + 1).padStart(2, '0')} / ${String(viewerItems.length).padStart(2, '0')}`;
    $('#lbPrev').disabled = $('#lbNext').disabled = viewerItems.length < 2;
  }
  function openViewer(items, index, trigger) {
    viewerItems = items;
    renderViewer(index);
    openDialog($('#lightbox'), trigger);
  }
  $('#galleryOpen').addEventListener('click', event => openViewer(album, albumIndex, event.currentTarget));
  moments.forEach((item, index) => {
    const figure = item.trigger;
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `放大查看：${item.image.alt}`);
    figure.addEventListener('click', () => openViewer(moments, index, figure));
    figure.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(moments, index, figure);
      }
    });
  });
  const hardware = $('.work-media img.cover');
  const hardwareFrame = hardware.closest('.work-media');
  hardwareFrame.tabIndex = 0;
  hardwareFrame.setAttribute('role', 'button');
  hardwareFrame.setAttribute('aria-label', '放大查看洗洁精机箱原图');
  hardwareFrame.addEventListener('click', () => openViewer([{ image: hardware }], 0, hardwareFrame));
  hardwareFrame.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); openViewer([{ image: hardware }], 0, hardwareFrame);
    }
  });
  $('#lbPrev').addEventListener('click', () => renderViewer(viewerIndex - 1));
  $('#lbNext').addEventListener('click', () => renderViewer(viewerIndex + 1));
  $('#lbZoom').addEventListener('click', () => setZoom(!$('#lbViewport').classList.contains('zoomed')));
  $('#lbImg').addEventListener('dblclick', () => setZoom(!$('#lbViewport').classList.contains('zoomed')));
  let touchStart = null;
  $('#lbViewport').addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  $('#lbViewport').addEventListener('touchend', event => {
    if (!touchStart || $('#lbViewport').classList.contains('zoomed')) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) renderViewer(viewerIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeDialog) closeDialog();
      else if (menu.classList.contains('open')) setMenu(false, true);
    }
    if (activeDialog === $('#lightbox') && !$('#lbViewport').classList.contains('zoomed') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      renderViewer(viewerIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key !== 'Tab' || !activeDialog) return;
    const controls = $$('button:not(:disabled), a[href], [tabindex="0"]', activeDialog);
    const first = controls[0];
    const last = controls.at(-1);
    if (!activeDialog.contains(document.activeElement)) {
      event.preventDefault(); first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });

  // The poster is pinned by CSS. Only its surrounding pictures animate.
  // Passive scrolling feeds one small requestAnimationFrame loop; no wheel interception.
  const vibe = $('#vibe');
  const story = $('.vibe-story');
  const sticky = $('.vibe-sticky');
  const satellites = $$('.vibe-sat');
  const stepDots = $$('.vibe-steps i');
  let vibeFrame = 0, vibeProgress = 0, vibeTarget = 0, vibeTime = 0;
  const clamp = value => Math.min(1, Math.max(0, value));
  function paintVibe(progress, all = false) {
    let count = 0;
    satellites.forEach(figure => {
      const step = Number(figure.dataset.step);
      const phase = all ? 1 : clamp((progress - .035 - step * .13) / .16);
      const ease = phase * phase * (3 - 2 * phase);
      const side = figure.dataset.side === 'left' ? -1 : 1;
      const rotation = parseFloat(figure.style.getPropertyValue('--rest-rotation')) || 0;
      figure.style.opacity = String(ease);
      figure.style.transform = `translate3d(${side * 75 * (1 - ease)}px,${55 * (1 - ease)}px,0) rotate(${rotation + side * 7 * (1 - ease)}deg) scale(${.87 + ease * .13})`;
      const visible = phase > .5;
      // Unrevealed pictures must not trap keyboard focus or receive accidental taps.
      if (figure.inert === visible) figure.inert = !visible;
      figure.tabIndex = visible ? 0 : -1;
      if (visible) figure.removeAttribute('aria-hidden');
      else figure.setAttribute('aria-hidden', 'true');
      stepDots[step].classList.toggle('is-visible', visible);
      if (visible) count++;
    });
    $('#vibeCounter').textContent = `${String(count).padStart(2, '0')} / 06`;
    $('.vibe-aura').style.setProperty('--aura-shift', `${progress * 60}px`);
  }
  function animateVibe(now) {
    const dt = Math.min(vibeTime ? now - vibeTime : 16, 64);
    vibeTime = now;
    vibeProgress += (vibeTarget - vibeProgress) * (1 - Math.exp(-dt / 85));
    if (Math.abs(vibeTarget - vibeProgress) < .0005) vibeProgress = vibeTarget;
    paintVibe(vibeProgress);
    if (vibeProgress !== vibeTarget && !document.hidden) vibeFrame = requestAnimationFrame(animateVibe);
    else { vibeFrame = 0; vibeTime = 0; }
  }
  updateVibe = () => {
    if (!vibe.classList.contains('vibe-scroll-enabled') || motionPaused) return;
    const bounds = story.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(sticky).top) || 0;
    const distance = Math.max(1, story.offsetHeight - sticky.offsetHeight);
    vibeTarget = clamp((top - bounds.top) / distance);
    if (!vibeFrame && !document.hidden) vibeFrame = requestAnimationFrame(animateVibe);
  };
  syncVibe = () => {
    const enabled = !reducedMotion.matches && CSS.supports('position', 'sticky');
    vibe.classList.toggle('vibe-scroll-enabled', enabled);
    cancelAnimationFrame(vibeFrame); vibeFrame = 0; vibeTime = 0;
    if (!enabled || motionPaused) paintVibe(1, true);
    else updateVibe();
  };
  // Images entering by transform are decoded before the story starts.
  if ('IntersectionObserver' in window) {
    const preloadMoments = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      $$('.vibe-fig img').forEach(image => { image.loading = 'eager'; });
      preloadMoments.disconnect();
    }, { rootMargin: '850px 0px' });
    preloadMoments.observe(vibe);
  }
  syncVibe();

  // A moving highlight on the glass shell, independent of image content.
  const albumGlass = $('.about-photos');
  let glassFrame = 0, glassX = 22, glassY = 12;
  albumGlass.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || motionPaused) return;
    const bounds = albumGlass.getBoundingClientRect();
    glassX = (event.clientX - bounds.left) / bounds.width * 100;
    glassY = (event.clientY - bounds.top) / bounds.height * 100;
    if (!glassFrame) glassFrame = requestAnimationFrame(() => {
      albumGlass.style.setProperty('--glass-x', `${glassX}%`);
      albumGlass.style.setProperty('--glass-y', `${glassY}%`);
      glassFrame = 0;
    });
  }, { passive: true });
  albumGlass.addEventListener('pointerleave', () => {
    cancelAnimationFrame(glassFrame); glassFrame = 0;
    albumGlass.style.removeProperty('--glass-x'); albumGlass.style.removeProperty('--glass-y');
  });

  // Source text reserves its full geometry and remains available to screen readers.
  // The visual layer really types each character, rather than fading complete lines.
  const terminal = $('.terminal');
  const termRows = $$('#termBody .term-line');
  const finalPrompt = termRows.at(-1);
  const termParts = termRows.slice(0, -1).map(row => {
    const target = row.lastElementChild;
    const text = target.textContent;
    const source = document.createElement('span');
    source.className = 'term-source';
    source.textContent = text;
    const live = document.createElement('span');
    live.className = 'term-live';
    live.setAttribute('aria-hidden', 'true');
    target.replaceChildren(source, live);
    return { row, live, text, characters: Array.from(text), command: target.classList.contains('cmd') };
  });
  let termLine = 0, termCharacter = 0, termTimer = 0;
  let terminalVisible = false, terminalDone = false, terminalStarted = false;
  function resetTerminal() {
    clearTimeout(termTimer);
    termTimer = 0; termLine = 0; termCharacter = 0;
    terminalDone = false; terminalStarted = false;
    termParts.forEach(({ row, live }) => {
      row.classList.add('term-pending');
      live.textContent = '';
      live.classList.remove('term-writing');
    });
    finalPrompt.classList.add('term-pending');
    $('#termStatus').textContent = 'READY';
  }
  function completeTerminal() {
    clearTimeout(termTimer); termTimer = 0; terminalDone = true;
    termParts.forEach(({ row, live, text }) => {
      row.classList.remove('term-pending');
      live.classList.remove('term-writing');
      live.textContent = text;
    });
    finalPrompt.classList.remove('term-pending');
    $('#termStatus').textContent = 'CONNECTED';
  }
  function canType() { return terminalVisible && pageReady && !motionPaused && !document.hidden && !reducedMotion.matches; }
  function termTick() {
    termTimer = 0;
    if (!canType() || terminalDone) return;
    if (termLine >= termParts.length) { completeTerminal(); return; }
    terminalStarted = true;
    $('#termStatus').textContent = 'RUNNING';
    const part = termParts[termLine];
    part.row.classList.remove('term-pending');
    part.live.classList.add('term-writing');
    part.live.textContent = part.characters.slice(0, ++termCharacter).join('');
    let delay = part.command ? 65 : 32;
    if (termCharacter >= part.characters.length) {
      part.live.classList.remove('term-writing');
      termLine++; termCharacter = 0;
      delay = part.command ? 450 : 200;
    }
    termTimer = setTimeout(termTick, delay);
  }
  syncTerminal = () => {
    if (reducedMotion.matches || (motionPaused && !terminalStarted)) { completeTerminal(); return; }
    if (!canType()) {
      clearTimeout(termTimer); termTimer = 0;
      if (terminalStarted && !terminalDone) $('#termStatus').textContent = 'PAUSED';
      return;
    }
    if (!terminalDone && !termTimer) termTimer = setTimeout(termTick, terminalStarted ? 100 : 400);
  };
  resetTerminal();
  syncTerminal();
  $('#termReplay').addEventListener('click', () => {
    resetTerminal();
    syncTerminal();
  });
  if ('IntersectionObserver' in window) {
    const terminalObserver = new IntersectionObserver(entries => {
      terminalVisible = entries[0].isIntersecting;
      syncTerminal();
    }, { threshold: .2 });
    terminalObserver.observe(terminal);
  } else { terminalVisible = true; syncTerminal(); }
})();
