// Chapter 4: springs that sing.
// Harmonium reed: a brass tongue clamped at one end, a cantilever spring. Tip stiffness
// k = 3 E I ÷ L³ with I = b t³ ÷ 12, so k = E b t³ ÷ (4 L³). Brass E ≈ 110 GPa, ρ = 8,500 kg/m³,
// tongue 4 mm wide. First bending mode of a uniform cantilever: f = (1.875² ÷ 2π) (t ÷ L²) √(E ÷ 12ρ),
// the same as (1/2π) √(k ÷ m_eff) with m_eff ≈ 0.243 × the tongue's mass. A 35 mm × 0.45 mm tongue
// gives k ≈ 230 N/m and about 213 Hz (near A3). Real reeds taper and are filed to pitch, so this is a
// uniform-beam sketch. A dab of solder at the tip adds mass and lowers the pitch (see HarmoniumClear).
// Guitar string: a plain steel high-E string, 0.010 inch (0.254 mm) across, on a 648 mm (25.5 inch)
// scale. It is a very stiff spring: k = E A ÷ L with E = 200 GPa, A = 5.07e-8 m², and about 0.75 m
// of string from bridge to tuning post, so k ≈ 13.5 N per mm. Turning the post (6 mm across,
// 18.8 mm of string per turn) stretches it; tension T = k ΔL. Pitch: f = (1 ÷ 2L) √(T ÷ μ),
// μ = 3.98e-4 kg/m. E4 (329.6 Hz) needs about 72 N (D'Addario's tension chart lists 16.2 lb for a
// plain .010 at E4 on a 25.5 inch scale). Breaking load taken as 2.4 GPa × A ≈ 122 N, typical for
// high-carbon music wire this thin. Scale: 1 unit = 5 mm (reed), 1 unit = 5 cm (guitar).
import { THREE, M, box, rod, sphere } from '../kit.js';
import {
  E_BRASS, RHO_BRASS, E_STEEL, RHO_STEEL, board, panelBg, axes, title, dot, COL, fitNarrow, reelBoards, inReel, fmtN, TAU,
} from '../hooke.js';

const REED = { b: 0.004, U: 200 };
const GTR = { d: 0.254e-3, L: 0.648, Ltot: 0.75, post: 0.006, brk: 122, X: 30 };
GTR.A = Math.PI * (GTR.d / 2) ** 2; GTR.k = (E_STEEL * GTR.A) / GTR.Ltot; GTR.mu = RHO_STEEL * GTR.A;
const reedK = (L, t) => (E_BRASS * REED.b * t ** 3) / (4 * L ** 3);
const reedMeff = (L, t) => 0.2427 * RHO_BRASS * REED.b * t * L;
const reedF = (L, t, tip) => Math.sqrt(reedK(L, t) / (reedMeff(L, t) + tip)) / TAU;
const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
function noteName(f) {
  if (!(f > 10)) return '–';
  const n = 12 * Math.log2(f / 440) + 57, r = Math.round(n), c = Math.round((n - r) * 100);
  return `${NOTES[((r % 12) + 12) % 12]}${Math.floor(r / 12)}${c ? ` ${c > 0 ? '+' : '−'}${Math.abs(c)} cents` : ''}`;
}
const VIEWS = {
  reed: { pos: [7.4, 9.5, 19.5], target: [7.4, 2.4, 0] },
  string: { pos: [GTR.X + 7.4, 4.6, 19.5], target: [GTR.X + 7.4, 3.2, 0] },
};

