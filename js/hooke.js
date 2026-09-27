// Shared parts for HookeClear: a coil spring whose length can change every frame, hooks, slotted
// masses, a metre rule, chart boards, and the constants used in readouts.
import { THREE, M, box, rod, sphere, canvasTexture, clamp } from './kit.js';

export { clamp };
// ---------------------------------------------------------------- physics
export const G = 9.81;              // m/s², Earth's surface gravity (standard 9.80665)
export const G_MOON = 1.62;         // m/s², the Moon's surface gravity (NASA Moon fact sheet)
export const TAU = Math.PI * 2;
// Young's modulus, GPa (Wikipedia "Young's modulus" table; engineering handbooks):
// structural steel about 200, brass about 100–125, rubber 0.01–0.1 at small strain.
export const E_STEEL = 200e9, E_BRASS = 110e9;
export const RHO_STEEL = 7850, RHO_BRASS = 8500;          // kg/m³
// Springs in series share the force, so their stretches add: 1/k = 1/k1 + 1/k2 + …
// Springs in parallel share the stretch, so their forces add: k = k1 + k2 + …
export const kEff = (k, n, arr) => (arr === 'parallel' ? k * n : k / n);
export const period = (m, k) => TAU * Math.sqrt(m / k);   // T = 2π √(m/k)

// Numbers with sensible units: 0.0023 → "2.3 m…", 12000 → "12 k…".
export function si(v, unit, sig = 2) {
  const a = Math.abs(v);
  if (!isFinite(v)) return '∞ ' + unit;
  if (a === 0) return '0 ' + unit;
  const pre = a >= 1e9 ? [1e9, 'G'] : a >= 1e6 ? [1e6, 'M'] : a >= 1e3 ? [1e3, 'k'] : a >= 1 ? [1, ''] : a >= 1e-3 ? [1e-3, 'm'] : [1e-6, 'µ'];
  const x = v / pre[0], ax = Math.abs(x);
  const d = ax >= 100 ? 0 : ax >= 10 ? Math.max(0, sig - 2) : Math.max(0, sig - 1);
  return `${x.toFixed(d)} ${pre[1]}${unit}`;
}
export const fmtN = (F) => (Math.abs(F) >= 1000 ? (F / 1000).toFixed(F >= 1e4 ? 0 : 1) + ' kN' : Math.abs(F) >= 10 ? F.toFixed(0) + ' N' : F.toFixed(2) + ' N');
export const fmtLen = (m) => (Math.abs(m) >= 1 ? m.toFixed(2) + ' m' : Math.abs(m) >= 0.01 ? (m * 100).toFixed(1) + ' cm' : (m * 1000).toFixed(m < 0.001 ? 2 : 1) + ' mm');
export const fmtJ = (E) => (E >= 1000 ? (E / 1000).toFixed(1) + ' kJ' : E >= 1 ? E.toFixed(E >= 100 ? 0 : 2) + ' J' : (E * 1000).toFixed(E >= 0.01 ? 0 : 1) + ' mJ');
export const fmtK = (k) => (k >= 1000 ? (k / 1000).toFixed(k >= 1e4 ? 0 : 1) + ' kN/m' : k.toFixed(k < 10 ? 1 : 0) + ' N/m');

// ---------------------------------------------------------------- the coil
// A helical spring hanging down the −Y axis from its origin. setLength(L) re-shapes the same mesh
// (no new geometry), so the wire keeps its thickness however far the coil is stretched.
export function makeCoil({ turns = 12, R = 0.16, r = 0.02, mat, seg = 20, rs = 8 } = {}) {
  const N = turns * seg + 1;
  const pos = new Float32Array(N * rs * 3), nor = new Float32Array(N * rs * 3), idx = [];
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < rs; j++) {
    const a = i * rs + j, b = i * rs + ((j + 1) % rs), c = (i + 1) * rs + j, d = (i + 1) * rs + ((j + 1) % rs);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, mat || M.metal(0xc9ced8, { roughness: 0.3 }));
  mesh.castShadow = true; mesh.frustumCulled = false;
  const w = turns * TAU;
  let last = -1;
  mesh.setLength = (L) => {
    L = Math.max(turns * r * 2.05, L);                       // coils can't pass through each other
    if (Math.abs(L - last) < 1e-5) return; last = L;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), th = w * t, c = Math.cos(th), s = Math.sin(th);
      const px = R * c, py = -L * t, pz = R * s;
      let tx = -R * s * w, ty = -L, tz = R * c * w; const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl;
      const nx = -c, ny = 0, nz = -s;                        // towards the axis
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      for (let j = 0; j < rs; j++) {
        const f = (j / rs) * TAU, cf = Math.cos(f), sf = Math.sin(f);
        const ox = cf * nx + sf * bx, oy = cf * ny + sf * by, oz = cf * nz + sf * bz, k = (i * rs + j) * 3;
        pos[k] = px + r * ox; pos[k + 1] = py + r * oy; pos[k + 2] = pz + r * oz;
        nor[k] = ox; nor[k + 1] = oy; nor[k + 2] = oz;
      }
    }
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  };
  mesh.setLength(1);
  return mesh;
}

