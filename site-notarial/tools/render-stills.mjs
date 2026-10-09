/* Génère les visuels du site à partir des scènes 3D (WebP + image de partage).
   Prérequis : npm i -D playwright sharp ; un serveur statique à la racine de site-notarial :
   python3 -m http.server 8090  puis  node tools/render-stills.mjs */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8090/tools/render.html';
const OUT = new URL('../src/assets/img/', import.meta.url).pathname;
const SHOTS = [
  { name: 'hero-crepuscule', scene: 'hero', p: 1, cam: [30, 8.5, 34], look: [0, 7.2, 0], fov: 30 },
  { name: 'tour-facade', scene: 'hero', p: 1, cam: [8.5, 2.2, 10.5], look: [0, 9.5, 0], fov: 38 },
  { name: 'chantier', scene: 'hero', p: 0.56, cam: [24, 11, 29], look: [0, 4.5, 0], fov: 30 },
  { name: 'plan-masse', scene: 'hero', p: 1, cam: [5, 44, 24], look: [0, 0, 1], fov: 32 },
  { name: 'socle', scene: 'hero', p: 1, cam: [17, 2.6, 21], look: [2, 2.6, 4], fov: 34 },
  { name: 'acte-signature', scene: 'acte', p: 0.57, cam: [3.4, 6.2, 6.4], look: [1.4, 0.2, 0.3], fov: 30 },
  { name: 'sceau', scene: 'acte', p: 0.69, cam: [3.9, 3.4, 4.6], look: [2.3, 0.6, 1.1], fov: 34 },
  { name: 'minutier', scene: 'acte', p: 0.99, cam: [0.6, 2.3, -1.2], look: [0, 1.9, -7], fov: 42 },
  { name: 'bureau', scene: 'acte', p: 0.08, cam: [2.4, 8.6, 8.8], look: [0.9, 0.1, 0.2], fov: 30 },
];
const only = process.argv[2];
const browser = await chromium.launch({ executablePath: process.env.CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const s of SHOTS.filter((x) => !only || x.name === only)) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  if (process.env.CDN_DIR) {
    await page.route('https://cdn.jsdelivr.net/npm/**', (r) => {
      const m = r.request().url().match(/three@0\.160\.0\/(.*)$/);
      return m ? r.fulfill({ body: fs.readFileSync(`${process.env.CDN_DIR}/${m[1]}`), contentType: 'application/javascript' }) : r.abort();
    });
  }
  await page.goto(`${BASE}?scene=${s.scene}&p=${s.p}&cam=${s.cam}&look=${s.look}&fov=${s.fov}`);
  await page.waitForFunction(() => window.__frames > 40, null, { timeout: 600000, polling: 500 });
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).resize(1920).webp({ quality: 82 }).toFile(`${OUT}${s.name}.webp`);
  await sharp(png).resize(960).webp({ quality: 80 }).toFile(`${OUT}${s.name}-960.webp`);
  if (s.name === 'hero-crepuscule') await sharp(png).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 84 }).toFile(`${OUT}partage.jpg`);
  console.log('ok', s.name);
  await page.close();
}
await browser.close();
