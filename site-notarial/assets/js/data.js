/* ==========================================================================
   Contenu éditorial de l'étude — modifiez ce fichier pour personnaliser le site
   (noms des associés, pôles, glossaire, FAQ). Aucune compilation nécessaire.
   ========================================================================== */

export const OFFICE = {
  name: 'Atrium Notaires',
  legal: 'Atrium Notaires — Société d\'exercice libéral de notaires',
  address: '12, avenue de l\'Opéra — 75001 Paris',
  phone: '+33 1 00 00 00 00',
  email: 'contact@atrium-notaires.fr',
  hours: 'Du lundi au vendredi, 9h00 – 19h00',
};

export const STATS = [
  { value: 120, suffix: '', label: 'collaborateurs', note: 'juristes, clercs, formalistes, comptables' },
  { value: 40, suffix: '', label: 'notaires', note: 'officiers publics et notaires diplômés' },
  { value: 7, suffix: '', label: 'associés au COMEX', note: 'une gouvernance collégiale' },
  { value: 7, suffix: '', label: 'pôles d\'expertise', note: 'de l\'actif institutionnel à la famille' },
];

/* Les 7 pôles de l'étude --------------------------------------------------- */
export const SERVICES = [
  {
    id: 'institutionnel',
    icon: 'tower',
    title: 'Immobilier institutionnel',
    kicker: 'Foncières · Investisseurs · Assureurs · SCPI / OPCI',
    summary:
      'Acquisitions et cessions d\'actifs tertiaires, logistiques et résidentiels en bloc, en asset deal comme en share deal.',
    missions: [
      'Acquisitions et arbitrages d\'immeubles de bureaux, commerces, logistique et hôtellerie',
      'Cessions de titres de sociétés à prépondérance immobilière (share deals)',
      'BEFA (bail en l\'état futur d\'achèvement) et opérations de sale & leaseback',
      'Ventes de portefeuilles et ventes en bloc de logements aux bailleurs institutionnels',
      'Vente d\'immeuble à rénover (VIR — art. L. 262-1 CCH)',
      'Divisions en volumes, ensembles immobiliers complexes, ASL et AFUL',
      'Audits juridiques, data rooms et rapports de due diligence',
    ],
    refs: ['Art. 1582 s. C. civ.', 'Art. L. 262-1 s. CCH', 'Art. 726 CGI'],
  },
  {
    id: 'construction-promotion',
    icon: 'crane',
    title: 'Construction & Promotion',
    kicker: 'Pôle Construction I — Promoteurs · VEFA',
    summary:
      'Accompagnement des programmes immobiliers, du contrat de réservation à la livraison du dernier lot.',
    missions: [
      'Vente en l\'état futur d\'achèvement (VEFA) en secteur protégé et libre',
      'Contrats de réservation : dépôt de garantie plafonné à 5 % (signature sous 1 an) ou 2 % (sous 2 ans)',
      'Garantie financière d\'achèvement (GFA) et vérification de sa mise en place',
      'Échéancier légal : 35 % fondations, 70 % hors d\'eau, 95 % achèvement',
      'États descriptifs de division et règlements de copropriété',
      'Dépôt de pièces, notice descriptive, plans et annexes du programme',
      'Ventes en bloc aux bailleurs sociaux et investisseurs (VEFA en bloc)',
    ],
    refs: ['Art. 1601-3 C. civ.', 'Art. L. 261-10 s. CCH', 'Art. R. 261-14 CCH'],
  },
  {
    id: 'construction-amenagement',
    icon: 'blueprint',
    title: 'Construction & Aménagement',
    kicker: 'Pôle Construction II — Aménageurs · Collectivités',
    summary:
      'Maîtrise foncière, montages complexes et outils de dissociation du foncier et du bâti.',
    missions: [
      'Maîtrise foncière : promesses sous conditions d\'obtention d\'un permis purgé de tout recours',
      'Lotissements, permis d\'aménager et cahiers des charges',
      'ZAC, cahiers des charges de cession de terrain (CCCT) et projets urbains partenariaux (PUP)',
      'Baux à construction, baux emphytéotiques et baux réels solidaires (BRS)',
      'Organismes de foncier solidaire (OFS) et accession sociale',
      'Servitudes, conventions de cour commune, divisions en volumes',
      'Opérations mixtes public / privé et cessions de collectivités',
    ],
    refs: ['Art. L. 442-1 C. urb.', 'Art. L. 251-1 CCH', 'Art. L. 255-1 CCH'],
  },
  {
    id: 'actes-courants',
    icon: 'key',
    title: 'Actes courants',
    kicker: 'Particuliers · Primo-accédants · Investisseurs',
    summary:
      'La vente, l\'achat et tous les actes du quotidien, traités avec la même exigence que les dossiers les plus complexes.',
    missions: [
      'Promesses unilatérales et compromis de vente, rédaction et conseil',
      'Ventes de maisons, appartements, terrains et locaux',
      'Purge du droit de préemption urbain (DIA) et des droits de préemption spéciaux',
      'Délai de rétractation de 10 jours de l\'acquéreur non professionnel',
      'Contrôle du dossier de diagnostic technique (DDT) et des pièces de copropriété',
      'Servitudes, mainlevées, attestations de propriété et procurations',
      'Baux d\'habitation et baux commerciaux en la forme authentique',
    ],
    refs: ['Art. L. 271-1 CCH', 'Art. L. 213-2 C. urb.', 'Art. L. 721-2 CCH'],
  },
  {
    id: 'financement',
    icon: 'vault',
    title: 'Financement',
    kicker: 'Banques · Établissements de crédit · Emprunteurs',
    summary:
      'Rédaction et sécurisation des actes de prêt et des sûretés réelles, dotés de la force exécutoire.',
    missions: [
      'Prêts hypothécaires, crédits d\'accompagnement promoteur et financements structurés',
      'Hypothèque légale spéciale du prêteur de deniers (ex-privilège, réforme des sûretés 2021)',
      'Hypothèques conventionnelles rechargeables et affectations hypothécaires',
      'Cautionnements, nantissements de titres et fiducie-sûreté',
      'Copies exécutoires : titre exécutoire sans passage devant le juge',
      'Mainlevées, renouvellements et radiations d\'inscriptions',
      'Coordination avec les pools bancaires et les agents des sûretés',
    ],
    refs: ['Ord. n° 2021-1192', 'Art. 2393 s. C. civ.', 'Art. L. 111-3 CPCE'],
  },
  {
    id: 'credit-bail',
    icon: 'contract',
    title: 'Crédit-bail immobilier',
    kicker: 'Crédit-bailleurs · Entreprises · Pools',
    summary:
      'Montage, cession et dénouement des contrats de crédit-bail immobilier, y compris sur immeubles à construire.',
    missions: [
      'Contrats de crédit-bail immobilier et acquisitions par le crédit-bailleur',
      'Crédit-bail sur immeuble à construire et en VEFA',
      'Opérations de cession-bail (lease-back)',
      'Levée d\'option anticipée ou à terme et transfert de propriété',
      'Cessions de contrats et substitutions de crédit-preneur',
      'Montages en pool et conventions entre crédit-bailleurs',
      'Publicité foncière des contrats de plus de douze ans',
    ],
    refs: ['Art. L. 313-7 CMF', 'Art. 239 sexies CGI', 'Décret n° 55-22, art. 28'],
  },
  {
    id: 'famille',
    icon: 'family',
    title: 'Droit de la famille & patrimoine',
    kicker: 'Couples · Familles · Chefs d\'entreprise',
    summary:
      'Organiser, protéger et transmettre : un conseil patrimonial sur mesure, à chaque étape de la vie.',
    missions: [
      'Contrats de mariage, changements de régime matrimonial et PACS',
      'Donations simples, donations-partages (y compris transgénérationnelles) et donations entre époux',
      'Testaments authentiques et inscription au Fichier central des dispositions de dernières volontés',
      'Règlement des successions : notoriété, déclaration (6 mois), attestation immobilière',
      'Divorce par consentement mutuel : dépôt de la convention au rang des minutes',
      'Mandat de protection future, démembrement, SCI familiales',
      'Renonciation anticipée à l\'action en réduction (RAAR) et pactes successoraux',
    ],
    refs: ['Art. 1397 C. civ.', 'Art. 229-1 C. civ.', 'Art. 929 C. civ.'],
  },
];

