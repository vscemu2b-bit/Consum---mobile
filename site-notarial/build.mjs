/* ==========================================================================
   Générateur du site Atrium Notaires (aucune dépendance).
   node build.mjs            → dist/          (site à mettre en ligne)
   node build.mjs --preview  → dist-preview/  (aperçu autonome, liens relatifs)
   Le contenu se modifie dans src/content/, le style dans src/assets/css/.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './src/content/site.mjs';
import { SERVICES } from './src/content/services.mjs';
import { ARTICLES } from './src/content/articles.mjs';
import { TEAM } from './src/content/team.mjs';
import { FAQ } from './src/content/faq.mjs';
import { GLOSSARY } from './src/content/glossary.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW = process.argv.includes('--preview');
const OUT = path.join(ROOT, PREVIEW ? 'dist-preview' : 'dist');
const SRC = path.join(ROOT, 'src');
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0';
const YEAR = new Date(SITE.updated).getFullYear();

/* ---------- Utilitaires ---------- */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const svc = (slug) => SERVICES.find((s) => s.slug === slug);
const art = (slug) => ARTICLES.find((a) => a.slug === slug);
const initials = (name) => name.replace(/^Me\s+/, '').split(' ').map((w) => w[0]).join('');
// Titre de page : suffixe complet, raccourci si le titre dépasse 65 caractères
const pageTitle = (t) => ((t + ' | ' + SITE.name).length <= 65 ? `${t} | ${SITE.name}` : `${t} | Atrium`);
const dateFr = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

let CUR = ''; // chemin de la page en cours (ex. « expertises/vente-immobiliere/ »)
const depth = () => CUR.split('/').filter(Boolean).length;
// Lien interne : absolu à la racine en production, relatif en aperçu
const url = (target = '') => {
  if (!PREVIEW) return '/' + target;
  const rel = '../'.repeat(depth()) + target;
  return (target === '' || target.endsWith('/')) ? rel + 'index.html' : rel;
};
const abs = (target = '') => `${SITE.url}/${target}`;
const asset = (p) => url('assets/' + p);

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  metro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="15" rx="4"/><path d="M8 21l2-3M16 21l-2-3M8 13h.01M16 13h.01M4 10h16"/></svg>',
};
const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8 56 54H8Z"/><path d="M20 40h24"/></svg>';

const img = (name, alt, { eager = false, sizes = '(min-width: 960px) 50vw, 100vw' } = {}) =>
  `<img src="${asset(`img/${name}-960.webp`)}" srcset="${asset(`img/${name}-960.webp`)} 960w, ${asset(`img/${name}.webp`)} 1920w" sizes="${sizes}" width="1920" height="1080" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

/* ---------- Données structurées (schema.org) ---------- */
const ORG_ID = abs('#etude');
const orgNode = () => ({
  '@type': ['Notary', 'LegalService'],
  '@id': ORG_ID,
  name: SITE.name,
  legalName: SITE.legalName,
  url: abs(),
  logo: abs('assets/img/logo.png'),
  image: abs('assets/img/partage.jpg'),
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: 'Tarif réglementé',
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.postalCode, addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  openingHoursSpecification: SITE.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
  areaServed: [{ '@type': 'City', name: 'Paris' }, { '@type': 'AdministrativeArea', name: 'Île-de-France' }],
  numberOfEmployees: { '@type': 'QuantitativeValue', value: SITE.stats[0].value },
  knowsAbout: SERVICES.map((s) => s.title),
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Expertises', itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: abs(`expertises/${s.slug}/`) } })) },
  sameAs: SITE.sameAs,
});
const breadcrumbNode = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, target], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(target) })),
});
const faqNode = (faqs) => ({ '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

/* ---------- Gabarit commun ---------- */
const CSS = read('assets/css/site.css');
const SITE_JS = read('assets/js/site.js');

function header() {
  const mega = SERVICES.map((s) => `<a href="${url(`expertises/${s.slug}/`)}" style="--c:${s.color}"><strong>${esc(s.title)}</strong><span>${esc(s.short)}</span></a>`).join('');
  const cur = (t) => (CUR.startsWith(t) ? ' aria-current="page"' : '');
  return `
<div class="topbar"><div class="container">
  <div class="topbar-left"><a href="tel:${SITE.phoneHref}">${esc(SITE.phone)}</a><span>${esc(SITE.street)}, ${SITE.postalCode} ${SITE.city}</span><span>${esc(SITE.hoursLabel)}</span></div>
  <div class="topbar-right"><a href="${url('lexique/')}">Lexique</a><a href="${url('carrieres/')}">Recrutement</a></div>
</div></div>
<header class="header"><div class="container">
  <a class="brand" href="${url('')}" aria-label="${esc(SITE.name)}, accueil">${LOGO}<span class="brand-name">Atrium<small>Notaires · Paris</small></span></a>
  <nav class="nav" id="nav" aria-label="Navigation principale">
    <ul>
      <li><button class="nav-link" type="button" data-mega aria-expanded="false" aria-controls="mega"${cur('expertises/')}>Expertises ${ICON.chevron}</button>
        <div class="mega" id="mega">${mega}<a class="mega-all" href="${url('expertises/')}"><strong>Toutes nos expertises</strong>${ICON.arrow}</a></div></li>
      <li><a class="nav-link" href="${url('equipe/')}"${cur('equipe/')}>L'étude</a></li>
      <li><a class="nav-link" href="${url('frais-de-notaire/')}"${cur('frais-de-notaire/')}>Frais de notaire</a></li>
      <li><a class="nav-link" href="${url('actualites/')}"${cur('actualites/')}>Actualités</a></li>
      <li><a class="nav-link" href="${url('contact/')}"${cur('contact/')}>Contact</a></li>
    </ul>
    <a class="btn btn-primary" href="${url('contact/')}">Prendre rendez-vous</a>
  </nav>
  <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
</div></header>`;
}

function footer() {
  return `
