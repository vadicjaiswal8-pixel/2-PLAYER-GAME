const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile menu */
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('#site-nav');
menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));

/* Entrance: parts of the opening screen rise once */
const rise = document.querySelectorAll('.rise');
if (reduced || !('IntersectionObserver' in window)) {
  rise.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  rise.forEach((el, i) => { el.style.transitionDelay = (i * 90) + 'ms'; io.observe(el); });
}

/* Demo: a sample selector. No question is submitted or processed. */
const demoForm = document.getElementById('demo-form');
const demoQuestion = document.getElementById('demo-question');
const demoType = document.getElementById('demo-research-type');
const demoFeedback = document.querySelector('[data-demo-sample-feedback]');
const demoView = document.querySelector('[data-view-sample]');
const destinations = {
  'Company Research': '/samples',
  'AI Market Research': null,
  'Competitor Analysis': null,
  'Academic Research': null,
  'Custom Research': null
};
const TYPE_INFO = {
  'Company Research': "A company's business model, products, market position, growth signals and strategic context.",
  'AI Market Research': 'Market boundaries, demand drivers, customer segments, industry trends, opportunities and risks.',
  'Competitor Analysis': 'How competitors position themselves, where they differ, and which market forces act on them.',
  'Academic Research': 'Research questions, relevant literature, findings and limitations, organised into one output.',
  'Custom Research': 'A specific question or business problem that does not fit neatly into one category.'
};
const DEPTH_INFO = {
  'Quick Answer': 'A concise response for straightforward research questions.',
  'Standard Report': 'A structured report containing core evidence and analysis.',
  'Deep Analysis': 'A more comprehensive research output with broader evidence, comparisons, deeper analysis and limitations.'
};
const demoDepth = document.getElementById('demo-report-depth');
function updateDemo() {
  if (!demoType || !demoFeedback) return;
  const ok = Boolean(destinations[demoType.value]);
  demoFeedback.textContent = ok ? 'Company Research sample available.' : 'Coming soon. No sample report is available for this type yet.';
  demoFeedback.classList.toggle('is-unavailable', !ok);
  const side = document.getElementById('demo-side');
  if (side) {
    side.querySelector('[data-s-type]').textContent = demoType.value;
    side.querySelector('[data-s-type-d]').textContent = TYPE_INFO[demoType.value] || '';
    side.querySelector('[data-s-depth]').textContent = demoDepth.value;
    side.querySelector('[data-s-depth-d]').textContent = DEPTH_INFO[demoDepth.value] || '';
    const st = side.querySelector('[data-s-sample]');
    st.textContent = ok ? 'A Company Research sample report is available to read.' : 'No sample report is available for this type yet.';
    st.className = ok ? 'ok' : 'no';
  }
}
demoType?.addEventListener('change', updateDemo);
demoDepth?.addEventListener('change', updateDemo);
demoView?.addEventListener('click', () => {
  const route = destinations[demoType?.value];
  if (route) { parent === window ? window.location.assign(route) : parent.postMessage({ go: route }, '*'); return; }
  updateDemo();
});
updateDemo();
demoForm?.addEventListener('submit', e => e.preventDefault());
document.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click', () => {
  if (demoQuestion) { demoQuestion.value = b.dataset.question; demoQuestion.focus(); }
}));

