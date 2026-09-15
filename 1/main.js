'use strict';

/* ═══════════════════════════════════════════════
   数码空间 DIGITAL SPACE — main.js
   ═══════════════════════════════════════════════ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ───────────── 照片跑马灯：克隆一份内容，平移 -50% 即无缝循环 ───────────── */
$$('.photo-track').forEach(track => {
  [...track.children].forEach(el => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
});

/* ───────────── Preloader 开机引导 ───────────── */
const bootLines = [
  '> BOOT DIGITAL_SPACE OS v2.1 ...',
  '> LOADING MODULES [ 数码科技 | 电子技术 | 信息编程 ] ... OK',
  '> MOUNTING /dev/creativity ... OK',
  '> LOADING passion.sys ...... OK',
  '> WELCOME, GEEK.'
];

(function boot() {
  const box = $('#bootLines');
  const fill = $('#preBarFill');
  const pre = $('#preloader');
  let i = 0;
  const timer = setInterval(() => {
    if (i < bootLines.length) {
      const d = document.createElement('div');
      d.textContent = bootLines[i];
      box.appendChild(d);
      fill.style.width = ((i + 1) / bootLines.length) * 100 + '%';
      i++;
    } else {
      clearInterval(timer);
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('loaded');
        setTimeout(() => pre.remove(), 800);
        startTyped();
        initReveal();
        initObservers();
      }, 400);
    }
  }, 230);
})();

/* ───────────── 自定义光标 ───────────── */
(function cursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.body.classList.add('has-cursor');
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
  $$('a, button, [data-tilt], .shot, .vibe-fig').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ───────────── Hero 粒子网络画布 ───────────── */
(function particles() {
  const canvas = $('#bgCanvas');
  const ctx = canvas.getContext('2d');
  const hero = $('#home');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, pts = [];
  const mouse = { x: null, y: null };
  let visible = true;

  function resize() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(40, Math.min(110, Math.floor((W * H) / 16000)));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.6 + 0.7
    }));
  }

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
  addEventListener('resize', resize);
  resize();

  (function step() {
    requestAnimationFrame(step);
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);

    for (const p of pts) {
      // 鼠标轻微排斥
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 130 && d > 0.01) {
          const f = (130 - d) / 130 * 0.35;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
      ctx.fill();
    }

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - d / 130) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  })();
})();

/* ───────────── Hero 打字机 ───────────── */
const phrases = [
  '星河揽梦，电掣流光',
  'E quindi uscimmo a riveder le stelle.',
  '不浪费每一寸晶圆。',
  '啊啊 这个这个 这个这个我们 这个这个啊 这个是吧 啊 这个这个啊啊 这个啊',
  '你好李鑫'
];
let pIdx = 0, cIdx = 0, deleting = false;

function startTyped() {
  const el = $('#typedText');
  (function tick() {
    const cur = phrases[pIdx];
    el.textContent = cur.slice(0, cIdx);
    let delay = deleting ? 30 : 80;
    if (!deleting) {
      if (cIdx < cur.length) cIdx++;
      else { deleting = true; delay = 2100; }
    } else {
      if (cIdx > 0) cIdx--;
      else { deleting = false; pIdx = (pIdx + 1) % phrases.length; delay = 420; }
    }
    setTimeout(tick, delay);
  })();
}

/* ───────────── Hero 内容视差 ───────────── */
(function parallax() {
  const content = $('.hero-content');
  $('#home').addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    content.style.transform = `translate(${x * -14}px, ${y * -10}px)`;
  });
})();

/* ───────────── 滚动显现 ───────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ───────────── 终端 触发器 ───────────── */
function initObservers() {
  const termIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { startTerm(); termIO.disconnect(); }
  }, { threshold: 0.35 });
  termIO.observe($('.terminal'));
}

/* ───────────── 3D 倾斜卡片 + 光晕跟随 ───────────── */
$$('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform =
      `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-6px)`;
    card.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
    card.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ───────────── 磁吸按钮 ───────────── */
$$('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ───────────── 锚点平滑滚动 ─────────────
   分页吸附（scroll-snap）会打断原生锚点滚动造成“跳页”，
   滚动期间临时关闭吸附，滚动停稳后再恢复 */
let snapIdleTimer, snapMaxTimer;
function restoreSnap() {
  document.documentElement.style.scrollSnapType = '';
  clearTimeout(snapIdleTimer);
  clearTimeout(snapMaxTimer);
  removeEventListener('scroll', onScrollIdle);
}
function onScrollIdle() {
  clearTimeout(snapIdleTimer);
  snapIdleTimer = setTimeout(restoreSnap, 180);
}
function smoothScrollTo(target) {
  document.documentElement.style.scrollSnapType = 'none';
  if (typeof target === 'number') scrollTo({ top: target, behavior: 'smooth' });
  else target.scrollIntoView({ behavior: 'smooth' });
  clearTimeout(snapIdleTimer);
  clearTimeout(snapMaxTimer);
  addEventListener('scroll', onScrollIdle, { passive: true });
  onScrollIdle(); /* 目标即当前位置时也能恢复吸附 */
  snapMaxTimer = setTimeout(restoreSnap, 1500);
}
$$('a[href^="#"]:not([data-join-modal])').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    smoothScrollTo(t);
  });
});

