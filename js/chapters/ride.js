// Chapter 3: springs that carry you.
// Car: a quarter-car model of a small hatchback. About 900 kg of sprung mass, so 225 kg sits on each
// wheel's spring; each 70 kg passenger adds about a quarter of their weight to this corner. A wheel
// rate of 22 kN/m gives a static sag of m g ÷ k ≈ 10 cm and a bounce (ride) frequency of
// (1/2π) √(k/m) ≈ 1.6 Hz. Passenger cars are usually tuned to about 1–1.5 Hz at the wheel (OptimumG,
// "Tech Tip: Springs & Dampers"); a light hatchback on stiff springs sits a little above that.
// Damper: working, ζ = 0.3 of critical (typical for comfort); worn out, ζ = 0.03.
// The wheel follows the road (the tyre's own springiness is ignored). The bump is a rounded speed
// breaker 8 cm high and 1 m across, crossed at 15 km/h, shown 3× slower. Scale: 1 unit = 10 cm.
// Bungee: a jump from a 43 m bridge (the height of the Kawarau Bridge jump, NZ) on a 12 m cord.
// Free fall for 12 m, then the cord pulls back with k × stretch. Energy gives the lowest point:
// m g (L0 + x) = ½ k x². A 75 kg jumper on a 75 N/m cord stretches it 28 m, 40 m below the deck,
// with a peak pull of about 2,100 N, near 3 g. Air drag: ½ ρ Cd A v² with Cd A = 0.4 m².
// Real cords are rubber and not quite Hookean (see chapter 5); crews pick a cord for each weight.
// Scale: 1 unit = 5 m.
import { THREE, M, box, rod, beam, sphere, torus } from '../kit.js';
import {
  G, makeCoil, board, panelBg, axes, title, dot, COL, fitNarrow, reelBoards, inReel, fmtN, fmtLen, fmtJ, fmtK, clamp, TAU,
} from '../hooke.js';

const CAR = { m0: 225, pax: 17.5, Lf: 0.36, R: 0.3, bumpH: 0.08, bumpW: 1.0, v: 15 / 3.6, slow: 3, U: 10 };
const BX = 60;                                       // bungee scene offset along X
const JX = 3;                                        // where the jumper leaps from, in the bungee group
const BJ = { H: 43, L0: 12, U: 0.2, CdA: 0.4, rho: 1.2 };
const VIEWS = {
  car: { pos: [-3.2, 8.8, 25], target: [-3.2, 7.2, 0] },
  bungee: { pos: [BX + 1, 10.2, 33], target: [BX + 1, 8.6, 0] },
};