// A small wire hook whose eye sits at the origin and whose hook hangs below it.
export function makeHook(mat = M.metal(0xd8dde6), s = 1) {
  const g = new THREE.Group();
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.06 * s, 0.014 * s, 8, 24), mat); eye.position.y = -0.06 * s; g.add(eye);
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * s, 0.014 * s, 0.14 * s, 8), mat); shank.position.y = -0.19 * s; g.add(shank);
  const cup = new THREE.Mesh(new THREE.TorusGeometry(0.06 * s, 0.014 * s, 8, 24, Math.PI * 1.3), mat); cup.rotation.z = Math.PI * 0.85; cup.position.set(0.04 * s, -0.3 * s, 0); g.add(cup);
  return g;
}

// A slotted-mass hanger: a rod with a base plate and up to n brass discs (50 g each).
// The group's origin is the top of the rod. setCount(n) shows n discs.
export function makeHanger(maxDiscs = 9, discH = 0.075, R = 0.24) {
  const g = new THREE.Group();
  const steel = M.metal(0xb9bec8), brass = M.metal(0xc9a24a, { roughness: 0.35 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.25 + maxDiscs * discH, 12), steel);
  const H = 0.25 + maxDiscs * discH; stem.position.y = -H / 2 - 0.05; g.add(stem);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 20), steel); loop.position.y = -0.03; g.add(loop);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.05, 32), steel); base.position.y = -H - 0.05; base.castShadow = true; g.add(base);
  const discs = [];
  for (let i = 0; i < maxDiscs; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(R, R, discH * 0.92, 32), brass); d.castShadow = true;
    d.position.y = -H - 0.025 + discH * (i + 0.5) + 0.02; g.add(d); discs.push(d);
  }
  g.height = H + 0.08;
  g.setCount = (n) => discs.forEach((d, i) => { d.visible = i < n; });
  return g;
}

// A vertical metre rule. Its top edge is at the group's origin; 'units' long, marked in cm for
// 'metres' of real length.
export function makeRuler(units, metres, w = 0.36) {
  const px = 2048;
  const tex = canvasTexture(128, px, (g, W, H) => {
    g.fillStyle = '#f3e7c4'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#222'; g.strokeStyle = '#222';
    const cm = Math.round(metres * 100);
    for (let i = 0; i <= cm; i++) {
      const y = (i / cm) * (H - 2) + 1, L = i % 10 === 0 ? 60 : i % 5 === 0 ? 40 : 22;
      g.lineWidth = i % 10 === 0 ? 3 : 1.5; g.beginPath(); g.moveTo(0, y); g.lineTo(L, y); g.stroke();
      if (i % 10 === 0 && i > 0 && i < cm) { g.font = 'bold 34px sans-serif'; g.fillText(String(i), 64, y + 12); }
    }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, units), new THREE.MeshStandardMaterial({ map: tex.tex, roughness: 0.7 }));
  m.position.y = -units / 2;
  const g = new THREE.Group(); g.add(m);
  const back = box(w, units, 0.03, M.matte(0xb89a5a)); back.position.set(0, -units / 2, -0.02); g.add(back);
  return g;
}

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
// Axes with a grid. Returns X(x) and Y(y) for the plot area.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '' }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub) {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '17px sans-serif'; g.fillText(sub, 20, 58); }
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export const COL = { line: '#8ef0ff', hot: '#ffb547', energy: 'rgba(255,181,71,.28)', warn: '#ff7a59', ok: '#7be08c', soft: '#c49bff' };

// A flat arrow (for forces) made of a shaft and a cone, pointing along +Y. set(L) sets its length.
export function forceArrow(color = 0xffb547, r = 0.035) {
  const g = new THREE.Group(), mat = M.glow(color);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), mat), tip = new THREE.Mesh(new THREE.ConeGeometry(r * 2.8, r * 7, 14), mat);
  g.add(shaft, tip);
  g.set = (L) => { const head = r * 7; L = Math.max(0, L); g.visible = L > 0.03; const sL = Math.max(0.001, L - head); shaft.scale.y = sL; shaft.position.y = sL / 2; tip.position.y = sL + head / 2; };
  g.set(1);
  return g;
}

// ---------------------------------------------------------------- stage helpers
// True while the Glassbox studio records the reel: scenes then choose their own camera views.
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.y };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.y = 0; }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(1); b.mesh.rotation.y = b.home.r; }
  });
}
export { THREE, M, box, rod, sphere, canvasTexture };
