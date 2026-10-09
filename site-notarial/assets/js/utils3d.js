/* Utilitaires partagés par les scènes 3D */
import * as THREE from 'three';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Avancement (0 → 1) du défilement à l'intérieur d'une section « sticky » */
export function sectionProgress(section) {
  const r = section.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? clamp(-r.top / total) : 0;
}

export function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  return renderer;
}

/* Ne fait tourner la boucle de rendu que lorsque la section est visible */
export function watchVisibility(section, frame) {
  let visible = true, raf = 0;
  const tick = () => { raf = 0; if (!visible) return; frame(); raf = requestAnimationFrame(tick); };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }, { rootMargin: '100px' });
  io.observe(section);
  raf = requestAnimationFrame(tick);
  return { stop() { io.disconnect(); cancelAnimationFrame(raf); visible = false; } };
}
