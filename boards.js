'use strict';
// Turn-based board games: rules + bots. Each game: init, move(rd,i,d) -> result|undefined, view(rd,k), bot(rd,i,lvl) -> move
const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// ---------- Connect Four ----------
const C4 = {
  init: () => ({ g: Array(42).fill(-1), last: -1, line: null }),
  low: (g, c) => { for (let r = 5; r >= 0; r--) if (g[r * 7 + c] < 0) return r; return -1; },
  win(g, r, c, p) {
    for (const [dr, dc] of DIRS) {
      const cells = [r * 7 + c];
      for (const s of [1, -1]) { let y = r + dr * s, x = c + dc * s; while (y >= 0 && y < 6 && x >= 0 && x < 7 && g[y * 7 + x] == p) { cells.push(y * 7 + x); y += dr * s; x += dc * s; } }
      if (cells.length >= 4) return cells;
    }
    return null;
  },
  move(rd, i, d) {
    const s = rd.s, c = +d.c; if (!(c >= 0 && c < 7)) return; const r = C4.low(s.g, c); if (r < 0) return;
    s.g[r * 7 + c] = i; s.last = r * 7 + c; const w = C4.win(s.g, r, c, i);
    if (w) { s.line = w; return { win: i, turn: i }; }
    return s.g.every(v => v >= 0) ? { draw: 1, turn: i } : { turn: 1 - i };
  },
  view: rd => ({ g: rd.s.g, last: rd.s.last, line: rd.s.line }),
  ev(g, p) {
    let sc = 0; const f = [0, 1, 5, 30];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      if (g[r * 7 + c] == p && c == 3) sc += 3;
      for (const [dr, dc] of DIRS) {
        const er = r + dr * 3, ec = c + dc * 3; if (er < 0 || er > 5 || ec < 0 || ec > 6) continue;
        let a = 0, b = 0; for (let k = 0; k < 4; k++) { const v = g[(r + dr * k) * 7 + c + dc * k]; if (v == p) a++; else if (v >= 0) b++; }
        if (b == 0) sc += f[a] || 0; else if (a == 0) sc -= f[b] || 0;
      }
    }
    return sc;
  },
  nm(g, p, d, a, b) {
    if (d == 0) return C4.ev(g, p);
    let best = -1e9, any = 0;
    for (const c of [3, 2, 4, 1, 5, 0, 6]) {
      const r = C4.low(g, c); if (r < 0) continue; any = 1; g[r * 7 + c] = p;
      const s = C4.win(g, r, c, p) ? 1e5 + d : -C4.nm(g, 1 - p, d - 1, -b, -a);
      g[r * 7 + c] = -1; if (s > best) best = s; if (best > a) a = best; if (a >= b) break;
    }
    return any ? best : 0;
  },
  bot(rd, i, lvl) {
    const g = rd.s.g.slice(), legal = [0, 1, 2, 3, 4, 5, 6].filter(c => C4.low(g, c) >= 0);
    if (Math.random() < [0.4, 0.08, 0][lvl]) return { c: pick(legal) };
    const depth = [2, 4, 7][lvl]; let best = -1e9, bc = legal[0];
    for (const c of [3, 2, 4, 1, 5, 0, 6]) {
      if (!legal.includes(c)) continue; const r = C4.low(g, c); g[r * 7 + c] = i;
      const s = C4.win(g, r, c, i) ? 1e6 : -C4.nm(g, 1 - i, depth - 1, -1e9, 1e9); g[r * 7 + c] = -1;
      if (s > best) { best = s; bc = c; }
    }
    return { c: bc };
  }
};