/* Samples page: inline Company Research report, loaded from the canonical report page */
const viewer = document.querySelector('[data-inline-report-viewer]');
const viewerContent = viewer?.querySelector('[data-inline-report-content]');
const viewerStatus = viewer?.querySelector('[data-inline-report-status]');
const viewerToggles = document.querySelectorAll('[data-inline-report-toggle]');
const viewerClose = viewer?.querySelector('[data-inline-report-close]');
let viewerLoaded = false, viewerLoading;
function setViewer(open) {
  if (!viewer) return;
  viewer.hidden = !open;
  viewerToggles.forEach(b => b.setAttribute('aria-expanded', String(open)));
  if (open) viewer.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
async function loadViewer() {
  if (viewerLoaded) return;
  if (viewerLoading) return viewerLoading;
  viewerLoading = fetch('/samples-company-research-the-whole-truth-foods.html', { credentials: 'same-origin' })
    .then(r => { if (!r.ok) throw new Error('Report request failed with ' + r.status); return r.text(); })
    .then(markup => {
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const report = doc.querySelector('[data-report]');
      if (!report || !viewerContent) throw new Error('Report content missing');
      viewerContent.replaceChildren(...Array.from(report.children));
      viewerLoaded = true;
      if (viewerStatus) viewerStatus.hidden = true;
    })
    .catch(err => {
      if (viewerStatus) { viewerStatus.hidden = false; viewerStatus.textContent = 'The sample report could not be loaded. Please try again.'; }
      console.error('Inline report failed to load', err);
      throw err;
    });
  return viewerLoading;
}
viewerToggles.forEach(b => b.addEventListener('click', async () => {
  const opening = viewer?.hidden !== false;
  if (!opening) { setViewer(false); b.focus(); return; }
  setViewer(true);
  try { await loadViewer(); } catch {}
}));
viewerClose?.addEventListener('click', () => { setViewer(false); viewerToggles[0]?.focus(); });

/* ---------- interaction layer ---------- */

/* Reading progress */
const progress = document.createElement('div');
progress.className = 'progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
let ticking = false;
function updateProgress() {
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
updateProgress();

/* Contents list follows the reader on inner pages */
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"], .chips a[href^="#"]')];
if (tocLinks.length) {
  const targets = tocLinks.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  function spy() {
    let idx = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.3) idx = i; });
    tocLinks.forEach((a, i) => i === idx ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }
  addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true });
  spy();
}

/* Itinerary slip: rows appear one after another */
document.querySelectorAll('.slip').forEach(slip => {
  const parts = slip.querySelectorAll('h3,.row,.total');
  parts.forEach((el, i) => { el.style.transitionDelay = (i * 110) + 'ms'; });
  if (reduced || !('IntersectionObserver' in window)) { slip.classList.add('in'); return; }
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { slip.classList.add('in'); o.disconnect(); } }), { threshold: 0.25 }).observe(slip);
});

