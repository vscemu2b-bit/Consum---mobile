/* Utilitaires partagés par les scènes 3D : rendu physique, post-traitement, textures procédurales */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/* Avancement (0 → 1) du défilement à l'intérieur d'une section « sticky » */
export function sectionProgress(section) {
  const r = section.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? clamp(-r.top / total) : 0;
}

/* Rendu physique : tone mapping filmique, ombres douces */
export function makeRenderer(canvas, { exposure = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

/* Chaîne de post-traitement : rendu → halo lumineux (bloom) → sortie */
export function makeComposer(renderer, scene, camera, { strength = 0.5, radius = 0.6, threshold = 0.85 } = {}) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), strength, radius, threshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return {
    composer, bloom,
    setSize(w, h) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); },
    render() { composer.render(); },
  };
}

/* Carte d'environnement (reflets) générée à partir d'une scène */
export function bakeEnvironment(renderer, envScene, blur = 0.03) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(envScene, blur);
  pmrem.dispose();
  return rt.texture;
}

/* Bruit de valeur simple pour les textures procédurales */
function makeNoise(seed = 1) {
  const p = new Uint8Array(512);
  let s = seed;
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 256; i++) p[i + 256] = p[i];
  const fade = (t) => t * t * (3 - 2 * t);
  const h = (x, y) => p[(p[x & 255] + y) & 511] / 255;
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    const u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

/* Texture de bois (noyer) : veinage étiré + bruit */
export function woodTexture(size = 512, base = [74, 44, 26]) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const img = g.createImageData(size, size);
  const n = makeNoise(7);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const w = n(x / 90, y / 12) * 6 + n(x / 30, y / 4) * 1.5;
    const ring = Math.sin(w * Math.PI) * 0.5 + 0.5;
    const k = 0.72 + ring * 0.28 + (n(x / 4, y / 1.5) - 0.5) * 0.12;
    const i = (y * size + x) * 4;
    img.data[i] = base[0] * k; img.data[i + 1] = base[1] * k; img.data[i + 2] = base[2] * k; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

/* Texture de grain (cuir, papier) en niveaux de gris, pour la rugosité ou le relief */
export function grainTexture(size = 256, scale = 3, seed = 3) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const img = g.createImageData(size, size);
  const n = makeNoise(seed);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = (n(x / scale, y / scale) * 0.6 + n(x / (scale * 4), y / (scale * 4)) * 0.4) * 255;
    const i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* Ne fait tourner la boucle de rendu que lorsque la section est visible */
export function watchVisibility(section, frame) {
  let visible = true, raf = 0, last = performance.now();
  const tick = (now) => {
    raf = 0; if (!visible) return;
    const dt = clamp((now - last) / 1000, 0, 0.1); last = Math.max(last, now);
    frame(dt);
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }, { rootMargin: '100px' });
  io.observe(section);
  raf = requestAnimationFrame(tick);
  return { stop() { io.disconnect(); cancelAnimationFrame(raf); visible = false; } };
}