export default {
  id: 'ride',
  short: 'Ride and bounce',
  title: 'Springs that carry you',
  subtitle: 'Car suspension and a bungee cord: stretch, store, give it back.',
  view: VIEWS.car,
  learn: `<p>Every wheel of a car sits under a <b>coil spring</b> (see CarClear). A small hatchback puts about 225 kg on each one. With a spring of <b>k = 22,000 N/m</b>, Hooke's law says it squeezes <b>x = F ÷ k ≈ 10 cm</b>. Each passenger adds a little more: about 8 mm per person on this corner. Load the boot and the car sits lower in a perfectly straight-line way.</p>
    <p>Hit a <b>speed breaker</b> and the spring squeezes, soaking up the jolt, then gives the energy back. On its own it would keep bouncing about <b>1.5 times a second</b>, T = 2π √(m ÷ k). So every spring has a partner, the <b>shock absorber</b> or <b>damper</b>: oil forced through small holes turns the bounce into heat. Motorbikes use the same pair in their forks and rear shocks, and a washing machine hangs its drum on springs and dampers too (see MotorcycleClear and WasherClear).</p>
    <p>A <b>bungee cord</b> is a very long, soft spring. Jump from a 43 m bridge on a 12 m cord and you fall freely for 12 m. Then the cord starts to stretch and pull. By the bottom, all the energy of your fall, <b>m g h</b>, has been stored in the cord as <b>½ k x²</b>. Heavier jumpers stretch it further, so crews pick a stiffer cord for them.</p>
    <p class="tip"><b>Try it:</b> add passengers and watch the sag grow in equal steps. Then hit the speed breaker with a worn-out damper. Switch to the bungee, make the jumper heavier, and see how close to the water they get.</p>`,
  terms: [
    { t: 'Suspension', d: 'The springs and dampers between the wheels and the body that let the wheels move over bumps.' },
    { t: 'Static sag', d: 'How far a spring squeezes under the vehicle’s own weight: x = m g ÷ k.' },
    { t: 'Damper (shock absorber)', d: 'A tube of oil that resists motion, turning a spring’s bounce into heat so it dies away.' },
    { t: 'Natural frequency', d: 'How many times a second a mass on a spring bounces by itself: f = (1/2π) √(k ÷ m).' },
    { t: 'Energy conservation', d: 'In the bungee jump, height energy m g h turns into speed, then into stretch energy ½ k x².' },
  ],
  defaults: { focus: 'car', pax: 1, kc: 22000, damper: true, mj: 75, kb: 75 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'car', label: 'Car suspension' }, { v: 'bungee', label: 'Bungee jump' }] },
    { key: 'pax', type: 'range', label: 'Car: people inside', min: 0, max: 5, step: 1, ends: ['0', '5'], fmt: (v) => String(v) },
    { key: 'kc', type: 'log', label: 'Car: spring stiffness', min: 12000, max: 45000, ends: ['soft', 'stiff'], fmt: (v) => (v / 1000).toFixed(0) + ' kN/m' },
    { key: 'damper', type: 'toggle', label: 'Car: shock absorber working', hint: 'Switch it off to feel a worn-out damper.' },
    { key: 'go', type: 'buttons', label: 'Car', items: [{ label: 'Hit a speed breaker', act: (s, inst) => { s.focus = 'car'; inst.bump(); } }] },
    { key: 'mj', type: 'range', label: 'Bungee: jumper’s mass', min: 40, max: 120, step: 1, ends: ['40 kg', '120 kg'], fmt: (v) => v + ' kg' },
    { key: 'kb', type: 'range', label: 'Bungee: cord stiffness', min: 40, max: 150, step: 1, ends: ['40 N/m', '150 N/m'], fmt: (v) => v + ' N/m' },
    { key: 'go2', type: 'buttons', label: 'Bungee', items: [{ label: 'Jump!', act: (s, inst) => { s.focus = 'bungee'; inst.jump(); } }] },
  ],
  onChange(s, key) {
    if (['pax', 'kc', 'damper'].includes(key)) s.focus = 'car';
    if (['mj', 'kb'].includes(key)) s.focus = 'bungee';
  },
  quiz: [
    { q: 'A car’s corner spring has k = 20,000 N/m. Adding 40 kg on that corner makes it sink about…', options: ['2 mm', '2 cm', '20 cm', '2 m'], answer: 1, why: 'x = F ÷ k = (40 × 9.81) ÷ 20,000 ≈ 0.02 m, about 2 cm.' },
    { q: 'What does a shock absorber do?', options: ['It is the spring', 'It turns the spring’s bouncing into heat so the car settles quickly', 'It makes the car lighter', 'It stops the wheel moving at all'], answer: 1, why: 'Springs store and return energy, so alone they bounce. The damper’s oil turns that energy into heat.' },
    { q: 'At the lowest point of a bungee jump, where has the energy of the fall gone?', options: ['Into the jumper’s speed', 'Into stretch energy in the cord, ½ k x²', 'It has vanished', 'Into the bridge'], answer: 1, why: 'At the bottom the jumper is still for an instant. Nearly all the height energy m g h is stored in the stretched cord.' },
  ],
  reel: [
    { ms: 5400, caption: 'A car rides on springs. Without a working damper, a speed breaker sets it bouncing.', set: { focus: 'car', pax: 2, kc: 22000, damper: false }, act: (s, inst) => inst.bump(), view: { pos: [0, 9.6, 14], target: [0, 9.2, 0] }, spin: 0 },
    { ms: 5600, caption: 'Bungee: the fall’s energy, m g h, ends up stretched into the cord as ½ k x².', set: { focus: 'bungee', mj: 75, kb: 75 }, act: (s, inst) => inst.jump(), view: { pos: [BX + 4, 14, 16], target: [BX + 4, 13.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gC = new THREE.Group(), gB = new THREE.Group(); root.add(gC, gB);
    gB.position.x = BX; gB.scale.setScalar(2);          // bungee parts are built at 1 unit = 5 m, shown doubled

    // ------------------------------------------------ car corner
    const U = CAR.U;
    const road = box(34, 0.4, 5, M.matte(0x2b2f36)); road.position.set(0, -0.2, 0); gC.add(road);
    const stripes = []; for (let i = 0; i < 8; i++) { const st = box(1.6, 0.02, 0.2, M.matte(0xe8e2c8)); st.position.set(-16 + i * 4.4, 0.01, 2.2); gC.add(st); stripes.push(st); }
    // Speed breaker: a rounded hump, extruded across the road.
    const shp = new THREE.Shape(); const HW = CAR.bumpW * U / 2, HH = CAR.bumpH * U;
    shp.moveTo(-HW, 0); for (let i = 0; i <= 24; i++) { const u = i / 24; shp.lineTo(-HW + u * 2 * HW, HH * Math.sin(Math.PI * u) ** 2); }
    const hump = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: 5, bevelEnabled: false }), M.matte(0xd9c24a)); hump.position.z = -2.5; gC.add(hump);
    const humpAt = (x) => (Math.abs(x) < CAR.bumpW / 2 ? CAR.bumpH * Math.sin(Math.PI * (x / CAR.bumpW + 0.5)) ** 2 : 0);   // metres
    // Wheel, strut and body.
    const wheel = new THREE.Group(); gC.add(wheel);
    const tyre = torus(2.3, 0.75, M.matte(0x1b1d22)); tyre.scale.z = 1.3; wheel.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.4, 32), M.metal(0xb9bec8)); rim.rotation.x = Math.PI / 2; wheel.add(rim);
    const spokes = new THREE.Group(); wheel.add(spokes);
    for (let i = 0; i < 5; i++) { const sp = box(0.35, 1.6, 0.2, M.metal(0x8a909c)); sp.position.y = 0.8; const p = new THREE.Group(); p.rotation.z = (i / 5) * TAU; p.position.z = 0.72; p.add(sp); spokes.add(p); }
    wheel.position.z = 1.1;
    const knuckle = box(0.9, 1.4, 0.6, M.metal(0x6f7886)); gC.add(knuckle);
    const arm = beam([0, 0, 0], [1, 0, 0], 0.22, M.metal(0x4a505c)); gC.add(arm);
    const cCoil = makeCoil({ turns: 7, R: 0.95, r: 0.16, mat: M.plastic(0xd23a2a, { roughness: 0.35 }), seg: 24 }); cCoil.position.z = -0.6; gC.add(cCoil);
    const dTube = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 2.2, 20), M.metal(0x2a2e37)); dTube.position.z = -0.6; gC.add(dTube);
    const dRod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12), M.metal(0xe0e4ea)); dRod.position.z = -0.6; gC.add(dRod);
    const seatL = box(1.2, 0.3, 1.2, M.metal(0x4a505c)); seatL.position.z = -0.6; gC.add(seatL);
    const body = new THREE.Group(); gC.add(body);
    const shell = box(8.4, 5.2, 4.4, M.clear(0xcfe0ff, 0.2)); shell.position.set(0, 2.6, -0.6); shell.castShadow = false; body.add(shell);
    const shellE = new THREE.LineSegments(new THREE.EdgesGeometry(shell.geometry), new THREE.LineBasicMaterial({ color: 0x9fb4c8, transparent: true, opacity: 0.6 })); shellE.position.copy(shell.position); body.add(shellE);
    const floor = box(8.4, 0.3, 4.4, M.matte(0x3a3f4b)); floor.position.set(0, 0.15, -0.6); body.add(floor);
    const people = [];
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Group(); p.position.set(-3.2 + i * 1.6, 0.3, -0.6); p.scale.setScalar(0.8); body.add(p);
      const torso = box(1.0, 1.7, 0.8, M.plastic([0x3a6fd8, 0xe06a4a, 0x4fb07a, 0xd9a93a, 0x9b6ad8][i])); torso.position.y = 1.15; p.add(torso);
      const head = sphere(0.45, M.plastic(0xd8a47f)); head.position.y = 2.5; p.add(head);
      people.push(p);
    }
    const lSag = stage.label('', [7.2, 5.4, 0], gC, 'hot');
    const lMass = stage.label('', [0, 13, 0], gC);
    const lDamp = stage.label('', [4.6, 4.2, 0], gC);

    // ------------------------------------------------ bungee: a bridge over a gorge
    const Hs = BJ.H * BJ.U;                                        // 8.6 units
    const river = box(17, 0.2, 5, M.clear(0x2e6bd6, 0.55)); river.position.set(1, 0.1, 0); gB.add(river);
    for (const x of [-6.2, 8.2]) { const cliff = box(3, Hs + 0.4, 4, M.matte(0x5a4d42, { roughness: 0.9 })); cliff.position.set(x, (Hs + 0.4) / 2, -1.6); gB.add(cliff); }
    const deck = box(15, 0.3, 1.6, M.matte(0x8a6a4a)); deck.position.set(1, Hs, 0); gB.add(deck);
    for (const z of [-0.75, 0.75]) { const rail = rod(-6.5, 8.5, 0.04, 0.04, M.metal(0x9aa3b2)); rail.position.set(0, Hs + 0.5, z); gB.add(rail); }
    const anchor = sphere(0.1, M.metal(0xd8dde6)); anchor.position.set(JX, Hs, 0.9); gB.add(anchor);
    const cordMat = M.plastic(0x2fb36a, { roughness: 0.5 });
    const cordA = beam([0, 0, 0], [0, 1, 0], 0.06, cordMat), cordB = beam([0, 0, 0], [0, 1, 0], 0.06, cordMat); gB.add(cordA, cordB);
    const jumper = new THREE.Group(); gB.add(jumper);
    const jBody = box(0.18, 0.2, 0.12, M.plastic(0xff7a59)); jBody.position.y = -0.18; jumper.add(jBody);   // hangs head-down from the ankles
    const jLegs = box(0.12, 0.16, 0.1, M.plastic(0x2a2e37)); jLegs.position.y = -0.02; jumper.add(jLegs);
    const jHead = sphere(0.07, M.plastic(0xd8a47f)); jHead.position.y = -0.34; jumper.add(jHead);
    const jScale = 1.8;                                           // drawn a little larger than life so you can see them
    jumper.scale.setScalar(jScale);
    const bot = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.03), M.glow(0xffb547, { transparent: true, opacity: 0.8 })); gB.add(bot);
    const lJump = stage.label('', [2.2, Hs - 1, 0.6], gB, 'hot');
    const lDeck = stage.label('bridge deck, 43 m up', [JX + 2.4, Hs + 0.7, 0.5], gB);
    const lRiver = stage.label('river', [JX + 2.5, 0.4, 2], gB);

    // ------------------------------------------------ chart (two panels)
    const trace = [];
    let cur = { focus: 'car', m: 242.5, k: 22000, xs: 0.108, pax: 1, xb: 0, Fb: 0, xMax: 0, mj: 75, kb: 75, bt: 0 };
    const chart = board(root, 9, 5.4, 800, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (cur.focus === 'car') {
        const a = axes(g, w, h, { x1: 370, xMax: 0.16, yMax: 3000, xTicks: [0, 0.04, 0.08, 0.12, 0.16], yTicks: [0, 1000, 2000, 3000], xFmt: (v) => Math.round(v * 100) + ' cm', yFmt: (v) => (v / 1000) + ' kN', xLabel: 'squeeze →', yLabel: 'load on spring ↑' });
        title(g, `This corner’s spring: k = ${(cur.k / 1000).toFixed(0)} kN/m`);
        const xe = Math.min(0.16, 3000 / cur.k);
        g.strokeStyle = COL.line; g.lineWidth = 5; g.beginPath(); g.moveTo(a.X(0), a.Y(0)); g.lineTo(a.X(xe), a.Y(cur.k * xe)); g.stroke();
        for (let p = 0; p <= 5; p++) { const F = (CAR.m0 + p * CAR.pax) * G, x = F / cur.k; if (x > 0.16) continue; g.fillStyle = p === cur.pax ? COL.hot : 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(a.X(x), a.Y(F), p === cur.pax ? 10 : 5, 0, TAU); g.fill(); }
        // body motion after the bump
        const b = axes(g, w, h, { x0: 470, x1: w - 24, xMax: 3, yMin: -0.08, yMax: 0.12, xTicks: [0, 1, 2, 3], yTicks: [-0.05, 0, 0.05, 0.1], xFmt: (v) => v + ' s', yFmt: (v) => Math.round(v * 100) + '', xLabel: 'time →', yLabel: 'height, cm ↑' });
        g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '17px sans-serif'; g.fillText('after the bump', 480, 96);
        const col = ['rgba(217,194,74,.6)', COL.line];
        [2, 1].forEach((ci) => { g.strokeStyle = col[ci - 1]; g.lineWidth = ci === 1 ? 2 : 4; g.beginPath(); trace.forEach((p, i) => { const X = b.X(p[0]), Y = b.Y(clamp(p[ci], -0.08, 0.12)); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); });
        g.fillStyle = COL.line; g.fillText('car body', 690, 96); g.fillStyle = 'rgba(217,194,74,.9)'; g.fillText('wheel', 690, 118);
      } else {
        const { X, Y, x1 } = axes(g, w, h, { y1: 96, xMax: 40, yMax: 4000, xTicks: [0, 10, 20, 30, 40], yTicks: [0, 1000, 2000, 3000, 4000], xFmt: (v) => v + ' m', yFmt: (v) => (v / 1000) + ' kN', xLabel: 'cord stretch →', yLabel: 'pull of the cord ↑' });
        title(g, `Bungee cord: k = ${cur.kb} N/m`, `12 m long, ${cur.mj} kg jumper`);
        const xe = Math.min(40, 4000 / cur.kb);
        const xm = Math.min(cur.xMax, xe);
        g.fillStyle = COL.energy; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xm), Y(0)); g.lineTo(X(xm), Y(cur.kb * xm)); g.closePath(); g.fill();
        g.strokeStyle = COL.line; g.lineWidth = 5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(xe), Y(cur.kb * xe)); g.stroke();
        const wt = cur.mj * G; g.setLineDash([6, 6]); g.strokeStyle = 'rgba(255,181,71,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(wt)); g.lineTo(x1, Y(wt)); g.stroke(); g.setLineDash([]);
        g.fillStyle = 'rgba(255,181,71,.85)'; g.font = '16px sans-serif'; g.fillText('jumper’s weight', x1 - 130, Y(wt) - 8);
        if (cur.xMax > 1) { g.fillStyle = COL.hot; g.font = 'bold 18px sans-serif'; g.fillText(`½kx² = ${(0.5 * cur.kb * cur.xMax * cur.xMax / 1000).toFixed(1)} kJ`, X(xm * 0.5) - 40, Y(cur.kb * xm * 0.2)); }
        if (cur.xb > 0) dot(g, X(Math.min(40, cur.xb)), Y(Math.min(4000, cur.Fb)), COL.hot, 10);
      }
    }, [-10.8, 4.4, 4.0]);
    chart.mesh.rotation.y = 0.25;

    // ------------------------------------------------ state
    const st = { yb: 0, vb: 0, t: 99, bumping: false, road: 0, spin: 0,
      jumping: false, y: 0, vy: 0, xMax: 0, peak: 0, tj: 0 };
    const kc0 = CAR.m0 * G / 22000;
    st.yb = CAR.R + (CAR.Lf - kc0) + 0.0;                              // body mount height, m, at rest
    let lastFocus = null, key = '', traceT = 0;
    const setBeam = (b, A, B) => { b.position.copy(A).add(B).multiplyScalar(0.5); b.scale.y = Math.max(0.001, A.distanceTo(B)); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();

    return {
      bump() { st.t = 0; st.bumping = true; trace.length = 0; traceT = 0; },
      jump() { st.jumping = true; st.y = 0; st.vy = 0; st.xMax = 0; st.peak = 0; st.tj = 0; },
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lDamp, lMass, lDeck, lRiver]);
        const bj = s.focus === 'bungee';
        gC.visible = !bj; gB.visible = bj;
        if (s.focus !== lastFocus) {
          if (lastFocus !== null && !inReel()) stage.setView(VIEWS[s.focus].pos, VIEWS[s.focus].target, 1.0);
          lastFocus = s.focus; chart.home = null;
          chart.mesh.position.set(...(bj ? [BX - 7, 5.0, 3.5] : [-10.8, 4.4, 4.0]));
        }
        reelBoards([[chart, bj ? [BX + 4, 25, 2] : [0, 18, -1.5], bj ? 1.2 : 1.05]]);
        // ---- car: m y'' = −m g + k (Lf − (y_b − y_w)) − c (y_b' − y_w'), body mount vs wheel centre.
        const m = CAR.m0 + s.pax * CAR.pax, k = s.kc, zeta = s.damper ? 0.3 : 0.03, c = 2 * zeta * Math.sqrt(k * m);
        const ts = dt / CAR.slow;
        const roadX = (t) => (st.bumping ? 1.2 - CAR.v * t : 99);           // where the bump is, ahead of the wheel, m
        const yw = (t) => CAR.R + humpAt(-roadX(t));
        const N = 20, h = ts / N;
        for (let i = 0; i < N; i++) {
          const t = st.t + i * h, ywv = yw(t), vw = (yw(t + 1e-3) - ywv) / 1e-3;
          const a = -G + (k * (CAR.Lf - (st.yb - ywv)) - c * (st.vb - vw)) / m;
          st.vb += a * h; st.yb += st.vb * h;
        }
        st.t += ts;
        if (st.bumping && roadX(st.t) < -1.6) st.bumping = false;
        const ywNow = yw(st.t);
        if (st.t < 3 && trace.length < 400 && st.t - traceT > 0.01) { traceT = st.t; const rest = CAR.R + CAR.Lf - m * G / k; trace.push([st.t, st.yb - rest, ywNow - CAR.R]); }
        // place parts (units)
        hump.position.x = st.bumping ? roadX(st.t) * U : 40;
        const roll = (st.bumping ? CAR.v : 0) * ts * U;
        stripes.forEach((sp) => { sp.position.x -= roll; if (sp.position.x < -17) sp.position.x += 35.2; });
        st.spin -= roll / 3; spokes.rotation.z = st.spin;
        wheel.position.set(0, ywNow * U, 1.1);
        knuckle.position.set(0, ywNow * U + 0.9, -0.6);
        const lowY = ywNow * U + 3.4, upY = lowY + (st.yb - ywNow) * U;   // spring seats: on a bracket above the tyre, and under the body
        setBeam(arm, vA.set(0, ywNow * U + 0.4, -0.6), vB.set(0, lowY, -0.6));
        cCoil.position.y = upY; cCoil.setLength(Math.max(0.5, upY - lowY));
        dTube.position.y = lowY + 1.1; dRod.position.y = upY - 1.6; seatL.position.y = lowY;
        body.position.y = upY;
        people.forEach((p, i) => { p.visible = i < s.pax; });
        const sag = m * G / k;
        lSag.position.set(3.4, (lowY + upY) / 2, 0); lDamp.position.set(-4.6, (lowY + upY) / 2, 0);
        lSag.element.innerHTML = `spring squeezed <b>${fmtLen(CAR.Lf - (st.yb - ywNow))}</b>`;
        lMass.position.set(6.2, upY + 4.2, 0);
        lMass.element.innerHTML = `<b>${Math.round(m)} kg</b> on this spring`;
        lDamp.element.innerHTML = s.damper ? 'damper working' : 'damper worn out';
        // ---- bungee (y = distance fallen below the deck, m)
        const mj = s.mj, kb = s.kb;
        if (st.jumping) {
          const M2 = 30, hh = dt / M2;
          for (let i = 0; i < M2; i++) {
            const stretch = Math.max(0, st.y - BJ.L0), drag = 0.5 * BJ.rho * BJ.CdA * st.vy * Math.abs(st.vy);
            const a = G - (kb * stretch + drag) / mj;
            st.vy += a * hh; st.y += st.vy * hh;
            st.xMax = Math.max(st.xMax, stretch); st.peak = Math.max(st.peak, kb * stretch);
          }
          st.tj += dt;
          if (st.tj > 25) st.jumping = false;
        }
        const yNow = st.jumping || st.tj > 0 ? st.y : 0;
        const yv = Hs - yNow * BJ.U;
        jumper.position.set(JX + 0.3, yv, 0.9);
        jumper.rotation.z = st.jumping ? clamp(st.vy * 0.02, -0.4, 0.4) : 0;
        vA.set(JX, Hs, 0.9); vB.set(JX + 0.3, yv, 0.9);
        const taut = yNow >= BJ.L0;
        if (taut) { setBeam(cordA, vA, vB); cordB.visible = false; cordA.scale.x = cordA.scale.z = clamp(1 - (yNow - BJ.L0) / 60, 0.45, 1); }
        else {                                                         // slack cord hangs in a loop below the jumper
          const loop = (BJ.L0 * BJ.U + (Hs - yv)) / 2;
          vC.set(JX + 0.15, Math.min(yv, Hs) - (loop - (Hs - yv)), 0.9);
          setBeam(cordA, vA, vC); setBeam(cordB, vC, vB); cordB.visible = true; cordA.scale.x = cordA.scale.z = 1;
        }
        // Lowest point this cord would reach (energy): m g (L0 + x) = ½ k x²
        const xLow = (mj * G + Math.sqrt((mj * G) ** 2 + 2 * kb * mj * G * BJ.L0)) / kb;
        bot.position.set(JX, Hs - (BJ.L0 + xLow) * BJ.U, 1.0);
        const clear = BJ.H - (BJ.L0 + xLow) - 1.8;
        lJump.position.set(JX + 2.2, clamp(yv, 1.2, Hs - 0.8), 0.9);
        lJump.element.innerHTML = clear < 0 ? `<b>Into the river!</b> Use a stiffer cord.` : `lowest point <b>${(BJ.L0 + xLow).toFixed(1)} m</b> down`;
        // ---- chart
        cur = { focus: s.focus, m, k, pax: s.pax, xb: Math.max(0, yNow - BJ.L0), Fb: kb * Math.max(0, yNow - BJ.L0), xMax: st.jumping || st.tj > 0 ? st.xMax : xLow, mj, kb };
        const k2 = `${s.focus}|${s.pax}|${Math.round(k)}|${mj}|${kb}|${yNow.toFixed(2)}|${trace.length}`;
        if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'bungee') {
          const mj = s.mj, kb = s.kb, w = mj * G;
          const x = (w + Math.sqrt(w * w + 2 * kb * w * BJ.L0)) / kb, F = kb * x, clear = BJ.H - (BJ.L0 + x) - 1.8;
          return `<div class="big">Stretch at the bottom: ${x.toFixed(1)} m</div>
            <div class="row"><span>Fall energy, m g (12 m + x)</span><b>${fmtJ(w * (BJ.L0 + x))}</b></div>
            <div class="row"><span>Stored in the cord, ½ k x²</span><b>${fmtJ(0.5 * kb * x * x)}</b></div>
            <div class="row"><span>Strongest pull, k × x</span><b>${fmtN(F)} (${(F / w).toFixed(1)} × weight)</b></div>
            <small>${clear < 0 ? 'Too heavy for this cord: the jumper would reach the river. Real crews weigh you and choose the cord.' : `The jumper’s head stops about ${clear.toFixed(1)} m above the water (air drag trims a little more).`}</small>`;
        }
        const m = CAR.m0 + s.pax * CAR.pax, k = s.kc, x = m * G / k, f = Math.sqrt(k / m) / TAU;
        return `<div class="big">Sag x = m g ÷ k = ${fmtLen(x)}</div>
          <div class="row"><span>Load on this spring</span><b>${Math.round(m)} kg · ${fmtN(m * G)}</b></div>
          <div class="row"><span>Spring stiffness</span><b>${fmtK(k)}</b></div>
          <div class="row"><span>Bounce rate, (1/2π) √(k ÷ m)</span><b>${f.toFixed(2)} per second</b></div>
          <small>Each passenger adds about ${fmtLen(CAR.pax * G / k)} of sag here. ${s.damper ? 'The damper settles a bump in about one bounce.' : 'With a dead damper, the body keeps bouncing.'}</small>`;
      },
    };
  },
};
