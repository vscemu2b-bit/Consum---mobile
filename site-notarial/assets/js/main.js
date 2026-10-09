/* ==========================================================================
   Atrium Notaires — interactions de l'interface
   ========================================================================== */
import { SERVICES, STATS, COMEX, TIMELINE, ACTE_STEPS, ABATTEMENTS, GLOSSARY, FAQ, OFFICE } from './data.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const eur = (n, d = 0) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Icônes des pôles (SVG trait) ------------------------------------------- */
const ICONS = {
  tower: '<path d="M6 21V5l6-2v18M12 21V8l6 2v11M3 21h18M9 8h0M9 12h0M9 16h0M15 13h0M15 17h0"/>',
  crane: '<path d="M5 21V3M5 3h15M5 6l4-3M5 6h3M17 3v5M15 8h4v3h-4zM3 21h6M12 21h8v-6h-8z"/>',
  blueprint: '<path d="M3 4h18v16H3zM3 9h6v11M9 9h12M14 9v5h7M6 4v2M12 4v2M18 4v2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/>',
  vault: '<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v1M12 14v1M8.5 11.5h1M14.5 11.5h1M6 19v2M18 19v2"/>',
  contract: '<path d="M7 3h8l4 4v14H7zM15 3v4h4M10 11h6M10 14h6M10 17h3"/><path d="M4 7v14h3"/>',
  family: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><circle cx="12" cy="14" r="2.2"/><path d="M3 20c0-3 2.2-5 5-5M21 20c0-3-2.2-5-5-5M8.5 21c.4-2 1.7-3.4 3.5-3.4s3.1 1.4 3.5 3.4"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ''}</svg>`;

/* ===================== Rendu du contenu ===================== */
function renderStats() {
  $('#statsGrid').innerHTML = STATS.map((s) => `
    <div class="stat reveal" style="--c:${s.color}">
      <span class="stat-value" data-count="${s.value}">0</span>
      <span class="stat-label">${s.label}</span>
      <span class="stat-note">${s.note}</span>
    </div>`).join('');
}

function renderServices() {
  $('#servicesGrid').innerHTML = SERVICES.map((s, i) => `
    <button class="card reveal${s.dark ? ' dark-text' : ''}" style="--c:${s.color}" data-id="${s.id}" aria-haspopup="dialog">
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="card-icon">${icon(s.icon)}</span>
      <span class="card-kicker">${s.kicker}</span>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
      <span class="card-more">Découvrir le pôle</span>
    </button>`).join('');
  $('#footerServices').innerHTML = SERVICES.map((s) => `<li><a href="#expertises" data-open="${s.id}">${s.title}</a></li>`).join('');
  $('#poleSelect').insertAdjacentHTML('beforeend', SERVICES.map((s) => `<option value="${s.id}">${s.title}</option>`).join(''));
}

function renderActeSteps() {
  $('#acteSteps').innerHTML = ACTE_STEPS.map((s, i) => `
    <li${i === 0 ? ' class="is-active"' : ''}><span class="n">${String(i + 1).padStart(2, '0')} / 05</span><h3>${s.title}</h3><p>${s.text}</p></li>`).join('');
  $('#acteDots').innerHTML = ACTE_STEPS.map((_, i) => `<span${i === 0 ? ' class="is-active"' : ''}></span>`).join('');
}

function renderTimeline() {
  const colors = SERVICES.map((x) => x);
  $('#timeline').insertAdjacentHTML('beforeend', TIMELINE.map((s, i) => `
    <article class="tl-item" style="--c:${colors[i % colors.length].color}">
      <div><span class="tl-step${colors[i % colors.length].dark ? ' dark-text' : ''}">${s.step}</span><span class="tl-delay">${s.delay}</span></div>
      <div><h3>${s.title}</h3><p>${s.text}</p></div>
    </article>`).join(''));
}

function renderComex() {
  $('#comexGrid').innerHTML = COMEX.map((m) => {
    const initials = m.name.replace(/^Me\s+/, '').split(' ').map((w) => w[0]).join('');
    const svc = SERVICES.find((x) => x.title === m.pole) || SERVICES[0];
    const dk = svc.dark ? ' dark-text' : '';
    return `
    <article class="member reveal" style="--c:${svc.color}">
      <div class="member-inner">
        <div class="member-face member-front" data-initials="${initials}">
          <div class="member-avatar${dk}" aria-hidden="true">${initials}</div>
          <h3>${m.name}</h3>
          <p class="member-role">${m.role}</p>
          <p class="member-pole">${m.pole}</p>
          <button class="member-flip" type="button">En savoir plus</button>
        </div>
        <div class="member-face member-back${dk}">
          <p class="member-pole">${m.pole}</p>
          <p>${m.bio}</p>
          <a class="member-flip" href="#contact">Prendre rendez-vous</a>
        </div>
      </div>
    </article>`;
  }).join('');
  $$('.member').forEach((el) => {
    $('button.member-flip', el).addEventListener('click', () => el.classList.toggle('is-flipped'));
  });
}

function renderResources() {
  $('#abatList').innerHTML = ABATTEMENTS.map((a) => `<li><span>${a.who}</span><b>${eur(a.amount)}</b></li>`).join('') +
    '<li class="extra">Dons de sommes d\'argent affectés à l\'achat d\'un logement neuf ou à sa rénovation énergétique : exonération temporaire jusqu\'à 100 000 € par donateur, sous conditions, jusqu\'au 31 décembre 2026 (art. 790 A bis CGI).</li>';

  const list = $('#glossList');
  const draw = (q = '') => {
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const nq = norm(q.trim());
    const items = GLOSSARY.filter(([t, d]) => !nq || norm(t + ' ' + d).includes(nq));
    const hl = (s) => {
      if (!nq) return esc(s);
      const i = norm(s).indexOf(nq);
      return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + nq.length)) + '</mark>' + esc(s.slice(i + nq.length));
    };
    list.innerHTML = items.length
      ? items.map(([t, d]) => `<div><dt>${hl(t)}</dt><dd>${hl(d)}</dd></div>`).join('')
      : '<p class="gloss-empty">Aucun terme ne correspond. Posez-nous directement la question.</p>';
  };
  draw();
  $('#glossSearch').addEventListener('input', (e) => draw(e.target.value));

  $('#faqList').innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
}

/* ===================== Modal des pôles ===================== */
function setupModal() {
  const dlg = $('#serviceModal');
  const open = (id) => {
    const s = SERVICES.find((x) => x.id === id);
    if (!s) return;
    dlg.style.setProperty('--c', s.color);
    $('#modalBody').innerHTML = `
      <div class="modal-hero${s.dark ? ' dark-text' : ''}">
        <span class="card-icon">${icon(s.icon)}</span>
        <p class="eyebrow">${s.kicker}</p>
        <h3 id="modalTitle">${s.title}</h3>
        <p>${s.summary}</p>
      </div>
      <div class="modal-body">
      <ul class="modal-list">${s.missions.map((m) => `<li>${m}</li>`).join('')}</ul>
      <div class="refs">${s.refs.map((r) => `<span>${r}</span>`).join('')}</div>
      <div class="modal-foot">
        <span class="muted">Une équipe dédiée, sous la direction d'un notaire associé.</span>
        <a class="btn btn-gold" href="#contact" data-pole="${s.id}">Consulter ce pôle</a>
      </div>
      </div>`;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  };
  const close = () => (dlg.close ? dlg.close() : dlg.removeAttribute('open'));
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-id]');
    if (card) return open(card.dataset.id);
    const link = e.target.closest('[data-open]');
    if (link) { e.preventDefault(); open(link.dataset.open); }
    const cta = e.target.closest('[data-pole]');
    if (cta) { $('#poleSelect').value = cta.dataset.pole; close(); }
  });
  $('#modalClose').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
}

/* ===================== Effets d'interface ===================== */
function setupNav() {
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks'), bar = $('#progress');
  const toggle = (force) => {
    const open = force ?? !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle());
  $$('a', links).forEach((a) => a.addEventListener('click', () => toggle(false)));
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Lien actif
  const sections = $$('main section[id]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('.nav-links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      const c = e.target.querySelector('[data-count]');
      if (c) countUp(c);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });
}

function countUp(el) {
  const to = +el.dataset.count, start = performance.now(), dur = 1800;
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Inclinaison 3D des cartes au survol */
function setupTilt() {
  if (matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('.card');
    $$('.card.is-tilting').forEach((c) => { if (c !== card) { c.style.transform = ''; c.classList.remove('is-tilting'); } });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.classList.add('is-tilting');
    card.style.transform = `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 12}deg) translateZ(10px)`;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  }, { passive: true });
}

function setupTimeline() {
  const items = $$('.tl-item');
  const fill = $('#timelineFill'), tl = $('#timeline');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')), { rootMargin: '0px 0px -35% 0px' });
  items.forEach((i) => io.observe(i));
  const onScroll = () => {
    const r = tl.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    fill.style.transform = `scaleY(${k})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===================== Simulateurs ===================== */