export default {
  id: 'music',
  short: 'Reeds and strings',
  title: 'Springs that sing',
  subtitle: 'A harmonium reed and a guitar string are springs that keep time.',
  view: VIEWS.reed,
  learn: `<p>Every note of a <b>harmonium</b> comes from a thin brass tongue, fixed at one end over a slot (see HarmoniumClear). Push its tip and it bends in proportion to the push, <b>F = k × x</b>: it is a tiny <b>diving-board spring</b>. Let go and it swings back and forth, just like the mass on a spring in chapter 1, at <b>f = (1/2π) √(k ÷ m)</b>.</p>
    <p>So a reed maker has two knobs. <b>Stiffness</b>: a tongue's k grows with its <b>thickness cubed</b> and falls with its <b>length cubed</b>. Twice as thick is 8 times stiffer. <b>Mass</b>: a dab of solder at the tip adds mass and <b>lowers</b> the note. Scraping metal off the tip raises it.</p>
    <p>A <b>guitar string</b> is a spring too, a very stiff one. Turning the tuning peg winds the string round its post and stretches it by a few millimetres. By Hooke's law the <b>tension</b> rises in step, about <b>13.5 N for every millimetre</b> on a thin steel E string. The note climbs with the square root of the tension (see GuitarClear). A piano does the same with far thicker wire: each string pulls with 700 to 900 N (see PianoClear), and a tabla player tightens the drumhead's straps for the same reason.</p>
    <p class="tip"><b>Try it:</b> make the reed thicker and hear the note jump. Add solder to the tip. Then turn the guitar peg up to E, and keep going until the string snaps.</p>`,
  terms: [
    { t: 'Cantilever', d: 'A beam fixed at one end, like a diving board. Its tip obeys Hooke’s law: F = k × x.' },
    { t: 'Natural frequency', d: 'The rate something swings at by itself: f = (1/2π) √(k ÷ m). Stiffer is higher, heavier is lower.' },
    { t: 'Tension', d: 'The pull along a stretched string. Tuning a string sets its tension.' },
    { t: 'Strain', d: 'Stretch as a fraction of length. A tuned E string is stretched by only about 0.7 %.' },
    { t: 'Cents', d: 'Hundredths of a semitone. Twelve semitones, 1,200 cents, make an octave.' },
  ],
  defaults: { focus: 'reed', L: 35, t: 0.45, tip: 0, press: 0, turn: 0.2 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'reed', label: 'Harmonium reed' }, { v: 'string', label: 'Guitar string' }] },
    { key: 'L', type: 'range', label: 'Reed: tongue length', min: 15, max: 60, step: 0.5, ends: ['15 mm', '60 mm'], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 't', type: 'range', label: 'Reed: tongue thickness', min: 0.2, max: 0.8, step: 0.01, ends: ['0.2 mm', '0.8 mm'], fmt: (v) => v.toFixed(2) + ' mm' },
    { key: 'tip', type: 'range', label: 'Reed: solder on the tip', min: 0, max: 100, step: 1, ends: ['none', '100 mg'], fmt: (v) => Math.round(v) + ' mg' },
    { key: 'press', type: 'range', label: 'Reed: press the tip with a finger', min: 0, max: 0.5, step: 0.01, ends: ['0 N', '0.5 N'], fmt: (v) => v.toFixed(2) + ' N', hint: 'While you press, the reed stops singing and just bends: x = F ÷ k.' },
    { key: 'turn', type: 'range', label: 'Guitar: turn the tuning peg', min: 0, max: 0.6, step: 0.002, ends: ['slack', '0.6 turn'], fmt: (v) => Math.round(v * 360) + '°' },
    { key: 'go', type: 'buttons', label: 'Guitar', items: [{ label: 'Fit a new string', act: (s, inst) => { s.focus = 'string'; s.turn = 0; inst.restring(); } }] },
  ],
  onChange(s, key) {
    if (['L', 't', 'tip', 'press'].includes(key)) s.focus = 'reed';
    if (key === 'turn') s.focus = 'string';
  },
  quiz: [
    { q: 'A reed tongue is made twice as thick. Its stiffness becomes…', options: ['twice as much', '4 times as much', '8 times as much', 'the same'], answer: 2, why: 'A cantilever’s stiffness grows with thickness cubed: 2³ = 8.' },
    { q: 'A tuner adds a dab of solder to a reed’s tip. The note…', options: ['goes up', 'goes down', 'stays the same', 'stops'], answer: 1, why: 'f = (1/2π) √(k ÷ m). More mass at the tip, lower frequency.' },
    { q: 'A steel string stretches 13.5 N per mm. To reach 72 N of tension, how far must the peg stretch it?', options: ['About 0.5 mm', 'About 5 mm', 'About 5 cm', 'About 1 m'], answer: 1, why: 'x = F ÷ k = 72 ÷ 13.5 ≈ 5.3 mm, about a quarter turn of the tuning post.' },
  ],
  reel: [
    { ms: 5400, caption: 'Turn a guitar peg: the string stretches a few millimetres, the tension climbs, and so does the note.', set: { focus: 'string' }, act: (s, inst) => inst.restring(), anim: { turn: [0.05, 0.3] }, view: { pos: [GTR.X + 10, 8.8, 12], target: [GTR.X + 10, 8.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gR = new THREE.Group(), gG = new THREE.Group(); root.add(gR, gG);
    gG.position.x = GTR.X;

    // ------------------------------------------------ reed (tongue along +X from the rivet at x = 0)
    const RU = REED.U;
    const plate = new THREE.Group(); gR.add(plate); plate.position.y = 1.2;
    const brassPlate = M.metal(0xb8923a, { roughness: 0.4 });
    const pl1 = box(14, 0.4, 1.0, brassPlate); pl1.position.set(5.5, -0.2, -1.1); plate.add(pl1);
    const pl2 = box(14, 0.4, 1.0, brassPlate); pl2.position.set(5.5, -0.2, 1.1); plate.add(pl2);
    const plEnd = box(1.6, 0.4, 3.2, brassPlate); plEnd.position.set(-0.8, -0.2, 0); plate.add(plEnd);
    const slotEnd = box(1.0, 0.4, 3.2, brassPlate); slotEnd.position.set(12.9, -0.2, 0); plate.add(slotEnd);
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 20), M.metal(0xd8dde6)); rivet.position.set(-0.7, 0.15, 0); plate.add(rivet);
    const NS = 40, tongueGeo = new THREE.BoxGeometry(1, 1, 1, NS, 1, 1);
    const base = Float32Array.from(tongueGeo.attributes.position.array);
    const tongue = new THREE.Mesh(tongueGeo, M.metal(0xd9b25a, { roughness: 0.25 })); tongue.castShadow = true; tongue.frustumCulled = false; plate.add(tongue);
    const solder = sphere(0.3, M.metal(0x9aa3b2)); plate.add(solder);
    const finger = new THREE.Group(); plate.add(finger);
    const fTip = sphere(0.45, M.plastic(0xd8a47f)); finger.add(fTip);
    const fArm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 3.4, 20), M.plastic(0xd8a47f)); fArm.position.y = 1.7; finger.add(fArm);
    const puffs = []; for (let i = 0; i < 16; i++) { const p = sphere(0.12, M.ghost(0x8ef0ff, 0.5)); plate.add(p); puffs.push(p); }
    const lReed = stage.label('', [6, 3.6, 0], gR, 'hot');
    const lRiv = stage.label('clamped here', [-0.7, 0.2, 1.8], gR);

    // ------------------------------------------------ guitar string (bridge at x = 0, nut at x = 13)
    const GU = 20;                                                   // units per metre
    const nutX = GTR.L * GU, postX = nutX + 2.2, sy = 3.0, SZ = 0.45;   // the string runs SZ in front of the fretboard
    const wood = M.matte(0xc8894a, { roughness: 0.6 });
    const neck = box(nutX - 5.6, 0.95, 0.5, M.matte(0x6b4226)); neck.position.set((nutX + 5.6) / 2, sy, -0.05); gG.add(neck);
    for (const [x, r] of [[1.2, 2.0], [4.4, 1.55]]) { const bout = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.9, 48), wood); bout.rotation.x = Math.PI / 2; bout.position.set(x, sy, -0.55); bout.castShadow = true; gG.add(bout); }
    const waist = box(1.6, 2.4, 0.9, wood); waist.position.set(2.9, sy, -0.55); gG.add(waist);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), M.matte(0x140c06)); hole.position.set(4.2, sy, -0.09); gG.add(hole);
    const bridge = box(0.3, 1.3, 0.35, M.matte(0x2a1a10)); bridge.position.set(0, sy, 0.05); gG.add(bridge);
    const nut = box(0.18, 0.95, 0.3, M.matte(0xf2ecd8)); nut.position.set(nutX, sy, 0.15); gG.add(nut);
    const head = box(3.4, 1.3, 0.35, M.matte(0x3a2616)); head.position.set(nutX + 1.8, sy, -0.05); gG.add(head);
    const post = new THREE.Group(); post.position.set(postX, sy, 0.3); gG.add(post);
    const postM = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 20), M.metal(0xd8dde6)); postM.rotation.x = Math.PI / 2; post.add(postM);
    const hole2 = box(0.34, 0.06, 0.06, M.matte(0x222222)); hole2.position.z = 0.15; post.add(hole2);
    const peg = new THREE.Group(); peg.position.set(postX, sy - 0.95, -0.05); gG.add(peg);
    const key = box(0.7, 0.9, 0.22, M.plastic(0xf2ecd8)); key.position.y = -0.4; peg.add(key);
    const pegShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10), M.metal(0xd8dde6)); pegShaft.position.y = 0.1; peg.add(pegShaft);
    const SN = 60, strPts = new Float32Array((SN + 1) * 3);
    const strGeo = new THREE.BufferGeometry(); strGeo.setAttribute('position', new THREE.BufferAttribute(strPts, 3));
    const strLine = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xe8eef8 })); strLine.frustumCulled = false; gG.add(strLine);
    const strEnd = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(nutX, sy, SZ), new THREE.Vector3(postX, sy, SZ)]), new THREE.LineBasicMaterial({ color: 0xe8eef8 })); gG.add(strEnd);
    const broken = [0, 1].map(() => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xe8eef8 })); gG.add(l); return l; });
    const lStr = stage.label('', [nutX / 2, sy + 1.4, 0], gG, 'hot');
    const lPeg = stage.label('tuning peg', [postX + 0.8, sy - 1.2, 1.4], gG);

    // ------------------------------------------------ chart
    let cur = { focus: 'reed', k: 230, x: 0, F: 0, f: 213, T: 0, dL: 0, snapped: false };
    const chart = board(root, 6.4, 4.8, 640, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (cur.focus === 'reed') {
        const xMax = 3, FM = 0.5;
        const { X, Y, x1 } = axes(g, w, h, { y1: 96, xMax, yMax: FM, xTicks: [0, 1, 2, 3], yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xFmt: (v) => v + ' mm', yFmt: (v) => v.toFixed(1) + ' N', xLabel: 'tip bends →', yLabel: 'finger push ↑' });
        title(g, `Reed tip: k = ${Math.round(cur.k)} N/m`, `sings at ${Math.round(cur.f)} Hz · ${noteName(cur.f)}`);
        const xe = Math.min(xMax, (FM / cur.k) * 1000);
        g.strokeStyle = COL.line; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xe), Y((cur.k * xe) / 1000)); g.stroke();
        const xm = cur.x * 1000; if (xm <= xMax) dot(g, X(xm), Y(cur.F), COL.hot, 10);
        g.fillStyle = COL.hot; g.font = 'bold 19px sans-serif'; const t = `${xm.toFixed(2)} mm`; g.fillText(t, x1 - g.measureText(t).width, 34);
      } else {
        const xMax = 11, TM = 150;
        const { X, Y, x1 } = axes(g, w, h, { y1: 96, xMax, yMax: TM, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 50, 100, 150], xFmt: (v) => v + ' mm', yFmt: (v) => v + ' N', xLabel: 'stretch →', yLabel: 'tension ↑' });
        title(g, 'Steel E string: k ≈ 13.5 N per mm', cur.snapped ? 'SNAPPED' : `${cur.f.toFixed(0)} Hz · ${noteName(cur.f)}`);
        const kmm = GTR.k / 1000, xb = GTR.brk / kmm;
        g.strokeStyle = COL.line; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xb), Y(GTR.brk)); g.stroke();
        g.strokeStyle = COL.warn; g.lineWidth = 4; const bx = X(xb), by = Y(GTR.brk); g.beginPath(); g.moveTo(bx - 10, by - 10); g.lineTo(bx + 10, by + 10); g.moveTo(bx + 10, by - 10); g.lineTo(bx - 10, by + 10); g.stroke();
        g.fillStyle = COL.warn; g.font = '17px sans-serif'; g.fillText('snaps', bx + 14, by + 6);
        const Te = GTR.mu * (2 * GTR.L * 329.63) ** 2; g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(X(Te / kmm), Y(Te), 6, 0, TAU); g.fill(); g.fillText('E4, in tune', X(Te / kmm) - 110, Y(Te) - 12);
        if (!cur.snapped) dot(g, X(Math.min(xMax, cur.dL * 1000)), Y(Math.min(TM, cur.T)), COL.hot, 10);
        g.fillStyle = COL.hot; g.font = 'bold 19px sans-serif'; const t = cur.snapped ? 'broken' : fmtN(cur.T); g.fillText(t, x1 - g.measureText(t).width, 34);
      }
    }, [14.2, 6.4, -2.0]);
    chart.mesh.rotation.y = -0.2;

    let lastFocus = null, keyS = '', ph = 0, amp = 0, prevF = 0, bent = 0, snapped = false, snapT = 0, strPh = 0, strAmp = 0, prevT = -1;
    return {
      restring() { snapped = false; snapT = 0; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lRiv, lPeg]);
        const str = s.focus === 'string';
        gR.visible = !str; gG.visible = str;
        if (s.focus !== lastFocus) {
          if (lastFocus !== null && !inReel()) stage.setView(VIEWS[s.focus].pos, VIEWS[s.focus].target, 1.0);
          lastFocus = s.focus; chart.home = null;
          chart.mesh.position.set(...(str ? [GTR.X + 12.4, 7.6, -1.5] : [14.2, 6.4, -2.0]));
        }
        reelBoards([[chart, str ? [GTR.X + 10, 12.5, -1.5] : [4, 9, -1.5], 1.2]]);
        // ---- reed
        const L = s.L / 1000, t = s.t / 1000, tip = s.tip * 1e-6, k = reedK(L, t), f = reedF(L, t, tip);
        const Lu = L * RU, tu = Math.max(0.05, t * RU);
        const xStatic = s.press / k;                                  // m
        bent = bent + (xStatic - bent) * (1 - Math.exp(-15 * dt));
        const playing = s.press < 0.005;
        if (Math.abs(f - prevF) > 0.5) { amp = 1; prevF = f; }
        amp = playing ? Math.min(1, amp + dt * 2) : Math.max(0, amp - dt * 6);
        ph += dt * TAU * (f / 90);                                     // shown 90× slower
        const swing = amp * 0.9 * Math.sin(ph);                        // units at the tip
        const tipDef = -bent * RU + swing;
        const P = tongueGeo.attributes.position.array;
        for (let i = 0; i < P.length; i += 3) {
          const u = base[i] + 0.5, x = u * Lu, shape = (u * u * (3 - u)) / 2;
          P[i] = x; P[i + 1] = base[i + 1] * tu + tipDef * shape; P[i + 2] = base[i + 2] * 0.8;
        }
        tongueGeo.attributes.position.needsUpdate = true; tongueGeo.computeVertexNormals();
        solder.visible = s.tip > 0; solder.scale.setScalar(0.4 + Math.cbrt(s.tip / 100) * 0.8); solder.position.set(Lu - 0.2, tipDef + tu / 2 + 0.1, 0);
        finger.visible = s.press > 0.005; finger.position.set(Lu - 0.4, tipDef + tu / 2 + 0.45, 0);
        puffs.forEach((p, i) => { const q = (time * 1.2 + i / puffs.length) % 1; p.visible = amp > 0.3; p.position.set(Lu * (0.3 + 0.6 * ((i * 0.37) % 1)), -0.6 - q * 3, (((i * 0.61) % 1) - 0.5) * 1.2); p.material.opacity = (1 - q) * 0.5 * amp; });
        lReed.position.set(Lu * 0.6, 3.2, 0);
        lReed.element.innerHTML = playing ? `sings at <b>${Math.round(f)} Hz</b> · ${noteName(f)}<br><small>shown 90× slower</small>` : `bent <b>${(xStatic * 1000).toFixed(2)} mm</b> by ${s.press.toFixed(2)} N`;
        // ---- string
        let dL = Math.max(0, s.turn * Math.PI * GTR.post - 0.0005);      // the first half-millimetre just takes up slack
        let T = GTR.k * dL;
        if (T > GTR.brk && !snapped) { snapped = true; snapT = 0; }
        if (snapped) { T = 0; dL = 0; snapT += dt; }
        const fS = T > 0 ? Math.sqrt(T / GTR.mu) / (2 * GTR.L) : 0;
        if (Math.abs(T - prevT) > 0.3) { strAmp = 0.35; prevT = T; }
        strAmp = Math.max(0.06, strAmp - dt * 0.12) * (T > 0 ? 1 : 0);
        strPh += dt * TAU * (fS / 110);
        strLine.visible = !snapped; strEnd.visible = !snapped;
        for (let i = 0; i <= SN; i++) { const u = i / SN, x = u * nutX; strPts[i * 3] = x; strPts[i * 3 + 1] = sy + (T > 0 ? strAmp * Math.sin(Math.PI * u) * Math.sin(strPh) : -0.25 * Math.sin(Math.PI * u)); strPts[i * 3 + 2] = SZ; }
        strGeo.attributes.position.needsUpdate = true;
        broken.forEach((l, i) => {
          l.visible = snapped;
          const p = l.geometry.attributes.position.array, curl = Math.min(1, snapT * 4);
          if (i === 0) { p[0] = 0; p[1] = sy; p[2] = SZ; p[3] = nutX * 0.45 * (1 - curl * 0.4); p[4] = sy - 1.5 * curl; p[5] = SZ + 0.8 * curl; }
          else { p[0] = postX; p[1] = sy; p[2] = SZ; p[3] = nutX * (0.5 + 0.3 * curl); p[4] = sy - 1.2 * curl; p[5] = SZ + 1.0 * curl; }
          l.geometry.attributes.position.needsUpdate = true;
        });
        post.rotation.z = -s.turn * TAU; peg.rotation.y = s.turn * TAU * 3;
        lStr.element.innerHTML = snapped ? '<b>Snap!</b> Past its limit, the string broke.' : T > 0 ? `tension <b>${fmtN(T)}</b> · <b>${Math.round(fS)} Hz</b> · ${noteName(fS)}` : 'slack: no tension, no note';
        // ---- chart
        cur = { focus: s.focus, k, x: xStatic, F: s.press, f, T, dL, snapped };
        const kk = `${s.focus}|${s.L}|${s.t}|${s.tip}|${s.press}|${s.turn}|${snapped}`;
        if (kk !== keyS) { keyS = kk; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'string') {
          const dL = Math.max(0, s.turn * Math.PI * GTR.post - 0.0005), T = GTR.k * dL, f = T > 0 ? Math.sqrt(T / GTR.mu) / (2 * GTR.L) : 0;
          if (snapped || T > GTR.brk) return `<div class="big">Snap!</div><div class="row"><span>Tension needed</span><b>${fmtN(T)}</b></div><div class="row"><span>Breaking load of this wire</span><b>about ${GTR.brk} N</b></div><small>Past its limit, steel stops obeying Hooke’s law and breaks. Fit a new string.</small>`;
          return `<div class="big">T = k × ΔL = ${fmtN(T)}</div>
            <div class="row"><span>String stretched by</span><b>${(dL * 1000).toFixed(2)} mm (${((dL / GTR.Ltot) * 100).toFixed(2)} %)</b></div>
            <div class="row"><span>Stiffness, E A ÷ L</span><b>${(GTR.k / 1000).toFixed(1)} N per mm</b></div>
            <div class="row"><span>Note, (1 ÷ 2L) √(T ÷ μ)</span><b>${f ? Math.round(f) + ' Hz · ' + noteName(f) : 'none'}</b></div>
            <small>In tune at E4 (330 Hz) with about 72 N: under a third of a turn of the peg.</small>`;
        }
        const L = s.L / 1000, t = s.t / 1000, k = reedK(L, t), f = reedF(L, t, s.tip * 1e-6), m = RHO_BRASS * REED.b * t * L;
        return `<div class="big">f = (1/2π) √(k ÷ m) = ${Math.round(f)} Hz</div>
          <div class="row"><span>Tip stiffness, E b t³ ÷ 4L³</span><b>${Math.round(k)} N/m</b></div>
          <div class="row"><span>Tongue mass${s.tip ? ' + solder' : ''}</span><b>${(m * 1000).toFixed(2)} g${s.tip ? ` + ${Math.round(s.tip)} mg` : ''}</b></div>
          <div class="row"><span>Note</span><b>${noteName(f)}</b></div>
          <small>${s.press > 0.005 ? `Pressed with ${s.press.toFixed(2)} N, the tip bends ${((s.press / k) * 1000).toFixed(2)} mm: x = F ÷ k.` : 'Twice as thick: 8 times stiffer but twice the mass, so the note doubles, one octave up.'}</small>`;
      },
    };
  },
};
