/* ==========================================================================
   Informations de l'étude — à compléter avant la mise en ligne.
   Ces données alimentent toutes les pages, le référencement local
   (données structurées schema.org) et le plan du site.
   ========================================================================== */
export const SITE = {
  name: 'Atrium Notaires',
  legalName: 'Atrium Notaires, société d\'exercice libéral de notaires',
  // Adresse définitive du site, sans barre finale : sert aux URL canoniques et au sitemap
  url: 'https://www.atrium-notaires.fr',
  locale: 'fr_FR',
  phone: '+33 1 00 00 00 00',
  phoneHref: '+33100000000',
  email: 'contact@atrium-notaires.fr',
  street: '12, avenue de l\'Opéra',
  postalCode: '75001',
  city: 'Paris',
  region: 'Île-de-France',
  country: 'FR',
  geo: { lat: 48.8655, lng: 2.3335 },
  metro: 'Métro Pyramides (lignes 7 et 14) ou Palais-Royal (lignes 1 et 7)',
  hours: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' }],
  hoursLabel: 'Du lundi au vendredi, de 9 h à 19 h',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12+avenue+de+l%27Op%C3%A9ra+75001+Paris',
  // Profils officiels de l'étude (laisser vide si absent)
  sameAs: ['https://www.linkedin.com/company/atrium-notaires'],
  stats: [
    { value: 120, label: 'collaborateurs' },
    { value: 40, label: 'notaires' },
    { value: 7, label: 'associés au comité exécutif' },
    { value: 7, label: 'pôles d\'expertise' },
  ],
  updated: '2026-10-09',
};
