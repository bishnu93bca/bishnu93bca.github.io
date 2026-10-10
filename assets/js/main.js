/* Bishnu Ray — portfolio scripts (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  /* ---------- Theme: auto (by local time) / light / dark ----------
     The initial theme is set by an inline script in <head> to avoid a flash. */
  (function () {
    var btn = document.getElementById('theme-btn');
    if (!btn) return;
    var sun = document.getElementById('ic-sun');
    var moon = document.getElementById('ic-moon');
    var badge = document.getElementById('auto-badge');
    var ORDER = ['auto', 'light', 'dark'];
    var mode = root.getAttribute('data-mode') || 'auto';

    function timeTheme() { var h = new Date().getHours(); return h >= 6 && h < 18 ? 'light' : 'dark'; }

    function apply() {
      var theme = mode === 'auto' ? timeTheme() : mode;
      root.setAttribute('data-theme', theme);
      root.setAttribute('data-mode', mode);
      // SVG elements have no .hidden property, so toggle the attribute.
      sun.toggleAttribute('hidden', theme === 'dark');
      moon.toggleAttribute('hidden', theme !== 'dark');
      badge.hidden = mode !== 'auto';
      var label = mode === 'auto'
        ? 'Auto: ' + (theme === 'dark' ? 'dark (night)' : 'light (day)')
        : (mode === 'dark' ? 'Dark mode' : 'Light mode');
      btn.setAttribute('aria-label', 'Theme: ' + label + '. Click to change.');
      btn.title = label;
      return label;
    }

    btn.addEventListener('click', function () {
      mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
      try { localStorage.setItem('theme-mode', mode); } catch (e) {}
      toast(apply());
    });

    // In auto mode, follow the clock.
    setInterval(function () { if (mode === 'auto') apply(); }, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && mode === 'auto') apply(); });
    apply();
  })();

  /* ---------- Header, menu, scroll-spy, back-to-top ---------- */
  (function () {
    var header = document.getElementById('site-header');
    var toTop = document.getElementById('to-top');
    var menuBtn = document.getElementById('menu-btn');
    var links = document.getElementById('nav-links');

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle('scrolled', y > 24);
      toTop.classList.toggle('show', y > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function closeMenu() { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !links.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      document.getElementById('home').focus({ preventScroll: true });
    });

    // Highlight the nav link for the section in view.
    var navMap = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          Object.keys(navMap).forEach(function (id) { navMap[id].classList.remove('active'); });
          var link = navMap[en.target.id];
          if (link && !link.classList.contains('nav-cta')) link.classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(navMap).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    }
  })();

  /* ---------- Scroll reveal ---------- */
  (function () {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Contact form: compose an email (static site, no backend) ---------- */
  (function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var err = document.getElementById('form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      if (!name || !message || !form.elements.email.checkValidity() || !email) {
        err.hidden = false;
        err.textContent = 'Please enter your name, a valid email address and a message.';
        return;
      }
      err.hidden = true;
      var subject = form.elements.subject.value.trim() || ('Hello from ' + name);
      var body = message + '\n\n— ' + name + ' (' + email + ')';
      window.location.href = 'mailto:' + form.dataset.to +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      toast('Opening your email app…');
    });
  })();

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Animated multi-colour network (hero background) ---------- */
  (function () {
    var canvas = document.getElementById('network');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var COLORS = ['#38bdf8', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
    var W = 0, H = 0, DPR = 1, LINK = 150;
    var nodes = [], pulses = [], particles = [];
    var running = false, inView = true, rafId = 0, last = 0;
    var mouse = { x: -9999, y: -9999 };

    // One pre-rendered glow sprite per colour: much cheaper than shadowBlur.
    var sprites = {};
    COLORS.forEach(function (c) {
      var s = document.createElement('canvas');
      s.width = s.height = 64;
      var g = s.getContext('2d');
      var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.18, c);
      grad.addColorStop(0.45, hexA(c, 0.35));
      grad.addColorStop(1, hexA(c, 0));
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      sprites[c] = s;
    });

    function hexA(hex, a) {
      var n = parseInt(hex.slice(1), 16);
      return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick() { return COLORS[(Math.random() * COLORS.length) | 0]; }

    function makeNode() {
      var hub = Math.random() < 0.14;
      return {
        x: rand(0, W), y: rand(0, H), vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
        r: hub ? rand(3, 4.2) : rand(1.5, 2.5), hub: hub, color: pick(), phase: rand(0, Math.PI * 2)
      };
    }
    function makeParticle() {
      return { x: rand(0, W), y: rand(0, H), r: rand(0.4, 1.1), vy: rand(-0.14, -0.03), a: rand(0.15, 0.55), color: pick() };
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      LINK = W < 640 ? 105 : 150;
      // Node count scales with area, capped for performance.
      var target = Math.max(26, Math.min(85, Math.round(W * H / 12000)));
      while (nodes.length < target) nodes.push(makeNode());
      nodes.length = target;
      nodes.forEach(function (n) { if (n.x > W) n.x = rand(0, W); if (n.y > H) n.y = rand(0, H); });
      var pTarget = Math.round(target * 0.7);
      while (particles.length < pTarget) particles.push(makeParticle());
      particles.length = pTarget;
      if (!running) draw();
    }

    function spawnPulse() {
      var a = nodes[(Math.random() * nodes.length) | 0], best = null, bestD = LINK * LINK;
      for (var i = 0; i < nodes.length; i++) {
        var b = nodes[i];
        if (b === a) continue;
        var dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < bestD && Math.random() < 0.6) { best = b; bestD = d; }
      }
      if (best) pulses.push({ a: a, b: best, t: 0, speed: rand(0.008, 0.016) });
    }

    function step(dt) {
      var k = dt / 16.67;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx * k; n.y += n.vy * k; n.phase += 0.02 * k;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        var mdx = mouse.x - n.x, mdy = mouse.y - n.y;
        if (mdx * mdx + mdy * mdy < 32400) { n.x += mdx * 0.0015 * k; n.y += mdy * 0.0015 * k; }
      }
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.y += p.vy * k;
        if (p.y < -5) { p.y = H + 5; p.x = rand(0, W); }
      }
      for (var q = pulses.length - 1; q >= 0; q--) {
        pulses[q].t += pulses[q].speed * k;
        if (pulses[q].t >= 1) pulses.splice(q, 1);
      }
      if (pulses.length < Math.min(16, nodes.length / 5) && Math.random() < 0.09 * k) spawnPulse();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L2 = LINK * LINK, a, b, i;

      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }

      // Links blend from one node's colour to the other's.
      ctx.lineWidth = 1.15;
      for (a = 0; a < nodes.length; a++) {
        var na = nodes[a];
        for (b = a + 1; b < nodes.length; b++) {
          var nb = nodes[b];
          var dx = na.x - nb.x, dy = na.y - nb.y, d2 = dx * dx + dy * dy;
          if (d2 >= L2) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.75;
          if (na.color === nb.color) {
            ctx.strokeStyle = na.color;
          } else {
            var g = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
            g.addColorStop(0, na.color); g.addColorStop(1, nb.color);
            ctx.strokeStyle = g;
          }
          ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
        }
        var mx = na.x - mouse.x, my = na.y - mouse.y, m2 = mx * mx + my * my;
        if (m2 < 28900) {
          ctx.globalAlpha = (1 - Math.sqrt(m2) / 170) * 0.7;
          ctx.strokeStyle = na.color;
          ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }

      for (i = 0; i < pulses.length; i++) {
        var pu = pulses[i];
        var x = pu.a.x + (pu.b.x - pu.a.x) * pu.t, y = pu.a.y + (pu.b.y - pu.a.y) * pu.t;
        ctx.globalAlpha = Math.sin(pu.t * Math.PI);
        ctx.drawImage(sprites[pu.t < 0.5 ? pu.a.color : pu.b.color], x - 10, y - 10, 20, 20);
      }

      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var tw = 0.75 + Math.sin(n.phase) * 0.25;
        var s = n.r * (n.hub ? 10 : 7);
        ctx.globalAlpha = (n.hub ? 0.95 : 0.7) * tw;
        ctx.drawImage(sprites[n.color], n.x - s / 2, n.y - s / 2, s, s);
        ctx.globalAlpha = 1;
        ctx.fillStyle = n.color;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill();
        if (n.hub) {
          // Hubs get a white core and a coloured ring.
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.45, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 0.55 * tw;
          ctx.strokeStyle = n.color; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4 + Math.sin(n.phase) * 1.5, 0, 6.2832); ctx.stroke();
          ctx.lineWidth = 1.15;
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(ts) {
      var dt = last ? Math.min(ts - last, 50) : 16.67;
      last = ts;
      step(dt); draw();
      rafId = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion.matches || !inView || document.hidden) return;
      running = true; last = 0; rafId = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    // Pause when the hero is off-screen or the tab is hidden.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    // Reduced motion: one static frame, no animation.
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function () { if (reduceMotion.matches) { stop(); draw(); } else start(); });
    }

    var hero = canvas.parentElement;
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

    resize();
    start();
  })();
})();
