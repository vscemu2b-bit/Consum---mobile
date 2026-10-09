/* Accueil : remplace le visuel fixe par la scène 3D animée, une fois la page chargée.
   Ignoré sur petit écran, en mode économie de données ou si l'utilisateur préfère moins d'animations. */
const box = document.querySelector('[data-hero3d]');
const allowed = box
  && matchMedia('(min-width: 900px)').matches
  && !matchMedia('(prefers-reduced-motion: reduce)').matches
  && !(navigator.connection && navigator.connection.saveData);

async function start() {
  try {
    const { initHeroScene } = await import('./scene-hero.js');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    box.appendChild(canvas);
    initHeroScene(canvas, box, { auto: true, center: true });
    setTimeout(() => box.classList.add('is-live'), 600);
  } catch (e) {
    // Le visuel fixe reste affiché
  }
}

if (allowed) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1000));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
