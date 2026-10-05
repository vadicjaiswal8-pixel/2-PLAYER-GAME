const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const LOW = { tug: 0, spot: 1, draw: 1, darts: 0, archery: 0 }, rooms = {};
const T = { '/manifest.json': 'application/json', '/sw.js': 'text/javascript', '/icon-192.png': 'image/png', '/icon-512.png': 'image/png' };
const srv = http.createServer((q, s) => {
  const p = q.url.split('?')[0], f = T[p] ? p.slice(1) : 'index.html';
  fs.readFile(path.join(__dirname, f), (e, d) => { s.writeHead(200, { 'Content-Type': T[p] || 'text/html' }); s.end(d); });
});
const wss = new WebSocketServer({ server: srv });
const send = (w, o) => w && w.readyState == 1 && w.send(JSON.stringify(o));
const live = r => r.p.filter(x => x.ws && x.ws.readyState == 1);
const all = r => live(r).every(x => r.round.sc[x.pid] !== undefined);
function info(r) {
  const L = live(r);
  for (const x of L) send(x.ws, { t: 'room', code: r.code, n: L.length, names: { me: x.name || 'You', opp: (L.find(y => y != x) || {}).name || '' }, wins: { me: r.wins[x.pid] || 0, opp: r.p.reduce((s, y) => s + (y.pid != x.pid ? (r.wins[y.pid] || 0) : 0), 0) } });
}
function finish(r) {
  const rd = r.round; if (!rd || rd.done) return; rd.done = 1;
  const L = live(r), low = LOW[rd.g], bad = low ? 1e9 : -1, v = x => rd.sc[x.pid] === undefined ? bad : rd.sc[x.pid];
  let win = null;
  if (L.length == 2) { const a = v(L[0]), b = v(L[1]); if (a != b) { win = (low ? a < b : a > b) ? L[0].pid : L[1].pid; r.wins[win] = (r.wins[win] || 0) + 1; } }
  for (const x of L) { const o = L.find(y => y != x); send(x.ws, { t: 'res', g: rd.g, sc: { me: rd.sc[x.pid], opp: o ? rd.sc[o.pid] : undefined }, win: L.length < 2 ? 'solo' : win == null ? 'tie' : win == x.pid ? 'me' : 'opp' }); }
  info(r);
}
function join(ws, c, pid, name) {
  const r = rooms[c];
  if (!r) return send(ws, { t: 'err', err: 'Room not found. Ask your friend for a new link.' });
  if (!pid) return;
  let x = r.p.find(y => y.pid == pid);
  if (!x) { if (r.p.length >= 2) return send(ws, { t: 'err', err: 'That room is full.' }); x = { pid }; r.p.push(x); }
  x.ws = ws; if (name) x.name = String(name).slice(0, 14); ws.r = r; ws.x = x; info(r);
}
function act(ws, d) {
  const r = ws.r, x = ws.x;
  if (d.t == 'pick' && LOW[d.g] !== undefined) {
    const rd = r.round = { g: d.g, seed: Math.floor(Math.random() * 1e9), startAt: Date.now() + 3500, sc: {} };
    for (const y of live(r)) send(y.ws, { t: 'go', g: rd.g, seed: rd.seed, startAt: rd.startAt, now: Date.now() });
    setTimeout(() => { if (r.round === rd) finish(r); }, 70000);
  } else if (d.t == 'score' && r.round && !r.round.done && r.round.sc[x.pid] === undefined) {
    r.round.sc[x.pid] = Number(d.v); if (all(r)) finish(r);
  } else if (d.t == 'prog') for (const y of live(r)) if (y !== x) send(y.ws, { t: 'prog', v: d.v });
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
    if (r.round && !r.round.done && live(r).length && all(r)) finish(r);
    info(r);
    if (!live(r).length) setTimeout(() => { if (!live(r).length) delete rooms[r.code]; }, 6e5);
  });
});
srv.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Tussle running'));
