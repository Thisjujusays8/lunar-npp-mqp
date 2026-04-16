/* ═══════════════════════════════════════════════════
   LUNAR NUCLEAR POWER PLANT — MQP Companion Site
   Script
   ═══════════════════════════════════════════════════ */

/* ─── Starfield Canvas ──────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const stars = [];
  const STAR_COUNT = 220;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:     Math.random(),
        y:     Math.random(),
        r:     Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  let raf;
  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  createStars();
  raf = requestAnimationFrame(draw);

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas);
})();

/* ─── Navbar: scroll shadow + active links ──────────── */
(function initNav() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-links');
  const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

  // Scroll class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ─── Subsystem Tabs ────────────────────────────────── */
(function initTabs() {
  const tabBtns    = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ─── Glossary Tooltips (mobile touch support) ──────── */
(function initTooltips() {
  // On mobile, clicking a term toggles the tooltip
  document.addEventListener('click', (e) => {
    const term = e.target.closest('.term');
    // Close any open tooltip that isn't the one clicked
    document.querySelectorAll('.term.active').forEach(t => {
      if (t !== term) t.classList.remove('active');
    });
    if (term) {
      e.preventDefault();
      term.classList.toggle('active');
    }
  });

  // Prevent tooltip from overflowing viewport (left/right edge)
  document.querySelectorAll('.term').forEach(term => {
    term.addEventListener('mouseenter', () => {
      const rect = term.getBoundingClientRect();
      term.classList.remove('tip-left', 'tip-right');
      if (rect.left < 160) term.classList.add('tip-left');
      else if (rect.right > window.innerWidth - 160) term.classList.add('tip-right');
    });
  });
})();

/* ─── Glossary Section Auto-Population ──────────────── */
(function buildGlossary() {
  const grid = document.getElementById('glossary-grid');
  if (!grid) return;

  // Collect all unique terms from the page
  const seen = new Map();
  document.querySelectorAll('.term[data-term]').forEach(el => {
    const key = el.dataset.term.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, {
        term: el.dataset.term.trim(),
        def:  el.dataset.def  || el.getAttribute('data-def') || '',
      });
    }
  });

  // Sort alphabetically
  const sorted = [...seen.values()].sort((a, b) => a.term.localeCompare(b.term));

  if (sorted.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:.9rem;">No glossary terms found.</p>';
    return;
  }

  sorted.forEach(({ term, def }) => {
    const entry = document.createElement('div');
    entry.className = 'glossary-entry';
    entry.innerHTML = `
      <div class="glossary-term">${escHtml(term)}</div>
      <div class="glossary-def">${escHtml(def)}</div>
    `;
    grid.appendChild(entry);
  });
})();

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
