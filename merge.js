// ---- Blob Brawl (server side) ----
// Merge battle. Every player has their own jar. The server runs the physics for BOTH jars (so Rex's jar is simulated too)
// and the phones only send "aim here" / "drop" / "shake". Same blob sequence for both players, so it is a fair fight.
module.exports = function (C) {
  const { award, after, bc } = C;
  const W = 240, H = 312, LINE = 58, SPAWN = 26, STEP = 1 / 60, GRAV = 1100, TMAX = 8, STONE = 13, ROUND = 120000;
  const RR = []; for (let t = 0; t <= TMAX; t++) RR.push(9 + t * 2.9);
  const ATK = [0, 0, 0, 0, 1, 1, 2, 3, 4];             // junk sent when a merge creates this tier
  const rnd = (a, b) => a + Math.random() * (b - a), gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  // same pseudo-random sequence for both jars
  const sq = (seed, i) => { let h = (seed ^ Math.imul(i + 1, 0x9E3779B1)) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x85EBCA6B) >>> 0; h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35) >>> 0; h ^= h >>> 16; const u = (h >>> 0) / 4294967296; return u < .34 ? 0 : u < .64 ? 1 : u < .86 ? 2 : 3; };
  const mkBox = seed => ({ it: [], nid: 1, si: 0, ax: W / 2, sc: 0, inc: 0, dz: 0, lock: 0, sk: 0, nd: 0, q: [], cmb: -9e9, ch: 0, nodz: 0, seed, lose: 0, best: 0 });
  const isB = (r, id) => r.p.some(y => y.pid == id && y.bot);
  const botLv = r => { const b = r.p.find(y => y.bot); return b ? (b.lvl ?? 1) : 1; };

  // ---------- physics (one jar) ----------
  function phys(b, h) {
    const its = b.it, n = its.length, damp = 1 - 0.5 * h;
    for (let i = 0; i < n; i++) { const o = its[i]; o.vy += GRAV * h; o.vx *= damp; o.vy *= damp; o.x += o.vx * h; o.y += o.vy * h; }
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < n; i++) {
        const a = its[i];
        for (let j = i + 1; j < n; j++) {
          const c = its[j], m = a.r + c.r; let dx = a.x - c.x; if (dx > m || dx < -m) continue; let dy = a.y - c.y; if (dy > m || dy < -m) continue;
          const d2 = dx * dx + dy * dy; if (d2 >= m * m) continue;
          let d = Math.sqrt(d2); if (d < 1e-6) { dx = 0; dy = -1; d = 1e-6; } else { dx /= d; dy /= d; }
          const ma = a.r * a.r, mc = c.r * c.r, s = ma + mc, cor = Math.max(m - d - 0.02, 0) * 0.85;
          a.x += dx * cor * mc / s; a.y += dy * cor * mc / s; c.x -= dx * cor * ma / s; c.y -= dy * cor * ma / s;
          const rx = a.vx - c.vx, ry = a.vy - c.vy, vn = rx * dx + ry * dy;
          if (vn < 0) {
            const iw = 1 / ma + 1 / mc, e = vn < -70 ? 0.1 : 0, jn = -(1 + e) * vn / iw;
            a.vx += jn * dx / ma; a.vy += jn * dy / ma; c.vx -= jn * dx / mc; c.vy -= jn * dy / mc;
            const tx = -dy, ty = dx, vt = rx * tx + ry * ty, mx = 0.3 * jn; let jt = -vt / iw; jt = jt < -mx ? -mx : jt > mx ? mx : jt;
            a.vx += jt * tx / ma; a.vy += jt * ty / ma; c.vx -= jt * tx / mc; c.vy -= jt * ty / mc;
          }
        }
        if (a.x < a.r) { a.x = a.r; if (a.vx < 0) a.vx = 0; } else if (a.x > W - a.r) { a.x = W - a.r; if (a.vx > 0) a.vx = 0; }
        if (a.y > H - a.r) { a.y = H - a.r; if (a.vy > 90) a.vy = -a.vy * 0.1; else if (a.vy > 0) a.vy = 0; a.vx *= 0.99; }
      }
    }
  }

  function send(rd, i, atk) {                         // attacks are switched off: each player has their own jar and the race is on score
    return;
    const b = rd.bx[i], o = rd.bx[1 - i]; if (atk <= 0) return;
    const c = Math.min(b.inc, atk); b.inc -= c; atk -= c;
    const stones = o.it.reduce((n, q) => n + (q.j ? 1 : 0), 0) + o.q.length; atk = Math.min(atk, Math.max(0, 8 - stones - o.inc));
    if (atk > 0) { o.inc = Math.min(12, o.inc + atk); rd.ev.push(['j', i, atk]); }
  }

  function merges(rd, i) {
    const b = rd.bx[i], its = b.it, st = rd.st; let dead = null;
    for (let x = 0; x < its.length; x++) {
      const a = its[x]; if (a.j || a.gone) continue;
      for (let y = x + 1; y < its.length; y++) {
        const c = its[y]; if (c.j || c.gone || c.t !== a.t) continue;
        const dx = a.x - c.x, dy = a.y - c.y, m = a.r + c.r + 0.6; if (dx * dx + dy * dy > m * m) continue;
        a.gone = c.gone = 1; dead = 1;
        b.ch = st - b.cmb < 900 ? b.ch + 1 : 1; b.cmb = st; const ch = b.ch;
        const ma = a.r * a.r, mc = c.r * c.r, T = a.t + 1, mx = (a.x * ma + c.x * mc) / (ma + mc), my = (a.y * ma + c.y * mc) / (ma + mc);
        if (T > TMAX) { b.sc += 500 * ch; rd.ev.push(['m', i, +mx.toFixed(1), +my.toFixed(1), 9, ch]); send(rd, i, 8); break; }
        const o = { id: b.nid++, x: mx, y: my, vx: (a.vx + c.vx) / 2, vy: (a.vy + c.vy) / 2 - 25, t: T, r: RR[T], j: 0, age: 0.8 };
        its.push(o); b.sc += T * T * 5 * ch; if (T > b.best) b.best = T;
        rd.ev.push(['m', i, +mx.toFixed(1), +my.toFixed(1), T, ch]);
        send(rd, i, ATK[T] + (ch >= 2 ? ch - 1 : 0));
        for (const s of its) if (s.j && !s.gone) {   // a merge next to a stone cracks it
          const sx = s.x - mx, sy = s.y - my, m2 = o.r + STONE + 7; if (sx * sx + sy * sy < m2 * m2) {
            s.hp--; if (s.hp <= 0) { s.gone = 1; rd.ev.push(['x', i, +s.x.toFixed(1), +s.y.toFixed(1)]); } else rd.ev.push(['c', i, +s.x.toFixed(1), +s.y.toFixed(1)]);
          }
        }
        break;
      }
    }
    if (dead) b.it = its.filter(o => !o.gone);
  }

  function drop(rd, i, x) {
    const b = rd.bx[i], st = rd.st; if (b.lose || st < b.nd || st < b.lock) return false;
    const t = sq(b.seed, b.si), r = RR[t]; x = clamp(+x || b.ax, r, W - r);
    b.it.push({ id: b.nid++, x, y: SPAWN, vx: 0, vy: 0, t, r, j: 0, age: 0 }); b.si++; b.ax = x; b.nd = st + 380;
    if (b.inc > 0) { const n = Math.min(b.inc, 5); b.inc -= n; for (let k = 0; k < n; k++) b.q.push(st + 400 + k * 280); }
    rd.ev.push(['d', i, x]); return true;
  }
  function shake(rd, i) {
    const b = rd.bx[i], st = rd.st; if (b.lose || st < b.sk || st < b.lock) return false;
    b.sk = st + 7000; b.lock = st + 1000; b.nodz = st + 1700;
    for (const o of b.it) { o.vx += rnd(-1, 1) * 150; o.vy -= rnd(70, 150); }
    rd.ev.push(['s', i]); return true;
  }

  // ---------- Rex ----------
  const AIMV = [95, 150, 240], THINK = [1500, 1000, 650], NOISE = [22, 9, 3], STP = [26, 16, 10];
  function pick(b, L, tier) {
    const r = RR[tier]; let best = W / 2, bs = -1e9; const cand = [];
    for (let x = r; x <= W - r + 0.01; x += STP[L]) cand.push(x);
    if (L == 0 && Math.random() < 0.3) return clamp(cand[Math.floor(Math.random() * cand.length)] + gauss() * NOISE[0], r, W - r);
    for (const x of cand) {
      let y = H - r, hit = null;
      for (const o of b.it) { const dx = Math.abs(x - o.x), m = r + o.r; if (dx < m) { const yc = o.y - Math.sqrt(m * m - dx * dx); if (yc < y) { y = yc; hit = o; } } }
      let s = y * 0.35 + (tier >= 4 ? Math.abs(x - W / 2) * 0.05 : 0);
      if (hit) { if (hit.j) s -= 4; else if (hit.t === tier) s += 45; else if (hit.t < tier) s -= 12; else if (hit.t === tier + 1) s += 4; }
      for (const o of b.it) if (!o.j && o.t === tier && o !== hit) { const dx = o.x - x, dy = o.y - y; if (dx * dx + dy * dy < (r + o.r + 8) * (r + o.r + 8)) s += 14; }
      s += gauss() * NOISE[L] * 0.4;
      if (s > bs) { bs = s; best = x; }
    }
    return clamp(best + gauss() * NOISE[L] * 0.35, r, W - r);
  }
  function botStep(rd, i, L) {
    const b = rd.bx[i], B = rd.bt[i], st = rd.st; if (b.lose) return;
    if (B.tgt == null) {
      if (st < b.lock || st < b.nd) return;
      if (L >= 1 && st >= b.sk) {
        let top = 1e9; for (const o of b.it) top = Math.min(top, o.y - o.r);
        if ((b.dz > 0.15 || top < LINE + 28) && (L == 2 || Math.random() < 0.02)) { shake(rd, i); return; }
      }
      B.tgt = pick(b, L, sq(b.seed, b.si)); B.at = st + THINK[L] * rnd(0.8, 1.25);
    } else {
      const d = B.tgt - b.ax, sp = AIMV[L] * STEP; b.ax = Math.abs(d) <= sp ? B.tgt : b.ax + Math.sign(d) * sp;
      if (st >= B.at && Math.abs(b.ax - B.tgt) < 1) { drop(rd, i, b.ax); B.tgt = null; }
    }
  }

  // ---------- one simulation step ----------
  function step(rd, L) {
    rd.st += STEP * 1000; const st = rd.st;
    rd.bx.forEach((b, i) => {
      if (b.lose) return;
      while (b.q.length && b.q[0] <= st) {
        b.q.shift(); const x = rnd(STONE + 6, W - STONE - 6);
        b.it.push({ id: b.nid++, x, y: STONE + 2, vx: rnd(-20, 20), vy: 60, t: 0, r: STONE, j: 1, hp: 2, age: 0 });
      }
      phys(b, STEP / 2); phys(b, STEP / 2);
      for (const o of b.it) { if (o.vx * o.vx + o.vy * o.vy < 144) { o.vx = 0; o.vy = 0; } }
      merges(rd, i);
      let over = false; for (const o of b.it) { o.age += STEP; if (o.age > 1.3 && o.y - o.r < LINE) over = true; }
      if (over && st >= b.nodz) b.dz += STEP; else b.dz = Math.max(0, b.dz - STEP * 2.5);
      if (b.dz >= 2.0) b.lose = 1;
      if (rd.bt[i]) botStep(rd, i, Array.isArray(L) ? L[i] : L);
    });
  }
  const r1 = v => Math.round(v * 10) / 10;
  function snap(rd, now) {
    return {
      t: 'mgu', k: rd.k, now, tm: Math.max(0, ROUND - rd.st), ev: rd.ev.splice(0),
      p: rd.bx.map(b => {
        const f = []; for (const o of b.it) f.push(o.id, r1(o.x), r1(o.y), o.j ? (o.hp > 1 ? 9 : 10) : o.t);
        return { s: b.sc, c: sq(b.seed, b.si), n: sq(b.seed, b.si + 1), a: r1(b.ax), i: b.inc, z: Math.round(b.dz * 100) / 100, l: Math.max(0, b.lock - rd.st) | 0, h: Math.max(0, b.sk - rd.st) | 0, b: f };
      })
    };
  }
  function finish(r, rd) {
    const [a, b] = rd.bx; let w = null;
    if (a.lose && !b.lose) w = rd.ids[1]; else if (b.lose && !a.lose) w = rd.ids[0];
    else if (a.lose && b.lose || rd.st >= ROUND) w = a.sc == b.sc ? null : rd.ids[a.sc > b.sc ? 0 : 1];
    else return;
    rd.open = 0; bc(r, { ...snap(rd, Date.now()), end: 1, lost: [a.lose, b.lose] }); award(r, rd, w, {});
  }
  function tick(r, rd, k, now) {
    if (r.round !== rd || rd.k !== k || !rd.open) return clearInterval(rd.iv);
    if (now >= rd.t0) {
      rd.acc += Math.min(now - rd.last, 100) / 1000; rd.last = now; const L = botLv(r);
      while (rd.acc >= STEP && rd.open) { rd.acc -= STEP; step(rd, L); finish(r, rd); }
      if (!rd.open) return;
    } else rd.last = rd.t0;
    if (++rd.n % 3 == 0 || rd.ev.length > 6) bc(r, snap(rd, now));
  }

  const blob = {
    to: 2,
    next(r, rd) {
      clearInterval(rd.iv); rd.k++; const k = rd.k; rd.ids = Object.keys(rd.pts); rd.open = 1; rd.t0 = Date.now() + 2400;
      const seed = (Math.random() * 4294967296) >>> 0; rd.bx = rd.ids.map(() => mkBox(seed));
      rd.bt = rd.ids.map(id => isB(r, id) ? { tgt: null, at: 0 } : null); rd.ev = []; rd.st = 0; rd.acc = 0; rd.last = rd.t0; rd.n = 0;
      bc(r, { t: 'mgs', k, ids: rd.ids, now: Date.now(), startAt: rd.t0, W, H, LN: LINE, SP: SPAWN, RR, SR: STONE, TM: ROUND });
      rd.iv = setInterval(() => tick(r, rd, k, Date.now()), 16);
      after(r, rd, 2400 + ROUND + 4000, () => { if (rd.open && rd.k === k) { rd.st = ROUND; finish(r, rd); } });
    },
    msg(r, rd, x, d) {
      if (!rd.open || d.k !== rd.k || Date.now() < rd.t0 || x.bot) return; const i = rd.ids ? rd.ids.indexOf(x.pid) : -1; if (i < 0) return;
      if (d.a == 'm') { const b = rd.bx[i]; if (!b.lose) b.ax = clamp(+d.x || b.ax, 8, W - 8); }
      else if (d.a == 'd') drop(rd, i, d.x);
      else if (d.a == 's') shake(rd, i);
    }
  };
  module.exports.sim = { phys, step, drop, shake, mkBox, snap, finish, W, H, LINE, RR, sq, tick };
  return { blob };
};
