// Chapter 2: springs that weigh and springs that push back.
// Spring balance: a hanging market / luggage balance reading 0–10 kg over 10 cm of stretch, so
// k = 10 kg × 9.81 m/s² ÷ 0.10 m = 981 N/m. Because F = k x, equal steps of load give equal steps
// of stretch, and the scale can be printed with evenly spaced marks (Richard Salter's balance, c. 1770).
// It measures force, not mass: on the Moon (g = 1.62 m/s², NASA) 6 kg of onions reads about 1 kg.
// Scale: 1 scene unit = 5 cm.
// Click pen: a small compression spring round the refill's front, between a step inside the nose
// and a collar on the refill. We assume k = 0.25 N/mm (250 N/m), a typical value for a pen-sized
// compression spring. Refill in: squeezed 2 mm (0.5 N, just enough to hold the refill back).
// Refill out: squeezed 8 mm (2 N). Pressing the button all the way: 9.5 mm (about 2.4 N).
// Scale: 1 scene unit = 1 cm.
import { THREE, M, box, rod, latheX, sphere, beam } from '../kit.js';
import {
  G, G_MOON, makeCoil, makeHook, board, panelBg, axes, title, dot, COL, canvasTexture,
  fitNarrow, reelBoards, inReel, fmtN, fmtLen, fmtJ,
} from '../hooke.js';

const SB = { k: 981, U: 20, max: 10, L0: 2.0, top: 7.0 };
const PEN = { k: 250, x0: 0.002, xOut: 0.008, xMax: 0.0095, X: 24 };
const VIEWS = {
  scale: { pos: [-2.4, 7.2, 18.5], target: [-2.4, 5.4, 0] },
  pen: { pos: [PEN.X + 7.4, 5.6, 16.5], target: [PEN.X + 7.4, 3.5, 0] },
};

