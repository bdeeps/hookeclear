// Chapter 1: Hooke's law as a live experiment. Slotted masses hang on one, two or three identical
// springs, in series or in parallel, beside a metre rule. F = m g, x = F ÷ k, E = ½ k x².
// Series: each spring carries the whole load, so the stretches add and k_eff = k ÷ n.
// Parallel: the springs share the load, so k_eff = n × k.
// Bounce mode: a mass on a spring swings with period T = 2π √(m / k), whatever the amplitude
// (the spring's own mass is ignored; a light school spring adds about a third of its mass to m).
// Scale: 1 scene unit = 20 cm. Springs are 10 cm long unstretched, like a school lab spring
// (typically 10–50 N/m). The hanger is 50 g and each brass slotted mass is 50 g.
import { THREE, M, box, rod } from '../kit.js';
import {
  G, kEff, period, makeCoil, makeHook, makeHanger, makeRuler, board, panelBg, axes, title, dot, COL,
  forceArrow, fitNarrow, reelBoards, fmtN, fmtLen, fmtJ, fmtK, clamp,
} from '../hooke.js';

const U = 5, TOP = 5.7, L0 = 0.1, LINK = 0.08, XMAX = 0.5, FMAX = 5;
const REF = [30, 60, 120, 300];

export default {
  id: 'idea',
  short: 'The law, live',
  title: 'Twice the pull, twice the stretch',
  subtitle: 'Force = stiffness × stretch. Hang masses on springs and watch it hold.',
  view: { pos: [-0.9, 3.4, 9.4], target: [-0.9, 3.0, 0] },
  learn: `<p>Hang a mass on a spring and it stretches. Hang twice the mass and it stretches <b>twice as far</b>. Three times the mass, three times the stretch. That is <b>Hooke's law</b>: <b>F = k × x</b>.</p>
    <p><b>F</b> is the force pulling the spring, in newtons. A 100 g mass pulls with about 1 N. <b>x</b> is the <b>extension</b>, how much longer the spring gets. <b>k</b> is the <b>spring constant</b>, the stiffness: how many newtons it takes to stretch the spring by one metre. Plot force against extension and you get a <b>straight line</b> whose steepness is k.</p>
    <p>Stretching a spring stores <b>energy</b>: <b>E = ½ k x²</b>. On the chart it is the <b>area of the triangle</b> under the line. That energy is what flings a catapult and bounces a mass back up.</p>
    <p>Join springs <b>end to end</b> (in series) and each one carries the whole load, so the stretches add: two springs act like one spring <b>half as stiff</b>. Hang them <b>side by side</b> (in parallel) and they share the load: two act like one <b>twice as stiff</b>.</p>
    <p>Pull the mass down and let go, and it <b>bounces</b>. One swing takes <b>T = 2π √(m ÷ k)</b>, and the surprise is what's missing: the size of the swing. Big bounce or small, the timing is the same. That's why springs keep time in watches, and it is the start of <b>Waves and resonance</b>.</p>
    <p class="tip"><b>Try it:</b> add masses one at a time and watch the pointer step down the rule by equal amounts. Then switch to two springs, try series and parallel, and set it bouncing.</p>`,
  terms: [
    { t: 'Hooke’s law', d: 'The force on a spring is proportional to its extension: F = k × x.' },
    { t: 'Extension (x)', d: 'How much longer (or shorter) a spring is than its natural length.' },
    { t: 'Spring constant (k)', d: 'The stiffness of a spring: the force per metre of stretch, in newtons per metre (N/m).' },
    { t: 'Elastic energy', d: 'The energy stored in a stretched spring: ½ k x², the area under the force–extension line.' },
    { t: 'Series and parallel', d: 'End to end, springs get softer (k ÷ n). Side by side, they get stiffer (k × n).' },
    { t: 'Period (T)', d: 'The time for one full bounce: T = 2π √(m ÷ k), the same for big and small bounces.' },
  ],
  defaults: { m: 0.2, k: 30, n: 1, arr: 'series', mode: 'hang' },
  controls: [
    { key: 'm', type: 'range', label: 'Mass on the hanger', min: 0.05, max: 0.5, step: 0.05, ends: ['50 g (hanger)', '500 g'], fmt: (v) => Math.round(v * 1000) + ' g' },
    { key: 'k', type: 'log', label: 'Stiffness of each spring (k)', min: 30, max: 300, ends: ['30 N/m, soft', '300 N/m, stiff'], fmt: (v) => Math.round(v) + ' N/m' },
    { key: 'n', type: 'seg', label: 'Number of springs', options: [{ v: 1, label: 'One' }, { v: 2, label: 'Two' }, { v: 3, label: 'Three' }] },
    { key: 'arr', type: 'seg', label: 'Join them', options: [{ v: 'series', label: 'End to end' }, { v: 'parallel', label: 'Side by side' }] },
    { key: 'mode', type: 'seg', label: 'Experiment', options: [{ v: 'hang', label: 'Hang and measure' }, { v: 'bounce', label: 'Bounce' }] },
    { key: 'go', type: 'buttons', label: 'Bounce', items: [{ label: 'Pull down and let go', act: (s, inst) => { s.mode = 'bounce'; inst.pull(); } }] },
  ],
  quiz: [
    { q: 'A spring stretches 4 cm with a 200 g mass. How far with 600 g (still within its limit)?', options: ['4 cm', '8 cm', '12 cm', '36 cm'], answer: 2, why: 'Extension is proportional to force. Three times the mass, three times the stretch: 12 cm.' },
    { q: 'Two identical springs are hung end to end. Compared with one spring, the pair is…', options: ['twice as stiff', 'half as stiff', 'just as stiff', 'four times as stiff'], answer: 1, why: 'Each spring carries the whole load, so each stretches the full amount and the stretches add. k_eff = k ÷ 2.' },
    { q: 'You double the mass on a bouncing spring. The time for one bounce…', options: ['doubles', 'stays the same', 'grows about 1.4 times (√2)', 'halves'], answer: 2, why: 'T = 2π √(m ÷ k), so doubling m multiplies T by √2 ≈ 1.41.' },
  ],
  reel: [
    { ms: 5600, caption: 'Hooke’s law: pull twice as hard and a spring stretches twice as far. F = k × x.', set: { k: 30, n: 1, arr: 'series', mode: 'hang' }, anim: { m: [0.05, 0.5] }, view: { pos: [1.3, 5.3, 6.6], target: [1.3, 4.9, 0] }, spin: 0 },
    { ms: 5400, caption: 'Set it bouncing: one swing takes 2π √(m ÷ k), however big the bounce.', set: { k: 40, n: 1, arr: 'series', m: 0.3, mode: 'bounce' }, act: (s, inst) => inst.pull(), view: { pos: [1.3, 5.3, 6.6], target: [1.3, 4.9, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rig = new THREE.Group(); rig.position.x = 1.3; root.add(rig);
    // Retort stand: base, post and a top arm with a clamp.
    const iron = M.matte(0x3a3f4b, { roughness: 0.6 }), steel = M.metal(0xb9bec8);
    const base = box(3.0, 0.14, 1.6, iron); base.position.set(0.1, 0.07, 0); rig.add(base);
    const post = rod(0, TOP + 0.4, 0.06, 0.06, steel); post.rotation.z = Math.PI / 2; post.position.set(1.3, (TOP + 0.4) / 2, -0.3); rig.add(post);
    const arm = rod(-0.6, 1.3, 0.045, 0.045, steel); arm.position.set(0, TOP + 0.1, -0.3); rig.add(arm);
    const bar = box(1.4, 0.08, 0.16, iron); bar.position.set(0, TOP, 0); rig.add(bar);
    const clampB = box(0.14, 0.26, 0.4, iron); clampB.position.set(0, TOP + 0.1, -0.15); rig.add(clampB);
    const ruler = makeRuler(5.5, 1.1); ruler.position.set(-0.95, TOP, 0.05); rig.add(ruler);

    // Up to three springs, their hooks, links, a spreader bar and the hanger.
    const coilMat = M.metal(0xd0d5de, { roughness: 0.25 });
    const coils = [0, 1, 2].map(() => { const c = makeCoil({ turns: 12, R: 0.12, r: 0.017, mat: coilMat }); rig.add(c); return c; });
    const eyes = [0, 1, 2].map(() => { const e = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 20), coilMat); rig.add(e); return e; });
    const spreader = box(1.0, 0.06, 0.12, steel); rig.add(spreader);
    const hanger = makeHanger(9); rig.add(hanger);
    const hook = makeHook(coilMat); rig.add(hook);
    const pointer = box(0.62, 0.015, 0.015, M.glow(0xff7a59)); rig.add(pointer);
    const zeroMark = box(0.5, 0.012, 0.02, M.glow(0x8ef0ff, { transparent: true, opacity: 0.8 })); rig.add(zeroMark);
    const wArrow = forceArrow(0xffb547), sArrow = forceArrow(0x8ef0ff); wArrow.rotation.z = Math.PI; rig.add(wArrow, sArrow);

    // The chart: force–extension line (hang) or position–time trace (bounce).
    const trace = [];
    let cur = { m: 0.2, k: 25, ke: 25, x: 0.078, mode: 'hang', A: 0, T: 1 };
    const chart = board(root, 4.2, 3.15, 640, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (cur.mode === 'hang') {
        const { X, Y, x1 } = axes(g, w, h, { xMax: XMAX, yMax: FMAX, xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yTicks: [0, 1, 2, 3, 4, 5], xFmt: (v) => Math.round(v * 100) + ' cm', yFmt: (v) => v + ' N', xLabel: 'extension x →', yLabel: 'force F ↑' });
        title(g, 'Force vs extension');
        g.font = '16px sans-serif';
        for (const k of REF) { const xe = Math.min(XMAX, FMAX / k); g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xe), Y(k * xe)); g.stroke(); if (k === 30 || k === 120) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillText(k + ' N/m', X(xe) + 6, Y(k * xe) + 16); } }
        const F = cur.m * G, x = F / cur.ke;
        // stored energy: the triangle under the line
        g.fillStyle = COL.energy; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(Math.min(x, XMAX)), Y(0)); g.lineTo(X(Math.min(x, XMAX)), Y(cur.ke * Math.min(x, XMAX))); g.closePath(); g.fill();
        const xe = Math.min(XMAX, FMAX / cur.ke);
        g.strokeStyle = COL.line; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xe), Y(cur.ke * xe)); g.stroke();
        if (x <= XMAX) dot(g, X(x), Y(F), COL.hot, 11);
        g.fillStyle = COL.hot; g.font = 'bold 18px sans-serif';
        if (x > 0.09) g.fillText('area = ½kx²', X(x) + 12, Y(F * 0.25));
        g.fillStyle = COL.line; g.font = 'bold 21px sans-serif';
        const t = `k = ${Math.round(cur.ke)} N/m = slope`; g.fillText(t, x1 - g.measureText(t).width, 34);
      } else {
        const span = Math.max(0.005, cur.A * 1.15), tWin = 5;
        const { X, Y, x1 } = axes(g, w, h, { xMax: tWin, yMin: -span, yMax: span, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [-span, 0, span].map((v) => +v.toFixed(3)), xFmt: (v) => v + ' s', yFmt: (v) => (v * 100).toFixed(1) + ' cm', xLabel: 'time →', yLabel: 'below rest ↓' });
        title(g, 'Bounce: position vs time');
        if (trace.length > 1) {
          const tEnd = trace[trace.length - 1][0], t0 = Math.max(0, tEnd - tWin);
          g.strokeStyle = COL.line; g.lineWidth = 4; g.beginPath();
          trace.forEach(([t, y], i) => { if (t < t0) return; const px = X(t - t0), py = Y(clamp(y, -span, span)); i && trace[i - 1][0] >= t0 ? g.lineTo(px, py) : g.moveTo(px, py); });
          g.stroke();
          // bracket one period
          if (cur.T < tWin * 0.9) { const bx = X(0.3), ex = X(0.3 + cur.T); g.strokeStyle = COL.hot; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, 100); g.lineTo(bx, 88); g.lineTo(ex, 88); g.lineTo(ex, 100); g.stroke(); g.fillStyle = COL.hot; g.font = 'bold 19px sans-serif'; g.fillText(`T = ${cur.T.toFixed(2)} s`, Math.min(x1 - 110, ex + 8), 96); }
        }
        g.fillStyle = COL.line; g.font = 'bold 21px sans-serif'; const t = `m = ${Math.round(cur.m * 1000)} g · k = ${Math.round(cur.ke)} N/m`; g.fillText(t, x1 - g.measureText(t).width, 34);
      }
    }, [-2.75, 2.15, -0.2]);
    chart.mesh.rotation.y = 0.2;

    const lSpring = stage.label('', [0.9, TOP - 0.55, 0], rig);
    const lLoad = stage.label('', [0.9, 2, 0], rig, 'hot');
    const lZero = stage.label('no load', [-1.55, 5, 0], rig);
    const lRule = stage.label('metre rule', [-0.95, 0.55, 0.3], rig);

    let xs = 0.078, v = 0, bt = 0, key = '', lastTrace = 0;
    const sim = { A: 0 };
    return {
      pull() {
        const F = cur.m * G, ke = cur.ke, x0 = F / ke;
        sim.A = Math.min(0.05, 0.8 * x0);
        xs = x0 + sim.A; v = 0; trace.length = 0; bt = 0;
      },
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lZero, lRule]);
        reelBoards([[chart, [1.3, 8.3, -0.2], 1.25]]);
        const ke = kEff(s.k, s.n, s.arr), F = s.m * G, xeq = F / ke;
        if (s.mode === 'bounce') {
          // m x'' = m g − k x − c x', light damping (ζ = 0.015), a few substeps per frame.
          const w0 = Math.sqrt(ke / s.m), zeta = 0.015, N = 8, h = dt / N;
          for (let i = 0; i < N; i++) { const a = -w0 * w0 * (xs - xeq) - 2 * zeta * w0 * v; v += a * h; xs += v * h; }
          bt += dt;
          if (bt - lastTrace > 1 / 30 || bt < lastTrace) { lastTrace = bt; trace.push([bt, xs - xeq]); if (trace.length > 400) trace.shift(); }
        } else { xs = xs + (xeq - xs) * (1 - Math.exp(-8 * dt)); v = 0; }
        // Lay out the springs.
        const n = s.n, par = s.arr === 'parallel', eachX = par ? xs : xs / n, coilLen = (L0 + eachX) * U;
        let bottom;
        coils.forEach((c, i) => {
          c.visible = i < n; eyes[i].visible = i < n && !par && i > 0;
          if (i >= n) return;
          if (par) { c.position.set((i - (n - 1) / 2) * 0.42, TOP - 0.05, 0); c.setLength(coilLen); bottom = TOP - 0.05 - coilLen; }
          else { const y0 = TOP - 0.05 - i * (L0 * U + LINK) - i * eachX * U; c.position.set(0, y0, 0); c.setLength(coilLen); if (i > 0) eyes[i].position.set(0, y0 + LINK / 2, 0); bottom = y0 - coilLen; }
        });
        spreader.visible = par && n > 1; spreader.scale.x = (n - 1) * 0.42 / 1.0 + 0.25; spreader.position.set(0, bottom - 0.03, 0);
        const top = bottom - (par && n > 1 ? 0.06 : 0);
        hook.position.set(0, top, 0);
        hanger.position.set(0, top - 0.26, 0);
        hanger.setCount(Math.round((s.m - 0.05) / 0.05));
        pointer.position.set(-0.5, top - 0.26, 0.05);
        // Where the pointer would sit with no load at all.
        const topNo = TOP - 0.05 - (par ? L0 * U : n * L0 * U + (n - 1) * LINK) - (par && n > 1 ? 0.06 : 0) - 0.26;
        zeroMark.position.set(-0.95, topNo, 0.08);
        lZero.position.set(-1.6, topNo, 0.1);
        const Fs = ke * xs;
        wArrow.position.set(0.55, top - 0.26 - hanger.height * 0.3, 0); wArrow.set(F * 0.28);
        sArrow.position.set(0.55, top - 0.26 - hanger.height * 0.3 + 0.02, 0); sArrow.set(Math.max(0, Fs) * 0.28);
        lSpring.position.set(par ? 0.5 + (n - 1) * 0.21 : 0.62, TOP - 0.45, 0);
        lSpring.element.innerHTML = `${n > 1 ? `${n} springs ${par ? 'side by side' : 'end to end'}<br>` : ''}k = <b>${fmtK(ke)}</b>`;
        lLoad.position.set(0.95, top - 0.26 - hanger.height * 0.3, 0);
        lLoad.element.innerHTML = `weight <b>${fmtN(F)}</b>${s.mode === 'bounce' ? `<br>spring <b>${fmtN(Math.max(0, Fs))}</b>` : ''}`;
        // Redraw the chart when something changes (every frame while it bounces).
        cur = { m: s.m, k: s.k, ke, x: xs, mode: s.mode, A: sim.A || xeq * 0.5, T: period(s.m, ke) };
        const kk = `${s.m}|${s.k.toFixed(2)}|${s.n}|${s.arr}|${s.mode}`;
        if (kk !== key) { if (s.mode === 'bounce' && !key.endsWith('bounce')) this.pull(); key = kk; chart.redraw(); }
        else if (s.mode === 'bounce') chart.redraw();
      },
      readout: (s) => {
        const ke = kEff(s.k, s.n, s.arr), F = s.m * G, x = F / ke, E = 0.5 * ke * x * x, T = period(s.m, ke);
        if (s.mode === 'bounce') return `<div class="big">T = 2π √(m ÷ k) = ${T.toFixed(2)} s</div>
          <div class="row"><span>Bounces per second</span><b>${(1 / T).toFixed(2)} Hz</b></div>
          <div class="row"><span>Mass · stiffness</span><b>${Math.round(s.m * 1000)} g · ${fmtK(ke)}</b></div>
          <small>Big bounce or small, each one takes the same time. Four times the mass doubles it.</small>`;
        return `<div class="big">x = F ÷ k = ${fmtLen(x)}</div>
          <div class="row"><span>Force, F = m × g</span><b>${fmtN(F)}</b></div>
          <div class="row"><span>Stiffness${s.n > 1 ? (s.arr === 'parallel' ? `, ${s.n} × k` : `, k ÷ ${s.n}`) : ''}</span><b>${fmtK(ke)}</b></div>
          <div class="row"><span>Energy stored, ½ k x²</span><b>${fmtJ(E)}</b></div>
          <small>Each 50 g disc adds the same ${fmtLen(0.05 * G / ke)} of stretch.</small>`;
      },
    };
  },
};
