// Chapter 5: where Hooke's law stops.
// Steel: a tensile test on a mild-steel bar, 10 mm across with a 50 mm gauge length (A = 78.5 mm²).
// Stress = E × strain with E = 200 GPa up to the yield point, 250 MPa at 0.125 % strain (typical
// structural steel such as S250 or ASTM A36: yield about 250 MPa, tensile strength 400–550 MPa,
// elongation at break 20–25 %). After yield: a flat yield plateau to about 1.5 %, strain hardening to
// 400 MPa at 20 %, then necking and fracture at 25 %. Let go and it springs back along a line of
// slope E, keeping a permanent stretch ε − σ ÷ E. So the bar alone is a spring of k = E A ÷ L =
// 314 kN per mm, until yield. Scale: 1 unit = 1 cm.
// Rubber: a rubber band, stretch ratio λ from 1 to 6. The Gent model, a standard fit for rubber:
// σ = μ (λ − 1/λ²) × Jm ÷ (Jm − (λ² + 2/λ − 3)), with μ = 1 MPa (so a small-stretch modulus of
// 3 MPa) and Jm = 40 (it stiffens sharply near 6×). Coming back, the band pulls less than it did on
// the way out (hysteresis); we take the return curve about 25 % lower at mid-stretch, a rough value
// for natural rubber. The lost energy warms the band. Young's modulus for rubber is quoted from about
// 0.001 to 0.1 GPa depending on the compound; steel is about 200 GPa.
// Myth: two springs, k = 100 N/m and 400 N/m. For the same force F, E = F² ÷ 2k, so the soft spring
// stores 4 times more. For the same stretch x, E = ½ k x², so the stiff one does. Scale: 1 unit = 5 cm.
import { THREE, M, box, rod, sphere, canvasTexture } from '../kit.js';
import {
  makeCoil, makeHook, makeHanger, board, panelBg, axes, title, dot, COL, fitNarrow, reelBoards, inReel, fmtN, fmtLen, fmtJ, clamp, TAU,
} from '../hooke.js';

const ST = { E: 200e9, sy: 250e6, su: 400e6, eP: 0.015, eU: 0.2, eF: 0.25, A: Math.PI * 0.005 ** 2, L: 0.05 };
ST.ey = ST.sy / ST.E;
function steelS(e) {
  if (e <= ST.ey) return ST.E * e;
  if (e <= ST.eP) return ST.sy;
  if (e <= ST.eU) { const u = (e - ST.eP) / (ST.eU - ST.eP); return ST.sy + (ST.su - ST.sy) * (1 - (1 - u) ** 2); }
  const u = (e - ST.eU) / (ST.eF - ST.eU); return ST.su - 70e6 * u * u;
}
const RB = { mu: 1e6, Jm: 40 };
const rubberS = (l) => { const I = l * l + 2 / l - 3; return RB.mu * (l - 1 / (l * l)) * RB.Jm / Math.max(0.5, RB.Jm - I); };
const rubberBack = (l, lmax) => { if (lmax <= 1.001) return rubberS(l); const u = (l - 1) / (lmax - 1); return rubberS(l) * (1 - 0.25 * Math.sin(Math.PI * clamp(u, 0, 1)) - 0.12 * (1 - u)); };
const MY = { k1: 100, k2: 400, U: 20, L0: 0.1 };
const RX = 30, MX = 60;
const VIEWS = {
  steel: { pos: [-2.2, 7.0, 23.5], target: [-2.2, 5.6, 0] },
  rubber: { pos: [RX + 5.2, 6.0, 15], target: [RX + 5.2, 2.6, 0] },
  myth: { pos: [MX - 4.0, 6.6, 23], target: [MX - 4.0, 5.0, 0] },
};

