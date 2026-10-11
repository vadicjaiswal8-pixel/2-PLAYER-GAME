// ---- Race games (client): Hurdle Sprint, Tower Stack, Sky Climb, Fruit Slice Rush ----
// Phones only send taps / swipes. The server decides positions, heights and scores.
const RC = (function () {
  const FONT = '400 14px Lilita One,sans-serif', ME = '#e5392f';
  const sn = () => Date.now() + (X.r ? X.r.so : 0);               // server time
  const cvH = (h, extra) => '<canvas id="cv" width="680" height="' + h * 2 + '" style="width:100%;max-width:340px;touch-action:none;border:4px solid #1a1a1a;border-radius:16px;background:#fff6e0;box-shadow:4px 4px 0 #1a1a1a;display:block;margin:0 auto"></canvas>' + (extra || '');
  const btn = (id, txt, st) => '<button class="b cta" id="' + id + '" style="' + (st || '') + '">' + txt + '</button>';
  const bind = (id, f) => { const e = $('#' + id); if (e) e.onpointerdown = ev => { ev.preventDefault(); f(ev) } };
  const sprite = (x, im, cx, cy, w, tilt, flip) => {
    if (!im.complete || !im.width) { x.beginPath(); x.arc(cx, cy, w / 2, 0, 7); x.fillStyle = '#ccc'; x.fill(); return }
    const h = w * im.height / im.width; x.save(); x.translate(cx, cy); if (tilt) x.rotate(tilt); if (flip) x.scale(-1, 1); x.drawImage(im, -w / 2, -h / 2, w, h); x.restore();
  };
  const cap = (x, t, cx, cy, col, sz) => { x.font = '400 ' + (sz || 14) + 'px Lilita One,sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.lineJoin = 'round'; x.strokeText(t, cx, cy); x.fillStyle = col || '#fff6e0'; x.fillText(t, cx, cy) };
  const names = () => [nm || 'You', on.opp || 'Friend'];
  function begin(d, g, H) {
    const c = $('#cd'); if (c) c.textContent = ''; cancelAnimationFrame(X.raf);
    X.r = { g, k: d.k, ids: d.ids, me: d.ids.indexOf(pid), so: d.now - Date.now(), t0: d.startAt, over: 0, fl: [], d, H };
    closed = 0; return X.r;
  }
  function countdown(x, r, W, H) {
    const w = r.t0 - sn(); if (w <= 0) return; const n = Math.ceil(w / 800);
    x.fillStyle = '#1a1a1acc'; x.fillRect(0, 0, W, H); cap(x, n > 2 ? 'READY' : n > 1 ? 'SET' : 'GO!', W / 2, H / 2 + 14, '#ffc93c', 54);
  }
  function run(draw) {
    const loop = () => { const r = X.r, cv = $('#cv'); if (!r || !cv || view != 'play' || cur != r.g || closed) return; const x = cv.getContext('2d'); x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, 340, r.H); draw(x, r, Date.now()); countdown(x, r, 340, r.H); X.raf = requestAnimationFrame(loop) };
    loop();
  }
  const lerp = (a, b, f) => a + (b - a) * f;

  // ================= HURDLE SPRINT =================
  const SC = 2.3, GX = 78;
  function hInit(d) {
    const r = begin(d, 'hurdle', 262); r.L = d.L; r.HH = d.H; r.last = -1; r.p = [0, 1].map(() => ({ x: 0, dx: 0, air: 0, stun: 0, hh: 0, as: 0, kn: new Set() }));
    $('#gm').innerHTML = cvH(262) + '<div style="display:flex;gap:8px;margin:10px auto 0;max-width:340px"><button class="b cta" id="hl" style="flex:1;height:76px;margin:0;font-size:26px">◀</button>' + btn('hj', 'JUMP', 'flex:1.2;height:76px;margin:0;background:#2563c9;color:#fff6e0') + '<button class="b cta" id="hr" style="flex:1;height:76px;margin:0;font-size:26px">▶</button></div><small style="display:block;text-align:center;font-weight:900;margin-top:6px">Tap ◀ ▶ one after the other to run. JUMP just before a hurdle.</small>';
    bind('hl', () => hTap(0)); bind('hr', () => hTap(1)); bind('hj', hJump); run(hDraw);
  }
  function hTap(s) { const r = X.r; if (!r || r.g != 'hurdle' || r.over || sn() < r.t0 || s === r.last) return; r.last = s; send({ t: 'in', k: r.k, s }); snd('tap'); r.pulse = [s, Date.now()] }
  function hJump() { const r = X.r; if (!r || r.g != 'hurdle' || r.over || sn() < r.t0) return; send({ t: 'in', k: r.k, j: 1 }); const m = r.p[r.me]; if (Date.now() > m.as + 650) { m.as = Date.now(); snd('whoosh') } }
  function hUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return;
    d.p.forEach((a, i) => { const p = r.p[i]; p.x = a[0]; p.stun = a[2]; if (i != r.me) { if (a[1] && !p.air) p.as = Date.now(); } p.air = a[1]; p.hh = a[3]; });
    (d.ev || []).forEach(([i]) => { const p = r.p[i]; p.kn.add(p.hh - 1); p.sa = Date.now(); if (i == r.me) { snd('bad'); vib([40, 30, 40]); shake() } });
  }
  function hDraw(x, r, now) {
    const [n0, n1] = names();
    x.fillStyle = '#1a1a1a'; x.fillRect(18, 11, 304, 6);
    for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#1a1a1a' : '#fff'; x.fillRect(316, 4 + k * 2.5, 6, 2.5) }
    [1, 0].forEach(w => { const i = w ? r.me : 1 - r.me, p = r.p[i]; x.beginPath(); x.arc(20 + 296 * Math.min(1, p.dx / r.L), 14, w ? 9 : 7, 0, 7); x.fillStyle = w ? ME : OC(); x.fill(); x.lineWidth = 3; x.strokeStyle = '#1a1a1a'; x.stroke() });
    r.p.forEach(p => { p.dx = lerp(p.dx, p.x, .45) });
    const lane = (top, i, mine) => {
      const p = r.p[i], H = 112, cx = p.dx; x.save(); x.beginPath(); x.rect(0, top, 340, H); x.clip();
      x.fillStyle = mine ? '#fffaf0' : '#f1e6c8'; x.fillRect(0, top, 340, H);
      x.fillStyle = '#d9c9a0'; x.fillRect(0, top + 86, 340, 26);
      x.fillStyle = '#1a1a1a'; x.fillRect(0, top + 84, 340, 4);
      for (let k = -1; k < 20; k++) { const sx = k * 36 - ((cx * SC) % 36); x.fillStyle = '#c4b283'; x.fillRect(sx, top + 98, 18, 3) }
      const fx = GX + (r.L - cx) * SC; if (fx < 360) { for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#1a1a1a' : '#fff'; x.fillRect(fx, top + 4 + k * 10, 8, 10); x.fillStyle = k % 2 ? '#fff' : '#1a1a1a'; x.fillRect(fx + 8, top + 4 + k * 10, 8, 10) } }
      r.HH.forEach((hx, j) => {
        const sx = GX + (hx - cx) * SC; if (sx < -30 || sx > 370) return; const kn = p.kn.has(j);
        x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.lineCap = 'round';
        if (!kn) { x.beginPath(); x.moveTo(sx - 9, top + 86); x.lineTo(sx - 9, top + 58); x.moveTo(sx + 9, top + 86); x.lineTo(sx + 9, top + 58); x.stroke(); x.fillStyle = '#e5392f'; x.fillRect(sx - 14, top + 54, 28, 9); x.strokeRect(sx - 14, top + 54, 28, 9); x.fillStyle = '#fff'; x.fillRect(sx - 4, top + 54, 8, 9) }
        else { x.beginPath(); x.moveTo(sx - 18, top + 84); x.lineTo(sx + 18, top + 84); x.stroke(); x.fillStyle = '#e5392f'; x.fillRect(sx - 16, top + 78, 32, 7) }
      });
      const t = (now - p.as) / 650, air = t >= 0 && t < 1, jy = air ? Math.sin(t * Math.PI) * 50 : 0, stn = p.stun || (p.sa && now - p.sa < 700);
      const w = 44, bob = air || stn ? 0 : Math.abs(Math.sin(cx * .45)) * 4;
      x.fillStyle = '#0002'; x.beginPath(); x.ellipse(GX, top + 88, 16 - jy / 6, 4, 0, 0, 7); x.fill();
      sprite(x, fspr(!mine), GX, top + 62 - jy - bob, w, stn ? Math.sin(now / 50) * .25 : (air ? -.2 : 0));
      if (stn) cap(x, '✦ ✦', GX, top + 28, '#ffc93c', 16);
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(0, top, 340, H);
    };
    lane(26, 1 - r.me, 0); lane(144, r.me, 1);
    x.textAlign = 'left'; x.font = FONT; x.fillStyle = OC(); x.fillText(n1.slice(0, 12), 8, 46); x.fillStyle = ME; x.fillText(n0.slice(0, 12), 8, 164);
    const m = r.pulse; if (m && now - m[1] < 120) { x.fillStyle = '#ffc93c66'; x.fillRect(m[0] ? 170 : 0, 144, 170, 112) }
  }

  // ================= TOWER STACK =================
  const SW = 300, BH = 20;
  const stc = (e, k, w) => { const rg = SW - w, v = 140 + 9 * k, m = (e * v) % (2 * rg), pos = m < rg ? m : 2 * rg - m; return w / 2 + pos };
  function tInit(d) {
    const r = begin(d, 'stack', 330); r.dur = d.dur;
    r.p = [0, 1].map(() => ({ b: [[d.l, d.w, 0]], k: 0, l: d.l, w: d.w, fell: 0, perf: 0, ts: d.startAt - r.so, fx: [], cam: 0, msg: '' }));
    $('#gm').innerHTML = cvH(330) + btn('td', 'DROP!', 'width:80%;height:72px;margin:10px auto 0;font-size:28px') + '<small style="display:block;text-align:center;font-weight:900;margin-top:6px">Tap when the block is over your tower. Stack higher than your rival in 30 seconds.</small>';
    bind('td', tDrop); run(tDraw);
  }
  function tDrop() {
    const r = X.r; if (!r || r.g != 'stack' || r.over) return; const p = r.p[r.me], now = Date.now(); if (sn() < r.t0 || p.fell || sn() > r.t0 + r.dur + 300 || now - (p.dt || 0) < 90) return; p.dt = now;
    const e = (now - p.ts) / 1000; send({ t: 'in', k: r.k, e }); snd('tap'); tApply(r.me, e, now);
  }
  function tApply(i, e, now) {
    const r = X.r, p = r.p[i]; if (p.fell) return;
    const c = stc(e, p.k, p.w), l = c - p.w / 2, ol = Math.max(l, p.l), or = Math.min(l + p.w, p.l + p.w), ov = or - ol;
    if (ov < 4) { p.fell = 1; p.fx.push({ l, w: p.w, t: now, y: p.k + 1 }); p.msg = 'TOPPLED!'; return }
    let nl = ol, nw = ov, pf = 0;
    if (Math.abs(l - p.l) <= 4) { nl = p.l; nw = p.w; pf = 1; p.perf++ }
    else { if (l < p.l) p.fx.push({ l, w: p.l - l, t: now, y: p.k + 1 }); else p.fx.push({ l: p.l + p.w, w: l + p.w - (p.l + p.w), t: now, y: p.k + 1 }) }
    p.l = nl; p.w = nw; p.k++; p.ts = now; p.b.push([nl, nw, pf]); p.pf = pf ? now : 0;
    if (pf) { snd('point'); vib(15) }
  }
  function tUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return; const p = r.p[d.i]; if (d.i == r.me) {
      if (d.fell) { if (!p.fell) { p.fell = 1; p.msg = 'TOPPLED!'; snd('bad'); vib([40, 30, 40]) } } else if (d.h == p.k && (Math.abs(p.l - d.l) > 1.5 || Math.abs(p.w - d.w) > 1.5)) { p.k = d.h; p.l = d.l; p.w = d.w; p.b[d.h] = [d.l, d.w, d.perf]; p.perf = d.pn }
      return;
    }
    if (d.fell) { p.fx.push({ l: p.l, w: p.w, t: Date.now(), y: p.k + 1 }); p.fell = 1; p.msg = 'TOPPLED!'; return }
    if (d.perf) p.pf = Date.now(); else if (d.l > p.l || d.l + d.w < p.l + p.w) p.fx.push({ l: d.l > p.l ? p.l : d.l + d.w, w: p.w - d.w, t: Date.now(), y: d.h });
    p.k = d.h; p.l = d.l; p.w = d.w; p.perf = d.pn; p.b.push([d.l, d.w, d.perf]); p.ts = Date.now();
  }
  function tDraw(x, r, now) {
    const s = sn(), left = Math.max(0, r.t0 + r.dur - s), AW = 156, S = AW / SW, ox = [6, 178], idx = [r.me, 1 - r.me], nm2 = names();
    x.fillStyle = '#1a1a1a'; x.font = '400 22px Lilita One,sans-serif'; x.textAlign = 'center'; x.fillText(Math.ceil(left / 1000) + 's', 170, 24);
    idx.forEach((pi, col) => {
      const p = r.p[pi], mine = pi == r.me, X0 = ox[col], gy = 300; p.cam = lerp(p.cam, Math.max(0, p.k - 9), .15);
      x.save(); x.beginPath(); x.rect(X0, 34, AW, 292); x.clip(); x.fillStyle = mine ? '#fffaf0' : '#f1e6c8'; x.fillRect(X0, 34, AW, 292);
      x.fillStyle = '#1a1a1a'; x.fillRect(X0, gy, AW, 26);
      const yb = k => gy - (k + 1 - p.cam) * BH;
      p.b.forEach((b, k) => { if (k == 0 && false) return; const y = yb(k); if (y < 20 || y > 330) return; x.fillStyle = k == 0 ? '#8b6b3d' : ['#e5392f', '#ff9f1c', '#ffc93c', '#17a58a', '#2563c9', '#8b5cf6'][k % 6]; x.fillRect(X0 + b[0] * S, y, b[1] * S, BH - 2); x.lineWidth = 2.5; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0 + b[0] * S, y, b[1] * S, BH - 2); if (b[2] && k == p.k && p.pf && now - p.pf < 500) { x.fillStyle = '#fff8'; x.fillRect(X0 + b[0] * S, y, b[1] * S, BH - 2) } });
      p.fx = p.fx.filter(f => now - f.t < 900); p.fx.forEach(f => { const t = (now - f.t) / 1000, y = yb(f.y - 1) + t * t * 520; x.fillStyle = '#e5392fcc'; x.fillRect(X0 + f.l * S, y, f.w * S, BH - 2); x.strokeStyle = '#1a1a1a'; x.lineWidth = 2.5; x.strokeRect(X0 + f.l * S, y, f.w * S, BH - 2) });
      if (!p.fell && s >= r.t0 - 0 && left > 0) {
        const e = mine ? (now - p.ts) / 1000 : (now - p.ts) / 1000, c = stc(Math.max(0, mine ? e : e), p.k, p.w), y = yb(p.k);
        if (mine) { x.fillStyle = ME; x.fillRect(X0 + (c - p.w / 2) * S, y, p.w * S, BH - 2); x.lineWidth = 2.5; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0 + (c - p.w / 2) * S, y, p.w * S, BH - 2) }
        else { x.fillStyle = OC() + '66'; x.fillRect(X0 + (c - p.w / 2) * S, y, p.w * S, BH - 2); x.setLineDash([4, 3]); x.strokeStyle = '#1a1a1a'; x.lineWidth = 2; x.strokeRect(X0 + (c - p.w / 2) * S, y, p.w * S, BH - 2); x.setLineDash([]) }
      }
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0, 34, AW, 292);
      x.font = FONT; x.textAlign = 'left'; x.fillStyle = mine ? ME : OC(); x.fillText((mine ? nm2[0] : nm2[1]).slice(0, 12) + '  ' + p.k, X0 + 4, 52);
      if (p.msg) cap(x, p.msg, X0 + AW / 2, 160, '#fff6e0', 22); else if (p.pf && now - p.pf < 600) cap(x, 'PERFECT!', X0 + AW / 2, 150 - (now - p.pf) / 30, '#ffc93c', 20);
    });
  }

  // ================= SKY CLIMB =================
  const RH = 40;
  function sInit(d) {
    const r = begin(d, 'sky', 360); r.rows = d.rows; r.N = d.N; r.p = [0, 1].map(() => ({ r: 0, side: 0, stun: 0, dr: 0, ds: 0, sa: 0 }));
    $('#gm').innerHTML = cvH(360) + '<div style="display:flex;gap:10px;margin:10px auto 0;max-width:340px"><button class="b cta" id="sl" style="flex:1;height:80px;margin:0;font-size:28px">◀ LEFT</button><button class="b cta" id="sr" style="flex:1;height:80px;margin:0;font-size:28px">RIGHT ▶</button></div><small style="display:block;text-align:center;font-weight:900;margin-top:6px">Jump to the next cloud above. Pick the wrong side and you fall!</small>';
    bind('sl', () => sTap(0)); bind('sr', () => sTap(1)); run(sDraw);
  }
  function sTap(s) { const r = X.r; if (!r || r.g != 'sky' || r.over || sn() < r.t0) return; send({ t: 'in', k: r.k, s }); snd('tap') }
  function sUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return;
    d.p.forEach((a, i) => { const p = r.p[i]; if (a[0] > p.r) { p.jt = Date.now() } p.r = a[0]; p.side = a[1]; p.stun = a[2] });
    (d.ev || []).forEach(([i]) => { r.p[i].sa = Date.now(); if (i == r.me) { snd('bad'); vib([40, 30, 40]); shake() } });
  }
  function sDraw(x, r, now) {
    const AW = 156, ox = [6, 178], idx = [r.me, 1 - r.me], nm2 = names();
    idx.forEach((pi, col) => {
      const p = r.p[pi], mine = pi == r.me, X0 = ox[col]; p.dr = lerp(p.dr, p.r, .3);
      x.save(); x.beginPath(); x.rect(X0, 30, AW, 322); x.clip();
      const g = x.createLinearGradient(0, 30, 0, 352); g.addColorStop(0, mine ? '#bfe6ff' : '#d7ddf5'); g.addColorStop(1, '#fffaf0'); x.fillStyle = g; x.fillRect(X0, 30, AW, 322);
      const yr = k => 300 - (k - p.dr) * RH;
      for (let k = Math.max(0, Math.floor(p.dr) - 2); k <= Math.min(r.N, Math.ceil(p.dr) + 9); k++) {
        const y = yr(k), t = r.rows[k];
        if (k == r.N) { x.fillStyle = '#ffc93c'; x.fillRect(X0, y, AW, 12); x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; x.strokeRect(X0, y, AW, 12); for (let q = 0; q < 8; q++) { x.fillStyle = q % 2 ? '#1a1a1a' : '#fff'; x.fillRect(X0 + q * 19.5, y, 19.5, 6) } continue }
        [0, 1].forEach(s => { if (k == 0 || t & (1 << s)) { const px = X0 + (s ? 86 : 6), w = 64; x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(px, y, w, 14, 7) : x.rect(px, y, w, 14); x.fill(); x.lineWidth = 3; x.strokeStyle = '#1a1a1a'; x.stroke() } });
      }
      const y0 = yr(p.dr), px = X0 + (p.side ? 118 : 38), hop = Math.abs(p.dr - p.r) > .02 ? Math.sin(Math.min(1, (now - (p.jt || 0)) / 200) * Math.PI) * 10 : 0, stn = p.stun || (p.sa && now - p.sa < 550);
      x.fillStyle = '#0002'; x.beginPath(); x.ellipse(px, yr(p.dr) + 14, 14, 3, 0, 0, 7); x.fill();
      sprite(x, fspr(!mine), px, yr(p.dr) - 14 - hop, 36, stn ? Math.sin(now / 50) * .25 : 0);
      if (stn) cap(x, '✦ ✦', px, yr(p.dr) - 40, '#ffc93c', 14);
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0, 30, AW, 322);
      x.font = FONT; x.textAlign = 'left'; x.fillStyle = mine ? ME : OC(); x.fillText((mine ? nm2[0] : nm2[1]).slice(0, 12), X0 + 4, 22); x.textAlign = 'right'; x.fillStyle = '#1a1a1a'; x.fillText(p.r + '/' + r.N, X0 + AW - 4, 22);
    });
  }

  // ================= FRUIT SLICE RUSH =================
  const FT = 390, FG = 720, COLS = ['#e5392f', '#ff9f1c', '#80b918', '#ffc93c', '#ff5d8f'];
  const fp = (it, ms) => { const s = (ms - it[0]) / 1000; return [it[1] + it[2] * s, FT + it[3] * s + FG / 2 * s * s] };
  const ffl = it => -2 * it[3] / FG * 1000;
  function fruInit(d) {
    const r = begin(d, 'fruit', 390); r.it = d.it; r.dur = d.dur; r.s = [0, 0]; r.done = new Set(); r.q = []; r.trail = []; r.cuts = []; r.pops = []; r.lastSend = 0; r.ptr = null;
    $('#gm').innerHTML = cvH(390) + '<small style="display:block;text-align:center;font-weight:900;margin-top:8px">Swipe across the fruit to slice it. Do not touch the bombs!</small>';
    const cv = $('#cv'), pt = e => { const b = cv.getBoundingClientRect(), k = 340 / b.width; return [(e.clientX - b.left) * k, (e.clientY - b.top) * k] };
    cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (z) { } r.ptr = pt(e); r.trail = [r.ptr.concat(Date.now())] };
    cv.onpointermove = e => { if (!r.ptr) return; e.preventDefault(); const a = r.ptr, b = pt(e), n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 10)); for (let i = 1; i <= n; i++)fHit(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); r.ptr = b; r.trail.push(b.concat(Date.now())); if (r.trail.length > 12) r.trail.shift() };
    cv.onpointerup = cv.onpointercancel = () => { r.ptr = null };
    run(fDraw);
  }
  function fHit(px, py) {
    const r = X.r, t = sn() - r.t0; if (t < 0 || t > r.dur) return;
    r.it.forEach((m, id) => { if (r.done.has(id) || t < m[0] || t > m[0] + ffl(m)) return; const [fx, fy] = fp(m, t); if (Math.hypot(fx - px, fy - py) > 36) return;
      r.done.add(id); r.q.push([id, Math.round(px), Math.round(py), Math.round(t)]); r.cuts.push({ id, x: fx, y: fy, t: Date.now(), b: m[4] });
      if (m[4]) { snd('bad'); vib([50, 30, 50]); shake(); r.flash = Date.now(); r.pops.push({ x: fx, y: fy, t: Date.now(), s: '-3', c: '#e5392f' }) } else { snd('pop'); vib(8); r.pops.push({ x: fx, y: fy, t: Date.now(), s: '+1', c: '#fff6e0' }) } });
  }
  function fruUpd(d) { const r = X.r; if (!r || d.k != r.k) return; r.s = [d.s[r.me], d.s[1 - r.me]] }
  function fDraw(x, r, now) {
    const t = sn() - r.t0, left = Math.max(0, r.dur - t);
    if (r.q.length && now - r.lastSend > 80) { send({ t: 'in', k: r.k, sl: r.q.splice(0, 8) }); r.lastSend = now }
    x.fillStyle = '#fff6e0'; x.fillRect(0, 0, 340, 390); x.fillStyle = '#f1e6c8'; for (let i = 0; i < 8; i++)x.fillRect(0, 40 + i * 50, 340, 2);
    r.it.forEach((m, id) => {
      if (r.done.has(id) || t < m[0] || t > m[0] + ffl(m) || t > r.dur) return; const [fx, fy] = fp(m, t), a = id * 1.7 + t / 400;
      if (m[4]) { x.beginPath(); x.arc(fx, fy, 24, 0, 7); x.fillStyle = '#1a1a1a'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#555'; x.stroke(); x.strokeStyle = '#ff9f1c'; x.lineWidth = 3; x.beginPath(); x.moveTo(fx + 8, fy - 20); x.quadraticCurveTo(fx + 18, fy - 34, fx + 8, fy - 38); x.stroke(); x.fillStyle = '#fff'; x.font = '900 18px Nunito'; x.textAlign = 'center'; x.fillText('☠', fx, fy + 6) }
      else { const c = COLS[id % 5]; x.beginPath(); x.arc(fx, fy, 26, 0, 7); x.fillStyle = c; x.fill(); x.lineWidth = 3.5; x.strokeStyle = '#1a1a1a'; x.stroke(); x.beginPath(); x.arc(fx - 8, fy - 9, 6, 0, 7); x.fillStyle = '#fff7'; x.fill(); x.fillStyle = '#17a58a'; x.save(); x.translate(fx, fy - 26); x.rotate(a); x.fillRect(-2, -8, 4, 8); x.restore() }
    });
    r.cuts = r.cuts.filter(c => now - c.t < 500); r.cuts.forEach(c => { const u = (now - c.t) / 500, col = c.b ? '#555' : COLS[c.id % 5]; [-1, 1].forEach(sd => { x.save(); x.translate(c.x + sd * u * 36, c.y + u * u * 90); x.rotate(sd * u * 2); x.globalAlpha = 1 - u; x.beginPath(); x.arc(0, 0, 24, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : -Math.PI / 2 + Math.PI * 2 - Math.PI); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = 3; x.strokeStyle = '#1a1a1a'; x.stroke(); x.restore() }) });
    r.pops = r.pops.filter(p => now - p.t < 650); r.pops.forEach(p => cap(x, p.s, p.x, p.y - (now - p.t) / 12, p.c, 22));
    r.trail = r.trail.filter(p => now - p[2] < 220); if (r.trail.length > 1) { x.lineCap = 'round'; for (let i = 1; i < r.trail.length; i++) { const a = r.trail[i - 1], b = r.trail[i]; x.strokeStyle = 'rgba(26,26,26,' + (1 - (now - b[2]) / 220) * .85 + ')'; x.lineWidth = 3 + i * .6; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke() } }
    if (r.flash && now - r.flash < 250) { x.fillStyle = 'rgba(229,57,47,' + (.45 * (1 - (now - r.flash) / 250)) + ')'; x.fillRect(0, 0, 340, 390) }
    x.fillStyle = '#1a1a1aee'; x.fillRect(0, 0, 340, 34); x.font = FONT; x.textAlign = 'left'; x.fillStyle = '#ff9f9f'; x.fillText((names()[0]).slice(0, 10) + ' ' + r.s[0], 8, 23); x.textAlign = 'right'; x.fillStyle = '#9fc2ff'; x.fillText((names()[1]).slice(0, 10) + ' ' + r.s[1], 332, 23); cap(x, Math.ceil(left / 1000) + '', 170, 25, '#ffc93c', 22);
  }

  // ---- dispatch + keys ----
  function msg(d) {
    switch (d.t) {
      case 'rhs': hInit(d); return 1; case 'rhu': hUpd(d); return 1;
      case 'tws': tInit(d); return 1; case 'twu': tUpd(d); return 1;
      case 'sks': sInit(d); return 1; case 'sku': sUpd(d); return 1;
      case 'frs': fruInit(d); return 1; case 'fru': fruUpd(d); return 1;
    } return 0;
  }
  document.addEventListener('keydown', e => {
    if (view != 'play' || !X.r || e.repeat) return; const g = X.r.g, k = e.key;
    if (g == 'hurdle') { if (k == 'a' || k == 'ArrowLeft') hTap(0); else if (k == 'd' || k == 'ArrowRight') hTap(1); else if (k == ' ' || k == 'ArrowUp') { e.preventDefault(); hJump() } }
    else if (g == 'stack') { if (k == ' ' || k == 'ArrowDown') { e.preventDefault(); tDrop() } }
    else if (g == 'sky') { if (k == 'a' || k == 'ArrowLeft') sTap(0); else if (k == 'd' || k == 'ArrowRight') sTap(1) }
  });
  return { msg, over() { if (X.r) X.r.over = 1 } };
})();
