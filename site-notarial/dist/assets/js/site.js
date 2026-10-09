/* ==========================================================================
   Atrium Notaires — interactions (navigation, simulateurs, formulaires)
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var eur = function (n) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }); };

  /* En-tête : ombre au défilement */
  var header = $('.header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menu mobile */
  var burger = $('.burger'), nav = $('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* Méga-menu Expertises */
  $$('[data-mega]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var set = function (open) { btn.setAttribute('aria-expanded', open); panel.classList.toggle('is-open', open); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(btn.getAttribute('aria-expanded') !== 'true'); });
    var li = btn.parentElement, timer;
    if (matchMedia('(hover: hover) and (min-width: 1101px)').matches) {
      li.addEventListener('mouseenter', function () { clearTimeout(timer); set(true); });
      li.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 180); });
    }
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
  });

  /* Apparition douce au défilement (le contenu reste lisible sans script) */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -60px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Calculs ---------- */
  // Émoluments proportionnels de vente (tarif réglementé)
  var EMOL = [[6500, 0.0387], [17000, 0.01596], [60000, 0.01064], [Infinity, 0.00799]];
  function emoluments(prix) {
    var rest = prix, prev = 0, total = 0;
    for (var i = 0; i < EMOL.length; i++) { var part = Math.min(rest, EMOL[i][0] - prev); if (part <= 0) break; total += part * EMOL[i][1]; rest -= part; prev = EMOL[i][0]; }
    return total;
  }
  // Barème des droits de donation en ligne directe (art. 777 CGI)
  var LD = [[8072, .05], [12109, .10], [15932, .15], [552324, .20], [902838, .30], [1805677, .40], [Infinity, .45]];
  function droits(base) {
    var prev = 0, total = 0;
    for (var i = 0; i < LD.length; i++) { if (base <= prev) break; total += (Math.min(base, LD[i][0]) - prev) * LD[i][1]; prev = LD[i][0]; }
    return total;
  }
  // Nue-propriété selon l'âge de l'usufruitier (art. 669 CGI)
  function partNP(age) { var u = age < 21 ? .9 : age < 31 ? .8 : age < 41 ? .7 : age < 51 ? .6 : age < 61 ? .5 : age < 71 ? .4 : age < 81 ? .3 : age < 91 ? .2 : .1; return 1 - u; }
  function fraisAcquisition(prix, neuf, taux, mobilier) {
    var base = (prix - Math.min(prix, mobilier || 0)) / (neuf ? 1.2 : 1);
    var emolHT = emoluments(prix);
    var lines = [
      ['Droits de mutation' + (neuf ? ' (taxe de publicité foncière)' : ''), base * (neuf ? 0.715 : taux) / 100],
      ['Émoluments du notaire TTC', emolHT * 1.2],
      ['Contribution de sécurité immobilière', prix > 0 ? Math.max(15, base * 0.001) : 0],
      ['Formalités et débours (forfait)', prix > 0 ? 1200 : 0],
    ];
    return { lines: lines, emolHT: emolHT, total: lines.reduce(function (s, l) { return s + l[1]; }, 0) };
  }

  /* Simulateur compact de l'accueil */
  var quick = $('#quickPrice');
  if (quick) {
    var qType = $('#quickType');
    var runQuick = function () {
      var prix = Math.max(0, +quick.value || 0);
      var r = fraisAcquisition(prix, qType.value === 'neuf', 5.80665, 0);
      $('#quickTotal').textContent = eur(r.total);
      $('#quickPct').textContent = prix ? 'soit ' + (r.total / prix * 100).toFixed(1).replace('.', ',') + ' % du prix' : '';
    };
    quick.addEventListener('input', runQuick); qType.addEventListener('change', runQuick); runQuick();
  }

  /* Onglets des simulateurs */
  var tabs = $$('.sim-tab');
  tabs.forEach(function (t, i) {
    var select = function (tab) {
      tabs.forEach(function (x) { var on = x === tab; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    };
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; select(n); n.focus();
    });
  });

  var COLORS = ['#12204a', '#a8834b', '#5c1a2b', '#0f4a3f'];
  var formFrais = $('#formFrais');
  if (formFrais) {
    var calcFrais = function () {
      var prix = Math.max(0, +$('#fPrix').value || 0);
      var neuf = $('#fType').value === 'neuf';
      $('#fTaux').disabled = neuf;
      var r = fraisAcquisition(prix, neuf, +$('#fTaux').value, Math.max(0, +$('#fMobilier').value || 0));
      $('#fTotal').textContent = eur(r.total);
      $('#fPct').textContent = prix ? 'soit ' + (r.total / prix * 100).toFixed(2).replace('.', ',') + ' % du prix, dont ' + eur(r.emolHT) + ' HT de rémunération du notaire' : '';
      $('#fBars').innerHTML = r.lines.map(function (l, i) { return '<span style="flex-grow:' + l[1] + ';background:' + COLORS[i] + '"></span>'; }).join('');
      $('#fLines').innerHTML = r.lines.map(function (l, i) { return '<li><span><i style="background:' + COLORS[i] + '"></i>' + l[0] + '</span><b>' + eur(l[1]) + '</b></li>'; }).join('');
    };
    formFrais.addEventListener('input', calcFrais); calcFrais();
  }
  var formDon = $('#formDon');
  if (formDon) {
    var calcDon = function () {
      var valeur = Math.max(0, +$('#dValeur').value || 0);
      var n = Math.min(10, Math.max(1, Math.round(+$('#dEnfants').value || 1)));
      var np = $('#dDroit').value === 'np';
      var age = Math.max(18, +$('#dAge').value || 65);
      var coef = np ? partNP(age) : 1;
      var assiette = valeur * coef, part = assiette / n, taxable = Math.max(0, part - 100000), parEnfant = droits(taxable);
      $('#dAgeField').style.opacity = np ? 1 : .5;
      $('#dTotal').textContent = eur(parEnfant * n);
      $('#dDetail').textContent = parEnfant === 0 ? 'Aucun droit : chaque part reste sous l’abattement de 100 000 €.' : 'soit ' + eur(parEnfant) + ' par enfant';
      $('#dLines').innerHTML = [
        ['Valeur transmise' + (np ? ' (nue-propriété : ' + Math.round(coef * 100) + ' %)' : ''), eur(assiette)],
        ['Part de chaque enfant', eur(part)],
        ['Abattement par enfant', '− ' + eur(Math.min(part, 100000))],
        ['Part taxable par enfant', eur(taxable)],
        ['Droits par enfant', eur(parEnfant)],
      ].map(function (l) { return '<li><span>' + l[0] + '</span><b>' + l[1] + '</b></li>'; }).join('');
    };
    formDon.addEventListener('input', calcDon); calcDon();
  }

  /* Lexique : filtre */
  var gs = $('#glossSearch');
  if (gs) {
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    gs.addEventListener('input', function () {
      var q = norm(gs.value.trim()), shown = 0;
      $$('.gloss > div').forEach(function (d) { var ok = !q || norm(d.textContent).indexOf(q) > -1; d.hidden = !ok; if (ok) shown++; });
      $('#glossCount').textContent = shown + (shown > 1 ? ' termes' : ' terme');
    });
  }

  /* Formulaire de contact */
  var form = $('#contactForm');
  if (form) {
    var pole = new URLSearchParams(location.search).get('pole');
    if (pole && form.pole) form.pole.value = pole;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('#formStatus'), first = null;
      $$('[required]', form).forEach(function (f) {
        var ok = f.type === 'checkbox' ? f.checked : f.checkValidity() && f.value.trim() !== '';
        f.setAttribute('aria-invalid', !ok);
        if (!ok && !first) first = f;
      });
      if (first) { status.className = 'form-status err'; status.textContent = 'Merci de compléter les champs signalés.'; first.focus(); return; }
      // Branchez ici l'envoi vers votre serveur ou votre service de formulaires (fetch POST).
      var d = new FormData(form);
      var body = 'Nom : ' + d.get('nom') + '\nE-mail : ' + d.get('email') + '\nTéléphone : ' + (d.get('tel') || '—') + '\nObjet : ' + d.get('pole') + '\n\n' + d.get('message');
      var href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent('Demande de rendez-vous') + '&body=' + encodeURIComponent(body);
      status.className = 'form-status ok';
      status.innerHTML = 'Votre demande est prête. <a href="' + href + '">Ouvrir ma messagerie pour l’envoyer</a>, ou écrivez-nous à ' + form.dataset.email + '.';
    });
  }
})();
