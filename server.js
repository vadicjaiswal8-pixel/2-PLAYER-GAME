const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const rooms = {};
const T = { '/manifest.json': 'application/json', '/sw.js': 'text/javascript', '/icon-192.png': 'image/png', '/icon-512.png': 'image/png' };
const srv = http.createServer((q, s) => {
  const p = q.url.split('?')[0], f = T[p] ? p.slice(1) : 'index.html';
  fs.readFile(path.join(__dirname, f), (e, d) => { s.writeHead(200, { 'Content-Type': T[p] || 'text/html' }); s.end(d); });
});
const wss = new WebSocketServer({ server: srv });
const send = (w, o) => w && w.readyState == 1 && w.send(JSON.stringify(o));
const live = r => r.p.filter(x => x.ws && x.ws.readyState == 1);
const bc = (r, o) => { for (const y of live(r)) send(y.ws, o); };
function info(r) {
  const L = live(r);
  for (const x of L) send(x.ws, { t: 'room', code: r.code, n: L.length, names: { me: x.name || 'You', opp: (L.find(y => y != x) || {}).name || '' }, wins: { me: r.wins[x.pid] || 0, opp: r.p.reduce((s, y) => s + (y.pid != x.pid ? (r.wins[y.pid] || 0) : 0), 0) } });
}
function join(ws, c, pid, name) {
  const r = rooms[c];
  if (!r) return send(ws, { t: 'err', err: 'Room not found. Ask your friend for a new link.' });
  if (!pid) return;
  let x = r.p.find(y => y.pid == pid);
  if (!x) { if (r.p.length >= 2) return send(ws, { t: 'err', err: 'That room is full.' }); x = { pid }; r.p.push(x); }
  x.ws = ws; if (name) x.name = String(name).slice(0, 14); ws.r = r; ws.x = x; info(r);
}
const SY = '★♥♣☂☾♞⚑✂☎♫⚓✿❄☀♛✈'.split(''), TOP = ['pep', 'mush', 'olive', 'pepper', 'onion', 'ham', 'basil'];
const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const after = (r, rd, ms, f) => setTimeout(() => { if (r.round === rd && !rd.done) f(); }, ms);
function award(r, rd, w, extra) {
  rd.open = 0; if (w) rd.pts[w] = (rd.pts[w] || 0) + 1;
  bc(r, { t: 'spoint', w, pts: rd.pts, ...extra });
  if (w && rd.pts[w] >= G[rd.g].to) return after(r, rd, 1400, () => endDuel(r));
  after(r, rd, 1900, () => G[rd.g].next(r, rd));
}
function endDuel(r) {
  const rd = r.round; if (!rd || rd.done) return; rd.done = 1;
  const L = live(r); let win = null;
  if (L.length == 2) { const a = rd.pts[L[0].pid] || 0, b = rd.pts[L[1].pid] || 0; if (a != b) { win = a > b ? L[0].pid : L[1].pid; r.wins[win] = (r.wins[win] || 0) + 1; } }
  for (const x of L) { const o = L.find(y => y != x); send(x.ws, { t: 'res', g: rd.g, sc: { me: rd.pts[x.pid] || 0, opp: o ? (rd.pts[o.pid] || 0) : 0 }, win: L.length < 2 ? 'left' : win == null ? 'tie' : win == x.pid ? 'me' : 'opp' }); }
  info(r);
}
function thr(r, rd, w, x, y, miss) {
  rd.open = 0; x = Math.max(-100, Math.min(100, x)); y = Math.max(-100, Math.min(100, y));
  const hx = miss ? 0 : x + rd.wind, hy = y, s = miss ? 0 : Math.max(0, Math.round(100 * (1 - Math.hypot(hx, hy) / 120)));
  rd.pts[w] += s; bc(r, { t: 'athrown', i: rd.i, who: w, hx, hy, s, pts: rd.pts, miss: !!miss });
  after(r, rd, 1600, () => G[rd.g].next(r, rd));
}
const aimG = wind => ({
  next(r, rd) {
    rd.i = (rd.i === undefined ? -1 : rd.i) + 1; if (rd.i >= 10) return endDuel(r);
    const w = Object.keys(rd.pts)[rd.i % 2], i = rd.i; rd.who = w; rd.open = 1; rd.wind = wind ? Math.round((Math.random() * 2 - 1) * 45) : 0;
    bc(r, { t: 'aturn', i, who: w, wind: rd.wind, p: [1.4 + Math.random() * 1.2, 1.1 + Math.random() * 1.2, Math.random() * 6.28, Math.random() * 6.28], pts: rd.pts });
    after(r, rd, 15000, () => { if (rd.i == i && rd.open) thr(r, rd, w, 0, 0, true); });
  },
  msg(r, rd, x, d) { if (rd.open && d.i == rd.i && x.pid == rd.who) thr(r, rd, x.pid, +d.x || 0, +d.y || 0); }
});
const G = {
  spot: {
    to: 5,
    next(r, rd) { const p = shuf(SY.slice()); rd.sh = p[0]; rd.open = 1; rd.lock = {}; rd.k++; bc(r, { t: 'sround', k: rd.k, A: shuf(p.slice(1, 6).concat(p[0])), B: shuf(p.slice(6, 11).concat(p[0])), seed: Math.floor(Math.random() * 1e9) }); },
    msg(r, rd, x, d) { if (!rd.open || d.k != rd.k || (rd.lock[x.pid] || 0) > Date.now()) return; if (d.g == rd.sh) award(r, rd, x.pid); else { rd.lock[x.pid] = Date.now() + 1000; send(x.ws, { t: 'lock', ms: 1000 }); } }
  },
  draw: {
    to: 3,
    next(r, rd) { rd.k++; rd.go = 0; const k = rd.k; bc(r, { t: 'dwait', k }); after(r, rd, 2000 + Math.random() * 3000, () => { if (rd.k == k && rd.go == 0) { rd.go = 1; rd.t0 = Date.now(); bc(r, { t: 'ddraw', k }); } }); },
    msg(r, rd, x, d) {
      if (d.k != rd.k || rd.go == 2) return;
      if (rd.go == 0) { rd.go = 2; const o = live(r).find(y => y != x); award(r, rd, o ? o.pid : null, { why: 'early', by: x.pid }); }
      else { rd.go = 2; award(r, rd, x.pid, { ms: Date.now() - rd.t0 }); }
    }
  },
  pizza: {
    to: 3,
    next(r, rd) {
      rd.k++; const k = rd.k, ty = shuf(TOP.slice()).slice(0, rd.k < 3 ? 3 : 4), it = []; rd.cnt = {}; rd.open = 0; rd.lock = {};
      for (const t of ty) { const c = 1 + Math.floor(Math.random() * 4); rd.cnt[t] = c; for (let i = 0; i < c; i++) { const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * 72; it.push({ t, x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d) }); } }
      bc(r, { t: 'pshow', k, ty, it, ms: 4000 });
      after(r, rd, 4200, () => { if (rd.k != k) return; rd.open = 1; bc(r, { t: 'pplay', k, ty: TOP }); after(r, rd, 45000, () => { if (rd.k == k && rd.open) award(r, rd, null, { why: 'timeout' }); }); });
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k != rd.k || (rd.lock[x.pid] || 0) > Date.now()) return; const c = d.counts || {};
      if (Object.keys(rd.cnt).every(t => c[t] == rd.cnt[t]) && Object.keys(c).every(t => !c[t] || rd.cnt[t])) award(r, rd, x.pid);
      else { rd.lock[x.pid] = Date.now() + 2000; send(x.ws, { t: 'lock', ms: 2000 }); }
    }
  },
  darts: aimG(0), archery: aimG(1)
};
function act(ws, d) {
  const r = ws.r, x = ws.x;
  if (d.t == 'pick' && G[d.g] && live(r).length == 2) { r.pending = { g: d.g, ready: {} }; bc(r, { t: 'intro', g: d.g }); }
  else if (d.t == 'ready' && r.pending) {
    r.pending.ready[x.pid] = 1;
    if (live(r).every(y => r.pending.ready[y.pid])) {
      const g = r.pending.g; r.pending = null; const rd = r.round = { g, done: 0, k: 0, pts: {} };
      for (const y of live(r)) rd.pts[y.pid] = 0;
      bc(r, { t: 'dgo', g, now: Date.now(), startAt: Date.now() + 3500 });
      setTimeout(() => { if (r.round === rd) G[g].next(r, rd); }, 3600);
    }
  } else if (d.t == 'in' && r.round && !r.round.done) G[r.round.g].msg(r, r.round, x, d);
}
wss.on('connection', ws => {
  ws.on('message', m => {
    let d; try { d = JSON.parse(m); } catch { return; }
    if (d.t == 'create') {
      let c; do c = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''); while (rooms[c]);
      rooms[c] = { code: c, p: [], wins: {}, round: null }; join(ws, c, d.pid, d.name);
    } else if (d.t == 'join') join(ws, String(d.code || '').toUpperCase(), d.pid, d.name);
    else if (ws.r) act(ws, d);
  });
  ws.on('close', () => {
    const r = ws.r; if (!r) return;
    if (ws.x && ws.x.ws === ws) ws.x.ws = null;
    if (r.round && !r.round.done && live(r).length < 2) endDuel(r);
    info(r);
    if (!live(r).length) setTimeout(() => { if (!live(r).length) delete rooms[r.code]; }, 6e5);
  });
});
srv.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Tussle running'));