/* ───────────── 导航 / 进度条 / 回到顶部 ───────────── */
(function navScroll() {
  const nav = $('#nav');
  const prog = $('#scrollProgress');
  const backTop = $('#backTop');
  addEventListener('scroll', () => {
    const st = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', st > 40);
    prog.style.transform = `scaleX(${h > 0 ? st / h : 0})`;
    backTop.classList.toggle('show', st > 600);
  }, { passive: true });
  backTop.addEventListener('click', () => smoothScrollTo(0));
})();

/* ───────────── 分页滚动（滚轮 / 键盘整屏翻页） ───────────── */
(function fullPage() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 手机/平板触摸设备禁用翻页
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const root = document.documentElement;
  const navLinks = $('#navLinks');
  let stops = [0];
  let animId = 0;
  let coolUntil = 0;
  let acc = 0, accTimer = null;
  let isScrolling = false;

  /* 停靠点：只取每个区块的顶部和底部，过滤掉太近的 */
  function computeStops() {
    const els = [$('#home'), ...$$('main .section'), $('.footer')].filter(Boolean);
    const max = Math.max(0, root.scrollHeight - innerHeight);
    const pts = new Set([0, Math.round(max)]);
    els.forEach(el => {
      const top = Math.round(el.getBoundingClientRect().top + scrollY);
      const bottom = Math.round(top + el.offsetHeight);
      pts.add(Math.min(top, max));
      pts.add(Math.min(bottom, max));
    });
    // 排序并过滤掉距离太近的停靠点（小于屏幕高度的 50%）
    const sorted = [...pts].map(y => Math.min(Math.max(y, 0), Math.round(max))).sort((a, b) => a - b);
    const filtered = [];
    const minGap = innerHeight * 0.5;
    for (const y of sorted) {
      if (filtered.length === 0 || y - filtered[filtered.length - 1] >= minGap) {
        filtered.push(y);
      }
    }
    stops = filtered;
  }

  /* 平滑滚动到目标停靠点 */
  function goTo(target) {
    if (isScrolling) return;
    cancelAnimationFrame(animId);
    const start = scrollY;
    const dist = target - start;
    if (Math.abs(dist) < 5) { animId = 0; return; }
    isScrolling = true;
    // 根据距离动态调整时长，至少 500ms，每 1000px 增加 300ms，上限 2000ms
    const dur = Math.min(2000, Math.max(500, 500 + Math.abs(dist) * 0.3));
    const t0 = performance.now();
    root.style.scrollBehavior = 'auto';
    root.style.scrollSnapType = 'none';
    (function frame(now) {
      const t = Math.min((now - t0) / dur, 1);
      // easeInOutCubic
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      scrollTo(0, start + dist * e);
      if (t < 1) { animId = requestAnimationFrame(frame); return; }
      animId = 0;
      root.style.scrollBehavior = '';
      root.style.scrollSnapType = '';
      isScrolling = false;
      coolUntil = performance.now() + 400;
    })(t0);
  }

  /* 翻页 */
  function step(dir) {
    if (isScrolling || performance.now() < coolUntil) return;
    const y = scrollY;
    let i = 0;
    stops.forEach((s, k) => { if (s <= y + 5) i = k; });
    let target;
    if (Math.abs(stops[i] - y) <= 30) {
      target = stops[i + dir];
    } else {
      let nearest = 0, minDist = Infinity;
      stops.forEach((s, k) => {
        const d = Math.abs(s - y);
        if (d < minDist) { minDist = d; nearest = k; }
      });
      target = stops[nearest + dir];
    }
    if (target === undefined) return;
    goTo(target);
  }

  /* 滚轮 */
  addEventListener('wheel', e => {
    if (!document.body.classList.contains('loaded')) return;
    if (e.ctrlKey || navLinks.classList.contains('open')) return;
    if (document.body.classList.contains('lb-open')) return;
    if (isScrolling) { e.preventDefault(); return; }
    e.preventDefault();
    if (performance.now() < coolUntil) return;
    acc += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => { acc = 0; }, 150);
    if (Math.abs(acc) < 60) return;
    const dir = acc > 0 ? 1 : -1;
    acc = 0;
    step(dir);
  }, { passive: false });

  /* 键盘 */
  addEventListener('keydown', e => {
    if (!document.body.classList.contains('loaded')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.body.classList.contains('lb-open')) return;
    if (isScrolling) return;
    const t = e.target;
    if (t && t.closest && t.closest('a, button, input, textarea, select')) return;
    const dir = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (dir !== undefined) {
      e.preventDefault();
      step(e.key === ' ' && e.shiftKey ? -1 : dir);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(stops[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(stops[stops.length - 1]);
    }
  });

  computeStops();
  addEventListener('load', computeStops);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(computeStops);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(computeStops, 150); });
})();