// ---------- Gomoku (13x13, five in a row) ----------
const GN = 13;
const GM = {
  init: () => ({ g: Array(GN * GN).fill(-1), last: -1, line: null }),
  move(rd, i, d) {
    const s = rd.s, x = +d.x, y = +d.y; if (!(x >= 0 && x < GN && y >= 0 && y < GN) || s.g[y * GN + x] >= 0) return;
    s.g[y * GN + x] = i; s.last = y * GN + x;
    for (const [dx, dy] of DIRS) {
      const cells = [y * GN + x];
      for (const sg of [1, -1]) { let a = x + dx * sg, b = y + dy * sg; while (a >= 0 && a < GN && b >= 0 && b < GN && s.g[b * GN + a] == i) { cells.push(b * GN + a); a += dx * sg; b += dy * sg; } }
      if (cells.length >= 5) { s.line = cells; return { win: i, turn: i }; }
    }
    return s.g.every(v => v >= 0) ? { draw: 1, turn: i } : { turn: 1 - i };
  },
  view: rd => ({ g: rd.s.g, last: rd.s.last, line: rd.s.line }),
  val(g, x, y, p) {
    let tot = 0;
    for (const [dx, dy] of DIRS) {
      let c = 1, open = 0;
      for (const s of [1, -1]) { let a = x + dx * s, b = y + dy * s; while (a >= 0 && a < GN && b >= 0 && b < GN && g[b * GN + a] == p) { c++; a += dx * s; b += dy * s; } if (a >= 0 && a < GN && b >= 0 && b < GN && g[b * GN + a] < 0) open++; }
      tot += c >= 5 ? 1e6 : c == 4 ? (open == 2 ? 5e4 : open ? 5e3 : 0) : c == 3 ? (open == 2 ? 3e3 : open ? 300 : 0) : c == 2 ? (open == 2 ? 200 : open ? 30 : 0) : (open == 2 ? 10 : 1);
    }
    return tot;
  },
  bot(rd, i, lvl) {
    const g = rd.s.g; if (g.every(v => v < 0)) return { x: 6, y: 6 };
    const cand = [];
    for (let y = 0; y < GN; y++) for (let x = 0; x < GN; x++) {
      if (g[y * GN + x] >= 0) continue; let near = false;
      for (let b = -2; b <= 2 && !near; b++) for (let a = -2; a <= 2; a++) { const xx = x + a, yy = y + b; if (xx >= 0 && xx < GN && yy >= 0 && yy < GN && g[yy * GN + xx] >= 0) { near = true; break; } }
      if (!near) continue;
      const at = GM.val(g, x, y, i), df = GM.val(g, x, y, 1 - i);
      let sc = at >= 1e6 ? 1e9 : at + df * [0.6, 0.9, 1.05][lvl];
      sc *= 1 + (Math.random() - 0.5) * [1.4, 0.3, 0.04][lvl]; cand.push({ x, y, sc });
    }
    cand.sort((a, b) => b.sc - a.sc); return cand[0] ? { x: cand[0].x, y: cand[0].y } : { x: 6, y: 6 };
  }
};

// ---------- Dots and Boxes (5x5 boxes) ----------
const DB = {
  init: () => ({ h: Array(30).fill(-1), v: Array(30).fill(-1), b: Array(25).fill(-1), last: null }),
  sides: (s, r, c) => (s.h[r * 5 + c] >= 0) + (s.h[(r + 1) * 5 + c] >= 0) + (s.v[r * 6 + c] >= 0) + (s.v[r * 6 + c + 1] >= 0),
  adj(k, r, c) { const o = []; if (k == 'h') { if (r > 0) o.push([r - 1, c]); if (r < 5) o.push([r, c]); } else { if (c > 0) o.push([r, c - 1]); if (c < 5) o.push([r, c]); } return o; },
  lines(s) { const L = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) if (s.h[r * 5 + c] < 0) L.push({ k: 'h', r, c }); for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) if (s.v[r * 6 + c] < 0) L.push({ k: 'v', r, c }); return L; },
  move(rd, i, d) {
    const s = rd.s, k = d.k, r = +d.r, c = +d.c;
    if (k == 'h' ? !(r >= 0 && r <= 5 && c >= 0 && c <= 4) : k == 'v' ? !(r >= 0 && r <= 4 && c >= 0 && c <= 5) : true) return;
    const arr = k == 'h' ? s.h : s.v, idx = k == 'h' ? r * 5 + c : r * 6 + c; if (arr[idx] >= 0) return;
    arr[idx] = i; s.last = [k, r, c]; let got = 0;
    for (const [br, bc] of DB.adj(k, r, c)) if (s.b[br * 5 + bc] < 0 && DB.sides(s, br, bc) == 4) { s.b[br * 5 + bc] = i; got++; }
    const n0 = s.b.filter(v => v == 0).length, n1 = s.b.filter(v => v == 1).length;
    if (n0 + n1 == 25) return { win: n0 > n1 ? 0 : 1, turn: i };
    return { turn: got ? i : 1 - i };
  },
  view: rd => ({ h: rd.s.h, v: rd.s.v, b: rd.s.b, last: rd.s.last }),
  bot(rd, i, lvl) {
    const s = rd.s, L = DB.lines(s);
    const info = l => { let take = 0, give = 0; for (const [br, bc] of DB.adj(l.k, l.r, l.c)) { const n = DB.sides(s, br, bc); if (n == 3) take++; else if (n == 2) give++; } return { take, give }; };
    if (Math.random() < [0.45, 0.08, 0][lvl]) return pick(L);
    const T = L.filter(l => info(l).take > 0); if (T.length && (lvl > 0 || Math.random() < 0.7)) return pick(T);
    const S = L.filter(l => info(l).give == 0); if (S.length) return pick(S);
    let m = 9, ch = []; for (const l of L) { const g = info(l).give; if (g < m) { m = g; ch = [l]; } else if (g == m) ch.push(l); } return pick(ch);
  }
};