/* Gouvernance — COMEX ------------------------------------------------------ */
// Remplacez par les noms et parcours réels des associés.
export const COMEX = [
  { name: 'Me Hélène Duval', role: 'Notaire associée — Présidente du COMEX', pole: 'Immobilier institutionnel', bio: 'Accompagne foncières et investisseurs sur leurs opérations d\'arbitrage et de structuration.' },
  { name: 'Me Laurent Marchal', role: 'Notaire associé', pole: 'Construction & Promotion', bio: 'Pilote les programmes en VEFA et les ventes en bloc auprès des promoteurs nationaux.' },
  { name: 'Me Claire Fontaine', role: 'Notaire associée', pole: 'Construction & Aménagement', bio: 'Spécialiste des montages fonciers complexes, des ZAC et des baux réels solidaires.' },
  { name: 'Me Antoine Leclerc', role: 'Notaire associé', pole: 'Financement', bio: 'Conseille les établissements bancaires sur les sûretés réelles et les financements structurés.' },
  { name: 'Me Sophie Bertrand', role: 'Notaire associée', pole: 'Crédit-bail immobilier', bio: 'Intervient pour les crédit-bailleurs et les pools sur l\'ensemble du cycle contractuel.' },
  { name: 'Me Julien Garnier', role: 'Notaire associé', pole: 'Actes courants', bio: 'Garantit la qualité et la fluidité des transactions résidentielles de l\'étude.' },
  { name: 'Me Isabelle Rousseau', role: 'Notaire associée', pole: 'Droit de la famille & patrimoine', bio: 'Conseille les familles et les dirigeants sur la transmission de leur patrimoine.' },
];