<footer class="footer"><div class="container">
  <div class="footer-grid">
    <div>
      <a class="brand" href="${url('')}">${LOGO}<span class="brand-name">Atrium<small>Notaires · Paris</small></span></a>
      <address>${esc(SITE.street)}<br>${SITE.postalCode} ${SITE.city}<br><a href="tel:${SITE.phoneHref}">${esc(SITE.phone)}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br>${esc(SITE.hoursLabel)}</address>
    </div>
    <div><h2>Expertises</h2><ul>${SERVICES.map((s) => `<li><a href="${url(`expertises/${s.slug}/`)}">${esc(s.title)}</a></li>`).join('')}</ul></div>
    <div><h2>L'étude</h2><ul>
      <li><a href="${url('equipe/')}">Notre équipe</a></li><li><a href="${url('frais-de-notaire/')}">Frais de notaire</a></li>
      <li><a href="${url('actualites/')}">Actualités et guides</a></li><li><a href="${url('lexique/')}">Lexique notarial</a></li>
      <li><a href="${url('carrieres/')}">Carrières</a></li><li><a href="${url('contact/')}">Contact et accès</a></li></ul></div>
    <div><h2>Informations</h2><ul>
      <li><a href="${url('mentions-legales/')}">Mentions légales</a></li><li><a href="${url('mentions-legales/')}#donnees">Données personnelles</a></li>
      <li><a href="https://mediateur-notariat.notaires.fr" rel="noopener" target="_blank">Médiateur du notariat</a></li>
      <li><a href="https://www.notaires.fr" rel="noopener" target="_blank">Notaires de France</a></li>
      <li><a href="https://www.paris.notaires.fr" rel="noopener" target="_blank">Chambre des notaires de Paris</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span>© ${YEAR} ${esc(SITE.legalName)}</span><span>Membre de la Chambre des notaires de Paris · Tarifs réglementés</span></div>
</div></footer>`;
}

function bundle3D() {
  // Aperçu : assemble les modules 3D en un seul script (pas d'import relatif)
  const strip = (src) => src.replace(/^import .*?;\n/gm, '').replace(/^export /gm, '');
  const utilsNames = ['clamp', 'easeOutCubic', 'easeInOut', 'easeOutExpo', 'damp', 'reducedMotion', 'sectionProgress', 'makeRenderer', 'makeComposer', 'bakeEnvironment', 'woodTexture', 'grainTexture', 'watchVisibility'];
  const ext = new Set();
  [read('assets/js/utils3d.js'), read('assets/js/scene-hero.js')].forEach((s) => (s.match(/^import .*? from '(?!\.\/)[^']+';$/gm) || []).forEach((l) => ext.add(l)));
  return `${[...ext].join('\n')}
const __utils = (() => { ${strip(read('assets/js/utils3d.js'))}\nreturn { ${utilsNames.join(', ')} }; })();
const __hero = (() => { const { ${utilsNames.join(', ')} } = __utils; ${strip(read('assets/js/scene-hero.js'))}\nreturn { initHeroScene }; })();
${read('assets/js/hero3d.js').replace("await import('./scene-hero.js')", '__hero')}`;
}

function layout(p) {
  const canonical = abs(p.path);
  const graph = [orgNode(), { '@type': 'WebSite', '@id': abs('#site'), url: abs(), name: SITE.name, inLanguage: 'fr-FR', publisher: { '@id': ORG_ID } },
    { '@type': p.pageType || 'WebPage', '@id': canonical + '#page', url: canonical, name: p.title, description: p.desc, inLanguage: 'fr-FR', isPartOf: { '@id': abs('#site') }, about: { '@id': ORG_ID } },
    ...(p.crumbs ? [breadcrumbNode(p.crumbs)] : []), ...(p.schema || [])];
  const ogImg = abs(`assets/img/${p.ogImage || 'partage.jpg'}`);
  const scripts3D = p.hero3d ? (PREVIEW
    ? `<script type="importmap">{"imports":{"three":"${THREE}/build/three.module.js","three/addons/":"${THREE}/examples/jsm/"}}</script>\n<script type="module">${bundle3D()}</script>`
    : `<script type="importmap">{"imports":{"three":"${THREE}/build/three.module.js","three/addons/":"${THREE}/examples/jsm/"}}</script>\n<script type="module" src="${asset('js/hero3d.js')}"></script>`) : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#12204a">
<link rel="icon" href="${asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${asset('img/apple-touch-icon.png')}">
<link rel="manifest" href="${url('site.webmanifest')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap">
${p.preload ? `<link rel="preload" as="image" href="${asset(`img/${p.preload}-960.webp`)}" imagesrcset="${asset(`img/${p.preload}-960.webp`)} 960w, ${asset(`img/${p.preload}.webp`)} 1920w" imagesizes="(min-width: 960px) 50vw, 100vw" fetchpriority="high">` : ''}
${PREVIEW ? `<style>${CSS}</style>` : `<link rel="stylesheet" href="${asset('css/site.css')}">`}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
${header()}
<main id="contenu">
${p.body}
</main>
${footer()}
${PREVIEW ? `<script>${SITE_JS}</script>` : `<script src="${asset('js/site.js')}" defer></script>`}
${scripts3D}
</body>
</html>
`;
}

/* ---------- Blocs réutilisables ---------- */
const breadcrumb = (crumbs) => `<nav aria-label="Fil d'Ariane"><ol class="breadcrumb">${crumbs.map(([n, t], i) => (i < crumbs.length - 1 ? `<li><a href="${url(t)}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`)).join('')}</ol></nav>`;
const serviceCard = (s, wide = false) => `<a class="service-card reveal${wide ? ' is-wide' : ''}" href="${url(`expertises/${s.slug}/`)}" style="--c:${s.color}">
  <figure>${img(s.img, s.imgAlt, { sizes: '(min-width: 960px) 33vw, 100vw' })}</figure>
  <div class="body"><span class="tag">${esc(s.kicker.split(' · ')[0])}</span><h3>${esc(s.title)}</h3><p>${esc(s.short)}</p><span class="link-arrow">Découvrir ${ICON.arrow}</span></div></a>`;
