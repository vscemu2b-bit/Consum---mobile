/* ==========================================================================
   Scène 3D « De la plume au sceau » : la vie d'un acte authentique,
   sur un bureau de notaire en rendu physique (noyer verni, cuir, laiton).
   1. Rédaction  2. Vérifications  3. Signature  4. Sceau  5. Conservation
   ========================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, easeOutCubic, easeInOut, damp, sectionProgress, makeRenderer, makeComposer, bakeEnvironment, woodTexture, grainTexture, watchVisibility, reducedMotion } from './utils3d.js';

const W = 3, D = 4.2, TOP = 0.22;          // dimensions d'une page (unités monde)
const CW = 900, CH = 1260;                  // résolution du canevas de la page
const SERIF = '"Bodoni Moda", "Cormorant Garamond", Georgia, serif';
const JEWELS = ['#5c1a2b', '#0f4a3f', '#1a2f66', '#7a4a1e', '#3a1f4a', '#0f4f5c', '#6b2a1a'];

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
const S = CW / 600; // facteur d'échelle par rapport à la mise en page d'origine

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
      pts.push([(x0 + x * scale) * S, (y0 + y * scale) * S]);
    }
  });
  return pts;
}
const SIG_A = sampleSignature(70, 690, 0.95, 0);
const SIG_B = sampleSignature(380, 690, 0.95, 1);

/* Sceau doré en relief (dorure à chaud) */
function drawSeal(g, x, y, r, alpha) {
  g.save();
  g.globalAlpha = alpha;
  g.shadowColor = 'rgba(60,40,10,.35)'; g.shadowBlur = r * .12; g.shadowOffsetY = r * .04;
  const grd = g.createRadialGradient(x - r * .35, y - r * .35, 2, x, y, r);
  grd.addColorStop(0, '#f6e2a8'); grd.addColorStop(.55, '#c9a45c'); grd.addColorStop(1, '#7d5c24');
  g.fillStyle = grd;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(80,55,15,.75)'; g.lineWidth = 2;
  g.beginPath(); g.arc(x, y, r * .78, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(70,45,15,.9)';
  g.font = `600 ${r * .17}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const label = '· ATRIUM NOTAIRES · PARIS ';
  for (let i = 0; i < label.length; i++) {
    const a = (i / label.length) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(x + Math.cos(a) * r * .89, y + Math.sin(a) * r * .89); g.rotate(a + Math.PI / 2); g.fillText(label[i], 0, 0); g.restore();
  }
  g.font = `italic 600 ${r * .62}px ${SERIF}`; g.fillText('N', x, y + 2);
  g.restore();
}

/* Grain de papier : fibres très légères */
function paperBase(g, w, h, tone = ['#fbf8f1', '#efe8d8']) {
  const grd = g.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, tone[0]); grd.addColorStop(1, tone[1]);
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.05;
  for (let i = 0; i < w * h / 300; i++) {
    g.fillStyle = Math.random() > .5 ? '#7a6a4a' : '#ffffff';
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1);
  }
  g.globalAlpha = 1;
}

export function initActeScene(canvas, section, { onProgress, still } = {}) {
  const renderer = makeRenderer(canvas, { exposure: 0.78 });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e1a');
  scene.fog = new THREE.Fog('#0a0e1a', 13, 30);
  scene.environment = bakeEnvironment(renderer, new RoomEnvironment(renderer), 0.04);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  /* Éclairage : lampe de bureau chaude, contre-jour froid ------------------ */
  scene.add(new THREE.HemisphereLight(0x6d80c8, 0x2a1a10, 0.35));
  const key = new THREE.DirectionalLight(0xffdcae, 1.9);
  key.position.set(5, 9, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7f9cff, 0.9);
  rim.position.set(-5, 5, -8);
  scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);
  const book = new THREE.Group();
  world.add(book);

  /* Bureau en noyer verni et sous-main en cuir ------------------------------ */
  const wood = woodTexture(512); wood.repeat.set(2, 1);
  const walnut = new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.22, envMapIntensity: 0.7 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 16), walnut);
  desk.position.set(0, -0.32, -1.5); desk.receiveShadow = true;
  world.add(desk);
  const leatherGrain = grainTexture(256, 1.1, 5); leatherGrain.repeat.set(9, 6);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.04, 6.4),
    new THREE.MeshPhysicalMaterial({ color: '#0f4a3c', roughness: 0.62, roughnessMap: leatherGrain, bumpMap: leatherGrain, bumpScale: 0.12, sheen: 0.6, sheenColor: new THREE.Color('#3f8f78'), sheenRoughness: 0.6 }));
  pad.position.y = -0.0; pad.receiveShadow = true;
  world.add(pad);
  const gold = new THREE.MeshPhysicalMaterial({ color: '#d8b06a', metalness: 1, roughness: 0.18, clearcoat: 0.4 });
  // Surpiqûre dorée du sous-main
  const stitch = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.012, 0.025), gold, 260);
  {
    const d = new THREE.Object3D(); let i = 0;
    const hw = 4.45, hd = 3.0;
    for (let x = -hw; x <= hw && i < 260; x += 0.2) { [-hd, hd].forEach((z) => { d.position.set(x, 0.026, z); d.rotation.set(0, 0, 0); d.updateMatrix(); stitch.setMatrixAt(i++, d.matrix); }); }
    for (let z = -hd + 0.2; z < hd && i < 260; z += 0.2) { [-hw, hw].forEach((x) => { d.position.set(x, 0.026, z); d.rotation.set(0, Math.PI / 2, 0); d.updateMatrix(); stitch.setMatrixAt(i++, d.matrix); }); }
    stitch.count = i;
  }
  world.add(stitch);

  /* Canevas de la page principale ------------------------------------------ */
  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = CW; pageCanvas.height = CH;
  const g = pageCanvas.getContext('2d');
  const paperCanvas = document.createElement('canvas');
  paperCanvas.width = CW; paperCanvas.height = CH;
  paperBase(paperCanvas.getContext('2d'), CW, CH);
  const pageTex = new THREE.CanvasTexture(pageCanvas);
  pageTex.colorSpace = THREE.SRGBColorSpace;
  pageTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const pen = { x: 64 * S, y: 200 * S };
  let lastKey = '';

  function drawPage(write, sig, seal) {
    const k = `${Math.round(write * TOTAL_CHARS)}|${Math.round(sig * 200)}|${Math.round(seal * 40)}`;
    if (k === lastKey) return;
    lastKey = k;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(paperCanvas, 0, 0);
    g.scale(S, S);
    g.strokeStyle = 'rgba(150,115,50,.55)'; g.lineWidth = 1.2; g.strokeRect(26, 26, 548, 788);
    g.lineWidth = .5; g.strokeRect(32, 32, 536, 776);
    g.fillStyle = '#1e1f2a'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `600 30px ${SERIF}`; g.fillText('ACTE AUTHENTIQUE', 300, 96);
    g.font = `italic 19px ${SERIF}`; g.fillStyle = '#7a6436'; g.fillText('L\'an deux mille vingt-six', 300, 126);
    g.strokeStyle = 'rgba(150,115,50,.6)'; g.beginPath(); g.moveTo(250, 144); g.lineTo(350, 144); g.stroke();

    let chars = Math.round(write * TOTAL_CHARS);
    g.textAlign = 'left';
    for (let i = 0; i < TEXT.length && chars > 0; i++) {
      const line = TEXT[i];
      const isHead = line === line.toUpperCase() && line.length > 0 && !line.includes('—');
      g.font = isHead ? `600 15px ${SERIF}` : `16px ${SERIF}`;
      g.fillStyle = isHead ? '#5b4520' : '#262632';
      const shown = line.slice(0, chars);
      const y = 186 + i * 25;
      g.fillText(shown, 64, y);
      pen.x = (64 + g.measureText(shown).width) * S; pen.y = y * S;
      chars -= line.length;
    }

    g.font = `italic 16px ${SERIF}`; g.fillStyle = '#7a6436';
    g.fillText('Les parties', 70, 650); g.fillText('Le notaire', 380, 650);
    g.strokeStyle = 'rgba(122,100,54,.35)'; g.lineWidth = .8;
    g.beginPath(); g.moveTo(70, 735); g.lineTo(260, 735); g.moveTo(380, 735); g.lineTo(540, 735); g.stroke();
    g.setTransform(1, 0, 0, 1, 0, 0);
    const drawSig = (pts, kk) => {
      const n = Math.floor(pts.length * kk);
      if (n < 2) return null;
      g.strokeStyle = '#14215a'; g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 1; i < n; i++) {
        g.lineWidth = 2.2 + Math.sin(i * 0.35) * 0.9; // pression variable de la plume
        g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
      }
      return pts[n - 1];
    };
    if (sig > 0) {
      const a = drawSig(SIG_A, clamp(sig * 2));
      const b = drawSig(SIG_B, clamp(sig * 2 - 1));
      const last = b || a;
      if (last) { pen.x = last[0]; pen.y = last[1]; }
    }
    if (seal > 0) drawSeal(g, 470 * S, 760 * S, 52 * S, seal);
    pageTex.needsUpdate = true;
  }

  /* Acte ouvert : couverture en cuir saphir, liserés dorés, pages ---------- */
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xe3dccb, roughness: 0.95, envMapIntensity: 0.25 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xc9bea6, roughness: 1, envMapIntensity: 0.25 });
  const stackMats = [edgeMat, edgeMat, paperMat, edgeMat, edgeMat, edgeMat];
  const right = new THREE.Mesh(new THREE.BoxGeometry(W, TOP, D), stackMats);
  right.position.set(W / 2 + 0.02, TOP / 2 + 0.05, 0);
  const left = new THREE.Mesh(new THREE.BoxGeometry(W, TOP * .7, D), stackMats);
  left.position.set(-W / 2 - 0.02, TOP * .35 + 0.05, 0);
  right.castShadow = left.castShadow = true; right.receiveShadow = left.receiveShadow = true;
  const coverMat = new THREE.MeshPhysicalMaterial({ color: '#16264f', roughness: 0.5, roughnessMap: leatherGrain, bumpMap: leatherGrain, bumpScale: 0.1, sheen: 0.5, sheenColor: new THREE.Color('#5a74c0') });
  const cover = new THREE.Mesh(new THREE.BoxGeometry(W * 2 + 0.3, 0.06, D + 0.3), coverMat);
  cover.position.y = 0.05; cover.castShadow = cover.receiveShadow = true;
  const trimGeo = new THREE.BoxGeometry(W * 2 + 0.3, 0.012, 0.02);
  [-1, 1].forEach((sgn) => { const t = new THREE.Mesh(trimGeo, gold); t.position.set(0, 0.085, sgn * (D / 2 + 0.1)); book.add(t); });
  book.add(cover, right, left);

  const page = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: pageTex, color: 0xe8e1d2, roughness: 0.95, envMapIntensity: 0.25 }));
  page.rotation.x = -Math.PI / 2;
  page.position.set(W / 2 + 0.02, TOP + 0.052, 0);
  page.receiveShadow = true;
  book.add(page);

  // Feuillets qui se tournent (lecture de l'acte)
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = 450; c.height = 630;
    const x = c.getContext('2d'); paperBase(x, 450, 630);
    x.strokeStyle = 'rgba(150,115,50,.45)'; x.strokeRect(20, 20, 410, 590);
    x.fillStyle = 'rgba(40,40,55,.28)';
    for (let i = 0; i < 20; i++) x.fillRect(48, 70 + i * 26, 354 - (i % 3) * 40, 3);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const leaves = [0, 1, 2, 3].map((i) => {
    const pivot = new THREE.Group();
    pivot.position.set(0, TOP + 0.06 + i * 0.004, 0);
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(W, D, 16, 1), new THREE.MeshStandardMaterial({ map: leafTex, color: 0xe8e1d2, side: THREE.DoubleSide, roughness: .95, envMapIntensity: 0.25, transparent: true, opacity: 0 }));
    leaf.rotation.x = -Math.PI / 2; leaf.position.x = W / 2; leaf.castShadow = true;
    pivot.add(leaf); book.add(pivot);
    return { pivot, leaf };
  });

  /* Pièces annexes vérifiées ------------------------------------------------ */
  const annexNames = ['État hypothécaire', 'Urbanisme', 'État civil', 'Purge DPU'];
  const annexes = annexNames.map((name, i) => {
    const c = document.createElement('canvas'); c.width = 384; c.height = 510;
    const x = c.getContext('2d'); paperBase(x, 384, 510);
    x.fillStyle = '#16264f'; x.fillRect(30, 30, 324, 2);
    x.fillStyle = '#1e1f2a'; x.font = `600 28px ${SERIF}`; x.textAlign = 'center'; x.fillText(name, 192, 76);
    x.fillStyle = 'rgba(40,40,55,.26)';
    for (let k = 0; k < 11; k++) x.fillRect(40, 110 + k * 26, 304 - (k % 3) * 46, 3);
    x.save(); x.translate(282, 432); x.rotate(-0.22);
    x.strokeStyle = 'rgba(110,26,45,.85)'; x.lineWidth = 4;
    x.beginPath(); x.arc(0, 0, 48, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(0, 0, 40, 0, Math.PI * 2); x.lineWidth = 1.5; x.stroke();
    x.fillStyle = 'rgba(110,26,45,.85)'; x.font = `700 17px ${SERIF}`; x.fillText('VÉRIFIÉ', 0, 6);
    x.restore();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.53), new THREE.MeshStandardMaterial({ map: tex, color: 0xe8e1d2, side: THREE.DoubleSide, roughness: .95, envMapIntensity: 0.25 }));
    m.castShadow = true;
    const a = (i / 4) * Math.PI * 2 + 0.6;
    m.userData = {
      from: new THREE.Vector3(Math.cos(a) * 5.5, 2.2 + i * .3, Math.sin(a) * 4),
      to: new THREE.Vector3(-W / 2 - 0.25 + i * 0.28, TOP * .7 + 0.09 + i * 0.012, -0.9 + i * 0.55),
      rot: -0.25 + i * 0.16,
    };
    m.visible = false;
    world.add(m);
    return m;
  });

  /* Stylo plume : laque noire et attributs dorés --------------------------- */
  const lacquer = new THREE.MeshPhysicalMaterial({ color: '#08080b', roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });
  const penGroup = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 1.15, 48), lacquer); body.position.y = 0.88;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.32, 48), lacquer); cap.position.y = 1.62;
  const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.05, 48), gold); band1.position.y = 1.45;
  const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.03, 48), gold); band2.position.y = 0.32;
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.03), gold); clip.position.set(0, 1.58, 0.08);
  const section_ = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.22, 48), lacquer); section_.position.y = 0.2;
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 48, 1, false, 0, Math.PI * 1.2), gold);
  nib.rotation.x = Math.PI; nib.position.y = 0.1;
  penGroup.add(body, cap, band1, band2, clip, section_, nib);
  penGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const penPivot = new THREE.Group();
  penPivot.add(penGroup);
  penGroup.rotation.set(-0.42, 0, -0.55);
  book.add(penPivot);

  /* Sceau en laiton, manche en ébène ------------------------------------- */
  const brass = new THREE.MeshPhysicalMaterial({ color: '#c9a15a', metalness: 1, roughness: 0.26, clearcoat: 0.3 });
  const ebony = new THREE.MeshPhysicalMaterial({ color: '#1a0f0a', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const sealGroup = new THREE.Group();
  const prof = [[0, 0], [0.46, 0], [0.47, 0.03], [0.44, 0.2], [0.2, 0.28], [0.13, 0.5], [0.16, 0.56], [0, 0.56]].map(([x, y]) => new THREE.Vector2(x, y));
  const sealBase = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), brass);
  const handle = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.15, 0], [0.12, 0.35], [0.13, 0.7], [0.2, 0.92], [0.18, 1.05], [0, 1.08]].map(([x, y]) => new THREE.Vector2(x, y)), 64), ebony);
  handle.position.y = 0.56;
  sealGroup.add(sealBase, handle);
  sealGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  book.add(sealGroup);
  const toWorld = (px, py) => new THREE.Vector3(0.02 + (px / CW) * W, TOP + 0.05, -D / 2 + (py / CH) * D);
  const sealSpot = toWorld(470 * S, 760 * S);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.53, 96), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  shock.rotation.x = -Math.PI / 2;
  shock.position.set(sealSpot.x, TOP + 0.07, sealSpot.z);
  book.add(shock);

  /* Minutier : bibliothèque de registres reliés cuir ----------------------- */
  const archive = new THREE.Group();
  archive.position.set(0, 0, -7);
  world.add(archive);
  const ROWS = 3, PER = 24, BW = 0.34, ROWH = 1.25;
  const shelfW = PER * BW + 0.6;
  const shelfMat = new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.45, clearcoat: 0.5 });
  for (let r = 0; r <= ROWS; r++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(shelfW, 0.1, 1.0), shelfMat);
    plank.position.y = r * ROWH; plank.castShadow = plank.receiveShadow = true; archive.add(plank);
  }
  [-1, 1].forEach((sgn) => { const side = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROWS * ROWH + 0.1, 1.0), shelfMat); side.position.set(sgn * shelfW / 2, ROWS * ROWH / 2, 0); archive.add(side); });
  const back = new THREE.Mesh(new THREE.BoxGeometry(shelfW, ROWS * ROWH, 0.05), shelfMat); back.position.set(0, ROWS * ROWH / 2, -0.5); archive.add(back);
  const leatherBook = new THREE.MeshPhysicalMaterial({ roughness: 0.48, roughnessMap: leatherGrain, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color('#ffffff') });
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(BW * 0.9, 1, 0.78), leatherBook, ROWS * PER);
  const bands = new THREE.InstancedMesh(new THREE.BoxGeometry(BW * 0.92, 0.035, 0.02), gold, ROWS * PER * 2);
  books.castShadow = true;
  const slotIdx = 1 * PER + Math.floor(PER / 2);
  const bookData = [];
  {
    const c = new THREE.Color();
    for (let r = 0; r < ROWS; r++) for (let j = 0; j < PER; j++) {
      const i = r * PER + j;
      const h = 0.85 + ((i * 37) % 10) / 50;
      bookData.push({ x: (j - (PER - 1) / 2) * BW, y: r * ROWH + 0.05 + h / 2, h });
      books.setColorAt(i, c.set(JEWELS[(i * 5 + r) % JEWELS.length]));
    }
  }
  archive.add(books, bands);
  const dummy = new THREE.Object3D();
  // Halo du Minutier central électronique
  const HALO = 900, hPos = new Float32Array(HALO * 3), hSeed = new Float32Array(HALO).map(() => Math.random());
  const halo = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(hPos, 3)),
    new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.y = ROWS * ROWH + 1.6;
  archive.add(halo);
  const slot = new THREE.Vector3(bookData[slotIdx].x, ROWH + 0.55, 0.1);

  /* Post-traitement & mise en page ------------------------------------------ */
  const post = makeComposer(renderer, scene, camera, { strength: 0.25, radius: 0.35, threshold: 0.97 });
  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); post.setSize(w, h);
    camera.aspect = w / h; wide = w / h > 1.1;
    camera.fov = wide ? 32 : 46; camera.updateProjectionMatrix();
    if (still) { camera.fov = still.fov || 32; camera.clearViewOffset(); camera.updateProjectionMatrix(); }
    else if (wide) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
  }
  resize();
  addEventListener('resize', resize);
  document.fonts?.ready.then(() => { lastKey = ''; });

  const reduce = reducedMotion();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let time = 0, lastP = -1, sp = 0;

  function update(dt) {
    time += dt;
    const raw = still ? still.p : sectionProgress(section);
    sp = reduce || still ? raw : damp(sp, raw, 6, dt);
    const p = sp;
    if (Math.abs(raw - lastP) > 0.0005) { onProgress?.(raw); lastP = raw; }
    const s = (i) => clamp((p - i * 0.2) / 0.2);
    const s1 = s(0), s2 = s(1), s3 = s(2), s4 = s(3), s5 = s(4);

    const write = clamp(s1 * 1.15);
    const sig = clamp(s3 * 1.2);
    const press = clamp((s4 - 0.42) / 0.12);
    drawPage(write, sig, press);

    leaves.forEach(({ pivot, leaf }, i) => {
      const k = easeInOut(clamp(s2 * 1.6 - i * 0.18));
      pivot.rotation.z = k * Math.PI * 0.985;
      pivot.position.y = TOP + 0.06 + (k > 0.99 ? -TOP * 0.3 + i * 0.004 : i * 0.004);
      leaf.material.opacity = k > 0 ? 1 : 0;
      const pos = leaf.geometry.attributes.position;
      const bend = Math.sin(k * Math.PI) * 0.4;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v) / (W / 2);
        pos.setZ(v, bend * (1 - x * x) * 0.6 + bend * 0.25 * (x + 1));
      }
      pos.needsUpdate = true;
    });

    annexes.forEach((m, i) => {
      const k = easeOutCubic(clamp((s2 - 0.1 - i * 0.14) / 0.4));
      m.visible = k > 0 && s5 < 0.3;
      if (!m.visible) return;
      const { from, to, rot } = m.userData;
      m.position.lerpVectors(from, to, k);
      m.position.y += Math.sin(k * Math.PI) * 1.0;
      m.rotation.set(-Math.PI / 2 * k + (1 - k) * Math.sin(time + i) * 0.4, (1 - k) * 1.2, rot * k);
    });

    const penOn = (s1 > 0 && s1 < 1) || (s3 > 0 && s3 < 1);
    const rest = new THREE.Vector3(W + 1.0, TOP + 0.12, 1.4);
    const target = penOn ? toWorld(pen.x, pen.y) : rest;
    tmp.set(target.x, penOn ? TOP + 0.055 + (reduce ? 0 : Math.abs(Math.sin(time * 18)) * 0.01) : target.y, target.z);
    penPivot.position.x = damp(penPivot.position.x, tmp.x, penOn ? 14 : 4, dt);
    penPivot.position.y = damp(penPivot.position.y, tmp.y, penOn ? 14 : 4, dt);
    penPivot.position.z = damp(penPivot.position.z, tmp.z, penOn ? 14 : 4, dt);
    penGroup.rotation.z = damp(penGroup.rotation.z, penOn ? -0.55 : -1.45, 4, dt);
    penPivot.visible = s4 < 0.4;

    const desc = easeInOut(clamp(s4 / 0.42));
    const lift = easeInOut(clamp((s4 - 0.6) / 0.4));
    const squash = press > 0 && press < 1 ? Math.sin(press * Math.PI) : 0;
    sealGroup.visible = s4 > 0 && s4 < 1;
    sealGroup.position.set(sealSpot.x + lift * 1.6, TOP + 0.06 + 3.6 * (1 - desc) + lift * 2.4 - squash * 0.04, sealSpot.z - lift * 0.6);
    sealGroup.rotation.y = (1 - desc) * 2.4;
    const sh = clamp((s4 - 0.5) / 0.4);
    shock.scale.setScalar(1 + sh * 4);
    shock.material.opacity = sh > 0 && sh < 1 ? (1 - sh) * 0.8 : 0;

    // 5. Conservation : l'acte rejoint le minutier
    const travel = easeInOut(clamp((s5 - 0.3) / 0.55));
    book.position.set(0, easeInOut(clamp(s5 / 0.45)) * 0.6, 0);
    book.position.lerp(tmp.copy(slot).add(archive.position), travel);
    book.scale.setScalar(1 - travel * 0.88);
    book.rotation.set(travel * Math.PI / 2 * 0.98, 0, 0);

    const shelfK = clamp((s5 - 0.05) / 0.5);
    archive.visible = shelfK > 0;
    let bi = 0;
    bookData.forEach((b, i) => {
      const k = easeOutCubic(clamp(shelfK * 2.2 - (i / bookData.length) * 1.2));
      const hidden = i === slotIdx;
      dummy.position.set(b.x, b.y, (1 - k) * 1.5);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, hidden ? 0.0001 : b.h * Math.max(0.0001, k), 1);
      dummy.updateMatrix(); books.setMatrixAt(i, dummy.matrix);
      [-0.3, 0.3].forEach((o) => {
        dummy.position.set(b.x, b.y + o * b.h, 0.4 + (1 - k) * 1.5);
        dummy.scale.set(1, 1, hidden || k < 0.05 ? 0.0001 : 1);
        dummy.updateMatrix(); bands.setMatrixAt(bi++, dummy.matrix);
      });
    });
    books.instanceMatrix.needsUpdate = true; bands.instanceMatrix.needsUpdate = true;
    const haloK = clamp((s5 - 0.6) / 0.3);
    halo.material.opacity = haloK * 0.9;
    for (let i = 0; i < HALO; i++) {
      const a = hSeed[i] * Math.PI * 2 + time * (0.15 + hSeed[i] * 0.1);
      const r = 1.6 + (hSeed[(i * 7) % HALO] - 0.5) * 0.12;
      hPos[i * 3] = Math.cos(a) * r * 2.2; hPos[i * 3 + 1] = (hSeed[i] - 0.5) * 0.06; hPos[i * 3 + 2] = Math.sin(a) * r * 0.5;
    }
    halo.geometry.attributes.position.needsUpdate = true;

    // Caméra
    const breathe = reduce ? 0 : Math.sin(time * 0.3) * 0.2;
    const backK = easeInOut(clamp((s5 - 0.15) / 0.6));
    const base = wide ? 1.3 : 1.9;
    camera.position.set((1.2 + breathe - backK * 1.2) * base, (7.0 - s2 * 0.6 + backK * 0.4) * base, (6.4 + s2 * 0.8 + backK * 5.4) * base);
    look.set(backK * -0.2 + 0.6 * (1 - backK), 0.2 + backK * 2.2, 0.2 - backK * 6.9);
    if (still) { camera.position.fromArray(still.cam); look.fromArray(still.look); }
    camera.lookAt(look);

    post.render();
  }

  drawPage(0, 0, 0);
  const loop = watchVisibility(section, update);
  return { stop: loop.stop };
}
