/* ═══════════════════════════════════════════════════
   LUNAR NUCLEAR POWER PLANT: Script
   ═══════════════════════════════════════════════════ */

/* ─── Starfield ─────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const stars = [];

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }

  function init() {
    stars.length = 0;
    for (let i = 0; i < 220; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.6 + 0.2, s: Math.random() * 0.008 + 0.002, p: Math.random() * Math.PI * 2 });
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const a = s.a * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize(); init(); requestAnimationFrame(draw);
  new ResizeObserver(resize).observe(canvas);
})();

/* ─── Navbar ────────────────────────────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('nav-links');

  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', e => {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }
})();

/* ─── Accordion ─────────────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('.acc-section');

  function open(sec) {
    const body = sec.querySelector('.acc-body');
    sec.classList.add('open');
    sec.querySelector('.acc-head').setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  function close(sec) {
    const body = sec.querySelector('.acc-body');
    sec.classList.remove('open');
    sec.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0';
  }

  sections.forEach(sec => {
    sec.querySelector('.acc-head').addEventListener('click', () => {
      const isOpen = sec.classList.contains('open');
      sections.forEach(s => { if (s !== sec) close(s); });
      isOpen ? close(sec) : open(sec);
    });
  });

  // Nav anchor links open the target section
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      const sec = target.classList.contains('acc-section') ? target : target.closest('.acc-section');
      if (!sec) return;
      e.preventDefault();
      sections.forEach(s => { if (s !== sec) close(s); });
      open(sec);
      setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    });
  });

  // Recalc open section after glossary fills in
  window.addEventListener('glossaryBuilt', () => {
    const openSec = document.querySelector('.acc-section.open');
    if (openSec) openSec.querySelector('.acc-body').style.maxHeight = openSec.querySelector('.acc-body').scrollHeight + 'px';
  });
})();

/* ─── Glossary ──────────────────────────────────────── */
(function () {
  const grid = document.getElementById('glossary-grid');
  if (!grid) return;
  const seen = new Map();
  document.querySelectorAll('.term[data-term]').forEach(el => {
    const k = el.dataset.term.trim().toLowerCase();
    if (!seen.has(k)) seen.set(k, { term: el.dataset.term.trim(), def: el.dataset.def || '' });
  });
  [...seen.values()].sort((a, b) => a.term.localeCompare(b.term)).forEach(({ term, def }) => {
    const d = document.createElement('div');
    d.className = 'glossary-entry';
    d.innerHTML = `<div class="glossary-term">${esc(term)}</div><div class="glossary-def">${esc(def)}</div>`;
    grid.appendChild(d);
  });
  window.dispatchEvent(new Event('glossaryBuilt'));
})();

/* ─── Tooltips ──────────────────────────────────────── */
(function () {
  document.addEventListener('click', e => {
    const t = e.target.closest('.term');
    document.querySelectorAll('.term.active').forEach(x => { if (x !== t) x.classList.remove('active'); });
    if (t) { e.preventDefault(); t.classList.toggle('active'); }
  });
  document.querySelectorAll('.term').forEach(t => {
    t.addEventListener('mouseenter', () => {
      const r = t.getBoundingClientRect();
      t.classList.remove('tip-left', 'tip-right');
      if (r.left < 160) t.classList.add('tip-left');
      else if (r.right > window.innerWidth - 160) t.classList.add('tip-right');
    });
  });
})();

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ─── Subsystem Tabs ─────────────────────────────────── */
(function () {
  document.querySelectorAll('.subsystem-tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        const container = tabGroup.closest('section') || tabGroup.parentElement;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const target = container.querySelector('#tab-' + tabId);
        if (target) target.classList.add('active');
      });
    });
  });
})();