const postCard = (a) => `<a class="post-card reveal" href="${url(`actualites/${a.slug}/`)}">
  <figure>${img(a.img, a.title, { sizes: '(min-width: 960px) 33vw, 100vw' })}</figure>
  <div class="post-meta"><span class="tag" style="--c:${svc(a.service).color}">${esc(a.category)}</span><time datetime="${a.date}">${dateFr(a.date)}</time><span>${a.readTime} min</span></div>
  <h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p></a>`;
const faqBlock = (faqs) => `<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const ctaBand = (title = 'Un projet ? <em>Parlons-en.</em>', text = 'Un notaire du pôle concerné vous rappelle sous 48 heures ouvrées pour un premier échange.') => `
<section class="section"><div class="container"><div class="cta-band reveal">
  <div><h2>${title}</h2><p class="lead" style="color:rgba(255,255,255,.8)">${text}</p></div>
  <div class="cta-actions"><a class="btn btn-light" href="${url('contact/')}">Prendre rendez-vous ${ICON.arrow}</a><a class="btn btn-ghost-light" href="tel:${SITE.phoneHref}">${ICON.phone} ${esc(SITE.phone)}</a></div>
</div></div></section>`;
const checklist = (items) => `<ul class="checklist">${items.map((m) => `<li>${ICON.check}<span>${esc(m)}</span></li>`).join('')}</ul>`;

/* ---------- Pages ---------- */
const pages = [];
const add = (p) => pages.push(p);

// Accueil
add({
  path: '',
  title: `Notaire à Paris 1er : office notarial | ${SITE.name}`,
  ogTitle: `${SITE.name}, office notarial à Paris`,
  desc: `${SITE.name}, office notarial à Paris 1er : 40 notaires et 120 collaborateurs en immobilier, VEFA, financement, crédit-bail, donation et succession.`,
  preload: 'hero-crepuscule',
  hero3d: true,
  schema: [faqNode(FAQ)],
  body: () => `
<section class="hero"><div class="container hero-grid">
  <div>
    <p class="eyebrow">Office notarial · Paris 1er</p>
    <h1>Vos notaires à Paris, pour <em>chaque étape</em> de vos projets.</h1>
    <p class="lead">Immobilier, construction, financement, famille : 40 notaires et 120 collaborateurs réunis en sept pôles accompagnent particuliers, entreprises et investisseurs, avec un interlocuteur dédié du premier rendez-vous à la signature.</p>
    <div class="hero-actions"><a class="btn btn-primary" href="${url('contact/')}">Prendre rendez-vous ${ICON.arrow}</a><a class="btn btn-outline" href="${url('frais-de-notaire/')}">Estimer mes frais</a></div>
    <div class="trust"><ul>
      <li>${ICON.check}Rendez-vous sous 48 h</li><li>${ICON.check}Signature à distance</li><li>${ICON.check}Tarifs réglementés et devis clair</li>
    </ul></div>
  </div>
  <div class="hero-visual" data-hero3d>
    ${img('hero-crepuscule', 'Ensemble immobilier contemporain au crépuscule', { eager: true })}
    <div class="hero-badge"><strong>${SITE.stats[1].value}</strong><span>notaires réunis<br>en ${SITE.stats[3].value} pôles d'expertise</span></div>
  </div>
</div></section>

<section class="profiles"><div class="container"><div class="profiles-box">
  <p>Vous êtes</p>
  <ul class="profiles-list">
    <li><a href="${url('expertises/vente-immobiliere/')}">Acheteur ou vendeur</a></li>
    <li><a href="${url('expertises/famille-patrimoine-succession/')}">Une famille</a></li>
    <li><a href="${url('expertises/immobilier-institutionnel/')}">Investisseur</a></li>
    <li><a href="${url('expertises/construction-promotion-vefa/')}">Promoteur</a></li>
    <li><a href="${url('expertises/amenagement-urbanisme/')}">Aménageur ou collectivité</a></li>
    <li><a href="${url('expertises/financement-suretes/')}">Banque</a></li>
    <li><a href="${url('expertises/credit-bail-immobilier/')}">Entreprise</a></li>
  </ul>
</div></div></section>

<section class="section"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Nos expertises</p><h2>Sept pôles, <em>une seule étude.</em></h2><p class="lead">Chaque dossier est confié à une équipe spécialisée, qui mobilise les autres pôles dès qu'une opération le demande.</p></div><a class="link-arrow" href="${url('expertises/')}">Toutes nos expertises ${ICON.arrow}</a></div>
  <div class="services-grid">${SERVICES.map((s, i) => serviceCard(s, i === 0)).join('')}</div>
</div></section>

<section class="section section-paper"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Pourquoi nous choisir</p><h2>La puissance d'une grande étude, <em>l'attention d'un conseil dédié.</em></h2></div></div>
  <div class="values">
    <div class="value reveal"><b>${SITE.stats[0].value}</b><h3>collaborateurs</h3><p>Juristes, clercs, formalistes et comptables au service de vos dossiers.</p></div>
    <div class="value reveal"><b>48 h</b><h3>pour vous rappeler</h3><p>Un notaire du pôle concerné vous recontacte sous deux jours ouvrés.</p></div>
    <div class="value reveal"><b>100 %</b><h3>dématérialisable</h3><p>Acte authentique électronique et signature à distance pour tous nos pôles.</p></div>
    <div class="value reveal"><b>${SITE.stats[2].value}</b><h3>associés</h3><p>Un comité exécutif collégial, garant de la qualité et de la déontologie.</p></div>
  </div>
</div></section>

<section class="section"><div class="container split">
  <figure class="reveal">${img('acte-signature', 'Acte authentique signé sur un bureau de notaire')}</figure>
  <div>
    <p class="eyebrow">L'acte authentique</p>
    <h2>Une signature qui <em>vous protège.</em></h2>
    <p class="lead">Rédigé et vérifié par un officier public, l'acte notarié produit des effets qu'aucun autre contrat n'offre.</p>
    ${checklist(['Force probante : son contenu fait foi jusqu\'à inscription de faux', 'Force exécutoire : il vaut jugement en cas d\'impayé', 'Date certaine et conservation de l\'original par l\'étude', 'Fonds sécurisés sur un compte à la Caisse des Dépôts'])}
  </div>
</div></section>

