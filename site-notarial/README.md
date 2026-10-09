# Site de l'office notarial — Atrium Notaires

Site multipage en HTML statique, conçu pour le référencement naturel (SEO) : chaque page est livrée en HTML complet, sans dépendre de JavaScript pour son contenu.

## Mettre en ligne

Le dossier **`dist/`** contient le site prêt à publier. Déposez son contenu à la racine de votre hébergement (OVH, o2switch, Netlify, Vercel…).

Avant la mise en ligne :
1. Renseignez l'adresse définitive du site (`url`) et les coordonnées dans `src/content/site.mjs`.
2. Remplacez les noms fictifs des associés dans `src/content/team.mjs`.
3. Complétez les passages entre crochets des mentions légales (dans `build.mjs`, page « Mentions légales »).
4. Régénérez le site : `node build.mjs` (Node 18 ou plus récent, aucune dépendance).

## Structure

| Page | Adresse | Requête visée |
|---|---|---|
| Accueil | `/` | notaire Paris 1er, office notarial Paris |
| Expertises (7 pages) | `/expertises/<pôle>/` | notaire VEFA Paris, notaire succession Paris… |
| Frais de notaire | `/frais-de-notaire/` | frais de notaire 2026, simulateur |
| Actualités (6 guides) | `/actualites/<article>/` | frais de notaire 2026, donation abattement… |
| L'étude, Carrières, Lexique, Contact | `/equipe/`, `/carrieres/`, `/lexique/`, `/contact/` | recrutement notaire Paris, lexique notarial |

## Ce qui est en place pour le référencement

- Titre, description, URL canonique et balises de partage (Open Graph) uniques pour chaque page.
- Données structurées schema.org : étude notariale (`Notary`) avec adresse, horaires et coordonnées GPS, fil d'Ariane, FAQ, articles, services, personnes, lexique.
- `sitemap.xml`, `robots.txt`, `llms.txt` (moteurs de réponse IA), manifeste et icônes.
- Une seule balise H1 par page, maillage interne entre pôles et guides, textes alternatifs sur toutes les images.
- Performance : images WebP responsives, image principale préchargée, 3D chargée seulement après l'affichage complet de la page d'accueil et jamais sur mobile.

## À faire en dehors du site

- Déclarer le site dans Google Search Console et soumettre le `sitemap.xml`.
- Créer ou compléter la fiche Google Business Profile, avec exactement la même adresse et le même téléphone que sur le site.
- Vérifier la cohérence de la fiche de l'étude sur l'annuaire notaires.fr.
- Publier un nouveau guide chaque mois dans `src/content/articles.mjs`.

## Modifier le contenu

- Pôles, missions et FAQ par pôle : `src/content/services.mjs`
- Articles : `src/content/articles.mjs` (les liens `{{link:frais-de-notaire}}` ou `{{link:service:<pôle>}}` sont convertis automatiquement)
- FAQ de l'accueil, lexique, équipe : `src/content/faq.mjs`, `glossary.mjs`, `team.mjs`
- Style : `src/assets/css/site.css`

Après chaque modification, relancez `node build.mjs`.

## Formulaire de contact

Sans serveur, le formulaire prépare un e-mail dans la messagerie du visiteur. Pour un envoi direct, reliez-le à votre outil (formulaire de l'hébergeur, CRM, service d'e-mail) dans la partie « Formulaire de contact » de `src/assets/js/site.js`.

## Visuels 3D

Les images du site sont rendues à partir des scènes 3D de `src/assets/js/`. Pour les régénérer : servez le dossier `site-notarial/` (`python3 -m http.server 8090`), installez `playwright` et `sharp`, puis lancez `node tools/render-stills.mjs`.

## Simulateurs : hypothèses

- Émoluments proportionnels de vente selon le barème réglementé (3,870 % / 1,596 % / 1,064 % / 0,799 %), TVA 20 %.
- Droits de mutation à 5,80665 % ou 6,3185 % (taux départemental majoré, hors primo-accédants). Dans le neuf, la taxe de publicité foncière est de 0,715 % du prix HT.
- Contribution de sécurité immobilière de 0,10 % (minimum 15 €), formalités et débours forfaitisés à 1 200 €.
- Donation : abattement de 100 000 € par enfant, barème de l'art. 777 CGI, nue-propriété selon l'art. 669 CGI.

Ces chiffres sont à faire valider et mettre à jour par l'étude chaque année.