// ---------- Ultimate Tic Tac Toe ----------
const UL = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const UT = {
  init: () => ({ c: Array(81).fill(-1), w: Array(9).fill(-1), nx: -1, last: -1 }),
  sw(c, b) { for (const l of UL) { const p = c[b * 9 + l[0]]; if (p >= 0 && p == c[b * 9 + l[1]] && p == c[b * 9 + l[2]]) return p; } return c.slice(b * 9, b * 9 + 9).every(v => v >= 0) ? 2 : -1; },
  bw(w) { for (const l of UL) { const p = w[l[0]]; if (p >= 0 && p < 2 && p == w[l[1]] && p == w[l[2]]) return p; } return -1; },
  legal(s) { const m = []; for (let b = 0; b < 9; b++) { if (s.w[b] >= 0) continue; if (s.nx >= 0 && s.nx != b) continue; for (let c = 0; c < 9; c++) if (s.c[b * 9 + c] < 0) m.push([b, c]); } return m; },
  apply(s, b, c, p) { const u = { nx: s.nx, wb: s.w[b] }; s.c[b * 9 + c] = p; s.w[b] = UT.sw(s.c, b); s.nx = s.w[c] >= 0 ? -1 : c; return u; },
  undo(s, b, c, u) { s.c[b * 9 + c] = -1; s.w[b] = u.wb; s.nx = u.nx; },
  move(rd, i, d) {
    const s = rd.s, b = +d.b, c = +d.c; if (!(b >= 0 && b < 9 && c >= 0 && c < 9)) return;
    if (!UT.legal(s).some(m => m[0] == b && m[1] == c)) return;
    UT.apply(s, b, c, i); s.last = b * 9 + c; const w = UT.bw(s.w);
    if (w >= 0) return { win: w, turn: i };
    if (s.w.every(v => v >= 0)) { const a = s.w.filter(v => v == 0).length, z = s.w.filter(v => v == 1).length; return a == z ? { draw: 1, turn: i } : { win: a > z ? 0 : 1, turn: i }; }
    return { turn: 1 - i };
  },
  view: rd => ({ c: rd.s.c, w: rd.s.w, nx: rd.s.nx, last: rd.s.last }),
  ev(s, p) {
    let sc = 0;
    for (let b = 0; b < 9; b++) { if (s.w[b] == p) sc += b == 4 ? 18 : 10; else if (s.w[b] == 1 - p) sc -= b == 4 ? 18 : 10; }
    for (const l of UL) { let a = 0, z = 0; for (const b of l) { if (s.w[b] == p) a++; else if (s.w[b] == 1 - p) z++; } if (z == 0) sc += a * a * 6; if (a == 0) sc -= z * z * 6; }
    for (let b = 0; b < 9; b++) if (s.w[b] < 0) {
      for (const l of UL) { let a = 0, z = 0; for (const k of l) { const v = s.c[b * 9 + k]; if (v == p) a++; else if (v == 1 - p) z++; } if (z == 0 && a == 2) sc += 2; if (a == 0 && z == 2) sc -= 2; }
      if (s.c[b * 9 + 4] == p) sc += 1; else if (s.c[b * 9 + 4] == 1 - p) sc -= 1;
    }
    return sc;
  },
  nm(s, p, d, a, b) {
    const w = UT.bw(s.w); if (w >= 0) return (w == p ? 1 : -1) * (1e4 + d);
    const L = UT.legal(s); if (!L.length || d == 0) return UT.ev(s, p);
    let best = -1e9;
    for (const [bb, cc] of L) { const u = UT.apply(s, bb, cc, p); const sc = -UT.nm(s, 1 - p, d - 1, -b, -a); UT.undo(s, bb, cc, u); if (sc > best) best = sc; if (best > a) a = best; if (a >= b) break; }
    return best;
  },
  bot(rd, i, lvl) {
    const s = JSON.parse(JSON.stringify(rd.s)), L = UT.legal(s);
    if (Math.random() < [0.4, 0.1, 0][lvl]) { const m = pick(L); return { b: m[0], c: m[1] }; }
    const depth = [1, 3, 5][lvl]; let best = -1e9, bm = L[0];
    for (const m of shuf(L.slice())) {
      const u = UT.apply(s, m[0], m[1], i); const sc = UT.bw(s.w) == i ? 1e6 : -UT.nm(s, 1 - i, depth - 1, -1e9, 1e9); UT.undo(s, m[0], m[1], u);
      if (sc > best) { best = sc; bm = m; }
    }
    return { b: bm[0], c: bm[1] };
  }
};