/* 导航高亮当前区块 */
(function activeLink() {
  const links = $$('.nav-link');
  const io = new IntersectionObserver(es => {
    es.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(l => {
    const t = $(l.getAttribute('href'));
    if (t) io.observe(t);
  });
})();

/* 移动端菜单 */
(function mobileMenu() {
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  $$('.nav-link').forEach(l => l.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));
})();

/* ───────────── 招新终端打字 ───────────── */
const termLines = [
  { p: '$', c: 'cmd', t: ' whoami' },
  { p: '>', c: 'out', t: ' 新高一的技术爱好者' },
  { p: '$', c: 'cmd', t: ' cat 招新宣言.txt' },
  { p: '>', c: 'out', t: ' 期待新高一的你加入我们，' },
  { p: '>', c: 'out', t: ' 在芯片与代码的世界里挥洒青春，' },
  { p: '>', c: 'out', t: ' 共同开启通向未来的科技之门！' },
  { p: '$', c: 'cmd', t: ' ./join.sh --now' },
  { p: '>', c: 'ok', t: ' [ OK ] 数码空间大门已开启，欢迎登舰 ▊' }
];

function startTerm() {
  const body = $('#termBody');
  let i = 0;
  (function next() {
    if (i >= termLines.length) {
      const end = document.createElement('div');
      end.className = 'term-line';
      end.innerHTML = '<span class="prompt cmd">$</span> <span class="term-caret"></span>';
      body.appendChild(end);
      return;
    }
    const L = termLines[i++];
    const line = document.createElement('div');
    line.className = 'term-line';
    const pr = document.createElement('span');
    pr.className = 'prompt ' + L.c;
    pr.textContent = L.p;
    const tx = document.createElement('span');
    tx.className = L.c;
    line.appendChild(pr);
    line.appendChild(tx);
    body.appendChild(line);
    let j = 0;
    (function typeChar() {
      tx.textContent = L.t.slice(0, ++j);
      if (j < L.t.length) setTimeout(typeChar, 26);
      else setTimeout(next, L.c === 'cmd' ? 380 : 130);
    })();
  })();
}

/* ───────────── Slogan 背景视频 ───────────── 
(function sloganVideo() {
  const sec = $('.slogan');
  const v = $('#sloganVideo');
  if (!sec || !v) return;
  // 进入视口才播放并触发缩放入场，离开视口暂停省资源
  const io = new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    sec.classList.toggle('in-view', vis);
    if (vis) v.play().catch(() => {});
    else v.pause();
  }, { threshold: 0.25 });
  io.observe(sec);
  // 视频加载失败时隐藏，露出渐变底色
  v.addEventListener('error', () => { v.style.display = 'none'; }, true);
})();*/

/* ───────────── 照片灯箱（点击照片放大查看） ───────────── */
(function lightbox() {
  const lb = $('#lightbox');
  const img = $('#lbImg');
  const cap = $('#lbCap');
  if (!lb || !img) return;

  $$('.shot, .vibe-fig').forEach(fig => {
    fig.addEventListener('click', () => {
      const im = $('img', fig);
      if (!im) return;
      img.src = im.src;
      img.alt = im.alt;
      const c = $('figcaption', fig);
      cap.textContent = c ? c.textContent : im.alt;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-open');
    });
  });

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
  }
  lb.addEventListener('click', close);
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();

/* ───────────── 加入我们弹窗（加 QQ 群即入社） ───────────── */
(function joinModal() {
  const modal = $('#joinModal');
  if (!modal) return;
  const card = $('.jm-card', modal);

  $$('[data-join-modal]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  $('#joinModalClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (!card.contains(e.target)) close(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();
