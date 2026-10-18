import services from '../../contenu/services.json';

/** Sections communes à tout le site, éditables depuis n'importe quelle page qui les affiche. */
const COMMUNES = ['general.zone', 'general.avis', 'general.appel', 'general.coordonnees', 'general.piedDePage'];

/**
 * Pages de la rubrique « Pages » : aperçu à ouvrir et sections proposées.
 * Les réalisations (projets) se gèrent dans leur propre rubrique.
 */
export const PAGES = [
  {
    id: 'accueil',
    titre: 'Accueil',
    chemin: '/',
    image: (c) => c.accueil?.hero.image,
    fichiers: ['accueil', 'general'],
    sections: ['accueil.hero', 'accueil.services', 'accueil.expertise', 'accueil.raisons', 'accueil.faq', ...COMMUNES, 'accueil.seo'],
  },
  ...services.map((service, index) => ({
    id: `service-${service.slug}`,
    titre: service.menu.titre,
    groupe: 'Services',
    chemin: `/services/${service.slug}`,
    image: (c) => c.services?.[index].hero.image,
    fichiers: ['services', 'general'],
    sections: [
      `services.${index}.hero`,
      `services.${index}.raisons`,
      `services.${index}.approche`,
      `services.${index}.faq`,
      `services.${index}.menu`,
      ...COMMUNES,
      `services.${index}.seo`,
    ],
  })),
  {
    id: 'realisations',
    titre: 'Réalisations',
    chemin: '/realisations',
    image: (c) => c.realisations?.projets[0]?.image,
    fichiers: ['realisations', 'general'],
    sections: ['realisations.page', 'realisations.categories', ...COMMUNES, 'realisations.seo'],
  },
  {
    id: 'fiche-realisation',
    titre: 'Fiche d’une réalisation',
    description: 'Textes communs à toutes les fiches',
    chemin: (c) => {
      const projet = c.realisations?.projets.find((p) => p.publie && (p.defi || p.solution));
      return projet ? `/realisations/${projet.slug}` : '/realisations';
    },
    image: (c) => c.realisations?.projets.find((p) => p.defi || p.solution)?.image,
    fichiers: ['realisations', 'general'],
    sections: ['realisations.detail', 'general.appel', 'general.coordonnees', 'general.piedDePage'],
  },
  {
    id: 'contact',
    titre: 'Contact',
    chemin: '/contact',
    image: (c) => c.contact?.coordonnees.image,
    fichiers: ['contact', 'general'],
    sections: ['contact.hero', 'contact.formulaire', 'contact.coordonnees', 'general.coordonnees', 'general.piedDePage', 'contact.seo'],
  },
  {
    id: 'mentions-legales',
    titre: 'Mentions légales',
    groupe: 'Informations',
    chemin: '/mentions-legales',
    image: () => null,
    fichiers: ['legal', 'general'],
    sections: ['legal.mentions', 'general.coordonnees', 'general.piedDePage'],
  },
  {
    id: 'politique-de-confidentialite',
    titre: 'Politique de confidentialité',
    groupe: 'Informations',
    chemin: '/politique-de-confidentialite',
    image: () => null,
    fichiers: ['legal', 'general'],
    sections: ['legal.confidentialite', 'general.coordonnees', 'general.piedDePage'],
  },
];

export const trouverPage = (id) => PAGES.find((page) => page.id === id);

export const cheminPage = (page, contenu) => (typeof page.chemin === 'function' ? page.chemin(contenu) : page.chemin);