export default {
  id: 'limits',
  short: 'Where it breaks',
  title: 'Past the elastic limit',
  subtitle: 'Steel that stays stretched, rubber that curves, and a myth about stiff springs.',
  view: VIEWS.steel,
  learn: `<p>Hooke's law is a promise with small print: it holds only for <b>small</b> stretches. Engineers write it for materials as <b>stress = E × strain</b>. Stress is force per area; strain is stretch per length; <b>E</b> is <b>Young's modulus</b>, the stiffness of the stuff itself. Steel's is about <b>200 GPa</b>. Rubber's is roughly <b>0.001 to 0.1 GPa</b>, thousands of times floppier.</p>
    <p><b>Steel.</b> Pull a steel bar and it obeys Hooke's law perfectly, but only up to about <b>0.1 % stretch</b>. That is the <b>elastic limit</b>, or <b>yield point</b>. Let go before it and the bar returns exactly to its length. Go past it and the atoms start to slide: it <b>stays stretched</b> (plastic deformation). Keep pulling and it can stretch 20 % or more, thin in the middle (necking) and finally <b>break</b>. That is why an over-stretched spring never goes back.</p>
    <p><b>Rubber</b> never had a straight line. A band stretches easily at first, then stiffens sharply near six times its length. And it pulls back less than you pulled it out: that lost energy becomes heat. Stretch a band fast against your lip and feel it warm up. A bungee cord is rubber, which is why crews test and change cords so often.</p>
    <p><b>Myth-buster: “A stiffer spring stores more energy.”</b> Not for the same force! Hang the same weight on a soft and a stiff spring: the soft one stretches further, and energy is <b>F² ÷ 2k</b>, so it stores <b>more</b>. That is why archers and catapult builders chase long, springy draws. Only when you stretch both the <b>same distance</b> does the stiff one win.</p>
    <p class="tip"><b>Try it:</b> pull the steel past 0.125 % and let go: it keeps a permanent stretch. Stretch the rubber band and bring it back to see the loop. Then compare the two springs.</p>`,
  terms: [
    { t: 'Stress', d: 'Force per area, in pascals (N/m²) or megapascals (MPa).' },
    { t: 'Strain', d: 'Stretch divided by original length. 0.1 % strain is 1 mm per metre.' },
    { t: 'Young’s modulus (E)', d: 'A material’s stiffness: stress ÷ strain in its straight-line part. Steel about 200 GPa.' },
    { t: 'Elastic limit (yield point)', d: 'The largest stress a material can take and still spring fully back.' },
    { t: 'Plastic deformation', d: 'Permanent change of shape after the elastic limit is passed.' },
    { t: 'Hysteresis', d: 'When unloading follows a different path from loading. The loop’s area is energy turned to heat.' },
  ],
  defaults: { focus: 'steel', eps: 0.0008, hand: 'pull', lam: 3, F: 10, same: 'force' },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'steel', label: 'Steel bar' }, { v: 'rubber', label: 'Rubber band' }, { v: 'myth', label: 'Myth-buster' }] },
    { key: 'eps', type: 'log', label: 'Steel: pull (strain)', min: 0.0001, max: 0.26, ends: ['0.01 %', '26 %'], fmt: (v) => (v * 100).toFixed(v < 0.01 ? 3 : 1) + ' %', hint: 'The scale is stretched out: Hooke’s law lives in the first sliver.' },
    { key: 'hand', type: 'seg', label: 'Steel: the machine', options: [{ v: 'pull', label: 'Pulling' }, { v: 'free', label: 'Let go' }] },
    { key: 'go', type: 'buttons', label: 'Steel', items: [{ label: 'Fit a fresh bar', act: (s, inst) => { s.focus = 'steel'; s.eps = 0.0008; s.hand = 'pull'; inst.fresh(); } }] },
    { key: 'lam', type: 'range', label: 'Rubber: stretch', min: 1, max: 6, step: 0.02, ends: ['1×', '6× its length'], fmt: (v) => v.toFixed(1) + '×' },
    { key: 'F', type: 'range', label: 'Myth: weight on each spring', min: 0, max: 20, step: 0.5, ends: ['0 N', '20 N'], fmt: (v) => v.toFixed(1) + ' N' },
    { key: 'same', type: 'seg', label: 'Myth: compare at the same…', options: [{ v: 'force', label: 'Force' }, { v: 'stretch', label: 'Stretch' }] },
  ],
  onChange(s, key) {
    if (key === 'eps' || key === 'hand') s.focus = 'steel';
    if (key === 'lam') s.focus = 'rubber';
    if (key === 'F' || key === 'same') s.focus = 'myth';
  },
  quiz: [
    { q: 'A steel bar is stretched past its yield point, then released. It…', options: ['returns exactly to its old length', 'stays a little longer for good', 'shrinks shorter than before', 'snaps at once'], answer: 1, why: 'Past the elastic limit, the metal deforms plastically. It springs back only by σ ÷ E and keeps the rest of the stretch.' },
    { q: 'Steel’s Young’s modulus is about…', options: ['200 Pa', '200 kPa', '200 MPa', '200 GPa'], answer: 3, why: 'About 200 billion pascals. You need 200 MPa of stress for just 0.1 % of stretch.' },
    { q: 'Hang the same weight on a soft and a stiff spring. Which stores more energy?', options: ['The stiff one', 'The soft one', 'Both the same', 'Neither stores energy'], answer: 1, why: 'Same force: E = F² ÷ 2k. Smaller k, more energy, because the soft spring stretches further.' },
  ],
  reel: [
    { ms: 5600, caption: 'Pull steel past its elastic limit and it stays stretched. Keep going and it snaps.', set: { focus: 'steel', hand: 'pull' }, act: (s, inst) => inst.fresh(), anim: { eps: [0.0003, 0.26, true] }, view: { pos: [0.8, 10, 11.5], target: [0.8, 9.6, 0] }, spin: 0 },
    { ms: 5400, caption: 'Myth: a stiffer spring stores more energy. Same weight? The soft one stores four times more.', set: { focus: 'myth', same: 'force' }, anim: { F: [2, 20] }, view: { pos: [MX + 0.6, 10, 11.5], target: [MX + 0.6, 9.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gR = new THREE.Group(), gM = new THREE.Group(); root.add(gS, gR, gM);
    gR.position.x = RX; gM.position.x = MX;

    // ------------------------------------------------ steel: a tensile-test machine
    const iron = M.matte(0x3a3f4b, { roughness: 0.6 }), steelM = M.metal(0xb9bec8, { roughness: 0.3 });
    const baseS = box(6, 0.5, 2.4, iron); baseS.position.set(0, 0.25, 0); gS.add(baseS);
    for (const x of [-2.2, 2.2]) { const c = rod(0, 12, 0.18, 0.18, steelM); c.rotation.z = Math.PI / 2; c.position.set(x, 6, 0); gS.add(c); }
    const topS = box(6, 0.6, 2.4, iron); topS.position.set(0, 12.1, 0); gS.add(topS);
    const cross = box(5.2, 0.6, 1.8, M.plastic(0x2e6bd6)); gS.add(cross);
    const gripLo = box(1.2, 1.2, 1.2, iron); gripLo.position.set(0, 1.1, 0); gS.add(gripLo);
    const gripHi = box(1.2, 1.2, 1.2, iron); gS.add(gripHi);
    // The bar: shoulders in the grips and a 5 cm gauge section, lathed; its middle can neck down.
    const barMat = M.metal(0xd0d5de, { roughness: 0.25 });
    const NB = 30, barGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 24, NB, false);
    const barBase = Float32Array.from(barGeo.attributes.position.array);
    const bar = new THREE.Mesh(barGeo, barMat); bar.castShadow = true; bar.frustumCulled = false; gS.add(bar);
    const barTop = new THREE.Mesh(barGeo.clone(), barMat); gS.add(barTop); barTop.visible = false;
    const shLo = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.0, 24), barMat); shLo.position.set(0, 2.0, 0); gS.add(shLo);
    const shHi = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.0, 24), barMat); gS.add(shHi);
    // A dial gauge (extensometer): one turn of the needle = 0.1 mm.
    let dialVal = 0;
    const dialTex = canvasTexture(256, 256, (g, W) => {
      g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 4, 0, TAU); g.fill();
      g.strokeStyle = '#222'; for (let i = 0; i < 100; i++) { const a = (i / 100) * TAU - Math.PI / 2, L = i % 10 ? 10 : 22; g.lineWidth = i % 10 ? 1.5 : 3; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * 112, W / 2 + Math.sin(a) * 112); g.lineTo(W / 2 + Math.cos(a) * (112 - L), W / 2 + Math.sin(a) * (112 - L)); g.stroke(); }
      g.fillStyle = '#222'; g.font = 'bold 20px sans-serif'; g.fillText('0.001 mm', W / 2 - 42, W / 2 + 50);
      const a = (dialVal / 0.1) * TAU - Math.PI / 2; g.strokeStyle = '#b3261e'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2 + Math.cos(a) * 100, W / 2 + Math.sin(a) * 100); g.stroke();
      const turns = Math.floor(dialVal / 0.1); g.fillStyle = '#b3261e'; g.font = 'bold 22px monospace'; const t = `${turns} turns`; g.fillText(t, W / 2 - g.measureText(t).width / 2, W / 2 - 30);
    });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(1.0, 40), new THREE.MeshBasicMaterial({ map: dialTex.tex, toneMapped: false })); dial.position.set(3.6, 4.2, 0.3); gS.add(dial);
    const dialRim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.08, 10, 40), M.metal(0xc9ced8)); dialRim.position.copy(dial.position); gS.add(dialRim);
    const lBar = stage.label('', [-3.4, 5, 0.6], gS, 'hot');
    const lDial = stage.label('extensometer', [3.6, 2.9, 0.3], gS);

    // ------------------------------------------------ rubber band between two pegs
    const pegL = rod(0, 1.6, 0.18, 0.18, M.metal(0xd8dde6)); pegL.rotation.z = Math.PI / 2; gR.add(pegL);
    const pegR = rod(0, 1.6, 0.18, 0.18, M.metal(0xd8dde6)); pegR.rotation.z = Math.PI / 2; gR.add(pegR);
    const boardR = box(16, 0.3, 3, M.matte(0x7a5234)); boardR.position.set(4.5, 0.15, 0); gR.add(boardR);
    const bandMat = M.plastic(0xd8573a, { roughness: 0.6 });
    const bandA = box(1, 0.2, 0.12, bandMat), bandB = box(1, 0.2, 0.12, bandMat); gR.add(bandA, bandB);
    const bandEnds = [0, 1].map(() => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 10, 20, Math.PI), bandMat); gR.add(t); return t; });
    const rulerR = box(15, 0.02, 0.5, M.matte(0xf3e7c4)); rulerR.position.set(4.5, 0.32, 1.2); gR.add(rulerR);
    const lBand = stage.label('', [4.5, 3.4, 0], gR, 'hot');
    const heat = []; for (let i = 0; i < 10; i++) { const h = sphere(0.1, M.ghost(0xff9a4a, 0.5)); gR.add(h); heat.push(h); }

    // ------------------------------------------------ myth: soft and stiff springs, same load
    const TOPM = 9.2;
    const frame = box(7, 0.3, 1.2, iron); frame.position.set(0, TOPM + 0.15, 0); gM.add(frame);
    for (const x of [-3.3, 3.3]) { const c = rod(0, TOPM, 0.12, 0.12, steelM); c.rotation.z = Math.PI / 2; c.position.set(x, TOPM / 2, 0); gM.add(c); }
    const baseM = box(7, 0.3, 2, iron); baseM.position.set(0, 0.15, 0); gM.add(baseM);
    const mk = (x, color, turns, R, r) => {
      const c = makeCoil({ turns, R, r, mat: M.metal(color, { roughness: 0.3 }) }); c.position.set(x, TOPM, 0); gM.add(c);
      const h = makeHook(M.metal(0xd8dde6), 2); gM.add(h);
      const w = makeHanger(8, 0.14, 0.45); gM.add(w);
      return { c, h, w, x };
    };
    const soft = mk(-1.6, 0x8ef0ff, 14, 0.4, 0.035), stiff = mk(1.6, 0xffb547, 10, 0.4, 0.075);
    const glowS = sphere(0.1, M.glow(0x8ef0ff)), glowT = sphere(0.1, M.glow(0xffb547)); gM.add(glowS, glowT);
    const lSoft = stage.label('', [-1.6, TOPM + 1.0, 0], gM, 'hot'); lSoft.center.set(1, 0.5);
    const lStiff = stage.label('', [1.6, TOPM + 1.0, 0], gM, 'hot'); lStiff.center.set(0, 0.5);

    // ------------------------------------------------ chart
    let cur = { focus: 'steel', e: 0.0008, eMax: 0.0008, free: false, broken: false, lam: 3, lmax: 3, back: false, F: 10, same: 'force' };
    const chart = board(root, 6.4, 4.8, 640, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (cur.focus === 'steel') {
        const { X, Y } = axes(g, w, h, { y1: 96, xMax: 0.26, yMax: 450e6, xTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yTicks: [0, 100e6, 200e6, 300e6, 400e6], xFmt: (v) => Math.round(v * 100) + '%', yFmt: (v) => v / 1e6 + '', xLabel: 'strain →', yLabel: 'stress, MPa ↑' });
        title(g, 'Mild steel: stress vs strain', 'Hooke’s law is the nearly vertical sliver at the left');
        g.strokeStyle = COL.line; g.lineWidth = 5; g.beginPath();
        for (let i = 0; i <= 200; i++) { const e = (i / 200) * ST.eF; i ? g.lineTo(X(e), Y(steelS(e))) : g.moveTo(X(e), Y(steelS(e))); }
        g.stroke();
        g.strokeStyle = COL.warn; g.lineWidth = 3; const fx = X(ST.eF), fy = Y(steelS(ST.eF)); g.beginPath(); g.moveTo(fx - 9, fy - 9); g.lineTo(fx + 9, fy + 9); g.moveTo(fx + 9, fy - 9); g.lineTo(fx - 9, fy + 9); g.stroke();
        g.fillStyle = COL.warn; g.font = '16px sans-serif'; g.fillText('breaks', fx - 60, fy + 26);
        const sNow = cur.free ? 0 : steelS(cur.e);
        if (cur.eMax > ST.ey && !cur.broken) { const sM = steelS(cur.eMax); g.setLineDash([6, 6]); g.strokeStyle = COL.hot; g.lineWidth = 2; g.beginPath(); g.moveTo(X(cur.eMax), Y(sM)); g.lineTo(X(cur.eMax - sM / ST.E), Y(0)); g.stroke(); g.setLineDash([]); }
        if (!cur.broken) dot(g, X(cur.e), Y(sNow), COL.hot, 9);
        // Inset: the first 0.3 %, where Hooke's law lives.
        const ix0 = 380, iy0 = 378, iw = 220, ih = 78;
        g.fillStyle = 'rgba(20,24,34,.95)'; g.fillRect(ix0 - 50, iy0 - ih - 30, iw + 70, ih + 62); g.strokeStyle = 'rgba(255,255,255,.3)'; g.strokeRect(ix0 - 50, iy0 - ih - 30, iw + 70, ih + 62);
        const IX = (e) => ix0 + (e / 0.003) * iw, IY = (s) => iy0 - (s / 300e6) * ih;
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ix0, iy0 - ih); g.lineTo(ix0, iy0); g.lineTo(ix0 + iw, iy0); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '14px sans-serif'; g.fillText('0.3%', ix0 + iw - 26, iy0 + 18); g.fillText('0', ix0 - 4, iy0 + 18); g.fillText('250', ix0 - 34, IY(250e6) + 5);
        g.strokeStyle = COL.line; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 60; i++) { const e = (i / 60) * 0.003; i ? g.lineTo(IX(e), IY(steelS(e))) : g.moveTo(IX(e), IY(steelS(e))); } g.stroke();
        g.fillStyle = COL.hot; g.font = 'bold 14px sans-serif'; g.fillText('yield point', IX(ST.ey) + 6, IY(ST.sy) - 8);
        g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '14px sans-serif'; g.fillText('straight: E = 200 GPa', ix0 + 4, iy0 - ih - 12);
        if (cur.e <= 0.003 && !cur.broken) dot(g, IX(cur.e), IY(sNow), COL.hot, 6);
      } else if (cur.focus === 'rubber') {
        const { X, Y } = axes(g, w, h, { y1: 96, xMin: 1, xMax: 6, yMax: 30e6, xTicks: [1, 2, 3, 4, 5, 6], yTicks: [0, 10e6, 20e6, 30e6], xFmt: (v) => v + '×', yFmt: (v) => v / 1e6 + '', xLabel: 'stretch →', yLabel: 'stress, MPa ↑' });
        title(g, 'Rubber band: no straight line', 'dashed: what Hooke’s law would predict');
        g.setLineDash([7, 7]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(1), Y(0)); g.lineTo(X(6), Y(3 * RB.mu * 5)); g.stroke(); g.setLineDash([]);
        const lm = Math.max(cur.lmax, cur.lam);
        if (cur.back && lm > 1.2) {
          g.fillStyle = 'rgba(255,122,89,.25)'; g.beginPath();
          for (let i = 0; i <= 60; i++) { const l = 1 + (lm - 1) * (i / 60); i ? g.lineTo(X(l), Y(rubberS(l))) : g.moveTo(X(l), Y(rubberS(l))); }
          for (let i = 60; i >= 0; i--) { const l = 1 + (lm - 1) * (i / 60); g.lineTo(X(l), Y(rubberBack(l, lm))); }
          g.fill();
          g.strokeStyle = COL.warn; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 60; i++) { const l = 1 + (lm - 1) * (i / 60); i ? g.lineTo(X(l), Y(rubberBack(l, lm))) : g.moveTo(X(l), Y(rubberBack(l, lm))); } g.stroke();
          g.fillStyle = COL.warn; g.font = 'bold 16px sans-serif'; g.fillText('loop = energy lost as heat', X(1.3), Y(rubberS(lm)) - 10 < 110 ? 130 : Y(rubberS(lm) * 0.8));
        }
        g.strokeStyle = COL.line; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 100; i++) { const l = 1 + 5 * (i / 100); i ? g.lineTo(X(l), Y(rubberS(l))) : g.moveTo(X(l), Y(rubberS(l))); } g.stroke();
        dot(g, X(cur.lam), Y(cur.back ? rubberBack(cur.lam, lm) : rubberS(cur.lam)), COL.hot, 9);
      } else {
        const xMax = 0.25, FM = 20;
        const { X, Y } = axes(g, w, h, { y1: 96, xMax, yMax: FM, xTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yTicks: [0, 5, 10, 15, 20], xFmt: (v) => Math.round(v * 100) + ' cm', yFmt: (v) => v + ' N', xLabel: 'stretch →', yLabel: 'force ↑' });
        title(g, 'Energy = area under each line', cur.same === 'force' ? 'same force on both springs' : 'both stretched the same distance');
        const pts = cur.same === 'force' ? [[MY.k1, cur.F / MY.k1], [MY.k2, cur.F / MY.k2]] : [[MY.k1, cur.F / MY.k2], [MY.k2, cur.F / MY.k2]];
        const cols = [['rgba(142,240,255,.28)', '#8ef0ff'], ['rgba(255,181,71,.35)', '#ffb547']];
        pts.forEach(([k, x], i) => { const xx = Math.min(x, xMax); g.fillStyle = cols[i][0]; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xx), Y(0)); g.lineTo(X(xx), Y(k * xx)); g.closePath(); g.fill(); });
        [[MY.k1, 0], [MY.k2, 1]].forEach(([k, i]) => { const xe = Math.min(xMax, FM / k); g.strokeStyle = cols[i][1]; g.lineWidth = 5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xe), Y(k * xe)); g.stroke(); });
        pts.forEach(([k, x], i) => { if (x <= xMax) dot(g, X(x), Y(k * x), cols[i][1], 8); });
        g.font = 'bold 17px sans-serif'; g.fillStyle = cols[0][1]; g.fillText('soft, 100 N/m', X(0.16), Y(15.5)); g.fillStyle = cols[1][1]; g.fillText('stiff, 400 N/m', X(0.052) + 10, Y(19));
      }
    }, [10.2, 6.0, -1.5]);
    chart.mesh.rotation.y = -0.2;

    const st = { eMax: 0.0008, broken: false, lmax: 1, lamPrev: 3, back: false };
    let lastFocus = null, key = '';
    const P = barGeo.attributes.position.array;
    return {
      fresh() { st.eMax = 0; st.broken = false; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lDial]);
        gS.visible = s.focus === 'steel'; gR.visible = s.focus === 'rubber'; gM.visible = s.focus === 'myth';
        if (s.focus !== lastFocus) {
          if (lastFocus !== null && !inReel()) stage.setView(VIEWS[s.focus].pos, VIEWS[s.focus].target, 1.0);
          lastFocus = s.focus; chart.home = null;
          const off = s.focus === 'rubber' ? RX : s.focus === 'myth' ? MX : 0;
          chart.mesh.position.set(...(s.focus === 'rubber' ? [RX + 9.4, 5.0, -1.5] : s.focus === 'myth' ? [MX - 10.2, 3.4, 1.5] : [-8.6, 3.6, 1.5]));
          chart.mesh.rotation.y = s.focus === 'rubber' ? -0.2 : 0.22;
        }
        const off = s.focus === 'rubber' ? RX : s.focus === 'myth' ? MX : 0;
        reelBoards([[chart, [off + 0.6, 16.8, -1.5], 1.2]]);
        // ---- steel
        if (s.hand === 'pull') st.eMax = Math.max(st.eMax, s.eps);
        if (st.eMax >= ST.eF) st.broken = true;
        const perm = st.eMax > ST.ey ? st.eMax - steelS(st.eMax) / ST.E : 0;
        const e = st.broken ? perm : s.hand === 'free' ? perm : Math.max(s.eps, perm);
        const gauge = 5 * (1 + e);                                     // the 5 cm gauge section, units
        const neck = st.eMax > ST.eU ? 1 - 0.45 * clamp((st.eMax - ST.eU) / (ST.eF - ST.eU), 0, 1) : 1 - 0.1 * clamp(e, 0, 0.2);
        for (let i = 0; i < P.length; i += 3) {
          const v = barBase[i + 1] + 0.5, rr = 1 - (1 - neck) * Math.exp(-(((v - 0.5) / 0.14) ** 2));
          P[i] = barBase[i] * rr; P[i + 2] = barBase[i + 2] * rr; P[i + 1] = (v - 0.5) * gauge;
        }
        barGeo.attributes.position.needsUpdate = true; barGeo.computeVertexNormals();
        const y0 = 2.5, gap = st.broken ? 0.5 : 0;
        bar.position.y = y0 + gauge / 2; bar.scale.y = st.broken ? 0.5 : 1; bar.position.y = st.broken ? y0 + gauge / 4 : y0 + gauge / 2;
        barTop.visible = st.broken; if (st.broken) { barTop.geometry.attributes.position.array.set(P); barTop.geometry.attributes.position.needsUpdate = true; barTop.geometry.computeVertexNormals(); barTop.scale.y = 0.5; barTop.position.y = y0 + gauge * 0.75 + gap; }
        shHi.position.y = y0 + gauge + gap + 0.5; gripHi.position.y = shHi.position.y + 0.9; cross.position.y = gripHi.position.y + 0.9;
        dialVal = e * 50;                                               // mm over the 50 mm gauge
        dialTex.redraw();
        const plastic = st.eMax > ST.ey;
        lBar.element.innerHTML = st.broken ? '<b>Snapped</b> at 25 % stretch' : s.hand === 'free' ? (plastic ? `let go: stays <b>${(perm * 50).toFixed(2)} mm</b> longer` : 'let go: <b>back to its old length</b>') : e <= ST.ey ? 'elastic: <b>obeys Hooke’s law</b>' : e < ST.eU ? 'past yield: <b>stretching for good</b>' : '<b>necking</b>: about to break';
        // ---- rubber
        if (s.lam > st.lamPrev + 1e-4) { st.back = false; st.lmax = s.lam; }      // pulling out: loading curve
        else if (s.lam < st.lamPrev - 1e-4) st.back = true;                       // letting back: unloading curve
        if (!st.back) st.lmax = s.lam;
        st.lamPrev = s.lam;
        const len = 2.4 * s.lam, th = 1 / Math.sqrt(s.lam);
        pegL.position.set(0, 1.1, 0); pegR.position.set(len, 1.1, 0);
        bandA.scale.set(len, th, th); bandA.position.set(len / 2, 1.55, 0.3);
        bandB.scale.set(len, th, th); bandB.position.set(len / 2, 1.55, -0.3);
        bandEnds[0].position.set(0, 1.55, 0); bandEnds[0].rotation.set(Math.PI / 2, 0, Math.PI / 2);
        bandEnds[1].position.set(len, 1.55, 0); bandEnds[1].rotation.set(Math.PI / 2, 0, -Math.PI / 2);
        heat.forEach((hh, i) => { const q = (time * 0.8 + i / heat.length) % 1; hh.visible = st.back && st.lmax > 2; hh.position.set(len * ((i * 0.37) % 1), 1.8 + q * 1.5, 0); hh.material.opacity = (1 - q) * 0.5; });
        lBand.position.set(len / 2, 3.0, 0);
        lBand.element.innerHTML = `stretched <b>${s.lam.toFixed(1)}×</b> · pulls <b>${((st.back ? rubberBack(s.lam, st.lmax) : rubberS(s.lam)) / 1e6).toFixed(1)} MPa</b>${st.back ? '<br>coming back: weaker pull, band warms' : ''}`;
        // ---- myth
        const F = s.F;
        const xs = s.same === 'force' ? [F / MY.k1, F / MY.k2] : [F / MY.k2, F / MY.k2];
        const Fs = s.same === 'force' ? [F, F] : [MY.k1 * F / MY.k2, F];
        [soft, stiff].forEach((o, i) => {
          const L = (MY.L0 + xs[i]) * MY.U; o.c.setLength(L);
          const yb = TOPM - L; o.h.position.set(o.x, yb, 0); o.w.position.set(o.x, yb - 0.55, 0);
          o.w.setCount(Math.round(Fs[i] / 2.5));
        });
        const E1 = 0.5 * MY.k1 * xs[0] ** 2, E2 = 0.5 * MY.k2 * xs[1] ** 2;
        glowS.position.set(soft.x, TOPM - (MY.L0 + xs[0]) * MY.U / 2, 0); lSoft.position.set(soft.x - 0.9, TOPM - (MY.L0 + xs[0]) * MY.U - 1.2, 0); lStiff.position.set(stiff.x + 0.9, TOPM - (MY.L0 + xs[1]) * MY.U - 1.2, 0); glowS.scale.setScalar(1 + Math.sqrt(E1) * 4);
        glowT.position.set(stiff.x, TOPM - (MY.L0 + xs[1]) * MY.U / 2, 0); glowT.scale.setScalar(1 + Math.sqrt(E2) * 4);
        lSoft.element.innerHTML = `soft<br><b>${fmtJ(E1)}</b>`; lStiff.element.innerHTML = `stiff<br><b>${fmtJ(E2)}</b>`;
        // ---- chart
        cur = { focus: s.focus, e, eMax: st.eMax, free: s.hand === 'free' || st.broken, broken: st.broken, lam: s.lam, lmax: st.lmax, back: st.back, F, same: s.same };
        const kk = `${s.focus}|${e.toFixed(6)}|${st.broken}|${s.hand}|${s.lam}|${st.back}|${F}|${s.same}`;
        if (kk !== key) { key = kk; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'rubber') {
          const back = st.back, sg = back ? rubberBack(s.lam, st.lmax) : rubberS(s.lam), Et = sg / Math.max(1e-6, s.lam - 1);
          return `<div class="big">Stretch ${s.lam.toFixed(1)}× · ${(sg / 1e6).toFixed(1)} MPa</div>
            <div class="row"><span>Stiffness at small stretch</span><b>about 3 MPa (0.003 GPa)</b></div>
            <div class="row"><span>Average stiffness so far</span><b>${(Et / 1e6).toFixed(1)} MPa</b></div>
            <div class="row"><span>Steel is stiffer by</span><b>about 70,000 times</b></div>
            <small>${back ? 'On the way back the band pulls less. The loop between the curves is energy turned to heat.' : 'The curve bends: rubber is soft at first, then stiffens hard near 6×. No straight line, so no single k.'}</small>`;
        }
        if (s.focus === 'myth') {
          const F = s.F, same = s.same === 'force';
          const x1 = same ? F / MY.k1 : F / MY.k2, x2 = F / MY.k2, E1 = 0.5 * MY.k1 * x1 * x1, E2 = 0.5 * MY.k2 * x2 * x2;
          return `<div class="big">${same ? 'Same force: soft stores more' : 'Same stretch: stiff stores more'}</div>
            <div class="row"><span>Soft, 100 N/m: stretch · energy</span><b>${fmtLen(x1)} · ${fmtJ(E1)}</b></div>
            <div class="row"><span>Stiff, 400 N/m: stretch · energy</span><b>${fmtLen(x2)} · ${fmtJ(E2)}</b></div>
            <div class="row"><span>Energy ratio, soft : stiff</span><b>${E2 > 0 ? (E1 / E2).toFixed(2) + ' : 1' : '–'}</b></div>
            <small>${same ? 'Same pull, and the soft spring stretches four times as far, so it holds four times the energy.' : 'Pulled the same distance, the stiff spring needs four times the force and stores four times the energy.'}</small>`;
        }
        const perm = st.eMax > ST.ey ? st.eMax - steelS(st.eMax) / ST.E : 0;
        const e = st.broken || s.hand === 'free' ? perm : Math.max(s.eps, perm), sg = st.broken || s.hand === 'free' ? 0 : steelS(e);
        return `<div class="big">${st.broken ? 'Broken' : `Stress ${(sg / 1e6).toFixed(0)} MPa`}</div>
          <div class="row"><span>Strain (stretch ÷ length)</span><b>${(e * 100).toFixed(e < 0.01 ? 3 : 1)} %</b></div>
          <div class="row"><span>Pull on the 10 mm bar</span><b>${fmtN(sg * ST.A)}</b></div>
          <div class="row"><span>Stretch of the 5 cm section</span><b>${fmtLen(e * ST.L)}</b></div>
          <small>${perm > 0 ? `Permanent stretch: ${fmtLen(perm * ST.L)}. Past the elastic limit, it will never spring all the way back.` : 'Below the yield point, stress = 200 GPa × strain, and the bar springs fully back when released.'}</small>`;
      },
    };
  },
};