/* Parcours d'une vente ----------------------------------------------------- */
export const TIMELINE = [
  { step: '01', title: 'Ouverture du dossier', delay: 'J0', text: 'Collecte du titre de propriété, du dossier de diagnostic technique, des pièces de copropriété (art. L. 721-2 CCH) et des justificatifs d\'identité.' },
  { step: '02', title: 'Avant-contrat', delay: 'J+7', text: 'Promesse unilatérale ou compromis de vente. Une promesse unilatérale sous seing privé doit être enregistrée dans les 10 jours (art. 1589-2 C. civ.).' },
  { step: '03', title: 'Rétractation', delay: '10 jours', text: 'L\'acquéreur non professionnel d\'un bien d\'habitation dispose d\'un délai de rétractation de 10 jours à compter de la notification (art. L. 271-1 CCH).' },
  { step: '04', title: 'Conditions & purges', delay: '≈ 2 mois', text: 'Obtention du prêt (délai minimal d\'un mois), purge du droit de préemption urbain (DIA — 2 mois), état hypothécaire, urbanisme, état daté du syndic.' },
  { step: '05', title: 'Signature authentique', delay: '≈ J+90', text: 'Lecture et signature de l\'acte, sur papier ou électronique, y compris à distance. Fonds reçus exclusivement par virement au-delà de 3 000 €.' },
  { step: '06', title: 'Publicité foncière', delay: 'après l\'acte', text: 'Publication au service de la publicité foncière, versement du prix au vendeur, avis de mutation au syndic et remise de la copie authentique.' },
];

/* Étapes de l'acte authentique (scène 3D) --------------------------------- */
export const ACTE_STEPS = [
  { title: 'Rédaction', text: 'Le notaire rédige l\'acte et en contrôle chaque clause : identité et capacité des parties, origine de propriété, situation hypothécaire et urbanistique.' },
  { title: 'Vérifications', text: 'États hypothécaires, certificats d\'urbanisme, purge des droits de préemption, état civil : l\'acte ne repose sur aucune déclaration non vérifiée.' },
  { title: 'Signature', text: 'Lecture, puis signature manuscrite ou électronique — l\'acte authentique électronique, y compris avec comparution à distance, a la même valeur que l\'acte papier.' },
  { title: 'Authentification', text: 'Revêtu du sceau et de la signature du notaire, l\'acte acquiert force probante, date certaine et force exécutoire (art. 1371 C. civ.).' },
  { title: 'Conservation', text: 'L\'original — la minute — est conservé par l\'étude puis versé aux archives ; l\'acte électronique rejoint le Minutier central électronique des notaires.' },
];

/* Repères fiscaux --------------------------------------------------------- */
export const ABATTEMENTS = [
  { who: 'Enfant (ligne directe)', amount: 100000 },
  { who: 'Époux / partenaire de PACS (donation)', amount: 80724 },
  { who: 'Petit-enfant', amount: 31865 },
  { who: 'Frère ou sœur', amount: 15932 },
  { who: 'Neveu ou nièce', amount: 7967 },
  { who: 'Arrière-petit-enfant', amount: 5310 },
  { who: 'Personne handicapée (cumulable)', amount: 159325 },
  { who: 'Don familial de somme d\'argent (art. 790 G CGI)', amount: 31865 },
];

