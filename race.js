// ---- Race games (server side): Hurdle Sprint, Tower Stack, Sky Climb, Fruit Slice Rush ----
// The server is the referee for all four. Phones send only taps/swipes; positions and scores are decided here.
module.exports = function (C) {
  const { award, after, bc } = C;
  const rnd = (a, b) => a + Math.random() * (b - a), gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
  const isB = (r, id) => r.p.some(y => y.pid == id && y.bot);
  const botLv = r => { const b = r.p.find(y => y.bot); return b ? (b.lvl ?? 1) : 1; };
  const fin = (r, rd, id) => { if (!rd.open) return; rd.open = 0; award(r, rd, id, {}); };
  const live = (r, rd, k, f) => () => { if (rd.k === k && rd.open) f(); };   // guard stale timers from earlier rounds

  // ================= HURDLE SPRINT =================
  const HL = 1100, HH = [180, 340, 500, 660, 820, 980], STR = 13, AIR = 950;
  function hact(rd, i, a, now) {
    const p = rd.p[i]; if (now < p.stun) return;
    if (a == 'j') { if (now >= p.air) p.air = now + AIR; return; }
    if (a === p.last || now - p.lt < 65) return;
    p.last = a; p.lt = now; p.x += STR;
    while (p.hh < HH.length && p.x >= HH[p.hh]) {
      if (now > p.air) { p.stun = now + 550; p.x = Math.max(0, p.x - 20); rd.ev.push([i, 1]); }
      else rd.ev.push([i, 2]);
      p.hh++;
    }
  }
  function htick(r, rd, k) {
    if (r.round !== rd || rd.k !== k || !rd.open) return clearInterval(rd.iv);
    const now = Date.now(); if (now < rd.t0) return;
    const L = botLv(r), rate = [5, 7, 9.2][L], miss = [.22, .09, .02][L], sg = [24, 13, 5][L];
    rd.p.forEach((p, i) => {
      if (!p.bot) return;
      if (now >= p.nt) { p.nt = now + 1000 / rate * rnd(.8, 1.25); hact(rd, i, p.last == 0 ? 1 : 0, now); }
      if (p.hh < HH.length) {
        if (!p.jt[p.hh]) p.jt[p.hh] = { d: (AIR / 2000) * rate * STR + gauss() * sg, skip: Math.random() < miss };
        const j = p.jt[p.hh], dist = HH[p.hh] - p.x;
        if (!j.done && dist <= j.d) { j.done = 1; if (!j.skip) hact(rd, i, 'j', now); }
      }
    });
    bc(r, { t: 'rhu', k, p: rd.p.map(p => [Math.round(p.x), now < p.air ? 1 : 0, now < p.stun ? 1 : 0, p.hh]), ev: rd.ev.splice(0) });
    const w = rd.p.map((p, i) => [p.x, i]).filter(a => a[0] >= HL).sort((a, b) => b[0] - a[0])[0];
    if (w) fin(r, rd, rd.ids[w[1]]);
  }
  const hurdle = {
    to: 2,
    next(r, rd) {
      clearInterval(rd.iv); rd.k++; const k = rd.k; rd.ids = Object.keys(rd.pts); rd.open = 1; rd.t0 = Date.now() + 2400; rd.ev = [];
      rd.p = rd.ids.map(id => ({ x: 0, last: -1, lt: 0, stun: 0, air: 0, hh: 0, nt: 0, jt: [], bot: isB(r, id) }));
      bc(r, { t: 'rhs', k, ids: rd.ids, L: HL, H: HH, air: AIR, now: Date.now(), startAt: rd.t0 });
      rd.iv = setInterval(() => htick(r, rd, k), 50);
      after(r, rd, 2400 + 45000, live(r, rd, k, () => { const [a, b] = rd.p; fin(r, rd, a.x == b.x ? null : rd.ids[a.x > b.x ? 0 : 1]); }));
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k !== rd.k || Date.now() < rd.t0 || x.bot) return; const i = rd.ids ? rd.ids.indexOf(x.pid) : -1; if (i < 0) return;
      hact(rd, i, d.j ? 'j' : d.s === 0 ? 0 : d.s === 1 ? 1 : -9, Date.now());
    }
  };

  // ================= TOWER STACK =================
  const SW = 300, DUR = 30000;
  const stc = (e, k, w) => { const rg = SW - w, v = 140 + 9 * k, m = (e * v) % (2 * rg), pos = m < rg ? m : 2 * rg - m; return w / 2 + pos; };
  function tdrop(r, rd, i, e, now) {
    const p = rd.p[i]; if (p.fell) return;
    const c = stc(e, p.k, p.w), l = c - p.w / 2, ol = Math.max(l, p.l), orr = Math.min(l + p.w, p.l + p.w), ov = orr - ol;
    let nl = ol, nw = ov, perf = 0, fell = 0;
    if (ov < 4) { fell = 1; nl = l; nw = p.w; }
    else if (Math.abs(l - p.l) <= 4) { nl = p.l; nw = p.w; perf = 1; p.perf++; p.st++; if (p.st >= 3 && nw < 96) { const g = Math.min(8, 96 - nw); nw += g; nl = Math.max(0, Math.min(SW - nw, nl - g / 2)); } }
    if (!perf) p.st = 0;
    if (!fell) { p.l = nl; p.w = nw; p.k++; p.ts = now; } else p.fell = 1;
    bc(r, { t: 'twu', k: rd.k, i, h: p.k, l: nl, w: nw, perf, fell, pn: p.perf });
    if (rd.p.every(q => q.fell)) after(r, rd, 1300, live(r, rd, rd.k, () => tend(r, rd)));
    else if (p.bot && !fell) tbot(r, rd, i, rd.k);
  }
  function tbot(r, rd, i, k) {
    const p = rd.p[i], L = botLv(r), sg = [30, 13, 4][L], th = rnd(.5, 1.1) * [1.5, 1.1, .85][L], tg = p.l + p.w / 2 + gauss() * sg;
    let be = th, bd = 1e9; for (let e = th; e < th + 3; e += .01) { const d = Math.abs(stc(e, p.k, p.w) - tg); if (d < bd) { bd = d; be = e; } }
    const kk = p.k, at = Math.max(0, p.ts - Date.now()) + be * 1000;
    after(r, rd, at, live(r, rd, k, () => { if (!p.fell && p.k === kk) tdrop(r, rd, i, be, Date.now()); }));
  }
  function tend(r, rd) {
    if (!rd.open) return; const [a, b] = rd.p;
    fin(r, rd, a.k != b.k ? rd.ids[a.k > b.k ? 0 : 1] : a.perf != b.perf ? rd.ids[a.perf > b.perf ? 0 : 1] : null);
  }
  const stack = {
    to: 1,
    next(r, rd) {
      rd.k++; const k = rd.k; rd.ids = Object.keys(rd.pts); rd.open = 1; rd.t0 = Date.now() + 2400;
      rd.p = rd.ids.map(id => ({ k: 0, l: 102, w: 96, fell: 0, perf: 0, st: 0, ts: rd.t0, bot: isB(r, id) }));
      bc(r, { t: 'tws', k, ids: rd.ids, now: Date.now(), startAt: rd.t0, dur: DUR, l: 102, w: 96 });
      rd.p.forEach((p, i) => { if (p.bot) tbot(r, rd, i, k); });
      after(r, rd, 2400 + DUR, live(r, rd, k, () => tend(r, rd)));
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k !== rd.k || x.bot) return; const i = rd.ids ? rd.ids.indexOf(x.pid) : -1, now = Date.now(); if (i < 0 || now < rd.t0 || now > rd.t0 + DUR + 400) return;
      const p = rd.p[i], el = (now - p.ts) / 1000; let e = Number(d.e); if (!isFinite(e)) return;
      e = Math.max(Math.max(0, Math.min(e, el)), el - 1.2); tdrop(r, rd, i, e, now);
    }
  };

  // ================= SKY CLIMB =================
  const SN = 42;
  const sideAt = row => row & 1 ? 0 : 1;
  function smove(r, rd, i, s, now) {
    const p = rd.p[i]; if (now < rd.t0 || now < p.stun || now - p.lt < 50) return false; p.lt = now;
    const t = rd.rows[p.r + 1];
    if (t & (1 << s)) { p.r++; p.side = s; } else { p.r = Math.max(0, p.r - 2); p.side = p.r ? sideAt(rd.rows[p.r]) : s; p.stun = now + 350; rd.ev.push([i, 1]); }
    sbc(r, rd); if (p.r >= SN) fin(r, rd, rd.ids[i]); return true;
  }
  const sbc = (r, rd) => { const now = Date.now(); bc(r, { t: 'sku', k: rd.k, p: rd.p.map(p => [p.r, p.side, now < p.stun ? 1 : 0]), ev: rd.ev.splice(0) }); };
  function stick(r, rd, k) {
    if (r.round !== rd || rd.k !== k || !rd.open) return clearInterval(rd.iv);
    const now = Date.now(); if (now < rd.t0) return; const L = botLv(r);
    rd.p.forEach((p, i) => {
      if (!p.bot || now < p.nt || now < p.stun) return; p.nt = now + [360, 250, 170][L] * rnd(.8, 1.3);
      const t = rd.rows[p.r + 1]; let s = t == 1 ? 0 : t == 2 ? 1 : (Math.random() < .5 ? 0 : 1);
      if (t != 3 && Math.random() < [.14, .06, .02][L]) s ^= 1;
      smove(r, rd, i, s, now);
    });
  }
  const sky = {
    to: 2,
    next(r, rd) {
      clearInterval(rd.iv); rd.k++; const k = rd.k; rd.ids = Object.keys(rd.pts); rd.open = 1; rd.t0 = Date.now() + 2400; rd.ev = [];
      rd.rows = [3]; for (let i = 1; i <= SN; i++) { const q = Math.random(); rd.rows.push(q < .4 ? 1 : q < .8 ? 2 : 3); }
      rd.p = rd.ids.map(id => ({ r: 0, side: 0, stun: 0, lt: 0, nt: 0, bot: isB(r, id) }));
      bc(r, { t: 'sks', k, ids: rd.ids, rows: rd.rows, N: SN, now: Date.now(), startAt: rd.t0 });
      rd.iv = setInterval(() => stick(r, rd, k), 40);
      after(r, rd, 2400 + 60000, live(r, rd, k, () => { const [a, b] = rd.p; fin(r, rd, a.r == b.r ? null : rd.ids[a.r > b.r ? 0 : 1]); }));
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k !== rd.k || x.bot) return; const i = rd.ids ? rd.ids.indexOf(x.pid) : -1; if (i < 0 || (d.s !== 0 && d.s !== 1)) return;
      smove(r, rd, i, d.s, Date.now());
    }
  };

  // ================= FRUIT SLICE RUSH =================
  const FT = 390, FG = 720, FR = 30;
  const fpos = (it, ms) => { const s = (ms - it[0]) / 1000; return [it[1] + it[2] * s, FT + it[3] * s + FG / 2 * s * s]; };
  const fflight = it => -2 * it[3] / FG * 1000;
  function fsend(r, rd) { bc(r, { t: 'fru', k: rd.k, s: rd.p.map(p => p.s) }); }
  const fruit = {
    to: 1,
    next(r, rd) {
      rd.k++; const k = rd.k; rd.ids = Object.keys(rd.pts); rd.open = 1; rd.t0 = Date.now() + 2400;
      const it = []; let t = 900;
      while (t < 28500) {
        const mk = off => { const x0 = rnd(50, 290); return [Math.round(t + off), Math.round(x0), Math.round((170 - x0) * rnd(.1, .45)), -Math.round(rnd(560, 680)), Math.random() < .16 ? 1 : 0]; };
        it.push(mk(0)); if (Math.random() < .22) it.push(mk(90));
        t += rnd(380, 700);
      }
      rd.it = it; rd.p = rd.ids.map(id => ({ s: 0, got: new Set(), cw: [], ec: 0, ew: 0, bot: isB(r, id) }));
      bc(r, { t: 'frs', k, ids: rd.ids, it, now: Date.now(), startAt: rd.t0, dur: 30000 });
      const L = botLv(r), fp = [.5, .72, .9][L], bp = [.2, .08, .02][L];
      rd.p.forEach((p, i) => { if (!p.bot) return; it.forEach((m, id) => {
        const hit = m[4] ? Math.random() < bp : Math.random() < fp; if (!hit) return;
        after(r, rd, Math.max(0, rd.t0 - Date.now()) + m[0] + rnd(.35, 1) * fflight(m), live(r, rd, k, () => { p.s = Math.max(0, p.s + (m[4] ? -3 : 1)); rd.dirty = 1; }));
      }); });
      rd.iv = setInterval(() => { if (r.round !== rd || rd.k !== k || !rd.open) return clearInterval(rd.iv); if (rd.dirty) { rd.dirty = 0; fsend(r, rd); } }, 200);
      after(r, rd, 2400 + 30800, live(r, rd, k, () => { const [a, b] = rd.p; fsend(r, rd); fin(r, rd, a.s == b.s ? null : rd.ids[a.s > b.s ? 0 : 1]); }));
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k !== rd.k || x.bot || !Array.isArray(d.sl)) return; const i = rd.ids ? rd.ids.indexOf(x.pid) : -1, now = Date.now(); if (i < 0 || now < rd.t0) return;
      const p = rd.p[i]; if (now - p.ew > 1000) { p.ew = now; p.ec = 0; }
      for (const q of d.sl.slice(0, 8)) {
        if (++p.ec > 16) break; const id = q[0] | 0, m = rd.it[id], px = +q[1], py = +q[2], tm = +q[3]; if (!m || p.got.has(id) || !isFinite(px + py + tm)) continue;
        const sv = now - rd.t0; if (Math.abs(tm - sv) > 700 || tm < m[0] || tm > m[0] + fflight(m) + 100) continue;
        const [fx, fy] = fpos(m, tm); if (Math.hypot(fx - px, fy - py) > FR + 28) continue;
        p.got.add(id);
        if (m[4]) { p.s = Math.max(0, p.s - 3); p.cw = []; }
        else { p.s++; p.cw = p.cw.filter(z => now - z < 420); p.cw.push(now); if (p.cw.length >= 3) { p.s += 2; p.cw = []; } }
        rd.dirty = 1;
      }
    }
  };

  return { hurdle, stack, sky, fruit };
};
