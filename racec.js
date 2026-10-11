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

  const fine = () => { try { return matchMedia('(pointer:fine)').matches } catch (e) { return false } };
  const hint = (a, b) => '<small style="display:block;text-align:center;font-weight:900;margin-top:6px">' + (fine() ? b : a) + '</small>';

  // ================= HURDLE SPRINT =================
  const SC = 2.3, GX = 78, STR = 13;
  function hInit(d) {
    const r = begin(d, 'hurdle', 262); r.L = d.L; r.HH = d.H; r.air = d.air || 950; r.last = -1; r.taps = []; r.p = [0, 1].map(() => ({ x: 0, dx: 0, air: 0, stun: 0, hh: 0, as: -9e9, sa: 0, kn: new Set() }));
    $('#gm').innerHTML = cvH(262) + '<div style="display:flex;gap:8px;margin:10px auto 0;max-width:340px"><button class="b cta" id="hl" style="flex:1;height:76px;margin:0;font-size:26px">◀</button>' + btn('hj', 'JUMP', 'flex:1.2;height:76px;margin:0;background:#2563c9;color:#fff6e0') + '<button class="b cta" id="hr" style="flex:1;height:76px;margin:0;font-size:26px">▶</button></div>' + hint('Tap ◀ ▶ one after the other to run. JUMP when the yellow JUMP! sign appears.', 'Keys: A and D one after the other to run, SPACE to jump when the JUMP! sign appears.');
    bind('hl', () => hTap(0)); bind('hr', () => hTap(1)); bind('hj', hJump); run(hDraw);
  }
  const hStun = (r, p, now) => p.stun || now - p.sa < 550;
  function hTap(s) { const r = X.r; if (!r || r.g != 'hurdle' || r.over || sn() < r.t0 || s === r.last) return; r.last = s; send({ t: 'in', k: r.k, s }); snd('tap'); const now = Date.now(); if (!hStun(r, r.p[r.me], now)) r.taps.push(now); r.pulse = [s, now] }
  function hJump() { const r = X.r; if (!r || r.g != 'hurdle' || r.over || sn() < r.t0) return; send({ t: 'in', k: r.k, j: 1 }); const m = r.p[r.me], now = Date.now(); if (!hStun(r, m, now) && now > m.as + r.air) { m.as = now; snd('whoosh') } }
  function hUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return; const now = Date.now();
    d.p.forEach((a, i) => { const p = r.p[i]; p.x = a[0]; p.stun = a[2]; if (i != r.me && a[1] && !p.air) p.as = now; p.air = a[1]; p.hh = a[3]; });
    (d.ev || []).forEach(([i, t]) => { const p = r.p[i];
      if (t == 1) { p.kn.add(p.hh - 1); p.sa = now; if (i == r.me) { snd('bad'); vib([40, 30, 40]); shake(); r.pop = ['OUCH!', now, '#e5392f'] } }
      else if (i == r.me) { snd('point'); vib(12); r.pop = ['CLEAR!', now, '#ffc93c'] } });
  }
  function hDraw(x, r, now) {
    const [n0, n1] = names();
    r.taps = r.taps.filter(t => now - t < 170); const pend = r.taps.length;
    x.fillStyle = '#1a1a1a'; x.fillRect(18, 11, 304, 6);
    for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#1a1a1a' : '#fff'; x.fillRect(316, 4 + k * 2.5, 6, 2.5) }
    [1, 0].forEach(w => { const i = w ? r.me : 1 - r.me, p = r.p[i]; x.beginPath(); x.arc(20 + 296 * Math.min(1, p.dx / r.L), 14, w ? 9 : 7, 0, 7); x.fillStyle = w ? ME : OC(); x.fill(); x.lineWidth = 3; x.strokeStyle = '#1a1a1a'; x.stroke() });
    r.p.forEach((p, i) => { p.dx = lerp(p.dx, p.x + (i == r.me ? pend * STR : 0), .5) });
    const lane = (top, i, mine) => {
      const p = r.p[i], H = 112, cx = p.dx; x.save(); x.beginPath(); x.rect(0, top, 340, H); x.clip();
      x.fillStyle = mine ? '#fffaf0' : '#f1e6c8'; x.fillRect(0, top, 340, H);
      x.fillStyle = '#d9c9a0'; x.fillRect(0, top + 86, 340, 26);
      x.fillStyle = '#1a1a1a'; x.fillRect(0, top + 84, 340, 4);
      for (let k = -1; k < 20; k++) { const sx = k * 36 - ((cx * SC) % 36); x.fillStyle = '#c4b283'; x.fillRect(sx, top + 98, 18, 3) }
      const fx = GX + (r.L - cx) * SC; if (fx < 360) { for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#1a1a1a' : '#fff'; x.fillRect(fx, top + 4 + k * 10, 8, 10); x.fillStyle = k % 2 ? '#fff' : '#1a1a1a'; x.fillRect(fx + 8, top + 4 + k * 10, 8, 10) } }
      const t = (now - p.as) / r.air, air = t >= 0 && t < 1, jy = air ? Math.sin(t * Math.PI) * 56 : 0, stn = hStun(r, p, now);
      const nxt = p.hh < r.HH.length ? r.HH[p.hh] - cx : 999, cue = mine && !air && nxt > -6 && nxt < 88;
      r.HH.forEach((hx, j) => {
        const sx = GX + (hx - cx) * SC; if (sx < -30 || sx > 370) return; const kn = p.kn.has(j), hot = cue && j == p.hh;
        x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.lineCap = 'round';
        if (!kn) { x.beginPath(); x.moveTo(sx - 9, top + 86); x.lineTo(sx - 9, top + 58); x.moveTo(sx + 9, top + 86); x.lineTo(sx + 9, top + 58); x.stroke(); x.fillStyle = hot && Math.floor(now / 110) % 2 ? '#ffc93c' : '#e5392f'; x.fillRect(sx - 14, top + 54, 28, 9); x.strokeRect(sx - 14, top + 54, 28, 9); x.fillStyle = '#fff'; x.fillRect(sx - 4, top + 54, 8, 9) }
        else { x.beginPath(); x.moveTo(sx - 18, top + 84); x.lineTo(sx + 18, top + 84); x.stroke(); x.fillStyle = '#e5392f'; x.fillRect(sx - 16, top + 78, 32, 7) }
      });
      const w = 44, bob = air || stn ? 0 : Math.abs(Math.sin(cx * .45)) * 4;
      x.fillStyle = '#0002'; x.beginPath(); x.ellipse(GX, top + 88, 16 - jy / 6, 4, 0, 0, 7); x.fill();
      sprite(x, fspr(!mine), GX, top + 62 - jy - bob, w, stn ? Math.sin(now / 50) * .25 : (air ? -.2 : 0));
      if (stn) cap(x, '✦ ✦', GX, top + 28, '#ffc93c', 16);
      if (cue) { const q = 1 + Math.sin(now / 70) * .08; x.save(); x.translate(GX + 40, top + 28); x.scale(q, q); x.fillStyle = '#ffc93c'; x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; x.beginPath(); x.roundRect ? x.roundRect(-36, -14, 72, 26, 10) : x.rect(-36, -14, 72, 26); x.fill(); x.stroke(); x.fillStyle = '#1a1a1a'; x.font = FONT; x.textAlign = 'center'; x.fillText('JUMP!', 0, 5); x.restore() }
      if (mine && r.pop && now - r.pop[1] < 700) cap(x, r.pop[0], GX, top + 44 - (now - r.pop[1]) / 25, r.pop[2], 20);
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(0, top, 340, H);
    };
    lane(26, 1 - r.me, 0); lane(144, r.me, 1);
    x.textAlign = 'left'; x.font = FONT; x.fillStyle = OC(); x.fillText(n1.slice(0, 12), 8, 46); x.fillStyle = ME; x.fillText(n0.slice(0, 12), 8, 164);
    const m = r.pulse; if (m && now - m[1] < 120) { x.fillStyle = '#ffc93c66'; x.fillRect(m[0] ? 170 : 0, 144, 170, 112) }
  }

  // ================= TOWER STACK =================
  const SW = 300, BH = 20, TC = ['#e5392f', '#ff9f1c', '#ffc93c', '#17a58a', '#2563c9', '#8b5cf6'];
  const stc = (e, k, w) => { const rg = SW - w, v = 140 + 9 * k, m = (e * v) % (2 * rg), pos = m < rg ? m : 2 * rg - m; return w / 2 + pos };
  function tInit(d) {
    const r = begin(d, 'stack', 330); r.dur = d.dur;
    r.p = [0, 1].map(() => ({ b: [[d.l, d.w, 0, 0]], k: 0, l: d.l, w: d.w, fell: 0, perf: 0, st: 0, ts: d.startAt - r.so, fx: [], sp: [], cam: 0, msg: '' }));
    $('#gm').innerHTML = cvH(330) + btn('td', 'DROP!', 'width:80%;height:72px;margin:10px auto 0;font-size:28px') + hint('Tap anywhere when the block is over your tower. Three perfect drops in a row grow the block back!', 'Press SPACE (or click) when the block is over your tower. Three perfect drops in a row grow the block back!');
    bind('td', tDrop); $('#cv').onpointerdown = e => { e.preventDefault(); tDrop() }; run(tDraw);
  }
  function tDrop() {
    const r = X.r; if (!r || r.g != 'stack' || r.over) return; const p = r.p[r.me], now = Date.now(); if (sn() < r.t0 || p.fell || sn() > r.t0 + r.dur + 300 || now - (p.dt || 0) < 90) return; p.dt = now;
    const e = (now - p.ts) / 1000; send({ t: 'in', k: r.k, e }); snd('tap'); tApply(r.me, e, now);
  }
  function spark(p, x0, x1, y, now, col) { for (let q = 0; q < 12; q++) p.sp.push({ x: x0 + (x1 - x0) * Math.random(), y, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 90, t: now, c: col || '#ffc93c' }) }
  function tApply(i, e, now) {
    const r = X.r, p = r.p[i]; if (p.fell) return;
    const c = stc(e, p.k, p.w), l = c - p.w / 2, ol = Math.max(l, p.l), or = Math.min(l + p.w, p.l + p.w), ov = or - ol;
    if (ov < 4) { p.fell = 1; p.fx.push({ l, w: p.w, t: now, y: p.k + 1 }); p.msg = 'TOPPLED!'; if (i == r.me) { snd('bad'); vib([40, 30, 40]); shake() } return }
    let nl = ol, nw = ov, pf = 0;
    if (Math.abs(l - p.l) <= 4) { nl = p.l; nw = p.w; pf = 1; p.perf++; p.st++; if (p.st >= 3 && nw < 96) { const g = Math.min(8, 96 - nw); nw += g; nl = Math.max(0, Math.min(SW - nw, nl - g / 2)); p.gr = now } }
    else { p.st = 0; if (l < p.l) p.fx.push({ l, w: p.l - l, t: now, y: p.k + 1 }); else p.fx.push({ l: p.l + p.w, w: l + p.w - (p.l + p.w), t: now, y: p.k + 1 }) }
    p.l = nl; p.w = nw; p.k++; p.ts = now; p.b.push([nl, nw, pf, now]); p.pf = pf ? now : 0;
    if (pf) { snd('point'); vib(15); spark(p, nl, nl + nw, p.k, now) }
  }
  function tUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return; const p = r.p[d.i], now = Date.now(); if (d.i == r.me) {
      if (d.fell) { if (!p.fell) { p.fell = 1; p.msg = 'TOPPLED!'; snd('bad'); vib([40, 30, 40]) } } else if (d.h == p.k && (Math.abs(p.l - d.l) > 1.5 || Math.abs(p.w - d.w) > 1.5)) { p.l = d.l; p.w = d.w; p.b[d.h] = [d.l, d.w, d.perf, now]; p.perf = d.pn }
      return;
    }
    if (d.fell) { p.fx.push({ l: p.l, w: p.w, t: now, y: p.k + 1 }); p.fell = 1; p.msg = 'TOPPLED!'; return }
    if (d.perf) { p.pf = now; spark(p, d.l, d.l + d.w, d.h, now) } else if (d.l > p.l || d.l + d.w < p.l + p.w) p.fx.push({ l: d.l > p.l ? p.l : d.l + d.w, w: p.w - d.w, t: now, y: d.h });
    p.k = d.h; p.l = d.l; p.w = d.w; p.perf = d.pn; p.b.push([d.l, d.w, d.perf, now]); p.ts = now; p.st = d.perf ? p.st + 1 : 0;
  }
  function tDraw(x, r, now) {
    const s = sn(), left = Math.max(0, r.t0 + r.dur - s), AW = 156, S = AW / SW, ox = [6, 178], idx = [r.me, 1 - r.me], nm2 = names();
    cap(x, Math.ceil(left / 1000) + 's', 170, 25, left < 6000 ? '#ff9f9f' : '#fff6e0', 22);
    idx.forEach((pi, col) => {
      const p = r.p[pi], mine = pi == r.me, X0 = ox[col], gy = 300; p.cam = lerp(p.cam, Math.max(0, p.k - 9), .15);
      x.save(); x.beginPath(); x.rect(X0, 34, AW, 292); x.clip();
      const bg = x.createLinearGradient(0, 34, 0, 326); bg.addColorStop(0, mine ? '#cfe8ff' : '#e6e0f5'); bg.addColorStop(1, mine ? '#fffaf0' : '#f1e6c8'); x.fillStyle = bg; x.fillRect(X0, 34, AW, 292);
      x.fillStyle = '#1a1a1a'; x.fillRect(X0, gy, AW, 26);
      const yb = k => gy - (k + 1 - p.cam) * BH;
      for (let m = 5; m <= p.k + 12; m += 5) { const y = yb(m - 1) + BH - 1; if (y < 36 || y > 300) continue; x.strokeStyle = '#1a1a1a33'; x.lineWidth = 1.5; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X0, y); x.lineTo(X0 + AW, y); x.stroke(); x.setLineDash([]); x.fillStyle = '#1a1a1a66'; x.font = '900 10px Nunito'; x.textAlign = 'right'; x.fillText(m, X0 + AW - 3, y - 2) }
      p.b.forEach((b, k) => {
        const y0 = yb(k); if (y0 < 20 || y0 > 330) return; const age = b[3] ? Math.min(1, (now - b[3]) / 160) : 1, y = y0 - (1 - age) * 10, h = BH - 2;
        const col = k == 0 ? '#8b6b3d' : TC[k % 6]; x.fillStyle = col; x.fillRect(X0 + b[0] * S, y, b[1] * S, h);
        x.fillStyle = '#ffffff44'; x.fillRect(X0 + b[0] * S, y, b[1] * S, 4); x.fillStyle = '#00000022'; x.fillRect(X0 + b[0] * S, y + h - 4, b[1] * S, 4);
        x.lineWidth = 2.5; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0 + b[0] * S, y, b[1] * S, h);
        if (b[2] && k == p.k && p.pf && now - p.pf < 350) { x.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - (now - p.pf) / 350)) + ')'; x.fillRect(X0 + b[0] * S, y, b[1] * S, h) }
      });
      p.fx = p.fx.filter(f => now - f.t < 900); p.fx.forEach(f => { const t = (now - f.t) / 1000, y = yb(f.y - 1) + t * t * 520; x.fillStyle = '#e5392fcc'; x.fillRect(X0 + f.l * S, y, f.w * S, BH - 2); x.strokeStyle = '#1a1a1a'; x.lineWidth = 2.5; x.strokeRect(X0 + f.l * S, y, f.w * S, BH - 2) });
      p.sp = p.sp.filter(q => now - q.t < 600); p.sp.forEach(q => { const t = (now - q.t) / 1000; x.globalAlpha = 1 - t / .6; x.fillStyle = q.c; const px = X0 + q.x * S + q.vx * t, py = yb(p.k - 1) + 4 + q.vy * t + 200 * t * t; x.fillRect(px, py, 4, 4) }); x.globalAlpha = 1;
      if (!p.fell && s >= r.t0 && left > 0) {
        const e = (now - p.ts) / 1000, c = stc(Math.max(0, e), p.k, p.w), y = yb(p.k), bx = X0 + (c - p.w / 2) * S, bw = p.w * S;
        if (mine) { x.fillStyle = ME; x.fillRect(bx, y, bw, BH - 2); x.fillStyle = '#ffffff44'; x.fillRect(bx, y, bw, 4); x.lineWidth = 2.5; x.strokeStyle = '#1a1a1a'; x.strokeRect(bx, y, bw, BH - 2); x.strokeStyle = '#1a1a1a22'; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(X0 + p.l * S, y + BH); x.lineTo(X0 + p.l * S, 326); x.moveTo(X0 + (p.l + p.w) * S, y + BH); x.lineTo(X0 + (p.l + p.w) * S, 326); x.stroke(); x.setLineDash([]) }
        else { x.fillStyle = OC() + '66'; x.fillRect(bx, y, bw, BH - 2); x.setLineDash([4, 3]); x.strokeStyle = '#1a1a1a'; x.lineWidth = 2; x.strokeRect(bx, y, bw, BH - 2); x.setLineDash([]) }
      }
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0, 34, AW, 292);
      x.font = FONT; x.textAlign = 'left'; x.fillStyle = mine ? ME : OC(); x.fillText((mine ? nm2[0] : nm2[1]).slice(0, 12), X0 + 4, 52);
      x.textAlign = 'right'; x.font = '400 26px Lilita One,sans-serif'; x.fillStyle = '#1a1a1a'; x.fillText(p.k, X0 + AW - 6, 56);
      if (p.msg) cap(x, p.msg, X0 + AW / 2, 160, '#fff6e0', 22);
      else if (p.pf && now - p.pf < 700) cap(x, p.gr && now - p.gr < 700 ? 'BLOCK GROWS!' : p.st > 1 ? 'PERFECT x' + p.st : 'PERFECT!', X0 + AW / 2, 150 - (now - p.pf) / 30, '#ffc93c', 18);
    });
  }

  // ================= SKY CLIMB =================
  const RH = 40, SN = 350;
  function sInit(d) {
    const r = begin(d, 'sky', 360); r.rows = d.rows; r.N = d.N; r.lastTap = 0; r.lt = 0; r.p = [0, 1].map(() => ({ r: 0, side: 0, stunT: 0, dr: 0, jt: 0 }));
    $('#gm').innerHTML = cvH(360) + '<div style="display:flex;gap:10px;margin:10px auto 0;max-width:340px"><button class="b cta" id="sl" style="flex:1;height:84px;margin:0;font-size:28px">◀ LEFT</button><button class="b cta" id="sr" style="flex:1;height:84px;margin:0;font-size:28px">RIGHT ▶</button></div>' + hint('Tap LEFT or RIGHT to jump to the next cloud. Pick the wrong side and you fall!', 'Keys: A / ← for left, D / → for right. Wrong side and you fall!');
    bind('sl', () => sTap(0)); bind('sr', () => sTap(1));
    $('#cv').onpointerdown = e => { e.preventDefault(); const b = e.currentTarget.getBoundingClientRect(); sTap(e.clientX - b.left < b.width / 2 ? 0 : 1) };
    run(sDraw);
  }
  // Your own taps move you instantly on screen (same rules as the server). The server stays the referee.
  function sTap(s) {
    const r = X.r; if (!r || r.g != 'sky' || r.over || sn() < r.t0) return; const p = r.p[r.me], now = Date.now();
    if (now < p.stunT || now - r.lt < 80) return; r.lt = now; r.lastTap = now;
    send({ t: 'in', k: r.k, s }); snd('tap');
    const t = r.rows[p.r + 1];
    if (t & (1 << s)) { p.r++; p.side = s; p.jt = now }
    else { p.r = Math.max(0, p.r - 2); p.side = p.r ? (r.rows[p.r] & 1 ? 0 : 1) : s; p.stunT = now + SN; p.sa = now; snd('bad'); vib([40, 30, 40]); shake() }
  }
  function sUpd(d) {
    const r = X.r; if (!r || d.k != r.k) return; const now = Date.now();
    d.p.forEach((a, i) => { const p = r.p[i];
      if (i == r.me) { if (now - r.lastTap < 350) return; if (a[0] != p.r) p.jt = now; p.r = a[0]; p.side = a[1]; if (a[2]) p.stunT = Math.max(p.stunT, now + 150); return }
      if (a[0] > p.r) p.jt = now; p.r = a[0]; p.side = a[1]; if (a[2]) p.stunT = now + 300; });
    (d.ev || []).forEach(([i]) => { if (i != r.me) r.p[i].sa = now });
  }
  function sDraw(x, r, now) {
    const AW = 156, ox = [6, 178], idx = [r.me, 1 - r.me], nm2 = names();
    idx.forEach((pi, col) => {
      const p = r.p[pi], mine = pi == r.me, X0 = ox[col]; p.dr = lerp(p.dr, p.r, .35);
      x.save(); x.beginPath(); x.rect(X0, 30, AW, 322); x.clip();
      const g = x.createLinearGradient(0, 30, 0, 352); g.addColorStop(0, mine ? '#bfe6ff' : '#d7ddf5'); g.addColorStop(1, '#fffaf0'); x.fillStyle = g; x.fillRect(X0, 30, AW, 322);
      const yr = k => 300 - (k - p.dr) * RH;
      for (let k = Math.max(0, Math.floor(p.dr) - 2); k <= Math.min(r.N, Math.ceil(p.dr) + 9); k++) {
        const y = yr(k), t = r.rows[k];
        if (k == r.N) { x.fillStyle = '#ffc93c'; x.fillRect(X0, y, AW, 12); x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; x.strokeRect(X0, y, AW, 12); for (let q = 0; q < 8; q++) { x.fillStyle = q % 2 ? '#1a1a1a' : '#fff'; x.fillRect(X0 + q * 19.5, y, 19.5, 6) } continue }
        [0, 1].forEach(s => { if (k == 0 || t & (1 << s)) { const px = X0 + (s ? 86 : 6), w = 64, nxt = mine && k == p.r + 1; x.fillStyle = nxt ? '#fffbe0' : '#fff'; x.beginPath(); x.roundRect ? x.roundRect(px, y, w, 14, 7) : x.rect(px, y, w, 14); x.fill(); x.lineWidth = 3; x.strokeStyle = '#1a1a1a'; x.stroke() } });
      }
      const px = X0 + (p.side ? 118 : 38), hop = now - p.jt < 200 ? Math.sin((now - p.jt) / 200 * Math.PI) * 12 : 0, stn = now < p.stunT;
      x.fillStyle = '#0002'; x.beginPath(); x.ellipse(px, yr(p.dr) + 14, 14, 3, 0, 0, 7); x.fill();
      sprite(x, fspr(!mine), px, yr(p.dr) - 14 - hop, 36, stn ? Math.sin(now / 50) * .25 : 0);
      if (stn) cap(x, '✦ ✦', px, yr(p.dr) - 40, '#ffc93c', 14);
      x.restore(); x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.strokeRect(X0, 30, AW, 322);
      x.font = FONT; x.textAlign = 'left'; x.fillStyle = mine ? ME : OC(); x.fillText((mine ? nm2[0] : nm2[1]).slice(0, 12), X0 + 4, 22); x.textAlign = 'right'; x.fillStyle = '#1a1a1a'; x.fillText(p.r + '/' + r.N, X0 + AW - 4, 22);
    });
  }

  // ================= FRUIT SLICE RUSH =================
  const FT = 390, FG = 720;
  const FTY = [
    { c: '#e5392f', f: '#fff1cf' }, { c: '#ff9f1c', f: '#ffc766' }, { c: '#2f9e5b', f: '#ff5d6c' },
    { c: '#ffd93c', f: '#fff4a8' }, { c: '#e11d48', f: '#ff8fa3' }, { c: '#ffe066', f: '#fff7d1' }];
  const fp = (it, ms) => { const s = (ms - it[0]) / 1000; return [it[1] + it[2] * s, FT + it[3] * s + FG / 2 * s * s] };
  const ffl = it => -2 * it[3] / FG * 1000;
  const fang = (id, t) => id * 1.7 + (id % 2 ? 1 : -1) * t / 380;
  function fpath(x, ty) {
    x.beginPath();
    if (ty == 0) { x.moveTo(0, -14); x.bezierCurveTo(14, -26, 31, -6, 23, 12); x.bezierCurveTo(17, 27, 7, 27, 0, 23); x.bezierCurveTo(-7, 27, -17, 27, -23, 12); x.bezierCurveTo(-31, -6, -14, -26, 0, -14) }
    else if (ty == 1) x.arc(0, 0, 26, 0, 7);
    else if (ty == 2) x.ellipse(0, 0, 31, 25, 0, 0, 7);
    else if (ty == 3) { x.moveTo(-31, 0); x.quadraticCurveTo(-20, -25, 0, -24); x.quadraticCurveTo(20, -25, 31, 0); x.quadraticCurveTo(20, 25, 0, 24); x.quadraticCurveTo(-20, 25, -31, 0) }
    else if (ty == 4) { x.moveTo(0, 27); x.bezierCurveTo(-31, 9, -29, -18, -13, -21); x.bezierCurveTo(-5, -23, 0, -18, 0, -18); x.bezierCurveTo(0, -18, 5, -23, 13, -21); x.bezierCurveTo(29, -18, 31, 9, 0, 27) }
    else { x.moveTo(-29, -10); x.quadraticCurveTo(0, 42, 31, -20); x.lineTo(26, -26); x.quadraticCurveTo(2, 16, -29, -10) }
    x.closePath();
  }
  function fruit(x, ty, cut) {
    const T = FTY[ty]; x.lineJoin = 'round'; fpath(x, ty); x.fillStyle = T.c; x.fill(); x.lineWidth = 3.5; x.strokeStyle = '#1a1a1a'; x.stroke();
    if (cut) { x.save(); x.scale(ty == 5 ? .62 : .8, ty == 5 ? .62 : .8); if (ty == 5) x.translate(2, 6); fpath(x, ty); x.fillStyle = T.f; x.fill(); x.restore(); }
    x.save(); x.lineCap = 'round';
    if (ty == 0) {
      if (cut) { x.fillStyle = '#5b3a1e'; [[-3, -2], [3, -2]].forEach(a => { x.beginPath(); x.ellipse(a[0], a[1], 2, 3.5, 0, 0, 7); x.fill() }) }
      else { x.strokeStyle = '#6b4423'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -14); x.quadraticCurveTo(2, -22, 5, -27); x.stroke(); x.fillStyle = '#4caf50'; x.beginPath(); x.ellipse(10, -22, 8, 4, -.5, 0, 7); x.fill(); x.lineWidth = 2; x.strokeStyle = '#1a1a1a'; x.stroke(); x.fillStyle = '#ffffff88'; x.beginPath(); x.ellipse(-12, -6, 4, 8, .4, 0, 7); x.fill() }
    } else if (ty == 1) {
      if (cut) { x.strokeStyle = '#ff9f1c'; x.lineWidth = 2; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(k * .785) * 19, Math.sin(k * .785) * 19); x.stroke() } }
      else { x.fillStyle = '#d97706'; x.beginPath(); x.arc(0, -22, 3, 0, 7); x.fill(); x.fillStyle = '#4caf50'; x.beginPath(); x.ellipse(6, -24, 7, 3.5, -.4, 0, 7); x.fill(); x.fillStyle = '#d9770655'; [[-10, 4], [8, 8], [-4, -8], [12, -6]].forEach(a => { x.beginPath(); x.arc(a[0], a[1], 1.6, 0, 7); x.fill() }); x.fillStyle = '#ffffff88'; x.beginPath(); x.ellipse(-10, -10, 4, 7, .5, 0, 7); x.fill() }
    } else if (ty == 2) {
      if (cut) { x.fillStyle = '#1a1a1a'; [[-12, -4], [-4, 6], [6, -6], [12, 5], [0, -2]].forEach(a => { x.beginPath(); x.ellipse(a[0], a[1], 1.8, 3, .5, 0, 7); x.fill() }) }
      else { x.strokeStyle = '#176b3a'; x.lineWidth = 3; [-16, -6, 6, 16].forEach(a => { x.beginPath(); x.moveTo(a * .8, -23); x.quadraticCurveTo(a * 1.5, 0, a * .8, 23); x.stroke() }); x.fillStyle = '#ffffff55'; x.beginPath(); x.ellipse(-14, -9, 4, 7, .6, 0, 7); x.fill() }
    } else if (ty == 3) {
      if (cut) { x.strokeStyle = '#ffd93c'; x.lineWidth = 2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(k * 1.047) * 20, Math.sin(k * 1.047) * 14); x.stroke() } }
      else { x.fillStyle = '#d4a90a'; x.beginPath(); x.arc(-31, 0, 2.5, 0, 7); x.arc(31, 0, 2.5, 0, 7); x.fill(); x.fillStyle = '#ffffff88'; x.beginPath(); x.ellipse(-11, -9, 6, 3.5, -.3, 0, 7); x.fill() }
    } else if (ty == 4) {
      if (!cut) { x.fillStyle = '#ffd93c'; for (let a = -14; a <= 14; a += 9) for (let b = -6; b <= 16; b += 9) { if (Math.abs(a) + (b + 6) * .6 < 26) { x.beginPath(); x.ellipse(a + (b % 2 ? 3 : 0), b, 1.4, 2.2, 0, 0, 7); x.fill() } } x.fillStyle = '#4caf50'; x.strokeStyle = '#1a1a1a'; x.lineWidth = 2; [-1, 0, 1].forEach(k => { x.beginPath(); x.ellipse(k * 8, -22, 5, 3, k * .6, 0, 7); x.fill(); x.stroke() }) }
      else { x.fillStyle = '#ffd93c'; [[-6, 2], [6, 2], [0, 10]].forEach(a => { x.beginPath(); x.ellipse(a[0], a[1], 1.4, 2.2, 0, 0, 7); x.fill() }) }
    } else { x.fillStyle = '#6b4423'; x.beginPath(); x.arc(-29, -10, 3, 0, 7); x.arc(28, -23, 3, 0, 7); x.fill() }
    x.restore();
  }
  function bomb(x, now, a) {
    x.lineJoin = 'round'; x.beginPath(); x.arc(0, 2, 24, 0, 7); x.fillStyle = '#2a2a2e'; x.fill(); x.lineWidth = 3.5; x.strokeStyle = '#1a1a1a'; x.stroke();
    x.fillStyle = '#ffffff33'; x.beginPath(); x.ellipse(-9, -7, 5, 8, .5, 0, 7); x.fill();
    x.fillStyle = '#6b7280'; x.fillRect(-7, -27, 14, 8); x.lineWidth = 2.5; x.strokeRect(-7, -27, 14, 8);
    x.strokeStyle = '#a16207'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -27); x.quadraticCurveTo(10, -36, 6, -42); x.stroke();
    const f = Math.floor(now / 70) % 2; x.fillStyle = f ? '#ffc93c' : '#ff7849'; x.beginPath(); for (let k = 0; k < 8; k++) { const r2 = k % 2 ? 3 : 7; x.lineTo(6 + Math.cos(k * .785) * r2, -43 + Math.sin(k * .785) * r2) } x.closePath(); x.fill();
    x.fillStyle = '#fff'; [[-8, 2], [8, 2]].forEach(e => { x.beginPath(); x.arc(e[0], e[1], 5, 0, 7); x.fill() }); x.fillStyle = '#e5392f'; [[-8, 3], [8, 3]].forEach(e => { x.beginPath(); x.arc(e[0], e[1], 2.4, 0, 7); x.fill() });
    x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-14, -4); x.lineTo(-3, -1); x.moveTo(14, -4); x.lineTo(3, -1); x.stroke();
  }
  function fruInit(d) {
    const r = begin(d, 'fruit', 390); r.it = d.it; r.dur = d.dur; r.s = [0, 0]; r.done = new Set(); r.q = []; r.trail = []; r.cuts = []; r.pops = []; r.sp = []; r.sl = []; r.rec = []; r.lastSend = 0; r.ptr = null;
    $('#gm').innerHTML = cvH(390) + hint('Swipe across the fruit to slice it. Do not touch the bombs! Three quick slices make a combo.', 'Drag the mouse across the fruit to slice it. Do not touch the bombs! Three quick slices make a combo.');
    const cv = $('#cv'), pt = e => { const b = cv.getBoundingClientRect(), k = 340 / b.width; return [(e.clientX - b.left) * k, (e.clientY - b.top) * k] };
    cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (z) { } r.ptr = pt(e); r.trail = [r.ptr.concat(Date.now())]; fHit(r.ptr[0], r.ptr[1]) };
    cv.onpointermove = e => { if (!r.ptr) return; e.preventDefault(); const a = r.ptr, b = pt(e), n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8)); for (let i = 1; i <= n; i++)fHit(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); r.ptr = b; r.trail.push(b.concat(Date.now())); if (r.trail.length > 12) r.trail.shift() };
    cv.onpointerup = cv.onpointercancel = () => { r.ptr = null };
    run(fDraw);
  }
  function fHit(px, py) {
    const r = X.r, t = sn() - r.t0, now = Date.now(); if (t < 0 || t > r.dur) return;
    r.it.forEach((m, id) => { if (r.done.has(id) || t < m[0] || t > m[0] + ffl(m)) return; const [fx, fy] = fp(m, t); if (Math.hypot(fx - px, fy - py) > 38) return;
      r.done.add(id); r.q.push([id, Math.round(px), Math.round(py), Math.round(t)]);
      const tl = r.trail, ang = tl.length > 1 ? Math.atan2(tl[tl.length - 1][1] - tl[tl.length - 2][1], tl[tl.length - 1][0] - tl[tl.length - 2][0]) : -.7;
      r.cuts.push({ id, x: fx, y: fy, t: now, b: m[4], a: fang(id, t), ty: id % 6 }); r.sl.push({ x: fx, y: fy, a: ang, t: now });
      if (m[4]) { snd('bad'); vib([50, 30, 50]); shake(); r.flash = now; r.pops.push({ x: fx, y: fy, t: now, s: '-3', c: '#e5392f' }); for (let k = 0; k < 12; k++)r.sp.push({ x: fx, y: fy, vx: Math.cos(k * .52) * 160, vy: Math.sin(k * .52) * 160, t: now, c: k % 2 ? '#ffc93c' : '#ff7849' }) }
      else {
        snd('pop'); vib(8); r.pops.push({ x: fx, y: fy, t: now, s: '+1', c: '#fff6e0' });
        for (let k = 0; k < 9; k++) { const a = Math.random() * 6.3, v = 60 + Math.random() * 110; r.sp.push({ x: fx, y: fy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t: now, c: FTY[id % 6].f }) }
        r.rec = r.rec.filter(z => now - z < 420); r.rec.push(now); if (r.rec.length >= 3) { r.rec = []; r.pops.push({ x: fx, y: fy - 28, t: now, s: 'COMBO +2', c: '#ffc93c' }); snd('point') } } });
  }
  function fruUpd(d) { const r = X.r; if (!r || d.k != r.k) return; r.s = [d.s[r.me], d.s[1 - r.me]] }
  function fDraw(x, r, now) {
    const t = sn() - r.t0, left = Math.max(0, r.dur - t);
    if (r.q.length && now - r.lastSend > 80) { send({ t: 'in', k: r.k, sl: r.q.splice(0, 8) }); r.lastSend = now }
    const bg = x.createLinearGradient(0, 0, 0, 390); bg.addColorStop(0, '#fff6e0'); bg.addColorStop(1, '#ffe2b8'); x.fillStyle = bg; x.fillRect(0, 0, 340, 390);
    x.fillStyle = '#e9c98f55'; for (let i = 0; i < 9; i++)x.fillRect(i * 44 - 6, 34, 12, 356); x.fillStyle = '#c9985a44'; x.fillRect(0, 372, 340, 18);
    r.it.forEach((m, id) => {
      if (r.done.has(id) || t < m[0] || t > m[0] + ffl(m) || t > r.dur) return; const [fx, fy] = fp(m, t);
      x.save(); x.translate(fx, fy); x.rotate(fang(id, t));
      if (m[4]) bomb(x, now, 0); else { x.fillStyle = '#00000014'; x.beginPath(); x.ellipse(2, 5, 27, 24, 0, 0, 7); x.fill(); fruit(x, id % 6, 0) }
      x.restore();
    });
    r.cuts = r.cuts.filter(c => now - c.t < 650);
    r.cuts.forEach(c => { const u = (now - c.t) / 650; [-1, 1].forEach(sd => { x.save(); x.globalAlpha = Math.max(0, 1 - u * u); x.translate(c.x + sd * (u * 46), c.y + u * u * 150 - u * 20); x.rotate(c.a + sd * u * 2.4); x.beginPath(); x.rect(sd < 0 ? -40 : 0, -45, 40, 90); x.clip(); if (c.b) { bomb(x, now, 0) } else fruit(x, c.ty, 1); x.restore() }) });
    r.sl = r.sl.filter(s => now - s.t < 180); r.sl.forEach(s => { const u = (now - s.t) / 180; x.save(); x.translate(s.x, s.y); x.rotate(s.a); x.globalAlpha = 1 - u; x.fillStyle = '#fff'; x.fillRect(-46 - u * 14, -2.5, 92 + u * 28, 5); x.restore() });
    r.sp = r.sp.filter(q => now - q.t < 520); r.sp.forEach(q => { const u = (now - q.t) / 1000; x.globalAlpha = 1 - u / .52; x.fillStyle = q.c; x.beginPath(); x.arc(q.x + q.vx * u, q.y + q.vy * u + 420 * u * u, 3.2, 0, 7); x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#1a1a1a55'; x.stroke() }); x.globalAlpha = 1;
    r.pops = r.pops.filter(p => now - p.t < 700); r.pops.forEach(p => cap(x, p.s, Math.max(40, Math.min(300, p.x)), p.y - (now - p.t) / 11, p.c, p.s.length > 3 ? 20 : 24));
    r.trail = r.trail.filter(p => now - p[2] < 220); if (r.trail.length > 1) { x.lineCap = 'round'; for (let i = 1; i < r.trail.length; i++) { const a = r.trail[i - 1], b = r.trail[i], al = 1 - (now - b[2]) / 220; x.strokeStyle = 'rgba(255,255,255,' + al + ')'; x.lineWidth = 8 + i * .4; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.strokeStyle = 'rgba(26,26,26,' + al * .9 + ')'; x.lineWidth = 3; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke() } }
    if (r.flash && now - r.flash < 280) { x.fillStyle = 'rgba(229,57,47,' + (.5 * (1 - (now - r.flash) / 280)) + ')'; x.fillRect(0, 0, 340, 390) }
    x.fillStyle = '#1a1a1aee'; x.fillRect(0, 0, 340, 34); x.font = FONT; x.textAlign = 'left'; x.fillStyle = '#ff9f9f'; x.fillText((names()[0]).slice(0, 10) + ' ' + r.s[0], 8, 23); x.textAlign = 'right'; x.fillStyle = '#9fc2ff'; x.fillText((names()[1]).slice(0, 10) + ' ' + r.s[1], 332, 23); cap(x, Math.ceil(left / 1000) + '', 170, 25, left < 6000 ? '#ff9f9f' : '#ffc93c', 22);
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
    if (g == 'hurdle') { if (k == 'a' || k == 'ArrowLeft') hTap(0); else if (k == 'd' || k == 'ArrowRight') hTap(1); else if (k == ' ' || k == 'ArrowUp' || k == 'w') { e.preventDefault(); hJump() } }
    else if (g == 'stack') { if (k == ' ' || k == 'ArrowDown') { e.preventDefault(); tDrop() } }
    else if (g == 'sky') { if (k == 'a' || k == 'ArrowLeft') sTap(0); else if (k == 'd' || k == 'ArrowRight') sTap(1) }
  });
  return { msg, over() { if (X.r) X.r.over = 1 } };
})();