// Barème des émoluments proportionnels de vente (tarif applicable depuis 2021)
const EMOL = [[6500, 0.03870], [17000, 0.01596], [60000, 0.01064], [Infinity, 0.00799]];
export function emoluments(prix) {
  let rest = prix, prev = 0, total = 0;
  for (const [cap, rate] of EMOL) {
    const part = Math.min(rest, cap - prev);
    if (part <= 0) break;
    total += part * rate; rest -= part; prev = cap;
  }
  return total;
}

// Barème des droits de donation en ligne directe (art. 777 CGI)
const LD = [[8072, 0.05], [12109, 0.10], [15932, 0.15], [552324, 0.20], [902838, 0.30], [1805677, 0.40], [Infinity, 0.45]];
export function droitsLigneDirecte(base) {
  let prev = 0, total = 0;
  for (const [cap, rate] of LD) {
    if (base <= prev) break;
    total += (Math.min(base, cap) - prev) * rate; prev = cap;
  }
  return total;
}
// Valeur de la nue-propriété selon l'âge de l'usufruitier (art. 669 CGI)
export function partNuePropriete(age) {
  const usufruit = age < 21 ? .9 : age < 31 ? .8 : age < 41 ? .7 : age < 51 ? .6 : age < 61 ? .5 : age < 71 ? .4 : age < 81 ? .3 : age < 91 ? .2 : .1;
  return 1 - usufruit;
}