/* Home hero: twelve sources feed one claim. Everything here replays an existing sample. */
const cv = document.getElementById('cv');
if (cv) {
  const NS = 'http://www.w3.org/2000/svg';
  const apexEl = document.getElementById('apex');
  const CLAIMS = {
    1: { src: [5],      txt: 'Revenue of \u20B9219.83 crore in FY25<sup>E5</sup>' },
    2: { src: [5, 12],  txt: 'Net loss of \u20B928.15 crore<sup>E5, E12</sup>' },
    3: { src: [11, 12], txt: '$51 million Series D<sup>E11, E12</sup>' }
  };
  const VH = 380, VW = Math.round(Math.min(2300, Math.max(900, VH * cv.clientWidth / Math.max(1, cv.clientHeight))));
  cv.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
  const AX = VW / 2, AY = 40, NY = 330, X0 = VW * .07, DX = VW * .86 / 11;
  const nodes = [], lines = [];
  for (let i = 0; i < 12; i++) {
    const n = i + 1, x = X0 + i * DX;
    for (let k = -3; k <= 2; k++) {
      const off = k * 3 + 1.5;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x + off} ${NY} C ${x + off} 190, ${AX + (x - AX) * 0.12} 150, ${AX + k * 1.2} ${AY}`);
      p.setAttribute('pathLength', '1');
      p.setAttribute('class', 'ln');
      p.dataset.src = n;
      cv.append(p); lines.push(p);
    }
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'nd'); g.dataset.src = n; g.setAttribute('tabindex', '0');
    g.innerHTML = `<circle cx="${x}" cy="${NY}" r="5"/><text x="${x}" y="${NY + 30}">E${n}</text>`;
    cv.append(g); nodes.push(g);
  }
  const claimEls = document.querySelectorAll('.claim');
  const regs = document.querySelectorAll('.reg');
  let current = 0, manual = false;
  function setClaim(n) {
    current = n;
    const c = CLAIMS[n], on = c ? c.src : [];
    nodes.forEach(g => g.classList.toggle('on', on.includes(+g.dataset.src)));
    lines.forEach(l => l.classList.toggle('on', on.includes(+l.dataset.src)));
    regs.forEach(r => r.classList.toggle('on', on.includes(+r.dataset.src)));
    claimEls.forEach(e => e.classList.toggle('on', +e.dataset.claim === n));
    if (apexEl && c) apexEl.innerHTML = c.txt;
  }
  claimEls.forEach(e => {
    const pick = () => { manual = true; setClaim(+e.dataset.claim); };
    e.addEventListener('mouseenter', pick); e.addEventListener('focus', pick);
    e.addEventListener('click', pick);
    e.addEventListener('mouseleave', () => { manual = false; });
  });
  nodes.forEach(g => {
    const hit = () => {
      const n = +g.dataset.src;
      const found = Object.keys(CLAIMS).find(k => CLAIMS[k].src.includes(n));
      if (found) { manual = true; setClaim(+found); }
    };
    g.addEventListener('mouseenter', hit); g.addEventListener('focus', hit);
    g.addEventListener('mouseleave', () => { manual = false; });
  });
  setClaim(1);
  if (!reduced) setInterval(() => {
    if (manual || document.hidden || run?.dataset.state === 'running') return;
    setClaim(current % 3 + 1);
  }, 3800);

  /* the replayed run strip */
  var run = document.getElementById('run');
  const steps = run ? [...run.querySelectorAll('li')] : [];
  const paper = document.getElementById('paper');
  const counters = [...document.querySelectorAll('[data-count]')];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let token = 0;
  function settle() {
    steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
    counters.forEach(c => { c.textContent = c.dataset.count; });
    if (paper) paper.style.opacity = 1;
    if (run) run.dataset.state = 'done';
  }
  function countUp() {
    counters.forEach(el => {
      const end = parseFloat(el.dataset.count), t0 = performance.now();
      (function f(t) {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = (end * (1 - Math.pow(1 - k, 3))).toFixed(2);
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    });
  }
  async function play() {
    const my = ++token;
    run.dataset.state = 'running';
    steps.forEach(s => s.classList.remove('active', 'done'));
    counters.forEach(c => { c.textContent = '0.00'; });
    if (paper) paper.style.opacity = .3;
    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.add('active');
      await wait(i === 1 ? 900 : 620); if (my !== token) return;
      steps[i].classList.remove('active'); steps[i].classList.add('done');
    }
    run.dataset.state = 'done';
    if (paper) paper.style.opacity = 1;
    countUp();
  }
  document.getElementById('replay')?.addEventListener('click', play);
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    if (e.key === '1' || e.key === '2' || e.key === '3') { manual = true; setClaim(+e.key); setTimeout(() => { manual = false; }, 9000); }
    if (e.key === 'r' || e.key === 'R') play();
  });
  if (reduced) settle(); else setTimeout(play, 700);
}

/* How it works: the five columns light up in order */
document.querySelectorAll('.five').forEach(five => {
  [...five.children].forEach((c, i) => { c.style.transitionDelay = (i * 140) + 'ms'; });
  if (reduced || !('IntersectionObserver' in window)) five.classList.add('in');
  else new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { five.classList.add('in'); o.disconnect(); } }), { threshold: 0.25 }).observe(five);
});

/* The brand grid lights up under the cursor on every page, behind every section */
(function () {
  const l = document.getElementById('lit');
  if (!l || reduced || !matchMedia('(pointer:fine)').matches) return;
  addEventListener('pointermove', e => { l.style.setProperty('--mx', e.clientX + 'px'); l.style.setProperty('--my', e.clientY + 'px'); l.style.setProperty('--lit', '1'); }, { passive: true });
  document.addEventListener('pointerleave', () => l.style.setProperty('--lit', '0'));
})();

/* ---------- polish: spotlight cells, reveal on scroll, quick navigation ---------- */
if (matchMedia('(pointer:fine)').matches) {
  document.addEventListener('pointermove', e => {
    const cell = e.target.closest?.('.cell');
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    cell.style.setProperty('--cx', (e.clientX - r.left) + 'px');
    cell.style.setProperty('--cy', (e.clientY - r.top) + 'px');
  }, { passive: true });
}
const rvTargets = document.querySelectorAll('.psec .phd, .psec .pbd, .sec>h2, .sec>.lead, .cells>.cell, .notes>p, .demo');
if (rvTargets.length && 'IntersectionObserver' in window && !reduced) {
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  rvTargets.forEach(el => {
    el.classList.add('rv');
    if (el.matches('.cells>.cell')) el.style.transitionDelay = ([...el.parentElement.children].indexOf(el) % 4 * 90) + 'ms';
    rio.observe(el);
  });
}

const PAGES = [
  ['Home', '/', ''], ['About Us', '/about', 'Company'], ['How It Works', '/how-it-works', 'Product'], ['Contact Us', '/contact', 'Company'],
  ['Interactive demo', '/#demo', 'Product'], ['Samples', '/samples', 'Product'],
  ['Sample report: The Whole Truth Foods', '/samples-company-research-the-whole-truth-foods', 'Sample'],
  ['Company Research', '/company-research', 'Research'], ['AI Market Research', '/ai-market-research', 'Research'],
  ['Competitor Analysis', '/competitor-analysis', 'Research'], ['Research Methodology', '/research-methodology', 'Research'],
  ['Trust & Privacy', '/trust-and-privacy', 'Company'], ['Blog', '/blog', 'Reading'],
  ['Company research guide', '/blog/company-research-guide', 'Reading'], ['Open Recon Brief', 'https://app.reconbrief.in/', 'App']
];
let pal, palInput, palList, palIdx = 0, palShown = [], palPrev;
function buildPal() {
  pal = document.createElement('div');
  pal.className = 'pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Quick navigation');
  pal.innerHTML = '<div class="pal-box"><input type="text" placeholder="Jump to a page..." aria-label="Search pages" autocomplete="off" spellcheck="false"><ul class="pal-list" role="listbox"></ul><div class="pal-foot"><span><kbd>\u2191</kbd> <kbd>\u2193</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>';
  document.body.append(pal);
  palInput = pal.querySelector('input'); palList = pal.querySelector('ul');
  pal.addEventListener('mousedown', e => { if (e.target === pal) closePal(); });
  palInput.addEventListener('input', () => renderPal(palInput.value));
  palInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palIdx = Math.min(palShown.length - 1, palIdx + 1); markPal(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palIdx = Math.max(0, palIdx - 1); markPal(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (palShown[palIdx]) go(palShown[palIdx][1]); }
    else if (e.key === 'Escape') { e.preventDefault(); closePal(); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
}
function renderPal(q) {
  const t = q.trim().toLowerCase();
  palShown = PAGES.filter(p => !t || (p[0] + ' ' + p[2]).toLowerCase().includes(t));
  palIdx = 0;
  palList.innerHTML = palShown.length ? '' : '<div class="pal-empty">No matching page.</div>';
  palShown.forEach((p, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.innerHTML = '<span></span><small></small>';
    li.firstChild.textContent = p[0]; li.lastChild.textContent = p[2];
    li.addEventListener('mousemove', () => { palIdx = i; markPal(); });
    li.addEventListener('click', () => go(p[1]));
    palList.append(li);
  });
  markPal();
}
function markPal() {
  [...palList.querySelectorAll('li')].forEach((li, i) => { li.setAttribute('aria-selected', String(i === palIdx)); if (i === palIdx) li.scrollIntoView({ block: 'nearest' }); });
}
function go(href) { closePal(); if (href.startsWith('/#') && location.pathname === '/') { location.hash = href.slice(1); } else { location.assign(href); } }
function openPal() { if (!pal) buildPal(); palPrev = document.activeElement; pal.classList.add('open'); palInput.value = ''; renderPal(''); palInput.focus(); }
function closePal() { pal?.classList.remove('open'); palPrev?.focus?.(); }
document.querySelectorAll('[data-palette]').forEach(b => b.addEventListener('click', openPal));
addEventListener('keydown', e => {
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal?.classList.contains('open') ? closePal() : openPal(); }
  else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openPal(); }
});

/* Report: evidence chips show their source on hover or focus */
(function () {
  let pop;
  const mk = () => { pop = document.createElement('div'); pop.className = 'evpop'; pop.setAttribute('role', 'tooltip'); document.body.append(pop); };
  function show(a) {
    const id = (a.getAttribute('href') || '').slice(1);
    const card = id && document.getElementById(id);
    if (!card || !card.dataset.title) return;
    if (!pop) mk();
    const t = card.dataset.type || '';
    const host = card.querySelector('.host')?.textContent || '';
    pop.innerHTML = '<b></b><span class="badge co"></span><small></small>';
    pop.firstChild.textContent = card.querySelector('.rc-top b')?.textContent + '  ' + card.dataset.title;
    pop.querySelector('.badge').textContent = t;
    pop.querySelector('small').textContent = host;
    const r = a.getBoundingClientRect();
    pop.classList.add('on');
    const w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px';
    pop.style.top = (r.top - h - 10 > 8 ? r.top - h - 10 : r.bottom + 10) + 'px';
  }
  const hide = () => pop && pop.classList.remove('on');
  document.addEventListener('mouseover', e => { const a = e.target.closest?.('a.ev'); if (a) show(a); });
  document.addEventListener('mouseout', e => { if (e.target.closest?.('a.ev')) hide(); });
  document.addEventListener('focusin', e => { const a = e.target.closest?.('a.ev'); if (a) show(a); });
  document.addEventListener('focusout', hide);
  addEventListener('scroll', hide, { passive: true });
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a.ev'); if (!a) return;
    const card = document.getElementById((a.getAttribute('href') || '').slice(1));
    if (card) { card.classList.add('flash'); setTimeout(() => card.classList.remove('flash'), 2200); }
  });
})();

/* ---------- theme toggle ---------- */
(function () {
  const root = document.documentElement;
  const btns = document.querySelectorAll('[data-theme-toggle]');
  const cur = () => root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  function sync() {
    const light = cur() === 'light';
    btns.forEach(b => { b.setAttribute('aria-pressed', String(light)); b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme'); b.title = light ? 'Switch to dark theme' : 'Switch to light theme'; });
  }
  /* theme change: a circular reveal growing out of the toggle (View Transitions), with a colour fade as fallback */
  function apply(next) { root.setAttribute('data-theme', next); try { localStorage.setItem('rb-theme', next); } catch (e) {} sync(); }
  btns.forEach(b => b.addEventListener('click', () => {
    const next = cur() === 'light' ? 'dark' : 'light';
    if (reduced) { apply(next); return; }
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (typeof document.startViewTransition === 'function') {
      root.classList.add('theme-vt');
      const t = document.startViewTransition(() => apply(next));
      t.ready.then(() => {
        root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 750, easing: 'cubic-bezier(.22,.7,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      t.finished.finally(() => root.classList.remove('theme-vt'));
    } else {
      root.classList.add('theme-fade'); apply(next); setTimeout(() => root.classList.remove('theme-fade'), 650);
    }
  }));
  sync();
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: light)');
    const follow = e => { let saved = null; try { saved = localStorage.getItem('rb-theme'); } catch (x) {} if (!saved) { root.setAttribute('data-theme', e.matches ? 'light' : 'dark'); sync(); } };
    mq.addEventListener ? mq.addEventListener('change', follow) : mq.addListener && mq.addListener(follow);
  }
})();

/* ---------- contact form ---------- */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  if (form.elements.ts) form.elements.ts.value = String(Date.now());
  const btn = form.querySelector('button[type="submit"]');
  const EMAIL = 'support@reconbrief.in';
  const rules = {
    name: v => v.trim().length >= 2 ? '' : 'Enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid work email address.',
    subject: v => v.trim().length >= 3 ? '' : 'Enter a subject.',
    type: v => v ? '' : 'Choose an enquiry type.',
    message: v => v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.',
    consent: (v, el) => el.checked ? '' : 'Please confirm that you have read the Privacy Policy before sending your message.'
  };
  const fields = Object.keys(rules).map(k => form.elements[k]);
  function check(el) {
    const msg = rules[el.name](el.value, el);
    const wrap = el.closest('.field');
    wrap.classList.toggle('bad', Boolean(msg));
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    wrap.querySelector('.err').textContent = msg;
    return !msg;
  }
  fields.forEach(el => {
    el.addEventListener('blur', () => { if ((el.type !== 'checkbox' && el.value) || el.closest('.field').classList.contains('bad')) check(el); });
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('bad')) check(el); });
    el.addEventListener('change', () => { if (el.closest('.field').classList.contains('bad')) check(el); });
  });
  function show(kind, title, body, extra) {
    status.className = 'form-status show ' + kind;
    status.innerHTML = '';
    const t = document.createElement('strong'); t.textContent = title;
    const p = document.createElement('span'); p.textContent = body;
    status.append(t, p);
    if (extra) status.append(extra);
    status.setAttribute('tabindex', '-1'); status.focus({ preventScroll: false });
  }
  function mailtoLink() {
    const d = Object.fromEntries(new FormData(form).entries());
    const body = 'Privacy Policy read and understood: yes\n' + 'Name: ' + d.name + '\nEmail: ' + d.email + '\nEnquiry type: ' + d.type + '\n\n' + d.message;
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(d.subject) + '&body=' + encodeURIComponent(body);
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status';
    const bad = fields.filter(el => !check(el));
    if (bad.length) { bad[0].focus(); show('fail', 'Please fix the highlighted fields.', bad.length + (bad.length === 1 ? ' field needs' : ' fields need') + ' attention before this can be sent.'); return; }
    const endpoint = (form.dataset.endpoint || '').trim();
    if (!endpoint) {
      const a = document.createElement('a'); a.className = 'btn'; a.href = mailtoLink(); a.textContent = 'Email us instead';
      show('info', 'Your message has not been sent.', 'The contact form is not connected to an email service yet, so nothing was delivered. Please email ' + EMAIL + ' directly. The button below opens your email app with your message filled in.', a);
      return;
    }
    btn.disabled = true; btn.classList.add('loading'); btn.setAttribute('aria-busy', 'true');
    const label = btn.querySelector('.lbl'); const old = label.textContent; label.textContent = 'Sending';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(Object.assign(Object.fromEntries(new FormData(form).entries()), { consent: true, consent_text: form.querySelector('label[for="c-consent"]').innerText.replace(/\s*\*\s*\(required\)\s*$/, '').trim(), consent_at: new Date().toISOString(), privacy_notice_url: location.origin + '/trust-and-privacy' })) });
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      form.reset(); fields.forEach(el => { el.setAttribute('aria-invalid', 'false'); el.closest('.field').classList.remove('bad'); });
      show('good', 'Message sent.', 'Thank you. We will reply to the email address you provided.');
    } catch (err) {
      const a = document.createElement('a'); a.className = 'btn'; a.href = mailtoLink(); a.textContent = 'Email us instead';
      show('fail', 'Your message could not be sent.', 'Please try again, or email ' + EMAIL + ' directly.', a);
    } finally {
      btn.disabled = false; btn.classList.remove('loading'); btn.removeAttribute('aria-busy'); label.textContent = old;
    }
  });
})();


/* ---------- motion pass ---------- */
/* smooth scrolling (Lenis, MIT) */
if (!reduced && typeof Lenis === 'function') {
  const lenis = new Lenis({ lerp: .09, anchors: true });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
}

/* the 3D cloud of sources behind every hero and page header, tilting with the pointer */
(function () {
  if (reduced) return;
  document.querySelectorAll('.hero, .phead').forEach(function (hero) {
    const cv = document.createElement('canvas'); cv.className = 'hero-field'; cv.setAttribute('aria-hidden', 'true'); hero.insertBefore(cv, hero.firstChild);
    const ctx = cv.getContext('2d'), pts = [];
    const count = Math.round(Math.min(260, Math.max(130, (hero.clientWidth * hero.clientHeight) / 6500)));
    for (let i = 0; i < count; i++) { const r = () => Math.random() * 2 - 1; pts.push({ x: r() * 980, y: r() * 300, z: r() * 360, ph: Math.random() * 6.28, sp: .25 + Math.random() * .5 }); }
    let vis = true, rx = .05, ry = -.05, trx = .05, tryy = -.05, t = 0, last = performance.now();
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(hero);
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tryy = ((e.clientX - r.left) / r.width - .5) * .5; trx = -((e.clientY - r.top) / r.height - .5) * .3; });
    (function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!vis || document.hidden) return;
      const d = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, w, h);
      t += dt; rx += (trx - rx) * .05; ry += (tryy - ry) * .05;
      const cs = getComputedStyle(document.documentElement), hi = cs.getPropertyValue('--hi-rgb').trim(), bl = cs.getPropertyValue('--blue-rgb').trim();
      const sc = Math.min(w / 1500, 1.6), cx = w / 2, cy = h * .42, cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      for (const p of pts) {
        const x = p.x * 1.5 + Math.sin(t * p.sp + p.ph) * 16, y = p.y * 1.5 + Math.cos(t * p.sp * .8 + p.ph) * 16, z = p.z + Math.sin(t * p.sp * .7 + p.ph) * 16;
        const x1 = x * cY + z * sY, z1 = -x * sY + z * cY, y1 = y * cX - z1 * sX, z2 = y * sX + z1 * cX, s = 700 / (700 + z2);
        const a = Math.min(.5, Math.max(.05, (s - .55) * .7));
        ctx.fillStyle = 'rgba(' + (s > 1 ? hi : bl) + ',' + a + ')'; ctx.beginPath(); ctx.arc(cx + x1 * s * sc, cy + y1 * s * sc, Math.max(.7, 1.8 * s), 0, 6.283); ctx.fill();
      }
    })(performance.now());
  });
})();

/* product window: depth tilt, report and evidence panel sliding against each other */
(function () {
  const win = document.querySelector('.window');
  if (!win || reduced || !matchMedia('(pointer:fine)').matches) return;
  win.addEventListener('pointermove', e => {
    const r = win.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    win.style.setProperty('--wrx', (-ny * 4).toFixed(2) + 'deg'); win.style.setProperty('--wry', (nx * 6).toFixed(2) + 'deg');
    win.style.setProperty('--wpx', nx.toFixed(3)); win.style.setProperty('--wpy', ny.toFixed(3));
  });
  win.addEventListener('pointerleave', () => { ['--wrx', '--wry'].forEach(k => win.style.setProperty(k, '0deg')); ['--wpx', '--wpy'].forEach(k => win.style.setProperty(k, '0')); });
})();

/* headings: words blur into focus (same text) */
(function () {
  if (reduced) return;
  function wrap(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    let i = 0;
    nodes.forEach(tn => {
      const frag = document.createDocumentFragment();
      tn.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.append(p); else { const s = document.createElement('span'); s.className = 'hw'; s.style.setProperty('--d', (i++ * .055) + 's'); s.textContent = p; frag.append(s); } });
      tn.replaceWith(frag);
    });
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); e.target.querySelectorAll('.hw').forEach(x => x.classList.add('in')); } }), { threshold: .3 });
  document.querySelectorAll('.phead h1, .sec h2, .phd h2, .cta h2').forEach(h => { wrap(h); io.observe(h); });
})();

/* magnetic buttons */
document.querySelectorAll('.actions .btn, .cta .btn, .phead .btn').forEach(b => {
  if (reduced || !matchMedia('(pointer:fine)').matches) return;
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .16) + 'px,' + ((e.clientY - r.top - r.height / 2) * .26) + 'px)'; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});