export default {
  id: 'measure',
  short: 'Weigh and click',
  title: 'Springs that weigh and push back',
  subtitle: 'A market balance and a click pen: both trust F = k × x.',
  view: VIEWS.scale,
  learn: `<p>A <b>spring balance</b> is Hooke's law turned into a tool. Hang a bag of onions on the hook and the spring stretches in proportion to the pull. Because the stretch is <b>proportional</b> to the force, every extra kilogram moves the pointer the <b>same distance</b>, so the scale can be printed with <b>evenly spaced</b> marks. Richard Salter was making spring balances in England by about 1770, and the hanging balance is still used in markets and for weighing luggage.</p>
    <p>Our balance reads 10 kg over 10 cm of stretch, so its spring has <b>k = 98.1 N ÷ 0.1 m ≈ 980 N/m</b>.</p>
    <p><b>Here's the catch:</b> a spring feels <b>force</b>, not mass. Take it to the Moon, where gravity is about a sixth as strong, and 6 kg of onions reads just 1 kg. A kitchen <b>pan balance</b>, which compares two masses, would read 6 kg anywhere.</p>
    <p>Inside a <b>click pen</b> (see PenClear), a little spring sits round the front of the refill. Press the button and you squeeze it about 8 mm, so it pushes back with about <b>2 N</b>, the weight of a small apple. The click mechanism locks the refill out. Click again, the lock lets go, and the squeezed spring snaps the tip back inside.</p>
    <p class="tip"><b>Try it:</b> load the balance and check the pointer moves 1 cm for every kilogram. Then fly it to the Moon. Switch to the pen and push the button slowly: the spring's force rises in a straight line.</p>`,
  terms: [
    { t: 'Spring balance', d: 'A scale that measures force by how far a spring stretches. Its marks are evenly spaced because F = k × x.' },
    { t: 'Weight', d: 'The pull of gravity on a mass, W = m × g. On Earth 1 kg weighs 9.81 N; on the Moon, 1.62 N.' },
    { t: 'Mass', d: 'How much stuff something is made of, in kilograms. It is the same everywhere.' },
    { t: 'Compression spring', d: 'A spring made to be squeezed rather than stretched. Hooke’s law works the same way.' },
    { t: 'Preload', d: 'A spring fitted already a little squeezed, so it pushes even at rest, like the pen spring holding the refill in.' },
  ],
  defaults: { focus: 'scale', load: 4, moon: false, pen: 'in', push: 0 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'scale', label: 'Spring balance' }, { v: 'pen', label: 'Click pen' }] },
    { key: 'load', type: 'range', label: 'Balance: onions in the basket', min: 0, max: 10, step: 0.5, ends: ['0 kg', '10 kg'], fmt: (v) => v.toFixed(1) + ' kg' },
    { key: 'moon', type: 'toggle', label: 'Balance: take it to the Moon', hint: 'Same onions, a sixth of the gravity.' },
    { key: 'push', type: 'range', label: 'Pen: push the button', min: 0, max: 1, step: 0.01, ends: ['let go', 'all the way'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'go', type: 'buttons', label: 'Pen', items: [{ label: 'Click', act: (s) => { s.focus = 'pen'; s.pen = s.pen === 'in' ? 'out' : 'in'; s.push = 0; } }] },
  ],
  onChange(s, key) {
    if (key === 'load' || key === 'moon') s.focus = 'scale';
    if (key === 'push') s.focus = 'pen';
  },
  quiz: [
    { q: 'Why are the marks on a spring balance evenly spaced?', options: ['To look neat', 'The stretch is proportional to the force, so each kilogram adds the same stretch', 'The spring gets stiffer as it stretches', 'Gravity is stronger lower down'], answer: 1, why: 'F = k × x. Double the load, double the stretch, so equal steps of load are equal steps along the scale.' },
    { q: 'You weigh 6 kg of onions with a spring balance on the Moon. It reads about…', options: ['6 kg', '36 kg', '1 kg', '0 kg'], answer: 2, why: 'The spring measures force. Moon gravity is about a sixth of Earth’s, so the pull, and the reading, is about a sixth: 1 kg.' },
    { q: 'A pen spring has k = 250 N/m and is squeezed 8 mm. How hard does it push?', options: ['2 N', '31 N', '0.25 N', '2,000 N'], answer: 0, why: 'F = k × x = 250 N/m × 0.008 m = 2 N.' },
  ],
  reel: [
    { ms: 5200, caption: 'A spring balance: each kilo stretches the spring the same 1 cm, so the scale is even.', set: { focus: 'scale', moon: false }, anim: { load: [0, 10] }, view: { pos: [0, 8.0, 8.4], target: [0, 7.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gP = new THREE.Group(); root.add(gS, gP);
    gP.position.x = PEN.X;

    // ------------------------------------------------ spring balance (y up; origin on the floor)
    const steel = M.metal(0xc9ced8, { roughness: 0.3 }), brassy = M.metal(0xc9a24a, { roughness: 0.35 });
    const T = SB.top + 2.2;                                             // top of the housing
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 32), steel); ring.position.set(0, T + 0.5, 0); gS.add(ring);
    const beamTop = rod(-2.2, 2.2, 0.16, 0.16, M.matte(0x7a5234)); beamTop.position.set(0, T + 0.86, 0); beamTop.rotation.y = 0.0; gS.add(beamTop);
    const housing = box(1.3, 5.4, 0.9, M.clear(0xd8ecff, 0.16)); housing.position.set(0, T - 2.7, 0); housing.castShadow = false; gS.add(housing);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(housing.geometry), new THREE.LineBasicMaterial({ color: 0x9fb4c8, transparent: true, opacity: 0.55 })); edges.position.copy(housing.position); gS.add(edges);
    const capT = box(1.4, 0.18, 1.0, brassy); capT.position.set(0, T, 0); gS.add(capT);
    const capB = box(1.4, 0.18, 1.0, brassy); capB.position.set(0, T - 5.4, 0); gS.add(capB);
    const coil = makeCoil({ turns: 16, R: 0.28, r: 0.035, mat: steel }); coil.position.set(0, T - 0.1, 0); gS.add(coil);
    const rodS = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 12), steel); gS.add(rodS);
    const pointer = box(0.9, 0.05, 0.05, M.glow(0xff7a59)); gS.add(pointer);
    const hook = makeHook(steel, 1.6); gS.add(hook);
    // The printed scale: kilograms on the left, newtons on the right, both evenly spaced.
    const faceTex = canvasTexture(256, 1024, (g, W, H) => {
      g.fillStyle = '#f4efe2'; g.fillRect(0, 0, W, H);
      const y = (kg) => 40 + (kg / SB.max) * (H - 80);
      g.strokeStyle = '#222'; g.fillStyle = '#222';
      for (let i = 0; i <= 20; i++) { const kg = i / 2, L = i % 2 ? 26 : 50; g.lineWidth = i % 2 ? 2 : 4; g.beginPath(); g.moveTo(W / 2 - L, y(kg)); g.lineTo(W / 2, y(kg)); g.stroke(); if (!(i % 2)) { g.font = 'bold 40px sans-serif'; g.fillText(String(kg), 14, y(kg) + 14); } }
      for (let n = 0; n <= 100; n += 10) { g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, y(n / G)); g.lineTo(W / 2 + 34, y(n / G)); g.stroke(); if (n % 20 === 0) { g.font = '30px sans-serif'; g.fillStyle = '#6a4a1a'; g.fillText(String(n), W / 2 + 42, y(n / G) + 11); g.fillStyle = '#222'; } }
      g.font = 'bold 34px sans-serif'; g.fillStyle = '#b3261e'; g.fillText('kg', 14, H - 8); g.fillText('N', W - 44, H - 8);
    });
    const zeroY = T - 0.1 - SB.L0, fullY = zeroY - 0.1 * SB.U;           // pointer at 0 kg and at 10 kg
    const faceH = (fullY - zeroY) * (1024 / (1024 - 80));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.1, Math.abs(faceH)), new THREE.MeshBasicMaterial({ map: faceTex.tex, toneMapped: false }));
    face.position.set(-1.32, (zeroY + fullY) / 2 + (faceH < 0 ? 0 : 0), 0.46); gS.add(face);
    const faceBack = box(1.2, Math.abs(faceH) + 0.1, 0.06, M.matte(0x2a2e37)); faceBack.position.set(-1.32, face.position.y, 0.41); gS.add(faceBack);
    // A woven basket and onions.
    const basket = new THREE.Group(); gS.add(basket);
    const bowl = latheX([[0, 0], [0, 0.75], [0.1, 0.95], [0.6, 1.12], [0.65, 1.09], [0.12, 0.88]], M.matte(0x9c6b3c, { side: THREE.DoubleSide }), { seg: 36 });
    bowl.rotation.z = Math.PI / 2; bowl.position.y = 0; basket.add(bowl);
    const onions = [];
    const onionMat = [M.plastic(0xa8455a, { roughness: 0.5 }), M.plastic(0xc2566c, { roughness: 0.5 })];
    for (let i = 0; i < 30; i++) { const o = sphere(0.19, onionMat[i % 2], 16); const a = i * 2.4, ring2 = i % 10; const r = 0.15 + 0.55 * ((ring2 * 0.37) % 1); o.position.set(Math.cos(a) * r, 0.3 + Math.floor(i / 10) * 0.22, Math.sin(a) * r); basket.add(o); onions.push(o); }
    const strings = []; for (let i = 0; i < 3; i++) { const b = beam([0, 0, 0], [0, 1, 0], 0.012, M.matte(0x444444)); gS.add(b); strings.push(b); }
    const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(40, 48), M.matte(0x8a8a8a)); moonDisc.rotation.x = -Math.PI / 2; moonDisc.position.y = 0.005; gS.add(moonDisc);
    const lRead = stage.label('', [1.25, 6.5, 0.4], gS, 'hot');
    const lSpring = stage.label('', [1.25, 8.4, 0.4], gS);
    const lMoon = stage.label('', [0, 0.5, 1.8], gS);

    // ------------------------------------------------ click pen (along X; the tip points to −X)
    const barrelMat = M.clear(0xcfe8ff, 0.2);
    const barrel = latheX([[0.7, 0.12], [1.9, 0.42], [2.2, 0.46], [13.8, 0.46], [13.8, 0.3]], barrelMat, { seg: 40 }); barrel.castShadow = false; barrel.position.y = 1.6; gP.add(barrel);
    const barrelIn = latheX([[0.7, 0.1], [1.9, 0.38], [2.2, 0.42], [13.8, 0.42]], M.clear(0xcfe8ff, 0.12), { seg: 40 }); barrelIn.position.y = 1.6; gP.add(barrelIn);
    const grip = latheX([[2.2, 0.49], [2.4, 0.52], [4.8, 0.52], [5.0, 0.49]], M.plastic(0x2a2e37, { transparent: true, opacity: 0.55 }), { seg: 40 }); grip.position.y = 1.6; gP.add(grip);
    const clip = box(4.6, 0.06, 0.22, M.metal(0xd8dde6)); clip.position.set(11.2, 2.16, 0); gP.add(clip);
    const step = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 24), M.plastic(0x2a2e37)); step.rotation.y = Math.PI / 2; step.position.set(1.2, 1.6, 0); gP.add(step);
    const refill = new THREE.Group(); refill.position.y = 1.6; gP.add(refill);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 20), M.metal(0xd8dde6)); tip.rotation.z = Math.PI / 2; tip.position.x = 0.25; refill.add(tip);
    const ball = sphere(0.04, M.metal(0x333333), 12); refill.add(ball);
    const front = rod(0.5, 2.6, 0.1, 0.1, M.metal(0xd8dde6)); refill.add(front);
    const collar = rod(2.2, 2.4, 0.26, 0.26, M.plastic(0x3a6fd8)); refill.add(collar);
    const tubeR = rod(2.4, 11.2, 0.17, 0.17, M.clear(0xf4f4f4, 0.5)); refill.add(tubeR);
    const ink = rod(2.5, 8.5, 0.12, 0.12, M.plastic(0x2b4cc4)); refill.add(ink);
    const penCoil = makeCoil({ turns: 9, R: 0.2, r: 0.028, mat: M.metal(0xe0e4ea, { roughness: 0.2 }) });
    penCoil.rotation.z = Math.PI / 2; penCoil.position.set(1.25, 1.6, 0); gP.add(penCoil);
    const plunger = new THREE.Group(); plunger.position.y = 1.6; gP.add(plunger);
    plunger.add(rod(0, 1.9, 0.3, 0.3, M.plastic(0x3a6fd8)));
    const cam = rod(0.1, 0.9, 0.36, 0.36, M.plastic(0xffffff, { transparent: true, opacity: 0.5 })); plunger.add(cam);
    const thumb = forceArrowLike(); gP.add(thumb);
    const penStand = box(15, 0.1, 2.2, M.matte(0x3a3f4b)); penStand.position.set(7, 0.05, 0); gP.add(penStand);
    const lPen = stage.label('', [1.6, 3.0, 0], gP, 'hot');
    const lTip = stage.label('', [0.2, 0.9, 0.3], gP);
    const lBtn = stage.label('your thumb', [14.6, 2.6, 0], gP);

    function forceArrowLike() {
      const g = new THREE.Group(), mat = M.glow(0xffb547);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 10), mat); sh.rotation.z = Math.PI / 2; sh.position.x = 0.95; g.add(sh);
      const hd = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 14), mat); hd.rotation.z = Math.PI / 2; hd.position.x = 0.2; g.add(hd);
      return g;
    }

    // ------------------------------------------------ chart
    let cur = { focus: 'scale', load: 4, moon: false, x: 0.002 };
    const chart = board(root, 4.4, 3.3, 640, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (cur.focus === 'scale') {
        const { X, Y, x1 } = axes(g, w, h, { xMax: 10, yMax: 100, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 20, 40, 60, 80, 100], xFmt: (v) => v + ' cm', yFmt: (v) => v + ' N', xLabel: 'stretch →', yLabel: 'pull on the hook ↑' });
        title(g, 'Balance spring: k ≈ 980 N/m');
        for (let kg = 1; kg <= 10; kg++) { g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(X(kg), Y(kg * G), 4, 0, Math.PI * 2); g.fill(); }
        g.strokeStyle = COL.line; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(10), Y(98.1)); g.stroke();
        const F = cur.load * (cur.moon ? G_MOON : G), xcm = (F / SB.k) * 100;
        dot(g, X(xcm), Y(F), COL.hot, 11);
        g.fillStyle = COL.hot; g.font = 'bold 20px sans-serif'; const t = `reads ${(F / G).toFixed(1)} kg`; g.fillText(t, Math.min(x1 - g.measureText(t).width, X(xcm) + 16), Y(F) + 6);
      } else {
        const { X, Y, x1 } = axes(g, w, h, { xMax: 10, yMax: 3, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 1, 2, 3], xFmt: (v) => v + ' mm', yFmt: (v) => v + ' N', xLabel: 'squeeze →', yLabel: 'spring push ↑' });
        title(g, 'Pen spring: k = 0.25 N/mm');
        g.strokeStyle = COL.line; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(10), Y(2.5)); g.stroke();
        const mark = (mm, txt) => { g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '17px sans-serif'; g.beginPath(); g.arc(X(mm), Y(mm * 0.25), 6, 0, Math.PI * 2); g.fill(); g.fillText(txt, X(mm) + 10, Y(mm * 0.25) + 22); };
        mark(2, 'tip in'); mark(8, 'tip out');
        const mm = cur.x * 1000; dot(g, X(mm), Y(mm * 0.25), COL.hot, 11);
        g.fillStyle = COL.hot; g.font = 'bold 20px sans-serif'; const t = `${(PEN.k * cur.x).toFixed(2)} N`; g.fillText(t, x1 - g.measureText(t).width, 34);
      }
    }, [5.2, 5.6, -0.4]);
    chart.mesh.rotation.y = -0.15;

    let ext = 0, pX = PEN.x0, lastFocus = null, key = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lSpring, lMoon, lBtn, lTip]);
        const pen = s.focus === 'pen';
        gS.visible = !pen; gP.visible = pen;
        if (s.focus !== lastFocus) {
          if (lastFocus !== null && !inReel()) stage.setView(VIEWS[s.focus].pos, VIEWS[s.focus].target, 1.0);
          lastFocus = s.focus;
          chart.home = null;
          chart.mesh.position.set(...(pen ? [PEN.X + 11.0, 5.8, -0.8] : [-8.0, 3.4, 1.0]));
          chart.mesh.rotation.y = pen ? -0.15 : 0.22;
        }
        reelBoards([[chart, pen ? [PEN.X + 6.5, 6.0, -0.8] : [0, 12.6, -0.4], 1.25]]);
        // ---- balance
        const g = s.moon ? G_MOON : G, F = s.load * g;
        ext = ext + (F / SB.k - ext) * (1 - Math.exp(-7 * dt));
        const L = SB.L0 + ext * SB.U;
        coil.setLength(L);
        const bot = T - 0.1 - L;
        rodS.position.set(0, bot - 1.0, 0);
        pointer.position.set(-0.75, bot, 0.46);
        const hookY = bot - 2.0;
        hook.position.set(0, hookY, 0);
        const bY = hookY - 0.62 - 1.6;
        basket.position.set(0, bY, 0);
        const nOn = Math.round(s.load * 3);
        onions.forEach((o, i) => { o.visible = i < nOn; });
        const top = new THREE.Vector3(0, hookY - 0.5, 0);
        strings.forEach((b, i) => {
          const a = (i / 3) * Math.PI * 2, p = new THREE.Vector3(Math.cos(a) * 1.05, bY + 0.62, Math.sin(a) * 1.05);
          b.position.copy(top).add(p).multiplyScalar(0.5); b.scale.y = top.distanceTo(p);
          b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(top).normalize());
        });
        moonDisc.visible = s.moon; stage.floor.visible = !s.moon || pen;
        lRead.position.set(1.0, bot, 0.4);
        lRead.element.innerHTML = `reads <b>${(F / G).toFixed(1)} kg</b>`;
        lSpring.element.innerHTML = `spring stretched <b>${fmtLen(ext)}</b>`;
        lMoon.element.innerHTML = s.moon ? `On the Moon: <b>${s.load.toFixed(1)} kg</b> of onions` : `<b>${s.load.toFixed(1)} kg</b> of onions`;
        // ---- pen: compression = max(resting, pushed)
        const rest = s.pen === 'out' ? PEN.xOut : PEN.x0;
        const target = Math.max(rest, PEN.x0 + s.push * (PEN.xMax - PEN.x0));
        pX = pX + (target - pX) * (1 - Math.exp(-14 * dt));
        const tipX = 1.0 - (pX - PEN.x0) * 100;                           // refill moves 1 unit per cm
        refill.position.x = tipX;
        penCoil.position.x = 1.25; penCoil.setLength(tipX + 2.2 - 1.25);
        plunger.position.x = tipX + 11.2;
        thumb.position.set(tipX + 13.2, 1.6, 0); thumb.visible = s.push > 0.02;
        lPen.position.set(1.8, 2.7, 0);
        lPen.element.innerHTML = `spring squeezed <b>${(pX * 1000).toFixed(1)} mm</b><br>pushes back <b>${fmtN(PEN.k * pX)}</b>`;
        lTip.element.textContent = tipX < 0.7 ? 'tip out: ready to write' : 'tip safely inside';
        const k2 = `${s.focus}|${s.load}|${s.moon}|${pX.toFixed(5)}|${ext.toFixed(5)}`;
        cur = { focus: s.focus, load: s.load, moon: s.moon, x: pX };
        if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'pen') {
          const x = s.pen === 'out' ? Math.max(PEN.xOut, PEN.x0 + s.push * (PEN.xMax - PEN.x0)) : PEN.x0 + s.push * (PEN.xMax - PEN.x0);
          return `<div class="big">F = k × x = ${fmtN(PEN.k * x)}</div>
            <div class="row"><span>Spring squeezed</span><b>${(x * 1000).toFixed(1)} mm</b></div>
            <div class="row"><span>Stiffness</span><b>250 N/m (0.25 N per mm)</b></div>
            <div class="row"><span>Energy stored, ½ k x²</span><b>${fmtJ(0.5 * PEN.k * x * x)}</b></div>
            <small>${s.pen === 'out' ? 'The click has locked the refill out. Click again and the spring pulls it back in.' : 'Even at rest the spring is squeezed 2 mm, so it holds the refill in.'}</small>`;
        }
        const g = s.moon ? G_MOON : G, F = s.load * g, x = F / SB.k;
        return `<div class="big">Reads ${(F / G).toFixed(1)} kg</div>
          <div class="row"><span>Pull on the hook, m × g</span><b>${fmtN(F)}</b></div>
          <div class="row"><span>Stretch, F ÷ k</span><b>${fmtLen(x)}</b></div>
          <div class="row"><span>Spring constant</span><b>981 N/m</b></div>
          <small>${s.moon ? 'Same onions, a sixth of the pull. A spring balance measures weight, not mass.' : 'Every kilogram adds 9.81 N and exactly 1 cm of stretch.'}</small>`;
      },
    };
  },
};