<section class="section section-navy"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Frais de notaire</p><h2>Estimez vos frais <em>en quelques secondes.</em></h2></div><a class="btn btn-ghost-light" href="${url('frais-de-notaire/')}">Simulateur détaillé ${ICON.arrow}</a></div>
  <div class="quote reveal">
    <form class="stack-sm" onsubmit="return false">
      <label class="field" for="quickPrice">Prix d'achat (€)<input id="quickPrice" type="number" inputmode="numeric" min="0" step="1000" value="450000"></label>
      <label class="field" for="quickType">Type de bien<select id="quickType"><option value="ancien">Ancien</option><option value="neuf">Neuf ou VEFA</option></select></label>
      <p class="muted" style="font-size:.88rem">Estimation indicative au taux départemental de droit commun.</p>
    </form>
    <div class="quote-out"><span class="muted">Frais estimés</span><strong id="quickTotal">32 571 €</strong><span id="quickPct" class="muted">soit 7,2 % du prix</span></div>
  </div>
</div></section>

<section class="section"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Votre dossier</p><h2>Simple, <em>de bout en bout.</em></h2></div></div>
  <ol class="steps">
    <li class="reveal"><h3>Prise de contact</h3><p>Par téléphone ou en ligne : nous orientons votre demande vers le bon pôle.</p></li>
    <li class="reveal"><h3>Premier rendez-vous</h3><p>À l'étude ou en visioconférence, sous 48 heures ouvrées.</p></li>
    <li class="reveal"><h3>Devis transparent</h3><p>Une estimation détaillée des frais, sans surprise.</p></li>
    <li class="reveal"><h3>Signature</h3><p>À l'étude ou à distance, puis formalités et remise de vos titres.</p></li>
  </ol>
</div></section>

<section class="section section-paper"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Actualités et guides</p><h2>Comprendre <em>avant de signer.</em></h2></div><a class="link-arrow" href="${url('actualites/')}">Tous les articles ${ICON.arrow}</a></div>
  <div class="posts">${ARTICLES.slice(0, 3).map(postCard).join('')}</div>
</div></section>

<section class="section"><div class="container narrow">
  <p class="eyebrow">Questions fréquentes</p><h2>Vos questions, <em>nos réponses.</em></h2>
  <div class="mt-l">${faqBlock(FAQ)}</div>
</div></section>
${ctaBand()}`,
});

// Index des expertises
add({
  path: 'expertises/',
  title: `Nos expertises notariales à Paris | ${SITE.name}`,
  desc: 'Immobilier institutionnel, VEFA, aménagement, vente immobilière, financement, crédit-bail, famille et succession : les sept pôles de notre étude parisienne.',
  crumbs: [['Accueil', ''], ['Expertises', 'expertises/']],
  pageType: 'CollectionPage',
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Expertises', 'expertises/']])}
  <h1>Nos expertises <em>notariales</em></h1>
  <p class="lead">Sept pôles spécialisés couvrent l'ensemble du droit notarial, de l'immobilier institutionnel à la transmission familiale.</p>
</div></section>
<section class="section"><div class="container"><div class="services-grid">${SERVICES.map((s) => serviceCard(s)).join('')}</div></div></section>
${ctaBand()}`,
});

// Pages expertise
SERVICES.forEach((s) => {
  const partner = TEAM.find((t) => t.service === s.slug);
  const crumbs = [['Accueil', ''], ['Expertises', 'expertises/'], [s.title, `expertises/${s.slug}/`]];
  add({
    path: `expertises/${s.slug}/`,
    title: pageTitle(s.seoTitle),
    desc: s.metaDesc,
    crumbs,
    preload: s.img,
    ogImage: `${s.img}.webp`,
    schema: [faqNode(s.faqs), { '@type': 'Service', name: s.title, serviceType: s.title, description: s.metaDesc, provider: { '@id': ORG_ID }, areaServed: { '@type': 'City', name: 'Paris' }, url: abs(`expertises/${s.slug}/`) }],
    body: () => `
<section class="page-hero" style="--c:${s.color}"><div class="container">
  ${breadcrumb(crumbs)}
  <div class="page-hero-grid">
    <div><span class="tag" style="--c:${s.color}">${esc(s.kicker)}</span><h1 style="margin-top:16px">${esc(s.h1)}</h1><p class="lead">${esc(s.lead)}</p>
      <div class="hero-actions"><a class="btn btn-primary" href="${url('contact/')}${PREVIEW ? '' : `?pole=${s.slug}`}">Consulter le pôle ${ICON.arrow}</a><a class="btn btn-outline" href="tel:${SITE.phoneHref}">${esc(SITE.phone)}</a></div></div>
    <figure>${img(s.img, s.imgAlt, { eager: true })}</figure>
  </div>
</div></section>
<section class="section"><div class="container layout-aside">
  <div>
    <div class="prose">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <h2 class="mt-l">Nos missions</h2>
    ${checklist(s.missions)}
    <h2 class="mt-l">Nos clients</h2>
    <ul class="pill-list" style="margin-top:20px">${s.clients.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2 class="mt-l">Notre méthode</h2>
    <ol class="steps" style="margin-top:24px;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))">${s.steps.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
    <h2 class="mt-l">Questions fréquentes</h2>
    <div style="margin-top:12px">${faqBlock(s.faqs)}</div>
    <h3 class="mt-l" style="margin-bottom:14px">Textes de référence</h3>
    <ul class="refs">${s.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
  </div>
  <aside class="aside-card" style="--c:${s.color}" aria-label="Contact du pôle">
    <div class="avatar" aria-hidden="true">${initials(partner.name)}</div>
    <div><strong style="color:var(--ink)">${esc(partner.name)}</strong><p class="muted" style="font-size:.92rem">${esc(partner.role)}, responsable du pôle</p></div>
    <p style="font-size:.95rem">Exposez-nous votre projet : un notaire du pôle vous répond sous 48 heures ouvrées.</p>
    <a class="btn btn-primary" href="${url('contact/')}${PREVIEW ? '' : `?pole=${s.slug}`}">Prendre rendez-vous</a>
    <a class="btn btn-outline" href="tel:${SITE.phoneHref}">${ICON.phone} Appeler l'étude</a>
  </aside>
</div></section>
${s.related.length ? `<section class="section section-paper"><div class="container"><div class="section-head"><div><p class="eyebrow">À lire</p><h2>Nos guides <em>sur le sujet</em></h2></div></div><div class="posts">${s.related.map((r) => postCard(art(r))).join('')}</div></div></section>` : ''}
<section class="section"><div class="container"><div class="section-head"><div><p class="eyebrow">Autres expertises</p><h2>Un dossier <em>transversal ?</em></h2></div></div>
<div class="services-grid">${SERVICES.filter((x) => x.slug !== s.slug).slice(0, 3).map((x) => serviceCard(x)).join('')}</div></div></section>
${ctaBand()}`,
  });
});

