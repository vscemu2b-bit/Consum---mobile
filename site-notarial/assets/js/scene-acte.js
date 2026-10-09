/* ==========================================================================
   Scène 3D « De la plume au sceau » : la vie d'un acte authentique
   1. Rédaction  2. Vérifications  3. Signature  4. Sceau  5. Conservation
   ========================================================================== */
import * as THREE from 'three';
import { clamp, easeOutCubic, easeInOut, sectionProgress, makeRenderer, watchVisibility, reducedMotion } from './utils3d.js';

const GOLD = 0xc9a45c;
const W = 3, D = 4.2, TOP = 0.22;          // dimensions d'une page (unités monde)
const CW = 600, CH = 840;                   // résolution du canevas de la page
const SERIF = '"Cormorant Garamond", Georgia, serif';

const TEXT = [
  'PAR-DEVANT Maître ****, notaire associé',
  'de la société « Atrium Notaires », titulaire',
  'd\'un office notarial à Paris (Ier arrondissement),',
  'A REÇU le présent acte authentique de VENTE',
  'à la requête des parties ci-après identifiées.',
  '',
  'IDENTIFICATION DES PARTIES',
  'VENDEUR — Monsieur et Madame ****, demeurant…',
  'ACQUÉREUR — La société ****, société par actions',
  'simplifiée, immatriculée au RCS de Paris…',
  '',
  'DÉSIGNATION DU BIEN',
  'Dans un ensemble immobilier situé à Paris, les',
  'lots numéros 12 et 47 de l\'état descriptif de',
  'division, avec les tantièmes des parties communes.',
  '',
  'PRIX — La vente est consentie et acceptée moyennant',
  'un prix payé comptant par virement ce jour…',
];
const TOTAL_CHARS = TEXT.reduce((n, l) => n + l.length, 0);

/* Points d'une signature manuscrite (Bézier échantillonnée) */
function sampleSignature(x0, y0, scale, variant) {
  const segs = variant
    ? [[0, 0, 20, -40, 35, 30, 55, -5], [55, -5, 70, -30, 80, 25, 100, 0], [100, 0, 120, -25, 130, 20, 160, -10]]
    : [[0, 10, 10, -35, 40, 40, 60, 0], [60, 0, 75, -35, 95, 30, 115, -8], [115, -8, 135, -30, 150, 15, 175, 5], [20, 25, 70, 18, 120, 30, 170, 20]];
  const pts = [];
  segs.forEach(([ax, ay, b1x, b1y, b2x, b2y, cx, cy]) => {
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, u = 1 - t;
      const x = u * u * u * ax + 3 * u * u * t * b1x + 3 * u * t * t * b2x + t * t * t * cx;
      const y = u * u * u * ay + 3 * u * u * t * b1y + 3 * u * t * t * b2y + t * t * t * cy;
      pts.push([x0 + x * scale, y0 + y * scale]);
    }
  });
  return pts;
}
const SIG_A = sampleSignature(70, 690, 0.95, 0);
const SIG_B = sampleSignature(380, 690, 0.95, 1);

