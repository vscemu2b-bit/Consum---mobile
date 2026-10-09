# Site de l'office notarial — Atrium Notaires

Site vitrine statique (HTML / CSS / JavaScript) avec scènes 3D temps réel (Three.js). Il n'y a aucune étape de compilation : les fichiers se déposent tels quels sur n'importe quel hébergeur (OVH, o2switch, Netlify, GitHub Pages…).

## Lancer en local

```bash
cd site-notarial
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Un serveur local est nécessaire, car les modules JavaScript ne se chargent pas en `file://`.

## Contenu

| Section | Description |
|---|---|
| Accueil 3D | Un ensemble immobilier se construit au défilement (plan → structure → façades), avec une grue à tour et des actes en orbite |
| L'étude | Chiffres clés animés (120 collaborateurs, 40 notaires, 7 associés, 7 pôles) |
| Expertises | 7 pôles en cartes 3D inclinables ; fiche détaillée avec missions et références légales |
| L'acte authentique | Scène 3D pilotée par le défilement : rédaction, vérifications, signature, sceau, conservation au minutier |
| Parcours d'une vente | Frise chronologique avec les délais légaux |
| Simulateurs | Frais d'acquisition (ancien / neuf, taux majoré 2025) et droits de donation (pleine ou nue-propriété) |
| Gouvernance | Cartes des 7 associés du COMEX, qui se retournent au survol |
| Engagements, ressources | Déontologie, abattements fiscaux, glossaire avec recherche, FAQ |
| Contact | Formulaire validé, avec choix du pôle |

## Personnaliser

- **Textes, associés, pôles, glossaire, FAQ** : `assets/js/data.js`. Les noms des associés sont fictifs et doivent être remplacés.
- **Nom de l'étude, adresse, téléphone** : rechercher `Atrium`, `avenue de l'Opéra` et `00 00 00 00` dans `index.html`, `data.js` et `mentions-legales.html`.
- **Mentions légales** : compléter les passages entre crochets dans `mentions-legales.html`.
- **Couleurs** : variables `--gold`, `--ink`, etc. en tête de `assets/css/style.css`.
- **Formulaire** : sans serveur, il ouvre la messagerie du visiteur (`mailto:`). Pour un envoi direct, brancher une API ou un service de formulaires dans `setupContact()` de `assets/js/main.js`.

## Simulateurs : hypothèses

- Émoluments proportionnels de vente : barème réglementé (tranches à 3,870 %, 1,596 %, 1,064 % et 0,799 %), plus TVA à 20 %.
- Droits de mutation à 5,80665 %, ou 6,3185 % au taux départemental majoré (loi de finances 2025, hors primo-accédants). Dans le neuf, la taxe de publicité foncière est de 0,715 % du prix HT.
- Contribution de sécurité immobilière de 0,10 % (minimum 15 €), formalités et débours forfaitisés à 1 200 €.
- Donation en ligne directe : abattement de 100 000 €, barème de l'art. 777 CGI, nue-propriété selon l'art. 669 CGI.

Il s'agit d'estimations indicatives, à faire valider et actualiser par l'étude chaque année (loi de finances, arrêtés tarifaires).

## Technique

- Three.js 0.160 via CDN (import map) : rendu physique (verre, laiton, cuir, noyer), tone mapping filmique, ombres douces, reflets d'environnement et halo lumineux (bloom).
- Défilement amorti (Lenis 1.1.13), curseur personnalisé, polices Bodoni Moda et Jost (Google Fonts).
- Les scènes 3D ne s'animent que lorsqu'elles sont visibles. Elles respectent `prefers-reduced-motion` et basculent vers une version statique si WebGL est indisponible.
- Le site est responsive (mobile, tablette, desktop) et accessible : navigation clavier, onglets ARIA, boîte de dialogue native, contrastes élevés.
