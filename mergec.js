// ---- Blob Brawl (client) ----
// The server runs the physics for both jars. This file only draws them, smooths the snapshots and sends aim / drop / shake.
const MC = (function () {
  const BC = ['#ff6b9d', '#ff9f1c', '#ffd93c', '#8ac926', '#17a58a', '#4cc9f0', '#2563c9', '#9b5de5', '#e5392f'];
  const FONT = 'Lilita One,sans-serif', CW = 360, JX = 5, JY = 5;
  let CH = 470;
  const sn = () => Date.now() + (X.r ? X.r.so : 0);
  const names = () => [nm || 'You', on.opp || 'Friend'];
  const tn = (f, d, ty, v, sl, dl) => { try { if (Meta.sfxOn()) tone(f, d, ty, v, sl, dl) } catch (e) { } };
  const lerp = (a, b, f) => a + (b - a) * f;
  let SC = 1;                                             // current jar scale (keeps outlines readable in the small jar)
  const txt = (x, t, cx, cy, col, sz, al) => { x.font = '400 ' + sz + 'px ' + FONT; x.textAlign = al || 'center'; x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.lineJoin = 'round'; x.strokeText(t, cx, cy); x.fillStyle = col || '#fff6e0'; x.fillText(t, cx, cy) };

  // ---------- drawing ----------
  function blob(x, cx, cy, r, t, o) {
    o = o || {}; const sq = o.sq || 1, lw = Math.max(1.6 / SC, r * 0.13), big = r * SC > 6;
    x.save(); x.translate(cx, cy); if (sq != 1) x.scale(sq, sq); x.lineJoin = 'round';
    if (t >= 9) {                                         // junk stone
      x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + .3, rr = r * (k % 2 ? .93 : 1); x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) } x.closePath();
      x.fillStyle = '#9aa5b1'; x.fill(); x.lineWidth = lw; x.strokeStyle = '#1a1a1a'; x.stroke();
      x.fillStyle = '#7d8896'; x.beginPath(); x.arc(r * .35, r * .3, r * .18, 0, 7); x.arc(-r * .4, r * .4, r * .1, 0, 7); x.fill();
      x.strokeStyle = '#1a1a1a'; x.lineWidth = Math.max(1.2 / SC, r * .1); x.lineCap = 'round';
      if (t == 10) { x.beginPath(); x.moveTo(-r * .1, -r * .85); x.lineTo(r * .1, -r * .3); x.lineTo(-r * .2, r * .1); x.lineTo(r * .15, r * .6); x.stroke() }
      if (big) { const e = r * .3; x.beginPath(); [-1, 1].forEach(s => { x.moveTo(s * r * .35 - e * .4, -r * .2 - e * .4); x.lineTo(s * r * .35 + e * .4, -r * .2 + e * .4); x.moveTo(s * r * .35 + e * .4, -r * .2 - e * .4); x.lineTo(s * r * .35 - e * .4, -r * .2 + e * .4) }); x.stroke() }
      x.restore(); return;
    }
    const col = o.col || BC[t];
    if (t == 8 || (o.col && o.crown)) {                   // the red Blaze blob wears the crown
      x.beginPath(); x.moveTo(-r * .5, -r * .8); x.lineTo(-r * .55, -r * 1.35); x.lineTo(-r * .2, -r * 1.05); x.lineTo(0, -r * 1.5); x.lineTo(r * .2, -r * 1.05); x.lineTo(r * .55, -r * 1.35); x.lineTo(r * .5, -r * .8); x.closePath();
      x.fillStyle = '#ffc93c'; x.fill(); x.lineWidth = lw; x.strokeStyle = '#1a1a1a'; x.stroke();
    }
    x.beginPath(); x.arc(0, 0, r, 0, 7); x.fillStyle = col; x.fill(); x.lineWidth = lw; x.strokeStyle = '#1a1a1a'; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(-r * .42, -r * .5, r * .2, r * .12, -.7, 0, 7); x.fill();
    if (big) {
      const ey = -r * .1, ex = r * .36, er = r * .24, happy = t >= 7 || o.happy;
      x.lineWidth = Math.max(1 / SC, r * .06); x.strokeStyle = '#1a1a1a';
      [-1, 1].forEach(s => { x.beginPath(); x.arc(s * ex, ey, er, 0, 7); x.fillStyle = '#fff'; x.fill(); x.stroke(); x.beginPath(); x.arc(s * ex + (o.look || 0) * r * .06, ey + r * .03, er * .5, 0, 7); x.fillStyle = '#1a1a1a'; x.fill() });
      x.lineWidth = Math.max(1.3 / SC, r * .09); x.lineCap = 'round'; x.beginPath();
      if (!happy) { [-1, 1].forEach(s => { x.moveTo(s * (ex + er * 1.1), ey - er * 1.7); x.lineTo(s * (ex - er * .9), ey - er * .95) }); x.moveTo(-r * .2, r * .45); x.lineTo(r * .2, r * .45) }
      else { x.arc(0, r * .28, r * .26, .15 * Math.PI, .85 * Math.PI); }
      x.stroke();
    }
    x.restore();
  }
  function jar(x, r, i, ox, oy, s, fill) {
    SC = s; const W = r.W, H = r.Hh, p = r.cur ? r.cur[i] : null; x.save(); x.translate(ox, oy);
    const sk = r.shk[i] ? Math.max(0, 1 - (Date.now() - r.shk[i]) / 700) : 0; if (sk > 0) x.translate(Math.sin(Date.now() / 22) * 3 * sk, Math.cos(Date.now() / 17) * 2 * sk);
    x.fillStyle = fill; x.beginPath(); x.roundRect(-2 * s, -2 * s, (W + 4) * s, (H + 4) * s, 10); x.fill();
    x.save(); x.beginPath(); x.rect(0, 0, W * s, H * s); x.clip(); x.scale(s, s);
    // danger line
    const z = p ? p.z : 0;
    if (z > 0) { x.fillStyle = 'rgba(229,57,47,' + Math.min(.4, z * .22) * (.6 + .4 * Math.sin(Date.now() / 90)) + ')'; x.fillRect(0, 0, W, H) }
    x.strokeStyle = '#e5392f'; x.lineWidth = 2.6; x.setLineDash([8, 6]); x.beginPath(); x.moveTo(0, r.LN); x.lineTo(W, r.LN); x.stroke(); x.setLineDash([]);
    if (s > .7) { x.font = '400 11px ' + FONT; x.textAlign = 'left'; x.fillStyle = '#e5392f'; x.fillText('DANGER', 6, r.LN - 5) }
    return p;
  }
  function jarEnd(x, r, i, s, ox, oy, fr) {
    x.restore();
    x.lineWidth = 4; x.strokeStyle = '#1a1a1a'; x.beginPath(); x.roundRect(-2 * s, -2 * s, (r.W + 4) * s, (r.Hh + 4) * s, 10); x.stroke(); x.restore(); SC = 1;
  }
  // smoothed items of one jar: [{id,x,y,t}] at render time rt
  function items(r, i, rt) {
    const S = r.sn; if (!S.length) return []; let b = S[S.length - 1], a = b;
    for (let k = S.length - 1; k >= 0; k--) { if (S[k].ts <= rt) { a = S[k]; b = S[k + 1] || S[k]; break } if (k == 0) { a = b = S[0] } }
    const f = b.ts > a.ts ? Math.max(0, Math.min(1, (rt - a.ts) / (b.ts - a.ts))) : 1, out = [], bb = b.p[i].b;
    if (!a.m) a.m = [new Map(), new Map()]; if (!a.mf) { a.mf = [0, 0] }
    if (!a.mf[i]) { const mp = a.m[i], ab = a.p[i].b; for (let k = 0; k < ab.length; k += 4) mp.set(ab[k], k); a.mf[i] = 1 }
    for (let k = 0; k < bb.length; k += 4) { const id = bb[k], q = a.m[i].get(id), ab = a.p[i].b; let x = bb[k + 1], y = bb[k + 2]; if (q != null) { x = lerp(ab[q + 1], x, f); y = lerp(ab[q + 2], y, f) } out.push({ id, x, y, t: bb[k + 3] }) }
    return out;
  }
  function land(r, its, x, rad) {                         // where would a dropped blob rest? (for the guide line)
    let y = r.Hh - rad; for (const o of its) { const R = o.t >= 9 ? r.SR : r.RR[o.t], dx = Math.abs(x - o.x), m = rad + R; if (dx < m) { const yc = o.y - Math.sqrt(m * m - dx * dx); if (yc < y) y = yc } } return y;
  }
  function draw(x, r, now) {
    const rt = sn() - 90, me = r.me, op = 1 - me, cp = r.cur; if (!cp) return; const s = r.sc, W = r.W;
    const [n0, n1] = names();
    // ---- my jar (big, full width) ----
    const my = items(r, me, rt), mp = jar(x, r, me, JX, JY, s, '#fffaf0');
    const held = mp && now >= r.hide && mp.l == 0 && !r.over;
    if (held) {
      const rad = r.RR[mp.c], ax = Math.max(rad, Math.min(W - rad, r.aim)), ly = land(r, my, ax, rad);
      x.strokeStyle = 'rgba(26,26,26,.35)'; x.lineWidth = 2 / s; x.setLineDash([3, 5]); x.beginPath(); x.moveTo(ax, r.SP + rad); x.lineTo(ax, ly - rad + 2); x.stroke(); x.setLineDash([]);
      x.globalAlpha = .28; blob(x, ax, ly, rad, mp.c); x.globalAlpha = 1;
    }
    drawItems(x, r, my, now, me);
    if (held) blob(x, Math.max(r.RR[mp.c], Math.min(W - r.RR[mp.c], r.aim)), r.SP, r.RR[mp.c], mp.c, { look: 0 });
    else if (mp && mp.l > 0 && !r.over) txt(x, 'SHAKING...', W / 2, r.SP + 6, '#9b5de5', 16);
    if (r.ghost && now - r.ghost.t < 320) { const u = (now - r.ghost.t) / 1000, g = r.ghost; blob(x, g.x, r.SP + .5 * 1100 * u * u, r.RR[g.c], g.c) }
    fxDraw(x, r, now, me);
    jarEnd(x, r, me, s);
    // next chip
    SC = 1; x.fillStyle = '#ffc93c'; x.strokeStyle = '#1a1a1a'; x.lineWidth = 2.5; x.beginPath(); x.roundRect(JX + 8, JY + 8, 82, 28, 14); x.fill(); x.stroke();
    x.font = '400 14px ' + FONT; x.textAlign = 'left'; x.fillStyle = '#1a1a1a'; x.fillText('NEXT', JX + 17, JY + 28); blob(x, JX + 68, JY + 22, 10, mp.n, { look: 0 });
    if (mp.z > .4 && Math.floor(now / 160) % 2) txt(x, 'DANGER!', JX + W * s / 2, JY + r.LN * s + 34, '#ff6b6b', 24);
    // ---- opponent: small floating card, top right ----
    const os = 84 / W, ow = W * os, oh = r.Hh * os, px = CW - JX - ow - 14, py = JY + 12;
    x.save(); x.globalAlpha = .9; x.fillStyle = '#f1e6c8'; x.strokeStyle = '#1a1a1a'; x.lineWidth = 3.5; x.beginPath(); x.roundRect(px - 7, py - 7, ow + 14, oh + 38, 12); x.fill(); x.stroke();
    const opp = jar(x, r, op, px, py, os, '#f1e6c8'), ot = items(r, op, rt);
    drawItems(x, r, ot, now, op);
    if (!r.over && opp.l == 0) blob(x, Math.max(r.RR[opp.c], Math.min(W - r.RR[opp.c], opp.a)), r.SP, r.RR[opp.c], opp.c);
    fxDraw(x, r, now, op);
    jarEnd(x, r, op, os); SC = 1;
    x.font = '400 13px ' + FONT; x.textAlign = 'center'; x.fillStyle = '#1a1a1a'; x.fillText(n1.slice(0, 7) + '  ' + opp.s.toLocaleString('en-US'), px + ow / 2, py + oh + 20);
    if (opp.z > .3) { x.fillStyle = '#e5392f'; x.font = '400 11px ' + FONT; x.fillText('in danger!', px + ow / 2, py + oh + 32) }
    x.restore();
  }
  function drawItems(x, r, its, now, i) {
    const born = r.born[i], seen = r.seen[i];
    for (const o of its) {
      if (!born.has(o.id)) born.set(o.id, { t: now, m: o.y > r.SP + 14 });
      const bq = born.get(o.id), u = (now - bq.t) / 280; let sq = 1; if (bq.m && o.t < 9 && u < 1) sq = .62 + .38 * u + .32 * Math.sin(u * Math.PI);
      blob(x, o.x, o.y, o.t >= 9 ? r.SR : r.RR[o.t], o.t, { sq, look: 0 });
    }
    if (born.size > 400) born.clear();
  }
  function fxDraw(x, r, now, i) {
    r.fx = r.fx.filter(f => now - f.t < f.d);
    r.fx.forEach(f => {
      if (f.i != i) return; const u = (now - f.t) / f.d;
      if (f.k == 'ring') { x.globalAlpha = 1 - u; x.beginPath(); x.arc(f.x, f.y, f.r * (.8 + u * 1.1), 0, 7); x.lineWidth = 4 * (1 - u) + 1; x.strokeStyle = f.c; x.stroke(); for (let k = 0; k < 6; k++) { const a = k * 1.047 + f.r, d = f.r * (.9 + u * 1.6); x.beginPath(); x.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 3 * (1 - u) + .5, 0, 7); x.fillStyle = f.c; x.fill() } x.globalAlpha = 1 }
      else if (f.k == 'txt') { x.globalAlpha = Math.min(1, 2.2 * (1 - u)); txt(x, f.s, Math.max(40, Math.min(r.W - 40, f.x)), f.y - u * 36, f.c, f.z || 18); x.globalAlpha = 1 }
      else if (f.k == 'dust') { x.globalAlpha = 1 - u; x.fillStyle = '#9aa5b1'; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(f.x + (k - 2) * 7 * (.5 + u), f.y - u * 14 + (k % 2) * 4, 4 * (1 - u) + 1, 0, 7); x.fill() } x.globalAlpha = 1 }
    });
  }

  // ---------- messages ----------
  function init(d) {
    const c = $('#cd'); if (c) c.textContent = ''; cancelAnimationFrame(X.raf);
    const sc = (CW - 2 * JX) / d.W; CH = Math.ceil(d.H * sc + 2 * JY);
    const r = X.r = { sc, g: 'blob', k: d.k, ids: d.ids, me: d.ids.indexOf(pid), so: d.now - Date.now(), t0: d.startAt, over: 0, H: CH, W: d.W, Hh: d.H, LN: d.LN, SP: d.SP, RR: d.RR, SR: d.SR, sn: [], cur: null, fx: [], shk: [0, 0], born: [new Map(), new Map()], seen: [0, 0], aim: d.W / 2, hide: 0, lastS: 0, down: 0, ghost: null, lbl: '' };
    closed = 0;
    $('#gm').innerHTML = '<canvas id="cv" width="' + CW * 2 + '" height="' + CH * 2 + '" style="width:100%;max-width:' + CW + 'px;touch-action:none;border:4px solid #1a1a1a;border-radius:16px;background:#fff6e0;box-shadow:4px 4px 0 #1a1a1a;display:block;margin:0 auto"></canvas>'
      + '<div style="display:flex;align-items:center;gap:10px;max-width:' + CW + 'px;margin:12px auto 0"><div style="flex:none;min-width:108px;background:#fff6e0;border:4px solid #1a1a1a;border-radius:16px;padding:4px 10px;box-shadow:3px 3px 0 #1a1a1a;text-align:center;line-height:1.15;color:#1a1a1a"><small id="mnm" style="font:900 12px Nunito"></small><br><b id="msc" style="font:400 21px Lilita One,sans-serif">0</b></div><div id="mtm" style="flex:1;text-align:center;font:400 32px Lilita One,sans-serif;color:#fff6e0;-webkit-text-stroke:6px #1a1a1a;paint-order:stroke fill">2:30</div><button class="b cta" id="bsh" style="flex:none;width:auto;min-width:124px;margin:0;background:#8ecae6;color:#1a1a1a">SHAKE</button></div>'
      + '<small style="display:block;text-align:center;font-weight:900;margin-top:6px">' + (fine() ? 'Move the mouse to aim, click to drop. Keys: ◀ ▶ aim, Space drop, S shake' : 'Slide your finger to aim, lift to drop. SHAKE settles your pile') + '</small>';
    const cv = $('#cv'), pos = e => { const b = cv.getBoundingClientRect(), lx = (e.clientX - b.left) / b.width * CW; r.aim = Math.max(0, Math.min(d.W, (lx - JX) / sc)) };
    const go = () => { if (!r.cur) return; const cp = r.cur[r.me]; if (r.over || sn() < r.t0 || Date.now() < r.hide || cp.l > 0) return; const rad = r.RR[cp.c], ax = Math.max(rad, Math.min(r.W - rad, r.aim)); send({ t: 'in', k: r.k, a: 'd', x: Math.round(ax * 10) / 10 }); r.hide = Date.now() + 400; r.ghost = { t: Date.now(), x: ax, c: cp.c }; snd('drop') };
    const aimSend = () => { const n = Date.now(); if (n - r.lastS > 55) { r.lastS = n; send({ t: 'in', k: r.k, a: 'm', x: Math.round(r.aim * 10) / 10 }) } };
    cv.onpointermove = e => { if (e.pointerType == 'mouse' || r.down) { pos(e); aimSend() } };
    cv.onpointerdown = e => { e.preventDefault(); pos(e); aimSend(); if (e.pointerType == 'mouse') go(); else { r.down = 1; try { cv.setPointerCapture(e.pointerId) } catch (x) { } } };
    cv.onpointerup = e => { if (r.down) { r.down = 0; pos(e); go() } };
    cv.onpointercancel = () => { r.down = 0 };
    r.go = go; r.aimSend = aimSend;
    const sh = $('#bsh'); sh.onpointerdown = e => { e.preventDefault(); shk() };
    loop();
  }
  const fine = () => { try { return matchMedia('(pointer:fine)').matches } catch (e) { return false } };
  function shk() { const r = X.r; if (!r || r.g != 'blob' || r.over || sn() < r.t0 || !r.cur) return; const cp = r.cur[r.me]; if (cp.h > 0 || cp.l > 0) return; send({ t: 'in', k: r.k, a: 's' }); vib(20) }
  function loop() {
    const r = X.r, cv = $('#cv'); if (!r || !cv || view != 'play' || cur != r.g || closed) return;
    const x = cv.getContext('2d'), now = Date.now(); x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, CW, CH); draw(x, r, now);
    const w = r.t0 - sn(); if (w > 0) { const n = Math.ceil(w / 800); x.fillStyle = '#1a1a1acc'; x.fillRect(0, 0, CW, CH); txt(x, n > 2 ? 'READY' : n > 1 ? 'SET' : 'GO!', CW / 2, CH / 2 + 14, '#ffc93c', 54) }
    const b = $('#bsh'); if (b && r.cur) { const cp = r.cur[r.me], l = cp.l > 0 ? 'SHAKING...' : cp.h > 0 ? 'SHAKE · ' + Math.ceil(cp.h / 1000) + 's' : 'SHAKE'; if (l != r.lbl) { r.lbl = l; b.textContent = l; b.style.opacity = cp.h > 0 || cp.l > 0 ? .55 : 1 } }
    if (r.cur) { const me = r.me, l2 = Math.max(0, Math.ceil(r.cur[me].tl / 1000)), tm = Math.floor(l2 / 60) + ':' + String(l2 % 60).padStart(2, '0'), sc2 = r.cur[me].s.toLocaleString('en-US'), q = tm + '|' + sc2;
      if (q != r.dq) { r.dq = q; const a = $('#mtm'), c = $('#msc'), n = $('#mnm'); if (a) { a.textContent = tm; a.style.color = l2 < 20 ? '#ff6b6b' : '#fff6e0' } if (c) c.textContent = sc2; if (n) n.textContent = names()[0].slice(0, 10) } }
    X.raf = requestAnimationFrame(loop);
  }
  function upd(d) {
    const r = X.r; if (!r || d.k != r.k) return; const now = Date.now(), me = r.me;
    d.p.forEach(p => { });
    r.sn.push({ ts: d.now, p: d.p }); if (r.sn.length > 10) r.sn.shift(); r.cur = d.p.map(p => ({ ...p, b: null })); r.cur.forEach((c, i) => { c.b = d.p[i].b; c.tl = d.tm });
    if (r.ghost && d.p[me].b.length) { /* real blob arrived */ const b = d.p[me].b; for (let k = 0; k < b.length; k += 4) if (Math.abs(b[k + 1] - r.ghost.x) < 2 && b[k + 2] < r.SP + 40 && b[k + 3] == r.ghost.c) { r.ghost = null; break } }
    (d.ev || []).forEach(e => {
      const [k, i] = e, mine = i == me;
      if (k == 'm') { const [, , ex, ey, T, ch] = e, col = T > 8 ? '#ffc93c' : BC[Math.min(8, T)]; r.fx.push({ k: 'ring', i, x: ex, y: ey, t: now, d: 520, r: T > 8 ? 34 : r.RR[Math.min(8, T)], c: col });
        if (mine) { tn(260 + T * 75, .11, 'sine', .17, 420 + T * 95); if (ch >= 2) { r.fx.push({ k: 'txt', i, x: ex, y: ey - 14, t: now, d: 900, s: 'CHAIN x' + ch, c: '#ffc93c', z: 18 }); tn(500 + ch * 90, .12, 'triangle', .13, 0, .08) } if (T >= 6) { snd('point'); vib(25) } if (T > 8) { snd('win'); vib([40, 30, 80]) } } }
      else if (k == 's') { r.shk[i] = now; if (mine) snd('whoosh') }
      else if (k == 'c') { r.fx.push({ k: 'dust', i, x: e[2], y: e[3], t: now, d: 380 }); if (mine) snd('stone') }
      else if (k == 'x') { r.fx.push({ k: 'dust', i, x: e[2], y: e[3], t: now, d: 480 }); if (mine) snd('boom') }
    });
  }
  function msg(d) { if (d.t == 'mgs') { init(d); return 1 } if (d.t == 'mgu') { upd(d); return 1 } return 0 }
  document.addEventListener('keydown', e => {
    const r = X.r; if (view != 'play' || !r || r.g != 'blob' || r.over) return; const k = e.key;
    if (k == 'ArrowLeft' || k == 'a') { r.aim = Math.max(0, r.aim - 9); r.aimSend() } else if (k == 'ArrowRight' || k == 'd') { r.aim = Math.min(r.W, r.aim + 9); r.aimSend() }
    else if ((k == ' ' || k == 'ArrowDown') && !e.repeat) { e.preventDefault(); r.go() } else if ((k == 's' || k == 'Shift') && !e.repeat) shk();
  });
  return { msg, over() { if (X.r) X.r.over = 1 } };
})();