/* Glossaire ----------------------------------------------------------------- */
export const GLOSSARY = [
  ['Acte authentique', 'Acte reçu par un officier public compétent, avec les solennités requises. Il fait foi jusqu\'à inscription de faux et emporte force exécutoire.'],
  ['Minute', 'Original de l\'acte authentique, conservé par le notaire. Les parties reçoivent des copies authentiques.'],
  ['Copie exécutoire', 'Copie de l\'acte revêtue de la formule exécutoire, permettant au créancier de recourir à l\'exécution forcée sans jugement préalable.'],
  ['VEFA', 'Vente en l\'état futur d\'achèvement : l\'acquéreur devient propriétaire du sol et des constructions au fur et à mesure de leur exécution.'],
  ['GFA', 'Garantie financière d\'achèvement, obligatoire en VEFA, garantissant l\'achèvement de l\'immeuble en cas de défaillance du promoteur.'],
  ['BEFA', 'Bail en l\'état futur d\'achèvement : bail signé sur un immeuble à construire, fréquemment adossé à une VEFA.'],
  ['DIA', 'Déclaration d\'intention d\'aliéner, adressée à la commune titulaire du droit de préemption, qui dispose de deux mois pour se prononcer.'],
  ['Publicité foncière', 'Formalité de publication des actes au service de la publicité foncière, rendant les droits opposables aux tiers.'],
  ['Hypothèque légale spéciale', 'Sûreté du prêteur de deniers qui a remplacé l\'ancien privilège depuis le 1er janvier 2022.'],
  ['Crédit-bail immobilier', 'Location d\'un immeuble à usage professionnel assortie d\'une promesse unilatérale de vente au profit du crédit-preneur.'],
  ['Levée d\'option', 'Exercice par le crédit-preneur de la promesse de vente, entraînant le transfert de propriété de l\'immeuble.'],
  ['Bail réel solidaire', 'Bail de longue durée consenti par un organisme de foncier solidaire, dissociant le foncier du bâti pour l\'accession abordable.'],
  ['Donation-partage', 'Donation par laquelle un ascendant répartit ses biens entre ses héritiers présomptifs ; les valeurs sont figées au jour de l\'acte.'],
  ['Acte de notoriété', 'Acte établi par le notaire désignant les héritiers d\'un défunt et leurs droits dans la succession.'],
  ['Démembrement', 'Division de la propriété entre l\'usufruit (usage et revenus) et la nue-propriété ; valorisée selon le barème de l\'art. 669 CGI.'],
  ['Mandat de protection future', 'Acte permettant d\'organiser à l\'avance sa propre protection ou celle d\'un enfant, sans passer par une mesure judiciaire.'],
  ['Division en volumes', 'Technique de division d\'un ensemble immobilier en fractions superposées dans l\'espace, alternative à la copropriété.'],
  ['État daté', 'Document établi par le syndic lors d\'une vente en copropriété, retraçant les sommes dues par le vendeur et l\'acquéreur.'],
  ['AAE / AAED', 'Acte authentique électronique, et acte authentique électronique avec comparution à distance d\'une ou plusieurs parties.'],
  ['FCDDV', 'Fichier central des dispositions de dernières volontés, où sont inscrits les testaments et donations entre époux.'],
];

/* FAQ ---------------------------------------------------------------------- */
export const FAQ = [
  ['Que recouvrent les « frais de notaire » ?', 'Environ 80 % des frais d\'acquisition dans l\'ancien sont des impôts reversés à l\'État et aux collectivités (droits de mutation). Le reste se partage entre les débours avancés pour le compte du client et la rémunération du notaire, fixée par un tarif réglementé.'],
  ['Combien de temps entre l\'avant-contrat et la vente ?', 'Comptez en moyenne trois mois, le temps de purger les droits de préemption, d\'obtenir le financement et de réunir les pièces administratives.'],
  ['Puis-je signer sans me déplacer ?', 'Oui. L\'étude pratique l\'acte authentique électronique avec comparution à distance : chaque partie signe en visioconférence sécurisée auprès de son notaire. Une procuration authentique ou sous seing privé est également possible.'],
  ['Mes fonds sont-ils en sécurité ?', 'Les fonds confiés au notaire sont obligatoirement déposés sur un compte ouvert à la Caisse des Dépôts. La comptabilité de l\'étude est contrôlée chaque année et la responsabilité du notaire est couverte par une garantie collective de la profession.'],
  ['Pourquoi faire un testament chez le notaire ?', 'Le testament authentique, reçu par deux notaires ou un notaire assisté de deux témoins, est difficilement contestable. Tout testament déposé est inscrit au Fichier central des dispositions de dernières volontés, ce qui garantit qu\'il sera retrouvé.'],
  ['Le divorce sans juge passe-t-il par le notaire ?', 'Oui. La convention de divorce par consentement mutuel, signée par les époux et leurs avocats, est déposée au rang des minutes d\'un notaire, qui lui confère date certaine et force exécutoire après contrôle des mentions obligatoires.'],
  ['Puis-je choisir mon notaire ?', 'Toujours. Chaque partie est libre de choisir son notaire ; en cas de pluralité de notaires, les émoluments sont partagés entre eux et le client ne paie pas davantage.'],
  ['Que faire en cas de différend avec un notaire ?', 'Le Médiateur du notariat peut être saisi gratuitement, après une réclamation écrite préalable restée sans réponse satisfaisante.'],
];