function setupSimulators() {
  // Onglets
  const tabs = $$('.sim-tab');
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(n); n.focus();
    });
  });

  // Frais d'acquisition
  const COLORS = ['#c9a45c', '#6f86c6', '#8fb39a', '#b7a6d9'];
  const calcFrais = () => {
    const prix = Math.max(0, +$('#fPrix').value || 0);
    const mobilier = Math.min(prix, Math.max(0, +$('#fMobilier').value || 0));
    const neuf = $('#fType').value === 'neuf';
    // Le mobilier n'est pas soumis aux droits ; en VEFA, la taxe est assise sur le prix hors TVA
    const base = (prix - mobilier) / (neuf ? 1.2 : 1);
    const emolHT = emoluments(prix);
    const emolTTC = emolHT * 1.2;
    const taux = neuf ? 0.715 : +$('#fTaux').value;
    const droits = base * taux / 100;
    const csi = Math.max(15, base * 0.001);
    const debours = prix > 0 ? 1200 : 0;
    const lines = [
      ['Droits de mutation' + (neuf ? ' (taxe de publicité foncière)' : ''), droits],
      ['Émoluments du notaire TTC', emolTTC],
      ['Contribution de sécurité immobilière', prix > 0 ? csi : 0],
      ['Formalités et débours (forfait)', debours],
    ];
    const total = lines.reduce((s, [, v]) => s + v, 0);
    $('#fTotal').textContent = eur(total);
    $('#fPct').textContent = prix ? `soit ${(total / prix * 100).toFixed(2).replace('.', ',')} % du prix — dont ${eur(emolHT)} HT de rémunération du notaire` : '—';
    $('#fBars').innerHTML = lines.map(([, v], i) => `<span style="flex-grow:${v};background:${COLORS[i]}"></span>`).join('');
    $('#fLines').innerHTML = lines.map(([l, v], i) => `<li><span><i style="background:${COLORS[i]}"></i>${l}</span><b>${eur(v)}</b></li>`).join('');
    $('#fTaux').disabled = neuf;
  };
  $('#formFrais').addEventListener('input', calcFrais);
  calcFrais();

  // Donation
  const calcDon = () => {
    const valeur = Math.max(0, +$('#dValeur').value || 0);
    const n = Math.min(10, Math.max(1, Math.round(+$('#dEnfants').value || 1)));
    const np = $('#dDroit').value === 'np';
    const age = Math.max(18, +$('#dAge').value || 65);
    const coef = np ? partNuePropriete(age) : 1;
    const assiette = valeur * coef;
    const part = assiette / n;
    const taxable = Math.max(0, part - 100000);
    const parEnfant = droitsLigneDirecte(taxable);
    const total = parEnfant * n;
    $('#dAge').closest('.field').style.opacity = np ? 1 : .45;
    $('#dTotal').textContent = eur(total);
    $('#dDetail').textContent = total === 0 ? 'Aucun droit : chaque part reste sous l\'abattement de 100 000 €.' : `soit ${eur(parEnfant)} par enfant`;
    $('#dLines').innerHTML = [
      ['Valeur transmise' + (np ? ` (nue-propriété : ${Math.round(coef * 100)} %)` : ''), eur(assiette)],
      ['Part de chaque enfant', eur(part)],
      ['Abattement par enfant', '− ' + eur(Math.min(part, 100000))],
      ['Part taxable par enfant', eur(taxable)],
      ['Droits par enfant', eur(parEnfant)],
    ].map(([l, v]) => `<li><span>${l}</span><b>${v}</b></li>`).join('');
  };
  $('#formDon').addEventListener('input', calcDon);
  calcDon();
}