// Équipe
add({
  path: 'equipe/',
  title: `L'étude et ses associés | ${SITE.name}`,
  desc: `${SITE.name} réunit 120 collaborateurs et 40 notaires à Paris 1er, sous la gouvernance de sept associés. Découvrez l'équipe et notre organisation.`,
  crumbs: [['Accueil', ''], ['L\'étude', 'equipe/']],
  pageType: 'AboutPage',
  schema: TEAM.map((m) => ({ '@type': 'Person', name: m.name.replace(/^Me\s+/, ''), honorificPrefix: 'Maître', jobTitle: m.role, worksFor: { '@id': ORG_ID }, knowsAbout: svc(m.service).title })),
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['L\'étude', 'equipe/']])}
  <h1>Une grande étude, <em>une équipe à votre écoute</em></h1>
  <p class="lead">Officiers publics nommés par le garde des Sceaux, nos notaires confèrent l'authenticité aux actes et en garantissent la sécurité juridique. L'étude est organisée en sept pôles, chacun dirigé par un associé.</p>
</div></section>
<section class="section"><div class="container">
  <div class="values">${SITE.stats.map((st) => `<div class="value"><b>${st.value}</b><h3>${esc(st.label)}</h3></div>`).join('')}</div>
</div></section>
<section class="section section-paper"><div class="container">
  <div class="section-head"><div><p class="eyebrow">Gouvernance</p><h2>Le comité <em>exécutif</em></h2><p class="lead">Chaque associé dirige un pôle et siège au comité exécutif, garant de la stratégie, de la qualité et de la déontologie de l'étude.</p></div></div>
  <div class="team-grid">${TEAM.map((m) => { const s = svc(m.service); return `<article class="member reveal" style="--c:${s.color}"><div class="avatar" aria-hidden="true">${initials(m.name)}</div><h3>${esc(m.name)}</h3><p class="role">${esc(m.role)}</p><span class="tag" style="--c:${s.color}">${esc(s.title)}</span><p>${esc(m.bio)}</p><a class="link-arrow" href="${url(`expertises/${s.slug}/`)}">Le pôle ${ICON.arrow}</a></article>`; }).join('')}</div>
</div></section>
<section class="section"><div class="container split is-reverse">
  <figure class="reveal">${img('minutier', 'Registres reliés de l\'étude')}</figure>
  <div><p class="eyebrow">Nos engagements</p><h2>Une sécurité <em>garantie par la loi</em></h2>
  ${checklist(['Officiers publics, sous le contrôle du procureur de la République et des instances professionnelles', 'Fonds clients déposés à la Caisse des Dépôts, comptabilité inspectée chaque année', 'Assurance de responsabilité civile professionnelle et garantie collective du notariat', 'Secret professionnel, protection des données et vigilance contre le blanchiment', 'Formation continue de tous nos notaires et collaborateurs'])}</div>
</div></section>
${ctaBand('Rejoindre <em>l\'étude ?</em>', 'Nous recrutons régulièrement des notaires, clercs, juristes et formalistes.').replace(url('contact/'), url('carrieres/')).replace('Prendre rendez-vous', 'Voir les carrières')}`,
});

// Actualités
add({
  path: 'actualites/',
  title: `Actualités et guides notariaux | ${SITE.name}`,
  desc: 'Frais de notaire, VEFA, donation, succession, crédit-bail : nos guides pratiques rédigés par les notaires de l\'étude pour préparer vos projets.',
  crumbs: [['Accueil', ''], ['Actualités', 'actualites/']],
  pageType: 'CollectionPage',
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Actualités', 'actualites/']])}
  <h1>Actualités <em>et guides</em></h1>
  <p class="lead">Des réponses claires aux questions que vous vous posez, rédigées par nos notaires et mises à jour régulièrement.</p>
</div></section>
<section class="section"><div class="container"><div class="posts">${ARTICLES.map(postCard).join('')}</div></div></section>
${ctaBand()}`,
});

ARTICLES.forEach((a) => {
  const s = svc(a.service);
  const crumbs = [['Accueil', ''], ['Actualités', 'actualites/'], [a.title, `actualites/${a.slug}/`]];
  add({
    path: `actualites/${a.slug}/`,
    title: pageTitle(a.seoTitle),
    desc: a.metaDesc,
    crumbs,
    ogType: 'article',
    ogImage: `${a.img}.webp`,
    preload: a.img,
    schema: [{ '@type': 'BlogPosting', headline: a.title, description: a.metaDesc, datePublished: a.date, dateModified: SITE.updated, image: abs(`assets/img/${a.img}.webp`), author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, mainEntityOfPage: abs(`actualites/${a.slug}/`), articleSection: a.category, inLanguage: 'fr-FR' }],
    body: () => `
<article>
<section class="page-hero"><div class="narrow">
  ${breadcrumb(crumbs)}
  <div class="post-meta"><span class="tag" style="--c:${s.color}">${esc(a.category)}</span><time datetime="${a.date}">${dateFr(a.date)}</time><span>${a.readTime} min de lecture</span></div>
  <h1 style="font-size:clamp(2.3rem,5vw,4rem)">${esc(a.title)}</h1>
  <p class="lead">${esc(a.excerpt)}</p>
</div></section>
<section class="section" style="padding-top:48px"><div class="narrow">
  <figure class="article-cover">${img(a.img, a.title, { eager: true, sizes: '(min-width: 800px) 780px, 100vw' })}</figure>
  <div class="prose">${a.body.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>').replace(/\{\{link:service:([\w-]+)\}\}/g, (_, x) => url(`expertises/${x}/`)).replace(/\{\{link:([\w-]+)\}\}/g, (_, x) => url(`${x}/`))}</div>
  <p class="disclaimer">Article d'information générale mis à jour le ${dateFr(SITE.updated)}. Il ne remplace pas un conseil personnalisé : chaque situation mérite l'analyse d'un notaire.</p>
  <div class="article-aside"><div><strong style="color:var(--ink)">Une question sur ce sujet ?</strong><p class="muted">Notre pôle ${esc(s.title.toLowerCase())} vous répond.</p></div><a class="btn btn-primary" href="${url('contact/')}">Prendre rendez-vous ${ICON.arrow}</a></div>
</div></section>
</article>
<section class="section section-paper"><div class="container"><div class="section-head"><div><p class="eyebrow">À lire aussi</p><h2>D'autres <em>guides</em></h2></div></div><div class="posts">${ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3).map(postCard).join('')}</div></div></section>`,
  });
});