function drawSeal(g, x, y, r, alpha) {
  g.save();
  g.globalAlpha = alpha;
  const grd = g.createRadialGradient(x - r * .3, y - r * .3, 2, x, y, r);
  grd.addColorStop(0, '#f1d99c'); grd.addColorStop(.7, '#c9a45c'); grd.addColorStop(1, '#8f6c2b');
  g.fillStyle = grd;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(90,60,20,.7)'; g.lineWidth = 2;
  g.beginPath(); g.arc(x, y, r * .78, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(70,45,15,.85)';
  g.font = `600 ${r * .19}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const label = '· ATRIUM NOTAIRES · PARIS ';
  for (let i = 0; i < label.length; i++) {
    const a = (i / label.length) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(x + Math.cos(a) * r * .89, y + Math.sin(a) * r * .89); g.rotate(a + Math.PI / 2); g.fillText(label[i], 0, 0); g.restore();
  }
  g.font = `600 ${r * .62}px ${SERIF}`; g.fillText('N', x, y + 2);
  g.restore();
}

export function initActeScene(canvas, section, { onProgress } = {}) {
  const renderer = makeRenderer(canvas);
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xb9c6ea, 0x0a0f1c, 0.9));
  const key = new THREE.DirectionalLight(0xfff0d6, 2.0);
  key.position.set(4, 10, 6);
  scene.add(key);
  const warm = new THREE.PointLight(GOLD, 18, 20, 1.5);
  warm.position.set(-4, 3, 2);
  scene.add(warm);

  const world = new THREE.Group();
  scene.add(world);
  const book = new THREE.Group();
  world.add(book);

  /* Bureau : plateau sombre à filet doré */
  const desk = new THREE.Mesh(new THREE.CircleGeometry(7.5, 64), new THREE.MeshStandardMaterial({ color: 0x121a2e, roughness: .6, metalness: .2 }));
  desk.rotation.x = -Math.PI / 2;
  world.add(desk);
  const deskRing = new THREE.Mesh(new THREE.RingGeometry(7.45, 7.5, 128), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .5 }));
  deskRing.rotation.x = -Math.PI / 2; deskRing.position.y = .005;
  world.add(deskRing);

  /* Canevas de la page principale --------------------------------------------- */
  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = CW; pageCanvas.height = CH;
  const g = pageCanvas.getContext('2d');
  const pageTex = new THREE.CanvasTexture(pageCanvas);
  pageTex.colorSpace = THREE.SRGBColorSpace;
  pageTex.anisotropy = 8;
  const pen = { x: 60, y: 200 };
  let lastKey = '';

  function drawPage(write, sig, seal) {
    const key = `${Math.round(write * TOTAL_CHARS)}|${Math.round(sig * 200)}|${Math.round(seal * 40)}`;
    if (key === lastKey) return;
    lastKey = key;
    const grd = g.createLinearGradient(0, 0, CW, CH);
    grd.addColorStop(0, '#fbf6ea'); grd.addColorStop(1, '#ece2cb');
    g.fillStyle = grd; g.fillRect(0, 0, CW, CH);
    g.strokeStyle = 'rgba(160,125,60,.6)'; g.lineWidth = 2; g.strokeRect(26, 26, CW - 52, CH - 52);
    g.lineWidth = .8; g.strokeRect(34, 34, CW - 68, CH - 68);
    g.fillStyle = '#23232e'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `600 34px ${SERIF}`; g.fillText('ACTE AUTHENTIQUE', CW / 2, 96);
    g.font = `italic 22px ${SERIF}`; g.fillStyle = '#7a6436'; g.fillText('L\'an deux mille vingt-six', CW / 2, 128);
    g.strokeStyle = 'rgba(160,125,60,.6)'; g.beginPath(); g.moveTo(CW / 2 - 60, 146); g.lineTo(CW / 2 + 60, 146); g.stroke();

    // Texte écrit progressivement
    let chars = Math.round(write * TOTAL_CHARS);
    g.textAlign = 'left';
    for (let i = 0; i < TEXT.length && chars > 0; i++) {
      const line = TEXT[i];
      const isHead = line === line.toUpperCase() && line.length > 0 && !line.includes('—');
      g.font = isHead ? `600 19px ${SERIF}` : `19px ${SERIF}`;
      g.fillStyle = isHead ? '#5b4520' : '#2b2b36';
      const shown = line.slice(0, chars);
      const y = 186 + i * 25;
      g.fillText(shown, 64, y);
      pen.x = 64 + g.measureText(shown).width; pen.y = y;
      chars -= line.length;
    }

    // Bloc de signature
    g.font = `italic 18px ${SERIF}`; g.fillStyle = '#7a6436';
    g.fillText('Les parties', 70, 650); g.fillText('Le notaire', 380, 650);
    g.strokeStyle = 'rgba(122,100,54,.4)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(70, 735); g.lineTo(260, 735); g.moveTo(380, 735); g.lineTo(540, 735); g.stroke();
    const drawSig = (pts, k) => {
      const n = Math.floor(pts.length * k);
      if (n < 2) return null;
      g.strokeStyle = '#1b2a5c'; g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.stroke();
      return pts[n - 1];
    };
    if (sig > 0) {
      const a = drawSig(SIG_A, clamp(sig * 2));
      const b = drawSig(SIG_B, clamp(sig * 2 - 1));
      const last = b || a;
      if (last) { pen.x = last[0]; pen.y = last[1]; }
    }
    if (seal > 0) drawSeal(g, 470, 760, 52, seal);
    pageTex.needsUpdate = true;
  }

  /* Livre ouvert : piles gauche et droite ------------------------------------ */
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xefe6d2, roughness: .95 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd9ccb0, roughness: 1 });
  const stackMats = [edgeMat, edgeMat, paperMat, edgeMat, edgeMat, edgeMat];
  const right = new THREE.Mesh(new THREE.BoxGeometry(W, TOP, D), stackMats);
  right.position.set(W / 2 + 0.02, TOP / 2, 0);
  const left = new THREE.Mesh(new THREE.BoxGeometry(W, TOP * .7, D), stackMats);
  left.position.set(-W / 2 - 0.02, TOP * .35, 0);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(W * 2 + 0.3, 0.06, D + 0.25), new THREE.MeshStandardMaterial({ color: 0x1f2b4d, roughness: .5, metalness: .2 }));
  cover.position.y = -0.02;
  book.add(cover, right, left);

  const page = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: pageTex, roughness: .9 }));
  page.rotation.x = -Math.PI / 2;
  page.position.set(W / 2 + 0.02, TOP + 0.002, 0);
  book.add(page);

  // Feuillets qui se tournent (lecture de l'acte)
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = 300; c.height = 420;
    const x = c.getContext('2d');
    x.fillStyle = '#f6efdf'; x.fillRect(0, 0, 300, 420);
    x.strokeStyle = 'rgba(160,125,60,.5)'; x.strokeRect(14, 14, 272, 392);
    x.fillStyle = 'rgba(40,40,55,.35)';
    for (let i = 0; i < 16; i++) x.fillRect(34, 50 + i * 21, 232 - (i % 3) * 30, 4);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const leaves = [0, 1, 2, 3].map((i) => {
    const pivot = new THREE.Group();
    pivot.position.set(0, TOP + 0.01 + i * 0.004, 0);
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(W, D, 12, 1), new THREE.MeshStandardMaterial({ map: leafTex, side: THREE.DoubleSide, roughness: .95, transparent: true, opacity: 0 }));
    leaf.rotation.x = -Math.PI / 2;
    leaf.position.x = W / 2;
    pivot.add(leaf);
    book.add(pivot);
    return { pivot, leaf };
  });

  /* Pièces annexes qui viennent se ranger (vérifications) -------------------- */
  const annexNames = ['État hypothécaire', 'Urbanisme', 'État civil', 'Purge DPU'];
  const annexes = annexNames.map((name, i) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 340;
    const x = c.getContext('2d');
    x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, 256, 340);
    x.fillStyle = '#c9a45c'; x.fillRect(0, 0, 256, 54);
    x.fillStyle = '#0a0f1c'; x.font = `600 24px ${SERIF}`; x.textAlign = 'center'; x.fillText(name, 128, 36);
    x.fillStyle = 'rgba(40,40,55,.3)';
    for (let k = 0; k < 9; k++) x.fillRect(26, 84 + k * 22, 204 - (k % 3) * 34, 4);
    x.strokeStyle = '#2f7a4c'; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath(); x.arc(196, 284, 34, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.moveTo(180, 285); x.lineTo(192, 298); x.lineTo(214, 270); x.stroke();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.53), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: .9 }));
    const a = (i / 4) * Math.PI * 2 + 0.6;
    m.userData = {
      from: new THREE.Vector3(Math.cos(a) * 5.5, 2.2 + i * .3, Math.sin(a) * 4),
      to: new THREE.Vector3(-W / 2 - 0.25 + i * 0.28, TOP * .7 + 0.03 + i * 0.012, -0.9 + i * 0.55),
      rot: -0.25 + i * 0.16,
    };
    m.visible = false;
    world.add(m);
    return m;
  });

  /* Plume ---------------------------------------------------------------- */
  const penGroup = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.5, 24), new THREE.MeshStandardMaterial({ color: 0x0d0f18, roughness: .25, metalness: .6 }));
  body.position.y = 0.95;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.073, 0.08, 24), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: .25 }));
  band.position.y = 0.5;
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 24), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: .2 }));
  nib.rotation.x = Math.PI; nib.position.y = 0.16;
  penGroup.add(body, band, nib);
  const penPivot = new THREE.Group();
  penPivot.add(penGroup);
  penGroup.rotation.set(-0.35, 0, -0.5);
  book.add(penPivot);

  /* Sceau ------------------------------------------------------------------ */
  const sealGroup = new THREE.Group();
  const sealBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.22, 48), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: .28 }));
  sealBase.position.y = 0.11;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 32), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: .3 }));
  neck.position.y = 0.45;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: .45, metalness: .1 }));
  handle.position.y = 1.1;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: .45 }));
  knob.position.y = 1.62;
  sealGroup.add(sealBase, neck, handle, knob);
  book.add(sealGroup);
  // Position du sceau sur la page (pixels du canevas → monde)
  const toWorld = (px, py) => new THREE.Vector3(0.02 + (px / CW) * W, TOP, -D / 2 + (py / CH) * D);
  const sealSpot = toWorld(470, 760);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 64), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  shock.rotation.x = -Math.PI / 2;
  shock.position.set(sealSpot.x, TOP + 0.01, sealSpot.z);
  book.add(shock);

  /* Minutier : rayonnage d'archives + nuage (Minutier central électronique) */
  const archive = new THREE.Group();
  archive.position.set(0, 0, -6.5);
  world.add(archive);
  const COLS = 9, ROWS = 5;
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.62, 0.7), new THREE.MeshStandardMaterial({ color: 0x34437a, roughness: .55, metalness: .25 }), COLS * ROWS);
  archive.add(boxes);
  const shelfLines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(COLS * 1.0, ROWS * 0.75, 0.8)), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0 }));
  shelfLines.position.y = ROWS * 0.75 / 2;
  archive.add(shelfLines);
  const slot = new THREE.Vector3(0, 2 * 0.75 + 0.375, 0); // emplacement libre pour la minute
  const dummy = new THREE.Object3D();
  const cloud = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0 }));
  cloud.position.set(0, ROWS * 0.75 + 2.2, 0);
  archive.add(cloud);
  const STREAM = 160;
  const sPos = new Float32Array(STREAM * 3);
  const sSeed = new Float32Array(STREAM).map(() => Math.random());
  const stream = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(sPos, 3)), new THREE.PointsMaterial({ color: 0xe6cf9b, size: 0.07, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  archive.add(stream);

  /* Responsive -------------------------------------------------------------- */
  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w / h > 1.1;
    camera.fov = wide ? 36 : 50;
    camera.updateProjectionMatrix();
    if (wide) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
  }
  resize();
  window.addEventListener('resize', resize);
  document.fonts?.ready.then(() => { lastKey = ''; });

  const reduce = reducedMotion();
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let lastP = -1;

  function update() {
    const t = clock.getElapsedTime();
    const p = sectionProgress(section);
    if (Math.abs(p - lastP) > 0.0005) { onProgress?.(p); lastP = p; }
    const s = (i) => clamp((p - i * 0.2) / 0.2);
    const s1 = s(0), s2 = s(1), s3 = s(2), s4 = s(3), s5 = s(4);

    // 1. Rédaction (le texte s'écrit) — 2. 3. 4. signatures et sceau
    const write = clamp(s1 * 1.15);
    const sig = clamp(s3 * 1.2);
    const press = clamp((s4 - 0.42) / 0.12);
    drawPage(write, sig, press);

    // Feuillets tournés pendant la vérification
    leaves.forEach(({ pivot, leaf }, i) => {
      const k = easeInOut(clamp(s2 * 1.6 - i * 0.18));
      pivot.rotation.z = k * Math.PI * 0.985;
      pivot.position.y = TOP + 0.01 + (k > 0.99 ? -TOP * 0.3 + i * 0.004 : i * 0.004);
      leaf.material.opacity = k > 0 && k < 1 ? 1 : (k >= 1 ? 1 : 0);
      // légère courbure du feuillet en vol
      const pos = leaf.geometry.attributes.position;
      const bend = Math.sin(k * Math.PI) * 0.35;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v) / (W / 2); // -1 … 1
        pos.setZ(v, bend * (1 - x * x) * 0.6);
      }
      pos.needsUpdate = true;
    });

    // Pièces annexes
    annexes.forEach((m, i) => {
      const k = easeOutCubic(clamp((s2 - 0.1 - i * 0.14) / 0.4));
      m.visible = k > 0;
      if (!m.visible) return;
      const { from, to, rot } = m.userData;
      m.position.lerpVectors(from, to, k);
      m.position.y += Math.sin(k * Math.PI) * 1.2;
      m.rotation.set(-Math.PI / 2 * k + (1 - k) * Math.sin(t + i) * 0.4, (1 - k) * 1.2, rot * k);
    });

    // Plume : écrit pendant la rédaction et la signature
    const penOn = (s1 > 0 && s1 < 1) || (s3 > 0 && s3 < 1);
    const penTarget = penOn ? toWorld(pen.x, pen.y) : new THREE.Vector3(W + 0.9, TOP + 0.6, 1.2);
    const jitter = penOn && !reduce ? Math.sin(t * 40) * 0.015 : 0;
    tmp.set(penTarget.x, penOn ? TOP + jitter : penTarget.y, penTarget.z);
    penPivot.position.lerp(tmp, penOn ? 0.6 : 0.15);
    penPivot.visible = s4 < 0.4;

    // 4. Sceau : descente, pression, onde de choc, remontée
    const desc = easeInOut(clamp(s4 / 0.42));
    const lift = easeInOut(clamp((s4 - 0.6) / 0.4));
    const squash = press > 0 && press < 1 ? Math.sin(press * Math.PI) : 0;
    sealGroup.visible = s4 > 0 && s4 < 1;
    sealGroup.position.set(
      sealSpot.x + lift * 1.6,
      TOP + 3.8 * (1 - desc) + lift * 2.6 - squash * 0.05,
      sealSpot.z - lift * 0.6
    );
    sealGroup.rotation.y = (1 - desc) * 2 + t * 0.2 * (1 - desc);
    sealGroup.scale.set(1 + squash * 0.04, 1 - squash * 0.06, 1 + squash * 0.04);
    const sh = clamp((s4 - 0.5) / 0.4);
    shock.scale.setScalar(1 + sh * 5);
    shock.material.opacity = sh > 0 && sh < 1 ? (1 - sh) * 0.9 : 0;

    // 5. Conservation : le livre se referme et rejoint le minutier
    const fold = easeInOut(clamp(s5 / 0.45));
    const travel = easeInOut(clamp((s5 - 0.3) / 0.55));
    book.position.set(0, fold * 0.6, 0);
    const bookTarget = tmp.copy(slot).add(archive.position);
    book.position.lerp(bookTarget, travel);
    book.scale.setScalar(1 - travel * 0.85);
    book.rotation.set(travel * Math.PI / 2 * 0.98, 0, 0);

    const shelfK = clamp((s5 - 0.05) / 0.5);
    let n = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = easeOutCubic(clamp(shelfK * 2.2 - (r * COLS + c) / (COLS * ROWS) * 1.2));
      const isSlot = r === 2 && c === 4;
      dummy.position.set((c - (COLS - 1) / 2) * 1.0, r * 0.75 + 0.375, isSlot ? -0.6 : (1 - k) * 2.5);
      dummy.scale.setScalar(isSlot ? 0.0001 : Math.max(0.0001, k));
      dummy.updateMatrix();
      boxes.setMatrixAt(n++, dummy.matrix);
    }
    boxes.instanceMatrix.needsUpdate = true;
    shelfLines.material.opacity = shelfK * 0.6;
    const cloudK = clamp((s5 - 0.6) / 0.3);
    cloud.material.opacity = cloudK * 0.75;
    cloud.rotation.set(t * 0.2, t * 0.3, 0);
    stream.material.opacity = cloudK;
    for (let i = 0; i < STREAM; i++) {
      const f = (sSeed[i] + t * 0.25) % 1;
      const a = sSeed[i] * 40;
      sPos[i * 3] = Math.cos(a) * 0.4 * (1 - f) + (sSeed[i] - 0.5) * 0.6;
      sPos[i * 3 + 1] = slot.y + f * (cloud.position.y - slot.y);
      sPos[i * 3 + 2] = Math.sin(a) * 0.4 * (1 - f);
    }
    stream.geometry.attributes.position.needsUpdate = true;

    // Caméra
    const breathe = reduce ? 0 : Math.sin(t * 0.3) * 0.25;
    const back = easeInOut(clamp((s5 - 0.15) / 0.6));
    const base = wide ? 1.28 : 1.9;
    camera.position.set(
      (1.2 + breathe - back * 1.2) * base,
      (7.2 - s2 * 0.6 + back * 1.5) * base,
      (6.2 + s2 * 0.8 + back * 6) * base
    );
    look.set(back * -0.5 + 0.6 * (1 - back), 0.2 + back * 2.0, 0.2 - back * 6.2);
    camera.lookAt(look);

    renderer.render(scene, camera);
  }

  drawPage(0, 0, 0);
  const loop = watchVisibility(section, update);
  return { stop: loop.stop };
}