/* ===================== Formulaire de contact ===================== */
function setupContact() {
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('[required]', form);
    let ok = true;
    fields.forEach((f) => {
      const valid = f.type === 'checkbox' ? f.checked : f.checkValidity() && f.value.trim() !== '';
      f.classList.toggle('invalid', !valid);
      f.setAttribute('aria-invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      status.className = 'form-status err';
      status.textContent = 'Merci de compléter les champs obligatoires.';
      fields.find((f) => f.classList.contains('invalid'))?.focus();
      return;
    }
    // Sans serveur, la demande est transmise via le client de messagerie.
    // Pour un envoi direct, branchez ici votre API (fetch POST) ou un service de formulaires.
    const d = new FormData(form);
    const pole = SERVICES.find((s) => s.id === d.get('pole'))?.title || '';
    const body = `Nom : ${d.get('nom')}\nE-mail : ${d.get('email')}\nTéléphone : ${d.get('tel') || '—'}\nPôle : ${pole}\n\n${d.get('message')}`;
    const href = `mailto:${OFFICE.email}?subject=${encodeURIComponent('Demande de rendez-vous — ' + pole)}&body=${encodeURIComponent(body)}`;
    status.className = 'form-status ok';
    status.innerHTML = `Votre demande est prête. <a href="${esc(href)}">Ouvrir ma messagerie</a> ou écrivez-nous à ${esc(OFFICE.email)}.`;
  });
  $('#espaceClient').addEventListener('click', (e) => {
    e.preventDefault();
    status.className = 'form-status ok';
    status.textContent = 'L\'espace client sécurisé sera relié à votre logiciel de rédaction d\'actes.';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ===================== Scènes 3D ===================== */
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch { return false; }
}

async function setup3D() {
  if (!webglAvailable()) { document.body.classList.add('no-webgl'); return; }
  const meter = $('#buildMeter'), meterBar = $('#buildMeterBar');
  const steps = $$('#acteSteps li'), dots = $$('#acteDots span');
  try {
    const [{ initHeroScene }, { initActeScene }] = await Promise.all([import('./scene-hero.js'), import('./scene-acte.js')]);
    initHeroScene($('#heroCanvas'), $('#top'), {
      onProgress: (p) => {
        meter.textContent = `${Math.round(p * 100)} %`;
        meterBar.style.width = `${p * 100}%`;
      },
    });
    initActeScene($('#acteCanvas'), $('#acte'), {
      onProgress: (p) => {
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      },
    });
  } catch (err) {
    console.warn('Scènes 3D indisponibles :', err);
    document.body.classList.add('no-webgl');
  }
}

/* ===================== Démarrage ===================== */
renderStats();
renderServices();
renderActeSteps();
renderTimeline();
renderComex();
renderResources();
setupModal();
setupNav();
setupReveal();
setupTilt();
setupTimeline();
setupSimulators();
setupContact();
$('#year').textContent = new Date().getFullYear();

setup3D().finally(() => {
  setTimeout(() => $('#loader').classList.add('is-done'), 400);
  $$('.hero .reveal').forEach((el) => el.classList.add('is-in'));
});
