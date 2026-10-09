/* ==========================================================================
   Scène 3D d'accueil : un ensemble immobilier se construit au défilement.
   Plan (lignes dorées) → structure → façades vitrées éclairées.
   ========================================================================== */
import * as THREE from 'three';
import { clamp, easeOutCubic, sectionProgress, makeRenderer, watchVisibility, reducedMotion } from './utils3d.js';

const GOLD = 0xc9a45c;
const INK = 0x0a0f1c;

/* Texture de façade : meneaux + fenêtres allumées aléatoirement */
function facadeTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 64);
  sky.addColorStop(0, '#2a3b63'); sky.addColorStop(1, '#141d33');
  g.fillStyle = sky; g.fillRect(0, 0, 256, 64);
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let x = 0; x < 8; x++) {
    const lit = rnd();
    if (lit > 0.55) {
      g.fillStyle = `rgba(255,${190 + rnd() * 50 | 0},130,${0.35 + rnd() * 0.45})`;
      g.fillRect(x * 32 + 2, 6, 28, 52);
    }
    // reflet diagonal sur le vitrage
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.beginPath(); g.moveTo(x * 32 + 4, 58); g.lineTo(x * 32 + 18, 6); g.lineTo(x * 32 + 24, 6); g.lineTo(x * 32 + 10, 58); g.fill();
  }
  g.fillStyle = 'rgba(201,164,92,0.75)';
  for (let x = 0; x <= 8; x++) g.fillRect(x * 32 - 1, 0, 2, 64);
  g.fillStyle = 'rgba(201,164,92,0.6)';
  g.fillRect(0, 0, 256, 3); g.fillRect(0, 61, 256, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* Texture d'un document notarié flottant */
function documentTexture(title) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, '#f7f1e3'); grd.addColorStop(1, '#e9dfc8');
  g.fillStyle = grd; g.fillRect(0, 0, 384, 512);
  g.strokeStyle = 'rgba(160,125,60,.55)'; g.lineWidth = 2; g.strokeRect(18, 18, 348, 476);
  g.fillStyle = '#2a2a33'; g.textAlign = 'center';
  g.font = '600 26px Georgia, serif'; g.fillText(title, 192, 78);
  g.font = 'italic 16px Georgia, serif'; g.fillStyle = '#6b5a3a'; g.fillText('Par-devant Maître …, notaire', 192, 108);
  g.fillStyle = 'rgba(40,40,55,.35)';
  for (let i = 0; i < 14; i++) {
    const w = 260 - (i % 4) * 30 - (i === 13 ? 120 : 0);
    g.fillRect(62, 146 + i * 20, w, 4);
  }
  // Sceau
  g.strokeStyle = '#b08a3e'; g.lineWidth = 3;
  g.beginPath(); g.arc(300, 440, 34, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(300, 440, 25, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#b08a3e'; g.font = '600 14px Georgia, serif'; g.fillText('N', 300, 445);
  // Signature
  g.strokeStyle = '#1d2a55'; g.lineWidth = 2; g.beginPath();
  g.moveTo(60, 450); g.bezierCurveTo(90, 410, 110, 470, 140, 440); g.bezierCurveTo(160, 420, 170, 460, 200, 445); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Treillis métallique (mât, flèche de grue) */
function lattice(w, h, d, segs, color = GOLD, opacity = 0.9) {
  const pts = [];
  const hw = w / 2, hd = d / 2;
  const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
  for (let i = 0; i < segs; i++) {
    const y0 = (i / segs) * h, y1 = ((i + 1) / segs) * h;
    for (let k = 0; k < 4; k++) {
      const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4];
      pts.push(ax, y0, az, ax, y1, az); // montant
      pts.push(ax, y0, az, bx, y0, bz); // traverse
      pts.push(ax, y0, az, bx, y1, bz); // diagonale
    }
  }
  for (let k = 0; k < 4; k++) {
    const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4];
    pts.push(ax, h, az, bx, h, bz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

export function initHeroScene(canvas, section, { onProgress } = {}) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(INK, 26, 70);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const world = new THREE.Group();
  scene.add(world);

  /* Lumières */
  scene.add(new THREE.HemisphereLight(0x8fa4d8, 0x0a0f1c, 0.7));
  const sun = new THREE.DirectionalLight(0xffe2b0, 1.6);
  sun.position.set(12, 22, 10);
  scene.add(sun);
  const rim = new THREE.PointLight(GOLD, 30, 40, 1.6);
  rim.position.set(-8, 6, -6);
  scene.add(rim);

  /* Sol : socle, trame de plan, cercle */
  const groundTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    r.addColorStop(0, '#1a2440'); r.addColorStop(.6, '#0f1628'); r.addColorStop(1, 'rgba(10,15,28,0)');
    g.fillStyle = r; g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(22, 64), new THREE.MeshBasicMaterial({ map: groundTex, transparent: true }));
  ground.rotation.x = -Math.PI / 2;
  world.add(ground);
  const grid = new THREE.GridHelper(36, 36, GOLD, GOLD);
  grid.material.transparent = true; grid.material.opacity = 0.09;
  world.add(grid);
  const ring = new THREE.Mesh(new THREE.RingGeometry(13.9, 14, 128), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01;
  world.add(ring);

  /* Bâtiments ---------------------------------------------------------------- */
  const FLOOR_H = 0.9;
  const towersDef = [
    { x: 0, z: 0, w: 4.2, d: 3.4, floors: 15, start: 0.0, span: 0.85, seed: 7 },
    { x: -5.6, z: 1.8, w: 3.2, d: 3.0, floors: 9, start: 0.12, span: 0.6, seed: 13 },
    { x: 5.0, z: -2.6, w: 3.6, d: 2.6, floors: 6, start: 0.25, span: 0.5, seed: 29 },
    { x: 3.4, z: 4.2, w: 5.0, d: 2.0, floors: 3, start: 0.4, span: 0.45, seed: 41 },
  ];
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x2b3554, roughness: 0.8, metalness: 0.1 });
  const towers = towersDef.map((def) => {
    const group = new THREE.Group();
    group.position.set(def.x, 0, def.z);
    world.add(group);
    const tex = facadeTexture(def.seed);
    tex.repeat.set(Math.max(1, def.w / 2), 1);
    const floors = [];
    for (let k = 0; k < def.floors; k++) {
      const f = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.2, 0.12, def.d + 0.2), slabMat);
      const glassGeo = new THREE.BoxGeometry(def.w, FLOOR_H - 0.12, def.d);
      const glassMat = new THREE.MeshStandardMaterial({
        map: tex, emissive: 0xffc77a, emissiveMap: tex, emissiveIntensity: 0.0,
        roughness: 0.25, metalness: 0.6, transparent: true, opacity: 0,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = (FLOOR_H) / 2;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0 }));
      edges.position.copy(glass.position);
      f.add(slab, glass, edges);
      f.userData = { slab, glass, edges, baseY: k * FLOOR_H };
      f.visible = false;
      group.add(f);
      floors.push(f);
    }
    // Couronnement doré
    const crown = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.3, 0.14, def.d + 0.3), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.3, emissive: GOLD, emissiveIntensity: 0.2 }));
    crown.position.y = def.floors * FLOOR_H + 0.07;
    crown.scale.setScalar(0.001);
    group.add(crown);
    // Empreinte au sol (plan)
    const plan = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(def.w + 0.8, def.d + 0.8)), new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.25, gapSize: 0.15, transparent: true, opacity: 0.7 }));
    plan.rotation.x = -Math.PI / 2; plan.position.y = 0.02; plan.computeLineDistances();
    group.add(plan);
    return { def, group, floors, crown };
  });

  /* Grue à tour --------------------------------------------------------------- */
  const crane = new THREE.Group();
  crane.position.set(-2.6, 0, -2.4);
  world.add(crane);
  const MAST_MAX = 18;
  const mast = lattice(0.5, MAST_MAX, 0.5, MAST_MAX * 2);
  crane.add(mast);
  const head = new THREE.Group();
  crane.add(head);
  const jib = lattice(0.4, 11, 0.4, 22); jib.rotation.z = -Math.PI / 2; jib.position.set(0, 0, 0);
  const counterJib = lattice(0.4, 3.4, 0.4, 7); counterJib.rotation.z = Math.PI / 2;
  const cwt = new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 0.6), new THREE.MeshStandardMaterial({ color: 0x39425e, roughness: .7 }));
  cwt.position.set(-3.0, -0.2, 0);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), new THREE.MeshStandardMaterial({ color: GOLD, metalness: .6, roughness: .4, emissive: GOLD, emissiveIntensity: .15 }));
  cab.position.set(0.3, -0.35, 0.45);
  const apex = lattice(0.3, 1.8, 0.3, 3); apex.position.y = 0;
  head.add(jib, counterJib, cwt, cab, apex);
  // Câble + charge
  const cableGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -1, 0], 3));
  const cable = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0xe6cf9b, transparent: true, opacity: .8 }));
  const load = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: GOLD, metalness: .8, roughness: .35 }));
  head.add(cable, load);

  /* Documents en orbite -------------------------------------------------------- */
  const titles = ['ACTE DE VENTE', 'VEFA', 'CRÉDIT-BAIL', 'DONATION-PARTAGE', 'PRÊT HYPOTHÉCAIRE', 'BAIL À CONSTRUCTION', 'NOTORIÉTÉ'];
  const docs = titles.map((t, i) => {
    const mat = new THREE.MeshStandardMaterial({ map: documentTexture(t), side: THREE.DoubleSide, roughness: .9, emissive: 0xffffff, emissiveMap: null, emissiveIntensity: 0, transparent: true, opacity: 0.95 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.73), mat);
    m.userData = { a: (i / titles.length) * Math.PI * 2, r: 9 + (i % 3) * 1.6, y: 3 + (i % 4) * 2.1, speed: 0.08 + (i % 3) * 0.025, phase: i * 1.3 };
    world.add(m);
    return m;
  });

  /* Poussière d'or ------------------------------------------------------------- */
  const N = 700;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 4 + Math.random() * 18, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 20; pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: 0xe6cf9b, size: 0.06, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  world.add(dust);

  /* Mise en page responsive -------------------------------------------------- */
  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w / h > 1.1;
    camera.fov = wide ? 38 : 52;
    camera.updateProjectionMatrix();
    // Décale l'image vers la droite sur grand écran pour libérer le texte
    if (wide) camera.setViewOffset(w, h, -w * 0.22, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Pointeur ---------------------------------------------------------------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  /* Boucle ------------------------------------------------------------------ */
  const reduce = reducedMotion();
  const clock = new THREE.Clock();
  const t0 = performance.now();
  let lastP = -1;
  const target = new THREE.Vector3();

  function update() {
    const t = clock.getElapsedTime();
    const intro = reduce ? 1 : easeOutCubic(clamp((performance.now() - t0) / 2800));
    const sp = sectionProgress(section);
    const p = clamp(0.28 * intro + 0.72 * sp);
    if (Math.abs(p - lastP) > 0.001) { onProgress?.(p); lastP = p; }

    // Construction étage par étage
    let topMain = 0;
    towers.forEach(({ def, floors, crown }, ti) => {
      const tp = clamp((p - def.start) / def.span);
      const fp = tp * (def.floors + 1.2);
      floors.forEach((f, k) => {
        const local = clamp(fp - k);
        f.visible = local > 0;
        if (!f.visible) return;
        const e = easeOutCubic(local);
        const { slab, glass, edges, baseY } = f.userData;
        f.position.y = baseY + (1 - e) * 2.2;
        slab.scale.set(0.6 + 0.4 * e, 1, 0.6 + 0.4 * e);
        edges.material.opacity = clamp(local * 2) * (1 - clamp((local - 0.8) * 3) * 0.55);
        glass.material.opacity = clamp((local - 0.35) * 1.6) * 0.92;
        glass.material.emissiveIntensity = clamp((local - 0.7) * 3.3) * (0.55 + 0.15 * Math.sin(t * 0.8 + k + ti));
        if (ti === 0 && local > 0) topMain = baseY + FLOOR_H * e;
      });
      const c = clamp((fp - def.floors) / 1.2);
      crown.scale.setScalar(Math.max(0.001, easeOutCubic(c)));
    });

    // Grue : suit la hauteur de la tour principale puis se replie à la fin
    const done = clamp((p - 0.86) / 0.14);
    const mastH = Math.max(6, topMain + 3.5);
    mast.scale.y = (mastH / MAST_MAX) * (1 - done * 0.999);
    head.position.y = mastH * (1 - done);
    head.visible = done < 0.98;
    head.rotation.y = reduce ? 0.6 : Math.sin(t * 0.35) * 0.9 + 0.4;
    const trolley = 4.2 + Math.sin(t * 0.5) * 2.2;
    const drop = 2.5 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 3.5;
    const cp = cable.geometry.attributes.position;
    cp.setXYZ(0, trolley, -0.2, 0); cp.setXYZ(1, trolley, -drop, 0); cp.needsUpdate = true;
    load.position.set(trolley, -drop - 0.1, 0);
    load.rotation.y = Math.sin(t * 0.7) * 0.4;

    // Documents
    docs.forEach((m) => {
      const u = m.userData;
      const a = u.a + (reduce ? 0 : t * u.speed);
      m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 0.8 + u.phase) * 0.35, Math.sin(a) * u.r);
      m.rotation.set(Math.sin(t * 0.5 + u.phase) * 0.25, -a + Math.PI / 2, Math.sin(t * 0.4 + u.phase) * 0.15);
      m.material.opacity = 0.35 + 0.6 * clamp(intro * 1.4 - 0.2);
    });
    dust.rotation.y = t * 0.02;

    // Caméra : orbite lente, élévation selon l'avancement, parallaxe pointeur
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    const orbit = (reduce ? 0 : t * 0.04) + 0.75 + mouse.x * 0.25 + p * 0.6;
    const dist = (wide ? 27 : 33) + p * 7;
    const camY = 6 + p * 8 - mouse.y * 1.5;
    camera.position.set(Math.cos(orbit) * dist, camY, Math.sin(orbit) * dist);
    target.set(0, 3.5 + p * 3, 0);
    camera.lookAt(target);

    renderer.render(scene, camera);
  }

  const loop = watchVisibility(section, update);
  return { stop: loop.stop };
}
