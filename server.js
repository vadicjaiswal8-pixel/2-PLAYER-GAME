const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const BG = require('./boards');
const rooms = {};
const T = { '/manifest.json': 'application/json', '/sw.js': 'text/javascript', '/icon-192.png': 'image/png', '/icon-512.png': 'image/png', '/og.png': 'image/png', '/b.js': 'text/javascript', '/logo.png': 'image/png' };
const srv = http.createServer((q, s) => {
  let p = q.url.split('?')[0];
  if (p == '/favicon.ico') p = '/icon-192.png';
  if (p == '/.well-known/assetlinks.json' && process.env.ASSETLINKS) { s.writeHead(200, { 'Content-Type': 'application/json' }); return s.end(process.env.ASSETLINKS); }
  if (p == '/health') { s.writeHead(200); return s.end('ok'); }
  const f = T[p] ? p.slice(1) : 'index.html';
  fs.readFile(path.join(__dirname, f), (e, d) => {
    if (e) { s.writeHead(404); return s.end(); }
    if (f == 'index.html') d = d.toString().replace(/__HOST__/g, 'https://' + (q.headers.host || ''));
    s.writeHead(200, { 'Content-Type': T[p] || 'text/html' }); s.end(d);
  });
});
const wss = new WebSocketServer({ server: srv, maxPayload: 4096 });
const send = (w, o) => w && w.readyState == 1 && w.send(JSON.stringify(o));
const live = r => r.p.filter(x => x.ws && x.ws.readyState == 1);
const hum = r => live(r).filter(x => !x.bot);
const bc = (r, o) => { for (const y of live(r)) send(y.ws, o); };
function info(r) {
  const L = live(r);
  for (const x of L) send(x.ws, { t: 'room', code: r.code, n: L.length, names: { me: x.name || 'You', opp: (L.find(y => y != x) || {}).name || '' }, wins: { me: r.wins[x.pid] || 0, opp: r.p.reduce((s, y) => s + (y.pid != x.pid ? (r.wins[y.pid] || 0) : 0), 0) } });
}
const clean = n => { n = String(n || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 14); return !n || /(fuck|shit|bitch|cunt|nigg|slut|whore|rape|porn|dick|cock|pussy|asshole)/i.test(n) ? 'Player' : n; };
function join(ws, c, pid, name) {
  let r = rooms[c];
  if (!r && /^[A-HJ-NP-Z2-9]{6}$/.test(c) && Object.keys(rooms).length < 3000) r = rooms[c] = { code: c, p: [], wins: {}, round: null };
  if (!r) return send(ws, { t: 'err', err: 'Room not found. Ask your friend for a new link.' });
  if (!pid) return;
  let x = r.p.find(y => y.pid == pid);
  if (!x && r.p.some(y => y.bot)) dropBot(r);
  if (!x) { if (r.p.length >= 2) return send(ws, { t: 'err', err: 'That room is full.' }); x = { pid }; r.p.push(x); }
  x.ws = ws; if (name) x.name = clean(name); ws.r = r; ws.x = x; info(r);
}
const SY = '★♥♣☂☾♞⚑✂☎♫⚓✿❄☀♛✈'.split(''), TOP = ['pep', 'mush', 'basil', 'tomato', 'onion', 'fish'];
const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const after = (r, rd, ms, f) => setTimeout(() => { if (r.round === rd && !rd.done) f(); }, ms);
function award(r, rd, w, extra) {
  clearInterval(rd.iv); rd.open = 0; if (w) rd.pts[w] = (rd.pts[w] || 0) + 1;
  bc(r, { t: 'spoint', w, pts: rd.pts, ...extra });
  if (w && rd.pts[w] >= G[rd.g].to) return after(r, rd, 1400, () => endDuel(r));
  after(r, rd, 1900, () => G[rd.g].next(r, rd));
}
function endDuel(r) {
  const rd = r.round; if (!rd || rd.done) return; rd.done = 1; clearInterval(rd.iv);
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
    const w = Object.keys(rd.pts)[rd.i % 2], i = rd.i; rd.who = w; rd.open = 1; rd.t0 = Date.now(); rd.wind = wind ? Math.round((Math.random() * 2 - 1) * 45) : 0;
    rd.p = [1.4 + Math.random() * 1.2, 1.1 + Math.random() * 1.2, Math.random() * 6.28, Math.random() * 6.28];
    bc(r, { t: 'aturn', i, who: w, wind: rd.wind, p: rd.p, pts: rd.pts });
    after(r, rd, 15000, () => { if (rd.i == i && rd.open) thr(r, rd, w, 0, 0, true); });
  },
  msg(r, rd, x, d) {
    if (!rd.open || d.i != rd.i || x.pid != rd.who) return;
    if (x.bot) return thr(r, rd, x.pid, +d.x || 0, +d.y || 0);
    const el = (Date.now() - rd.t0) / 1000; let e = Number(d.e); if (!isFinite(e)) return;
    e = Math.max(Math.max(0, Math.min(e, el)), el - 1.2); const p = rd.p;
    thr(r, rd, x.pid, Math.round(Math.cos(e * p[0] + p[2]) * 100), Math.round(Math.sin(e * p[1] + p[3]) * 100));
  }
});
const SC = 160;
function snext(r, rd) {
  rd.k++; rd.ids = Object.keys(rd.pts); rd.tick = 0; rd.ev = 0; rd.dash = [0, 0];
  rd.bl = [{ x: 110, y: 160, vx: 0, vy: 0, cd: 0, du: 0 }, { x: 210, y: 160, vx: 0, vy: 0, cd: 0, du: 0 }]; rd.tg = [{ x: 110, y: 160 }, { x: 210, y: 160 }];
  bc(r, { t: 'sstart', k: rd.k, ids: rd.ids });
  after(r, rd, 1000, () => { rd.t0 = Date.now(); rd.iv = setInterval(() => sstep(r, rd), 1000 / 60); });
}
function sbot(rd, i, AR) {
  const b = rd.bl[i], o = rd.bl[1 - i], t = rd.tg[i], d = Math.hypot(o.x - b.x, o.y - b.y), c = Math.hypot(b.x - SC, b.y - SC);
  if (c > AR - 40 && d > 60) { t.x = SC; t.y = SC; }
  else { t.x = o.x + o.vx * 0.15; t.y = o.y + o.vy * 0.15; if (d < 95 && Date.now() > b.cd && c < AR - 45 && Math.random() < [0.04, 0.1, 0.2][rd.lvl ?? 1]) rd.dash[i] = 1; }
}
function sstep(r, rd) {
  if (r.round !== rd || rd.done) return clearInterval(rd.iv);
  const dt = 1 / 60, B = rd.bl, now = Date.now(), AR = Math.max(85, 140 - (now - rd.t0) / 1000 * 1.6);
  rd.ids.forEach((id, i) => {
    const b = B[i], o = B[1 - i], t = rd.tg[i];
    if (r.p.some(y => y.pid == id && y.bot)) sbot(rd, i, AR);
    const dx = t.x - b.x, dy = t.y - b.y, d = Math.hypot(dx, dy);
    if (d > 6) { b.vx += dx / d * 900 * dt; b.vy += dy / d * 900 * dt; }
    if (rd.dash[i]) { rd.dash[i] = 0; if (now > b.cd) { b.cd = now + 1500; b.du = now + 250; const ux = d > 6 ? dx : o.x - b.x, uy = d > 6 ? dy : o.y - b.y, l = Math.hypot(ux, uy) || 1; b.vx += ux / l * 520; b.vy += uy / l * 520; } }
    const cap = now < b.du ? 620 : 230, sp = Math.hypot(b.vx, b.vy); if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
    b.vx *= .985; b.vy *= .985; b.x += b.vx * dt; b.y += b.vy * dt;
  });
  const dx = B[1].x - B[0].x, dy = B[1].y - B[0].y, d = Math.hypot(dx, dy) || 1;
  if (d < 52) {
    const nx = dx / d, ny = dy / d, ov = 52 - d; B[0].x -= nx * ov / 2; B[0].y -= ny * ov / 2; B[1].x += nx * ov / 2; B[1].y += ny * ov / 2;
    const rv = (B[1].vx - B[0].vx) * nx + (B[1].vy - B[0].vy) * ny;
    if (rv < 0) { const j = -1.15 * rv / 2; B[0].vx -= j * nx; B[0].vy -= j * ny; B[1].vx += j * nx; B[1].vy += j * ny; rd.ev = 1; }
    for (let i = 0; i < 2; i++) if (now < B[i].du) { const sg = i == 0 ? 1 : -1; B[1 - i].vx += sg * nx * 260; B[1 - i].vy += sg * ny * 260; }
  }
  for (let i = 0; i < 2; i++) if (Math.hypot(B[i].x - SC, B[i].y - SC) > AR + 6) { clearInterval(rd.iv); return award(r, rd, rd.ids[1 - i], {}); }
  if (++rd.tick % 2 == 0) { bc(r, { t: 'ss', b: B.map(b => [b.x | 0, b.y | 0, now < b.du ? 1 : 0, Math.max(0, b.cd - now) | 0]), ar: AR | 0, ev: rd.ev }); rd.ev = 0; }
}
const G = {
  spot: {
    to: 5,
    next(r, rd) { const p = shuf(SY.slice()); rd.sh = p[0]; rd.open = 1; rd.lock = {}; rd.k++; rd.ts = Date.now(); bc(r, { t: 'sround', k: rd.k, A: shuf(p.slice(1, 6).concat(p[0])), B: shuf(p.slice(6, 11).concat(p[0])), seed: Math.floor(Math.random() * 1e9) }); },
    msg(r, rd, x, d) { if (!rd.open || d.k != rd.k || Date.now() - rd.ts < 250 || (rd.lock[x.pid] || 0) > Date.now()) return; if (d.g == rd.sh) award(r, rd, x.pid); else { rd.lock[x.pid] = Date.now() + 1000; send(x.ws, { t: 'lock', ms: 1000 }); } }
  },
  pizza: {
    to: 3,
    next(r, rd) {
      rd.k++; const k = rd.k, n = rd.k < 3 ? 4 : 5; rd.tgt = Array.from({ length: n }, () => TOP[Math.floor(Math.random() * TOP.length)]);
      rd.open = 0; rd.lock = {}; bc(r, { t: 'pshow', k, slots: rd.tgt, ms: 4000 });
      after(r, rd, 4200, () => { if (rd.k != k) return; rd.open = 1; bc(r, { t: 'pplay', k, n, pal: TOP }); after(r, rd, 50000, () => { if (rd.k == k && rd.open) award(r, rd, null, { why: 'timeout' }); }); });
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k != rd.k) return; const s = Array.isArray(d.slots) ? d.slots.slice(0, rd.tgt.length) : [];
      if (d.done) {
        if ((rd.lock[x.pid] || 0) > Date.now()) return;
        if (s.length == rd.tgt.length && rd.tgt.every((t, i) => s[i] === t)) award(r, rd, x.pid);
        else { rd.lock[x.pid] = Date.now() + 2000; send(x.ws, { t: 'lock', ms: 2000 }); }
      } else { const f = rd.tgt.map((t, i) => s[i] ? 1 : 0); for (const y of live(r)) if (y !== x) send(y.ws, { t: 'pprog', k: rd.k, filled: f }); }
    }
  },
  darts: aimG(0), archery: aimG(1),
  c4: board(BG.c4), gomoku: board(BG.gomoku), dots: board(BG.dots), uttt: board(BG.uttt), sea: board(BG.sea),
  sumo: {
    to: 2, next: snext,
    msg(r, rd, x, d) {
      const i = rd.ids ? rd.ids.indexOf(x.pid) : -1; if (i < 0 || !rd.tg) return;
      if (d.dash) rd.dash[i] = 1; else if (d.stop) rd.tg[i] = { x: rd.bl[i].x, y: rd.bl[i].y };
      else if (isFinite(+d.x) && isFinite(+d.y)) rd.tg[i] = { x: Math.max(0, Math.min(320, +d.x)), y: Math.max(0, Math.min(320, +d.y)) };
    }
  }
};
const rr = (a, b) => a + Math.random() * (b - a), gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
function addBot(r, lvl) {
  const RN = ['Sleepy Rex (bot)', 'Rex (bot)', 'King Rex (bot)']; let bot = r.p.find(y => y.bot);
  if (!bot) {
    bot = { pid: 'BOT', name: RN[lvl], bot: 1 };
    bot.ws = { readyState: 1, r, x: bot, send: m => hear(r, bot, JSON.parse(m)) };
    r.p.push(bot); bot.lvl = lvl; info(r);
  } else { bot.lvl = lvl; bot.name = RN[lvl]; info(r); }
}
function dropBot(r) {
  const rd = r.round; if (rd && !rd.done) { rd.done = 1; clearInterval(rd.iv); }
  r.pending = null; r.wins = {}; r.p = r.p.filter(y => !y.bot); bc(r, { t: 'reset' });
}
function hear(r, bot, m) {
  const L = bot.lvl ?? 1, bt = (ms, f) => setTimeout(() => { if (r.p.includes(bot)) f(); }, ms), say = o => act(bot.ws, o);
  if (m.t == 'intro') bt(rr(700, 1500), () => say({ t: 'ready' }));
  else if (m.t == 'sround') {
    const sh = m.A.find(g => m.B.includes(g)), tap = (g, ms) => bt(ms, () => say({ t: 'in', k: m.k, g }));
    const t = [rr(1800, 3600), rr(900, 2100), rr(600, 1400)][L];
    if (Math.random() < [0.2, 0.08, 0.03][L]) { tap('x', rr(900, 1400)); tap(sh, t + 1500); } else tap(sh, t);
  } else if (m.t == 'pshow') { bot.tgt = m.slots.slice(); }
  else if (m.t == 'pplay' && bot.tgt) {
    const n = m.n, tgt = bot.tgt.slice(), cur = Array(n).fill(null), order = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    const think = (2200 + n * 600 + rr(0, 1200)) * [1.7, 1, 0.75][L], slip = Math.random() < [0.3, 0.15, 0.06][L], wi = order[n - 1];
    const prog = done => say({ t: 'in', k: m.k, slots: cur.slice(), done });
    order.forEach((idx, j) => bt(think * 0.9 * (j + 1) / n, () => { cur[idx] = slip && idx == wi ? m.pal.find(t => t != tgt[idx]) : tgt[idx]; prog(0); }));
    bt(think, () => prog(1));
    if (slip) { bt(think + 2300, () => { cur[wi] = tgt[wi]; prog(0); }); bt(think + 2700, () => prog(1)); }
  } else if (m.t == 'aturn' && m.who == 'BOT') {
    const w = m.wind || 0, sg = [38, 24, 13][L];
    bt(rr(1200, 2400), () => say({ t: 'in', i: m.i, x: Math.round(-w + gauss() * sg), y: Math.round(gauss() * sg) }));
  }
}
const FAST = process.env.FAST;
const bview = (r, rd, def, res) => { for (const y of live(r)) { const k = rd.ids.indexOf(y.pid); send(y.ws, { t: 'bs', g: rd.g, ids: rd.ids, turn: rd.turn, win: res && res.win != null ? res.win : null, ...def.view(rd, k) }); } };
const isFree = (def, rd) => def.free && def.free(rd);
function watch(r, rd, def) { const mc = rd.mc; after(r, rd, 60000, () => { if (rd.mc != mc || !rd.open || isFree(def, rd)) return; rd.open = 0; award(r, rd, rd.ids[1 - rd.turn], { why: 'timeout' }); }); }
function botGo(r, rd, def) {
  const bi = rd.ids.findIndex(id => r.p.some(y => y.pid == id && y.bot)); if (bi < 0 || rd.bt || !rd.open) return;
  const bot = r.p.find(y => y.bot), L = bot.lvl ?? 1; if (!isFree(def, rd) && rd.turn != bi) return;
  rd.bt = 1; const mc = rd.mc;
  after(r, rd, FAST ? 15 : 600 + Math.random() * (isFree(def, rd) ? 1200 : [900, 1400, 1800][L]), () => {
    rd.bt = 0; if (rd.mc != mc || !rd.open) return botGo(r, rd, def);
    const mv = def.bot(rd, bi, L); if (mv) play(r, rd, def, bi, mv);
  });
}
function play(r, rd, def, i, d) {
  if (!isFree(def, rd) && i != rd.turn) return false;
  const res = def.move(rd, i, d); if (!res) return false;
  rd.mc++; if (res.turn !== undefined && !res.stay) rd.turn = res.turn;
  bview(r, rd, def, res);
  if (res.win != null) { rd.open = 0; after(r, rd, 1200, () => award(r, rd, rd.ids[res.win], {})); }
  else if (res.draw) { rd.open = 0; after(r, rd, 1200, () => endDuel(r)); }
  else { botGo(r, rd, def); watch(r, rd, def); }
  return true;
}
function board(def) { return {
  to: 1,
  next(r, rd) {
    rd.k++; rd.ids = Object.keys(rd.pts); r.fm = (r.fm || 0) ^ 1; if (r.fm) rd.ids.reverse();
    rd.s = def.init(); rd.turn = 0; rd.open = 1; rd.mc = 0; bview(r, rd, def); botGo(r, rd, def); watch(r, rd, def);
  },
  msg(r, rd, x, d) { const i = rd.ids ? rd.ids.indexOf(x.pid) : -1; if (i >= 0 && rd.open) play(r, rd, def, i, d); }
}; }
function begin(r, g) {
  r.pending = null; const rd = r.round = { g, done: 0, k: 0, pts: {} }, b = r.p.find(y => y.bot); rd.lvl = b ? (b.lvl ?? 1) : 1;
  for (const y of live(r)) rd.pts[y.pid] = 0;
  bc(r, { t: 'dgo', g, now: Date.now(), startAt: Date.now() + 3500 });
  setTimeout(() => { if (r.round === rd) G[g].next(r, rd); }, 3600);
}
function act(ws, d) {
  const r = ws.r, x = ws.x;
  if (d.t == 'pick' && G[d.g]) {
    if (hum(r).length == 2) { r.pending = { g: d.g, ready: {} }; bc(r, { t: 'intro', g: d.g }); }
    else send(ws, { t: 'note', msg: 'Your friend is not connected right now.' });
  } else if (d.t == 'bot' && G[d.g]) {
    if (hum(r).length > 1) return send(ws, { t: 'note', msg: 'Your friend is in this room. Pick Play vs Friend instead.' });
    addBot(r, Math.max(0, Math.min(2, d.lvl | 0))); begin(r, d.g);
  } else if (d.t == 'ready' && r.pending) {
    r.pending.ready[x.pid] = 1;
    if (live(r).every(y => r.pending.ready[y.pid])) begin(r, r.pending.g);
  } else if (d.t == 'quit') {
    const rd = r.round, o = live(r).find(y => y != x);
    if (r.pending) { r.pending = null; if (o && !o.bot) send(o.ws, { t: 'home', msg: (x.name || 'Your friend') + ' backed out.' }); }
    if (rd && !rd.done) {
      rd.done = 1; clearInterval(rd.iv);
      if (o && !o.bot) { r.wins[o.pid] = (r.wins[o.pid] || 0) + 1; send(o.ws, { t: 'res', g: rd.g, left: 1, sc: { me: rd.pts[o.pid] || 0, opp: rd.pts[x.pid] || 0 }, win: 'me' }); info(r); }
    }
  } else if (d.t == 'in' && r.round && !r.round.done) G[r.round.g].msg(r, r.round, x, d);
}
wss.on('connection', ws => {
  ws.on('message', m => {
    const now = Date.now(); if (now - (ws.w0 || 0) > 1000) { ws.w0 = now; ws.wc = 0; } if (++ws.wc > 90) return;
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
    if (!hum(r).length) setTimeout(() => { if (!hum(r).length) delete rooms[r.code]; }, 6e5);
  });
});
srv.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Tussle running'));