// ---------- Sea Battle (10x10, shoot again on hit) ----------
const SN = 10, SH = [5, 4, 3, 3, 2];
const SB = {
  rand() {
    const b = Array(100).fill(-1), ships = [];
    SH.forEach((len, id) => { for (;;) { const h = Math.random() < 0.5, x = rnd(h ? SN - len + 1 : SN), y = rnd(h ? SN : SN - len + 1), cells = []; for (let k = 0; k < len; k++) cells.push(h ? y * SN + x + k : (y + k) * SN + x); if (cells.every(c => b[c] < 0)) { cells.forEach(c => b[c] = id); ships.push(cells); break; } } });
    return { b, ships };
  },
  init: () => ({ ph: 'place', p: [SB.rand(), SB.rand()], rdy: [0, 0], sh: [Array(100).fill(0), Array(100).fill(0)], sunk: [[], []] }),
  free: rd => rd.s.ph == 'place',
  move(rd, i, d) {
    const s = rd.s;
    if (s.ph == 'place') {
      if (s.rdy[i]) return;
      if (d.rand) { s.p[i] = SB.rand(); return { stay: 1 }; }
      if (d.ready) { s.rdy[i] = 1; if (s.rdy[0] && s.rdy[1]) { s.ph = 'fire'; return { turn: 0 }; } return { stay: 1 }; }
      return;
    }
    const x = +d.x, y = +d.y; if (!(x >= 0 && x < SN && y >= 0 && y < SN)) return;
    const idx = y * SN + x, o = 1 - i; if (s.sh[i][idx]) return;
    const id = s.p[o].b[idx];
    if (id < 0) { s.sh[i][idx] = 1; return { turn: o }; }
    s.sh[i][idx] = 2; const cells = s.p[o].ships[id];
    if (cells.every(c => s.sh[i][c] == 2)) s.sunk[i].push(cells);
    if (s.sunk[i].length == SH.length) return { win: i, turn: i };
    return { turn: i };
  },
  view(rd, k) { const s = rd.s, o = 1 - k; return { ph: s.ph, rdy: s.rdy, mine: s.p[k].b, eshot: s.sh[o], myshot: s.sh[k], sunk: s.sunk[k], esunk: s.sunk[o].length }; },
  bot(rd, i, lvl) {
    const s = rd.s; if (s.ph == 'place') return s.rdy[i] ? null : { ready: 1 };
    const sh = s.sh[i], sunkCells = new Set(s.sunk[i].flat()), live = [];
    for (let c = 0; c < 100; c++) if (sh[c] == 2 && !sunkCells.has(c)) live.push(c);
    const free = c => !sh[c], nb = c => { const x = c % SN, y = (c - x) / SN, o = []; if (x > 0) o.push(c - 1); if (x < SN - 1) o.push(c + 1); if (y > 0) o.push(c - SN); if (y < SN - 1) o.push(c + SN); return o; };
    const all = []; for (let c = 0; c < 100; c++) if (!sh[c]) all.push(c);
    const mk = c => ({ x: c % SN, y: (c - c % SN) / SN });
    if (lvl == 0) { if (live.length && Math.random() < 0.5) { const t = live.flatMap(nb).filter(free); if (t.length) return mk(pick(t)); } return mk(pick(all)); }
    if (lvl == 1) { if (live.length) { const t = live.flatMap(nb).filter(free); if (t.length) return mk(pick(t)); } const par = all.filter(c => ((c % SN) + Math.floor(c / SN)) % 2 == 0); return mk(pick(par.length ? par : all)); }
    const rem = SH.slice(); s.sunk[i].forEach(cs => { const k = rem.indexOf(cs.length); if (k >= 0) rem.splice(k, 1); });
    const dens = Array(100).fill(0), liveSet = new Set(live);
    for (const len of rem) for (let y = 0; y < SN; y++) for (let x = 0; x < SN; x++) for (const h of [true, false]) {
      if (h ? x + len > SN : y + len > SN) continue; const cs = []; let ok = true, cov = 0;
      for (let k = 0; k < len; k++) { const c = h ? y * SN + x + k : (y + k) * SN + x; if (sh[c] == 1 || sunkCells.has(c)) { ok = false; break; } if (liveSet.has(c)) cov++; cs.push(c); }
      if (!ok) continue; const w = 1 + cov * 40; for (const c of cs) if (!sh[c]) dens[c] += w;
    }
    let bs = -1, bc = []; for (const c of all) { if (dens[c] > bs) { bs = dens[c]; bc = [c]; } else if (dens[c] == bs) bc.push(c); }
    return mk(pick(bc));
  }
};

module.exports = { c4: C4, gomoku: GM, dots: DB, uttt: UT, sea: SB };
