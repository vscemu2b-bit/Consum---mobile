/* ==========================================================================
   Scène 3D d'accueil : un ensemble architectural se construit au crépuscule.
   Rendu physique : verre réfléchissant, ailettes en métal champagne,
   intérieurs éclairés, ombres douces, ciel de coucher de soleil et halo.
   ========================================================================== */
import * as THREE from 'three';
import { clamp, easeOutCubic, easeInOut, easeOutExpo, damp, sectionProgress, makeRenderer, makeComposer, bakeEnvironment, watchVisibility, reducedMotion } from './utils3d.js';

const SUN_DIR = new THREE.Vector3(-0.55, 0.2, 0.82).normalize();
const SKY = { zenith: '#0a0f2e', mid: '#33295a', horizon: '#d98a6c', ground: '#6a4560' };

/* Ciel dégradé avec halo solaire */
function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uZenith: { value: new THREE.Color(SKY.zenith) }, uMid: { value: new THREE.Color(SKY.mid) },
      uHorizon: { value: new THREE.Color(SKY.horizon) }, uGround: { value: new THREE.Color(SKY.ground) },
      uSun: { value: SUN_DIR },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uZenith, uMid, uHorizon, uGround, uSun; varying vec3 vDir;
      void main(){
        float h = normalize(vDir).y;
        vec3 col = mix(uGround, uHorizon, smoothstep(-0.01, 0.12, h));
        col = mix(col, uMid, smoothstep(0.06, 0.28, h));
        col = mix(col, uZenith, smoothstep(0.25, 0.8, h));
        float s = max(dot(normalize(vDir), uSun), 0.0);
        col += vec3(1.0, 0.6, 0.32) * (pow(s, 600.0) * 6.0 + pow(s, 24.0) * 0.6 + pow(s, 4.0) * 0.12);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/* Intérieurs éclairés : bureaux allumés derrière la façade */
function interiorTexture(seed) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#120d0a'; g.fillRect(0, 0, 512, 64);
  let s = seed; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let x = 0; x < 512; x += 16 + (rnd() * 20 | 0)) {
    if (rnd() < 0.35) continue;
    const w = 14 + rnd() * 30, warm = rnd();
    const grd = g.createLinearGradient(0, 8, 0, 60);
    const col = warm > 0.25 ? [255, 196 + rnd() * 30 | 0, 140] : [210, 225, 255];
    grd.addColorStop(0, `rgba(${col},0.9)`); grd.addColorStop(1, `rgba(${col},0.35)`);
    g.fillStyle = grd; g.fillRect(x, 10, w, 50);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* Options :
   - auto  : la construction se joue seule à l'ouverture de la page (accueil)
   - still : { p, cam: [x,y,z], look: [x,y,z], fov } image fixe (rendu des visuels) */
export function initHeroScene(canvas, section, { onProgress, still, auto, center } = {}) {
  const renderer = makeRenderer(canvas, { exposure: 0.95 });
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SKY.ground, 0.0075);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);

  /* Ciel et environnement de reflets ------------------------------------- */
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), skyMaterial()));
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), skyMaterial()));
  // Panneaux lumineux pour des reflets nets sur le verre
  [[-30, 8, 30, 0xffc89a, 2.2], [35, 20, -10, 0x9fb2ff, 1.4], [0, 45, 0, 0xffffff, 0.6]].forEach(([x, y, z, c, i]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  });
  scene.environment = bakeEnvironment(renderer, envScene, 0.02);

  /* Lumières ---------------------------------------------------------------- */
  scene.add(new THREE.HemisphereLight(0x8a94d6, 0x2e2230, 0.55));
  const sun = new THREE.DirectionalLight(0xffb27c, 3.2);
  sun.position.copy(SUN_DIR).multiplyScalar(45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun);

  /* Sol : pierre polie sombre, parvis en travertin, incrustation de laiton */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x0d0c12, roughness: 0.42, metalness: 0.0 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: 0.55, metalness: 0 }));
  plaza.position.y = 0.04; plaza.receiveShadow = true;
  scene.add(plaza);
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08d5a, metalness: 1, roughness: 0.3 });
  const inlay = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.035, 8, 160), brass);
  inlay.rotation.x = -Math.PI / 2; inlay.position.y = 0.085; inlay.scale.z = 0.3;
  scene.add(inlay);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(7, 0.02, 1.6), new THREE.MeshStandardMaterial({ color: 0x0a1020, roughness: 0.02, metalness: 0.9 }));
  pool.position.set(1.2, 0.09, 8.2);
  scene.add(pool);

  /* Ville lointaine dans la brume : silhouettes et fenêtres éclairées */
  {
    const CITY = 420;
    const cityMat = new THREE.MeshStandardMaterial({ color: 0x1a1522, roughness: 0.8, emissive: 0xffffff, emissiveMap: interiorTexture(91), emissiveIntensity: 0.9 });
    cityMat.emissiveMap.repeat.set(2, 6);
    const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, CITY);
    const d = new THREE.Object3D();
    let rs = 12345; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < CITY; i++) {
      const a = rnd() * Math.PI * 2, r = 120 + rnd() * 140;
      const h = 3 + Math.pow(rnd(), 2.6) * 20;
      d.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
      d.rotation.y = rnd() * Math.PI;
      d.scale.set(4 + rnd() * 8, h, 4 + rnd() * 8);
      d.updateMatrix(); city.setMatrixAt(i, d.matrix);
    }
    scene.add(city);
  }

  /* Bâtiments -------------------------------------------------------------- */
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd9d2c6, roughness: 0.75 });
  const laserMat = new THREE.LineBasicMaterial({ color: 0xe8c98e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const defs = [
    { x: 0, z: 0, w: 3.3, d: 3.3, floors: 22, fh: 0.62, twist: 0.028, tint: '#8fb0d8', start: 0.0, span: 0.86, seed: 3, fins: 7 },
    { x: -6.6, z: 2.6, w: 4.4, d: 2.6, floors: 13, fh: 0.62, twist: 0, tint: '#6fb3a0', start: 0.1, span: 0.62, seed: 17, fins: 9 },
    { x: 6.2, z: -3.6, w: 3.0, d: 3.0, floors: 9, fh: 0.62, twist: 0, tint: '#a892c9', start: 0.2, span: 0.55, seed: 31, fins: 6 },
    { x: 1.5, z: 5.0, w: 9.0, d: 3.2, floors: 3, fh: 0.8, twist: 0, tint: '#d9b98a', start: 0.32, span: 0.45, seed: 47, fins: 18 },
  ];
  const finGeo = new THREE.BoxGeometry(0.035, 1, 0.12);
  const dummy = new THREE.Object3D();

  const towers = defs.map((def) => {
    const group = new THREE.Group(); group.position.set(def.x, 0.08, def.z); scene.add(group);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: def.tint, metalness: 0.5, roughness: 0.04, transparent: true, opacity: 0,
      clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6,
    });
    const tex = interiorTexture(def.seed);
    tex.repeat.set(Math.max(1, def.w / 3), 1);
    const floors = [];
    for (let k = 0; k < def.floors; k++) {
      const f = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.22, 0.09, def.d + 0.22), concrete);
      slab.castShadow = slab.receiveShadow = true;
      const t = tex.clone(); t.offset.x = (k * 0.37) % 1; t.needsUpdate = true;
      const interior = new THREE.Mesh(new THREE.BoxGeometry(def.w - 0.3, def.fh - 0.1, def.d - 0.3),
        new THREE.MeshStandardMaterial({ color: 0x1b1612, roughness: 0.9, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }));
      interior.position.y = def.fh / 2;
      const glass = new THREE.Mesh(new THREE.BoxGeometry(def.w, def.fh - 0.09, def.d), glassMat.clone());
      glass.position.y = def.fh / 2; glass.castShadow = true;
      // Ailettes verticales en métal champagne
      const n = def.fins, fins = new THREE.InstancedMesh(finGeo, brass, n * 4);
      let i = 0;
      for (let side = 0; side < 4; side++) for (let j = 0; j < n; j++) {
        const u = (j + 0.5) / n - 0.5, len = side % 2 ? def.d : def.w;
        const off = (side % 2 ? def.w : def.d) / 2 + 0.05;
        const along = u * len;
        if (side === 0) dummy.position.set(along, def.fh / 2, off);
        if (side === 1) dummy.position.set(off, def.fh / 2, along);
        if (side === 2) dummy.position.set(-along, def.fh / 2, -off);
        if (side === 3) dummy.position.set(-off, def.fh / 2, -along);
        dummy.rotation.set(0, side % 2 ? Math.PI / 2 : 0, 0);
        dummy.scale.set(1, def.fh, 1); dummy.updateMatrix(); fins.setMatrixAt(i++, dummy.matrix);
      }
      fins.castShadow = true;
      const laser = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(def.w + 0.22, def.fh, def.d + 0.22)), laserMat.clone());
      laser.position.y = def.fh / 2;
      f.add(slab, interior, glass, fins, laser);
      f.rotation.y = k * def.twist;
      f.userData = { slab, interior, glass, fins, laser, baseY: k * def.fh };
      f.visible = false;
      group.add(f); floors.push(f);
    }
    const crown = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.4, 0.16, def.d + 0.4), brass);
    crown.position.y = def.floors * def.fh + 0.08; crown.rotation.y = def.floors * def.twist;
    crown.castShadow = true; crown.scale.setScalar(0.001);
    group.add(crown);
    return { def, floors, crown };
  });

  /* Poussière en suspension dans la lumière rasante ------------------------- */
  const N = 500, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.random() * 20, a = Math.random() * Math.PI * 2;
    pos.set([Math.cos(a) * r, Math.random() * 16, Math.sin(a) * r], i * 3);
  }
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: 0xffd9a8, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  /* Post-traitement & mise en page ------------------------------------------ */
  const post = makeComposer(renderer, scene, camera, { strength: 0.38, radius: 0.5, threshold: 0.9 });
  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); post.setSize(w, h);
    camera.aspect = w / h; wide = w / h > 1.1;
    camera.fov = wide ? 30 : 42; camera.updateProjectionMatrix();
    if (still) { camera.fov = still.fov || 30; camera.clearViewOffset(); camera.updateProjectionMatrix(); }
    else if (center) { camera.fov = 32; camera.clearViewOffset(); camera.updateProjectionMatrix(); }
    else if (wide) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.18, w, h);
  }
  resize();
  addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  const reduce = reducedMotion();
  const t0 = performance.now();
  let time = 0, lastP = -1, smoothP = 0;
  const target = new THREE.Vector3();

  function update(dt) {
    time += dt;
    let raw;
    if (still) raw = still.p;
    else if (auto) raw = reduce ? 1 : clamp(0.1 + 0.9 * easeInOut(clamp((performance.now() - t0 - 300) / 7500)));
    else raw = clamp(0.3 * (reduce ? 1 : easeOutCubic(clamp((performance.now() - t0) / 3200))) + 0.7 * sectionProgress(section));
    smoothP = reduce || still ? raw : damp(smoothP, raw, 5, dt);
    const p = smoothP;
    if (Math.abs(p - lastP) > 0.001) { onProgress?.(p); lastP = p; }

    towers.forEach(({ def, floors, crown }, ti) => {
      const fp = clamp((p - def.start) / def.span) * (def.floors + 1.5);
      floors.forEach((f, k) => {
        const local = clamp(fp - k);
        f.visible = local > 0;
        if (!f.visible) return;
        const { slab, interior, glass, laser, fins, baseY } = f.userData;
        const rise = easeOutExpo(clamp(local * 1.6));
        f.position.y = baseY - (1 - rise) * 1.2;
        laser.material.opacity = Math.sin(clamp(local * 1.4) * Math.PI) * 0.9;
        slab.scale.set(0.92 + 0.08 * rise, 1, 0.92 + 0.08 * rise);
        const g = clamp((local - 0.3) / 0.5);
        glass.material.opacity = 0.72 * g;
        glass.scale.y = Math.max(0.001, easeOutCubic(g));
        glass.position.y = interior.position.y * (0.5 + 0.5 * glass.scale.y);
        fins.visible = g > 0.05;
        fins.scale.y = Math.max(0.001, easeOutCubic(g));
        const light = clamp((local - 0.75) / 0.25);
        interior.material.emissiveIntensity = light * (1.15 + 0.08 * Math.sin(time * 0.7 + k * 1.7 + ti));
      });
      crown.scale.setScalar(Math.max(0.001, easeOutExpo(clamp((fp - def.floors) / 1.5))));
    });

    dust.rotation.y = time * 0.015;
    dust.position.y = Math.sin(time * 0.2) * 0.2;

    // Caméra : mouvement de grue lent, façon plan de cinéma
    mouse.x = damp(mouse.x, mouse.tx, 2.5, dt); mouse.y = damp(mouse.y, mouse.ty, 2.5, dt);
    const a = 0.98 + (reduce ? 0 : time * 0.012) + p * 0.55 + mouse.x * 0.08;
    const r = ((wide ? 44 : 54) - p * 4) * (center ? 0.72 : 1);
    const sc = auto ? clamp(scrollY / innerHeight) : 0;
    camera.position.set(Math.cos(a) * r, 3.2 + p * 12 - mouse.y * 0.8 + sc * 4, Math.sin(a) * r);
    target.set(0, 4.5 + p * 4.5 + sc * 2, 0);
    if (still) { camera.position.fromArray(still.cam); target.fromArray(still.look); }
    camera.lookAt(target);

    post.render();
  }

  const loop = watchVisibility(section, update);
  return { stop: loop.stop };
}