// Frais de notaire et simulateurs
add({
  path: 'frais-de-notaire/',
  title: `Frais de notaire 2026 : simulateur gratuit | ${SITE.name}`,
  desc: 'Calculez vos frais de notaire à Paris pour un achat dans l\'ancien ou le neuf, et vos droits de donation. Simulateur gratuit et explications détaillées.',
  crumbs: [['Accueil', ''], ['Frais de notaire', 'frais-de-notaire/']],
  schema: [{ '@type': 'WebApplication', name: 'Simulateur de frais de notaire', applicationCategory: 'FinanceApplication', operatingSystem: 'Tous', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, provider: { '@id': ORG_ID } }],
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Frais de notaire', 'frais-de-notaire/']])}
  <h1>Simulateur de <em>frais de notaire</em></h1>
  <p class="lead">Estimez en quelques secondes vos frais d'acquisition ou vos droits de donation. Résultats indicatifs, fondés sur le tarif réglementé et le barème fiscal en vigueur.</p>
</div></section>
<section class="section"><div class="container">
  <div class="sim">
    <div class="sim-tabs" role="tablist" aria-label="Choix du simulateur">
      <button class="sim-tab" role="tab" id="tabFrais" aria-controls="simFrais" aria-selected="true">Frais d'acquisition</button>
      <button class="sim-tab" role="tab" id="tabDon" aria-controls="simDon" aria-selected="false" tabindex="-1">Droits de donation</button>
    </div>
    <div class="sim-panel" role="tabpanel" id="simFrais" aria-labelledby="tabFrais">
      <form class="sim-form" id="formFrais" onsubmit="return false">
        <label class="field" for="fPrix">Prix de vente (€)<input id="fPrix" type="number" min="0" step="1000" value="450000" inputmode="numeric"></label>
        <label class="field" for="fType">Nature du bien<select id="fType"><option value="ancien">Ancien</option><option value="neuf">Neuf ou VEFA (prix TTC)</option></select></label>
        <label class="field" for="fTaux">Taux départemental<select id="fTaux"><option value="5.80665">Droit commun : 5,80665 %</option><option value="6.3185">Majoré (loi de finances 2025) : 6,3185 %</option></select></label>
        <label class="field" for="fMobilier">Mobilier inclus (€)<input id="fMobilier" type="number" min="0" step="500" value="0" inputmode="numeric"></label>
      </form>
      <div class="sim-result">
        <div class="sim-total"><span>Frais estimés</span><strong id="fTotal">32 571 €</strong><em id="fPct"></em></div>
        <div class="sim-bars" id="fBars"></div>
        <ul class="sim-lines" id="fLines"></ul>
        <p class="sim-note">Émoluments proportionnels selon le tarif réglementé, TVA 20 %. Droits de mutation selon le département ; le taux majoré ne s'applique pas aux primo-accédants. Formalités et débours : forfait estimatif.</p>
      </div>
    </div>
    <div class="sim-panel" role="tabpanel" id="simDon" aria-labelledby="tabDon" hidden>
      <form class="sim-form" id="formDon" onsubmit="return false">
        <label class="field" for="dValeur">Valeur du bien donné (€)<input id="dValeur" type="number" min="0" step="1000" value="300000" inputmode="numeric"></label>
        <label class="field" for="dEnfants">Nombre d'enfants donataires<input id="dEnfants" type="number" min="1" max="10" value="2" inputmode="numeric"></label>
        <label class="field" for="dDroit">Droit transmis<select id="dDroit"><option value="pp">Pleine propriété</option><option value="np">Nue-propriété (réserve d'usufruit)</option></select></label>
        <label class="field" for="dAge" id="dAgeField">Âge du donateur<input id="dAge" type="number" min="18" max="110" value="65" inputmode="numeric"></label>
      </form>
      <div class="sim-result">
        <div class="sim-total"><span>Droits estimés</span><strong id="dTotal">0 €</strong><em id="dDetail"></em></div>
        <ul class="sim-lines" id="dLines"></ul>
        <p class="sim-note">Donation d'un parent à ses enfants, à parts égales, sans donation antérieure de moins de 15 ans. Abattement de 100 000 € par enfant (art. 779 CGI), barème de l'art. 777 CGI, nue-propriété selon l'art. 669 CGI. Hors frais d'acte.</p>
      </div>
    </div>
  </div>
</div></section>
<section class="section section-paper"><div class="narrow prose">
  <h2>Que comprennent les frais de notaire ?</h2>
  <p>Les frais d'acquisition regroupent trois éléments : les <strong>droits de mutation</strong>, reversés au département, à la commune et à l'État ; les <strong>débours</strong>, avancés par le notaire pour obtenir les documents nécessaires ; et les <strong>émoluments</strong>, rémunération du notaire fixée par un tarif réglementé.</p>
  <p>Dans l'ancien, les frais représentent environ 7 à 8 % du prix, dont près de 80 % d'impôts. Dans le neuf, ils sont réduits à 2 à 3 % du prix, la vente étant soumise à la TVA.</p>
  <p>Pour aller plus loin, lisez notre guide <a href="${url('actualites/frais-de-notaire-2026/')}">Frais de notaire en 2026 : ce que vous payez vraiment</a> ou consultez notre pôle <a href="${url('expertises/vente-immobiliere/')}">vente immobilière</a>.</p>
</div></section>
${ctaBand('Besoin d\'un <em>devis précis ?</em>', 'Nous vous remettons une estimation détaillée de vos frais dès le premier rendez-vous.')}`,
});

// Lexique
add({
  path: 'lexique/',
  title: `Lexique notarial : définitions utiles | ${SITE.name}`,
  desc: 'Acte authentique, minute, VEFA, DIA, levée d\'option, démembrement : les termes du notariat expliqués simplement par les notaires de l\'étude.',
  crumbs: [['Accueil', ''], ['Lexique', 'lexique/']],
  schema: [{ '@type': 'DefinedTermSet', name: 'Lexique notarial', hasDefinedTerm: GLOSSARY.map(([t, d]) => ({ '@type': 'DefinedTerm', name: t, description: d })) }],
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Lexique', 'lexique/']])}
  <h1>Lexique <em>notarial</em></h1>
  <p class="lead">Les termes que vous rencontrerez dans vos actes, expliqués simplement.</p>
</div></section>
<section class="section"><div class="container">
  <label class="field gloss-search" for="glossSearch">Rechercher un terme<input id="glossSearch" type="search" placeholder="VEFA, minute, levée d'option…"></label>
  <p class="muted" id="glossCount" aria-live="polite">${GLOSSARY.length} termes</p>
  <dl class="gloss mt-l">${[...GLOSSARY].sort((a, b) => a[0].localeCompare(b[0], 'fr')).map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
</div></section>
${ctaBand()}`,
});

// Carrières
add({
  path: 'carrieres/',
  title: `Recrutement notaire et clerc à Paris | ${SITE.name}`,
  desc: 'Rejoignez une étude notariale parisienne de 120 collaborateurs : notaires, clercs, juristes, formalistes et comptables. Candidature spontanée.',
  crumbs: [['Accueil', ''], ['Carrières', 'carrieres/']],
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Carrières', 'carrieres/']])}
  <div class="page-hero-grid"><div><h1>Rejoignez <em>l'étude</em></h1>
  <p class="lead">Notaires, clercs, juristes, formalistes, comptables : nous recrutons des profils exigeants, curieux et attachés au service du client.</p>
  <div class="hero-actions"><a class="btn btn-primary" href="mailto:${SITE.email}?subject=Candidature">Envoyer ma candidature ${ICON.arrow}</a></div></div>
  <figure>${img('bureau', 'Bureau de notaire', { eager: true })}</figure></div>
</div></section>
<section class="section"><div class="container">
  <div class="values">
    <div class="value"><b>7</b><h3>pôles spécialisés</h3><p>Des dossiers variés et techniques, de l'institutionnel à la famille.</p></div>
    <div class="value"><b>40</b><h3>notaires</h3><p>Un encadrement de proximité et des perspectives d'association.</p></div>
    <div class="value"><b>100 %</b><h3>formation</h3><p>Formation continue, tutorat et accompagnement vers le diplôme de notaire.</p></div>
    <div class="value"><b>1er</b><h3>arrondissement</h3><p>Des bureaux au cœur de Paris, accessibles en transports.</p></div>
  </div>
</div></section>
<section class="section section-paper"><div class="container narrow prose">
  <h2>Les métiers de l'étude</h2>
  <p><strong>Notaire et notaire assistant.</strong> Vous rédigez et recevez les actes, conseillez les clients et pilotez les dossiers d'un pôle.</p>
  <p><strong>Clerc et juriste.</strong> Vous préparez les actes, réunissez les pièces et suivez les dossiers jusqu'à la signature.</p>
  <p><strong>Formaliste.</strong> Vous assurez les formalités préalables et postérieures, dont la publicité foncière.</p>
  <p><strong>Comptable taxateur.</strong> Vous établissez les décomptes et veillez à la sécurité des flux financiers.</p>
  <p>Envoyez votre candidature à <a href="mailto:${SITE.email}?subject=Candidature">${SITE.email}</a> en précisant le pôle qui vous intéresse.</p>
</div></section>`,
});

// Contact
add({
  path: 'contact/',
  title: `Contact et rendez-vous, notaire Paris 1er | ${SITE.name}`,
  desc: `Prenez rendez-vous avec un notaire à Paris 1er : ${SITE.street}. Réponse sous 48 h ouvrées. Téléphone ${SITE.phone}, du lundi au vendredi.`,
  crumbs: [['Accueil', ''], ['Contact', 'contact/']],
  pageType: 'ContactPage',
  body: () => `
<section class="page-hero"><div class="container">
  ${breadcrumb([['Accueil', ''], ['Contact', 'contact/']])}
  <h1>Prendre <em>rendez-vous</em></h1>
  <p class="lead">Décrivez votre projet : un notaire du pôle concerné vous recontacte sous 48 heures ouvrées.</p>
</div></section>
<section class="section"><div class="container contact-grid">
  <div>
    <h2 style="font-size:2rem;margin-bottom:28px">Nous trouver</h2>
    <ul class="info-list">
      <li><span class="ico">${ICON.pin}</span><div><strong>Adresse</strong>${esc(SITE.street)}, ${SITE.postalCode} ${SITE.city}<br><a href="${SITE.mapsUrl}" target="_blank" rel="noopener">Itinéraire</a></div></li>
      <li><span class="ico">${ICON.metro}</span><div><strong>Accès</strong>${esc(SITE.metro)}</div></li>
      <li><span class="ico">${ICON.phone}</span><div><strong>Téléphone</strong><a href="tel:${SITE.phoneHref}">${esc(SITE.phone)}</a></div></li>
      <li><span class="ico">${ICON.mail}</span><div><strong>E-mail</strong><a href="mailto:${SITE.email}">${SITE.email}</a></div></li>
      <li><span class="ico">${ICON.clock}</span><div><strong>Horaires</strong>${esc(SITE.hoursLabel)}</div></li>
    </ul>
  </div>
  <form class="card-form" id="contactForm" data-email="${SITE.email}" novalidate>
    <div class="form-grid">
      <label class="field" for="cNom">Nom et prénom *<input id="cNom" name="nom" required autocomplete="name"></label>
      <label class="field" for="cEmail">E-mail *<input id="cEmail" name="email" type="email" required autocomplete="email"></label>
      <label class="field" for="cTel">Téléphone<input id="cTel" name="tel" type="tel" autocomplete="tel"></label>
      <label class="field" for="cPole">Votre projet concerne *<select id="cPole" name="pole" required><option value="">Choisir…</option>${SERVICES.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join('')}<option value="autre">Autre demande</option></select></label>
      <label class="field full" for="cMsg">Votre message *<textarea id="cMsg" name="message" rows="6" required></textarea></label>
    </div>
    <label class="check" for="cRgpd"><input id="cRgpd" type="checkbox" name="rgpd" required><span>J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la <a href="${url('mentions-legales/')}#donnees">politique de confidentialité</a>.</span></label>
    <button class="btn btn-primary" type="submit" style="justify-self:start">Envoyer ma demande ${ICON.arrow}</button>
    <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
  </form>
</div></section>`,
});

// Mentions légales
add({
  path: 'mentions-legales/',
  title: `Mentions légales | ${SITE.name}`,
  desc: `Mentions légales, données personnelles, tarifs réglementés et médiation de la consommation de ${SITE.name}.`,
  crumbs: [['Accueil', ''], ['Mentions légales', 'mentions-legales/']],
  body: () => `
<section class="page-hero"><div class="narrow">${breadcrumb([['Accueil', ''], ['Mentions légales', 'mentions-legales/']])}<h1>Mentions légales</h1></div></section>
<section class="section"><div class="narrow prose">
  <p><em>Les éléments entre crochets sont à compléter avant la mise en ligne.</em></p>
  <h2>Éditeur</h2><p>${esc(SITE.legalName)}, [forme sociale] au capital de [montant] €, RCS Paris [numéro], ${esc(SITE.street)}, ${SITE.postalCode} ${SITE.city}. Directeur de la publication : [nom]. Hébergeur : [nom, adresse, téléphone].</p>
  <p>Les notaires de l'étude sont membres de la Chambre des notaires de Paris et soumis au règlement national de la profession.</p>
  <h2 id="tarifs">Tarifs</h2><p>La rémunération des notaires est fixée par un tarif réglementé (articles L. 444-1 et suivants du code de commerce). Les prestations hors tarif font l'objet d'une convention d'honoraires écrite. Les simulateurs du site donnent des estimations indicatives.</p>
  <h2 id="donnees">Données personnelles</h2><p>Les données du formulaire de contact sont traitées par l'étude pour répondre à votre demande, puis conservées le temps nécessaire. Vous disposez de droits d'accès, de rectification, d'effacement, de limitation et d'opposition auprès de [adresse du délégué à la protection des données], et du droit d'introduire une réclamation auprès de la CNIL. Ce site n'utilise pas de cookies de mesure d'audience sans votre consentement.</p>
  <h2 id="mediation">Médiation</h2><p>Après une réclamation écrite préalable, vous pouvez saisir gratuitement le Médiateur du notariat : <a href="https://mediateur-notariat.notaires.fr" target="_blank" rel="noopener">mediateur-notariat.notaires.fr</a>.</p>
</div></section>`,
});

// Page 404
add({
  path: '404.html', file: '404.html', noindex: true, nositemap: true,
  title: `Page introuvable | ${SITE.name}`,
  desc: 'Cette page n\'existe pas ou a été déplacée.',
  body: () => `<section class="notfound"><div class="narrow"><h1>404</h1><h2>Page introuvable</h2><p class="lead" style="margin-inline:auto">Cette page n'existe pas ou a été déplacée.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="${url('')}">Retour à l'accueil</a><a class="btn btn-outline" href="${url('expertises/')}">Nos expertises</a></div></div></section>`,
});

/* ---------- Écriture ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };
const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) if (filter(f)) fs.copyFileSync(path.join(from, f), path.join(to, f));
};

for (const p of pages) {
  CUR = p.file ? '' : p.path;
  const html = layout({ ...p, body: p.body() });
  write(p.file || path.join(p.path, 'index.html'), html);
}
copyDir(path.join(SRC, 'assets/img'), path.join(OUT, 'assets/img'));
if (!PREVIEW) {
  copyDir(path.join(SRC, 'assets/css'), path.join(OUT, 'assets/css'));
  copyDir(path.join(SRC, 'assets/js'), path.join(OUT, 'assets/js'), (f) => f !== 'scene-acte.js');
}

const indexable = pages.filter((p) => !p.nositemap);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${SITE.updated}</lastmod><priority>${p.path === '' ? '1.0' : p.path.split('/').length > 2 ? '0.7' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n`);
write('site.webmanifest', JSON.stringify({ name: SITE.name, short_name: 'Atrium', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#12204a', icons: [{ src: '/assets/img/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, { src: '/assets/img/logo.png', sizes: '512x512', type: 'image/png' }] }, null, 2));
write('llms.txt', `# ${SITE.name}\n\n> Office notarial à Paris 1er (${SITE.street}). ${SITE.stats[0].value} collaborateurs, ${SITE.stats[1].value} notaires, ${SITE.stats[3].value} pôles d'expertise.\n\n## Expertises\n${SERVICES.map((s) => `- [${s.title}](${abs(`expertises/${s.slug}/`)}) : ${s.short}`).join('\n')}\n\n## Guides\n${ARTICLES.map((a) => `- [${a.title}](${abs(`actualites/${a.slug}/`)}) : ${a.excerpt}`).join('\n')}\n\n## Contact\n- Téléphone : ${SITE.phone}\n- E-mail : ${SITE.email}\n- Horaires : ${SITE.hoursLabel}\n`);
console.log(`${pages.length} pages générées dans ${path.relative(ROOT, OUT)}/`);
