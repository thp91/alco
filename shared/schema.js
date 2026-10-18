/**
 * Schéma du contenu éditable (fichiers JSON de contenu/).
 * Partagé par le back-office (génération des formulaires) et par l'API
 * (validation de chaque publication : rien d'autre que ces champs ne peut être écrit).
 */

/** Icônes proposées dans les listes (noms de src/components/Icon). */
export const ICONES = {
  engineering: 'Cordiste',
  formatPaint: 'Pinceau',
  paintRoller: 'Rouleau',
  waterDrop: 'Goutte',
  shield: 'Bouclier',
  verified: 'Certifié',
  cleaning: 'Balai',
  factory: 'Usine',
  apartment: 'Immeuble',
  bolt: 'Éclair',
  payments: 'Tarifs',
  description: 'Document',
  person: 'Personne',
  location: 'Lieu',
  phone: 'Téléphone',
  compass: 'Compas',
};

const champ = (type, libelle, options = {}) => ({ type, libelle, ...options });

/** Texte sur une ligne. */
const texte = (libelle, options) => champ('texte', libelle, options);
/** Paragraphe. */
const long = (libelle, options) => champ('texteLong', libelle, options);
/** Titre : « *mot* » en couleur, retour à la ligne = saut de ligne sur ordinateur. */
const titre = (libelle, options) => champ('titre', libelle, options);
const image = (libelle, options) => champ('image', libelle, options);
const icone = (libelle, options) => champ('icone', libelle, options);
const booleen = (libelle, options) => champ('booleen', libelle, options);
const slug = (libelle, options) => champ('slug', libelle, options);
const categories = (libelle, options) => champ('categories', libelle, options);
const textes = (libelle, options) => champ('listeTextes', libelle, options);
const groupe = (libelle, champs, options) => champ('groupe', libelle, { champs, ...options });
/** Liste d'éléments ; `nomElement` sert aux boutons « Ajouter un … ». */
const liste = (libelle, champs, options) => champ('liste', libelle, { champs, ...options });

const faq = (libelle = 'Questions fréquentes') =>
  liste(libelle, { question: texte('Question'), reponse: long('Réponse') }, { nomElement: 'question', max: 20 });

/** Titre et description affichés par Google (vides = générés automatiquement). */
const seo = () =>
  groupe('Référencement Google', {
    titre: texte('Titre dans Google', {
      optionnel: true,
      aide: 'Environ 60 caractères. Vide : titre généré automatiquement.',
    }),
    description: long('Description dans Google', {
      optionnel: true,
      aide: 'Environ 155 caractères. Vide : début du texte de la page.',
    }),
  });

const pageLegale = (libelle) =>
  groupe(libelle, {
    titre: texte('Titre'),
    miseAJour: texte('Date de mise à jour'),
    sections: liste(
      'Paragraphes',
      {
        titre: texte('Intertitre', { optionnel: true }),
        texte: long('Texte', { aide: 'Ligne commençant par « - » = puce. Ligne vide = nouveau paragraphe.' }),
      },
      { nomElement: 'paragraphe', max: 30 },
    ),
  });

export const SCHEMA_PROJET = {
  titre: texte('Titre'),
  slug: slug('Adresse de la page', { aide: 'Utilisée dans l’URL : /realisations/…' }),
  publie: booleen('Publié sur le site'),
  categorie: texte('Catégorie affichée', { aide: 'Ex. « Ravalement & Nettoyage »' }),
  filtres: categories('Filtres', { aide: 'Catégories dans lesquelles le projet apparaît' }),
  resume: long('Résumé (carte de la liste)', { optionnel: true }),
  image: image('Photo principale'),
  surtitre: texte('Surtitre de la fiche', { optionnel: true }),
  titreDetail: texte('Titre de la fiche', { optionnel: true, aide: 'Par défaut : le titre du projet' }),
  imageDetail: image('Photo d’en-tête de la fiche', { optionnel: true, aide: 'Par défaut : la photo principale' }),
  stats: liste(
    'Chiffres de l’en-tête',
    {
      libelle: texte('Libellé'),
      valeur: texte('Valeur'),
      unite: texte('Unité', { optionnel: true }),
      accent: booleen('Valeur en orange'),
    },
    { nomElement: 'chiffre', max: 4 },
  ),
  defi: long('Le défi', { optionnel: true }),
  solution: long('Notre solution', { optionnel: true }),
  galerie: liste('Galerie photos', { image: image('Photo'), alt: texte('Description de la photo') }, {
    nomElement: 'photo',
    max: 3,
    aide: '3 photos maximum : la première est mise en avant',
  }),
  resultats: liste('Résultats', { valeur: texte('Chiffre'), texte: long('Texte') }, { nomElement: 'résultat', max: 3 }),
  maitreOuvrage: texte('Maître d’ouvrage', { optionnel: true }),
  duree: texte('Durée du chantier', { optionnel: true }),
  expertises: textes('Expertises déployées', { nomElement: 'expertise', max: 8 }),
  normes: textes('Normes de sécurité', { nomElement: 'norme', max: 8 }),
};

const PAGE_SERVICE = {
  slug: slug('Adresse', { verrouille: true }),
  seo: seo(),
  menu: groupe('Menu', { titre: texte('Nom dans le menu'), icone: icone('Icône') }),
  hero: groupe('En-tête', {
    surtitre: texte('Surtitre'),
    titre: titre('Titre'),
    texte: long('Texte'),
    image: image('Image de fond'),
  }),
  raisons: groupe('3 raisons', {
    titre: titre('Titre'),
    liste: liste(
      'Raisons',
      {
        image: image('Photo', { optionnel: true, aide: 'Sans photo, l’icône est affichée' }),
        icone: icone('Icône'),
        titre: texte('Titre'),
        texte: long('Texte'),
      },
      { nomElement: 'raison', max: 6 },
    ),
  }),
  approche: groupe('Notre approche', {
    titre: titre('Titre'),
    texte: long('Texte'),
    image: image('Photo'),
    imageAlt: texte('Description de la photo'),
    carteTitre: texte('Encart : titre', { optionnel: true, aide: 'Laisser vide pour masquer l’encart' }),
    carteTexte: long('Encart : texte', { optionnel: true }),
    etapes: liste('Étapes', { titre: texte('Titre'), texte: long('Texte') }, { nomElement: 'étape', max: 8 }),
  }),
  faq: groupe('FAQ', {
    titre: titre('Titre'),
    sousTitre: texte('Sous-titre', { optionnel: true }),
    liste: faq(),
  }),
};

export const SCHEMA = {
  general: groupe('Éléments communs', {
    coordonnees: groupe('Coordonnées', {
      telephone: texte('Téléphone'),
      email: texte('E-mail'),
      adresseLigne1: texte('Adresse (ligne 1)'),
      adresseLigne2: texte('Adresse (ligne 2)'),
    }),
    appel: groupe('Bandeau « Prêt pour votre prochain projet ? »', {
      titre: titre('Titre'),
      texte: long('Texte'),
      bouton: texte('Bouton'),
      telephone: texte('Téléphone affiché'),
    }),
    avis: groupe('Avis clients', {
      titre: titre('Titre'),
      liste: liste('Avis', { icone: icone('Icône'), citation: long('Citation'), auteur: texte('Auteur') }, {
        nomElement: 'avis',
        max: 9,
      }),
    }),
    zone: groupe('Rayon d’intervention', {
      titre: titre('Titre'),
      image: image('Image de la carte'),
      carteTitre: texte('Encart : titre'),
      carteTexte: long('Encart : texte'),
      liste: liste('Zones', { titre: texte('Titre'), texte: long('Texte') }, { nomElement: 'zone', max: 6 }),
    }),
    piedDePage: groupe('Pied de page', {
      accroche: long('Présentation'),
      mentions: texte('Mention de copyright'),
      devise: texte('Devise'),
    }),
  }),

  accueil: groupe('Accueil', {
    seo: seo(),
    hero: groupe('En-tête', {
      badge: texte('Badge'),
      titre: titre('Titre'),
      texte: long('Texte'),
      boutonPrincipal: texte('Bouton principal'),
      boutonSecondaire: texte('Bouton secondaire'),
      image: image('Image de fond'),
      imageAlt: texte('Description de l’image', { aide: 'Lue par Google et les lecteurs d’écran' }),
    }),
    services: groupe('Services', {
      titre: titre('Titre'),
      texte: long('Texte'),
      liste: liste(
        'Cartes services',
        { icone: icone('Icône'), titre: texte('Titre'), texte: long('Texte'), lien: texte('Lien', { optionnel: true }) },
        { nomElement: 'service', max: 9 },
      ),
    }),
    expertise: groupe('Expertise', {
      surtitre: texte('Surtitre'),
      titre: titre('Titre'),
      paragraphes: textes('Paragraphes', { element: 'texteLong', nomElement: 'paragraphe', max: 4 }),
      image: image('Photo'),
      imageAlt: texte('Description de la photo'),
      chiffre: texte('Chiffre clé'),
      chiffreLibelle: texte('Libellé du chiffre'),
    }),
    raisons: groupe('Pourquoi nous choisir', {
      titre: titre('Titre'),
      liste: liste('Raisons', { icone: icone('Icône'), titre: texte('Titre'), texte: long('Texte') }, {
        nomElement: 'raison',
        max: 6,
      }),
    }),
    faq: groupe('FAQ', { titre: titre('Titre'), liste: faq() }),
  }),

  services: liste('Pages services', PAGE_SERVICE, { fixe: true }),

  realisations: groupe('Réalisations', {
    seo: seo(),
    page: groupe('Page Réalisations', {
      badge: texte('Badge'),
      titre: titre('Titre'),
      texte: long('Texte'),
      tousLesProjets: texte('Filtre « tous »'),
      aucunProjet: texte('Message si aucun projet'),
      lienProjet: texte('Lien vers un projet'),
    }),
    detail: groupe('Fiche d’une réalisation', {
      defiTitre: texte('Titre « Le défi »'),
      solutionTitre: texte('Titre « Notre solution »'),
      galerieTitre: texte('Titre de la galerie'),
      galerieCompteur: texte('Compteur de photos'),
      ficheTitre: texte('Titre de la fiche technique'),
      enAttente: long('Message si la fiche n’est pas rédigée'),
      similairesTitre: texte('Titre « Réalisations similaires »'),
      similairesTexte: long('Texte « Réalisations similaires »'),
    }),
    categories: liste('Catégories (filtres)', { id: slug('Identifiant'), libelle: texte('Libellé') }, {
      nomElement: 'catégorie',
      max: 12,
    }),
    projets: liste('Projets', SCHEMA_PROJET, { nomElement: 'projet', max: 200 }),
  }),

  legal: groupe('Pages légales', {
    mentions: pageLegale('Mentions légales'),
    confidentialite: pageLegale('Politique de confidentialité'),
  }),

  contact: groupe('Contact', {
    seo: seo(),
    hero: groupe('En-tête', { badge: texte('Badge'), titre: titre('Titre'), texte: long('Texte') }),
    formulaire: groupe('Formulaire', {
      titre: texte('Titre'),
      sousTitre: texte('Sous-titre'),
      typesProjet: textes('Types de projet proposés', { nomElement: 'type', max: 12 }),
      bouton: texte('Bouton d’envoi'),
      confirmation: long('Message de confirmation'),
    }),
    coordonnees: groupe('Coordonnées', {
      image: image('Image (plan)'),
      imageAlt: texte('Description de l’image'),
      telephoneTitre: texte('Titre « téléphone »'),
      emailTitre: texte('Titre « e-mail »'),
      adresseTitre: texte('Titre « adresse »'),
    }),
  }),
};

export const CLES_CONTENU = Object.keys(SCHEMA);

/** Champ du schéma correspondant à un chemin (« accueil.services.liste.2.titre »). */
export function champAuChemin(chemin) {
  const [cle, ...morceaux] = chemin.split('.');
  let noeud = SCHEMA[cle];
  for (const morceau of morceaux) {
    if (!noeud) return null;
    if (noeud.type === 'groupe') noeud = noeud.champs[morceau];
    else if (noeud.type === 'liste') noeud = /^\d+$/.test(morceau) ? { type: 'element', champs: noeud.champs } : null;
    else if (noeud.type === 'element') noeud = noeud.champs[morceau];
    else if (noeud.type === 'listeTextes') noeud = /^\d+$/.test(morceau) ? { type: noeud.element ?? 'texte' } : null;
    else return null;
  }
  return noeud;
}

/** Valeur vide d'un champ (nouvel élément de liste). */
export function valeurVide(noeud) {
  switch (noeud.type) {
    case 'booleen':
      return false;
    case 'liste':
    case 'listeTextes':
    case 'categories':
      return [];
    case 'groupe':
      return Object.fromEntries(Object.entries(noeud.champs).map(([nom, sous]) => [nom, valeurVide(sous)]));
    default:
      return '';
  }
}

export const elementVide = (champs) =>
  Object.fromEntries(Object.entries(champs).map(([nom, sous]) => [nom, valeurVide(sous)]));

const LONGUEURS = { texte: 300, titre: 300, texteLong: 5000, slug: 80, image: 300 };

/**
 * Vérifie une valeur contre le schéma et la renvoie nettoyée (clés inconnues
 * retirées, clés manquantes complétées). Lève une erreur lisible sinon.
 */
export function valider(valeur, noeud, chemin = '') {
  const erreur = (message) => {
    throw new Error(`${chemin || 'contenu'} : ${message}`);
  };

  switch (noeud.type) {
    case 'texte':
    case 'texteLong':
    case 'titre':
      if (typeof valeur !== 'string') erreur('texte attendu');
      if (valeur.length > LONGUEURS[noeud.type]) erreur('texte trop long');
      return valeur;
    case 'image':
      if (typeof valeur !== 'string') erreur('image attendue');
      if (valeur && !/^\/images\/[\w./-]+\.(jpe?g|png|webp)$/i.test(valeur)) erreur('chemin d’image invalide');
      if (valeur.includes('..')) erreur('chemin d’image invalide');
      return valeur;
    case 'icone':
      if (typeof valeur !== 'string' || (valeur && !(valeur in ICONES))) erreur('icône inconnue');
      return valeur;
    case 'slug':
      if (typeof valeur !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(valeur)) erreur('adresse invalide');
      if (valeur.length > LONGUEURS.slug) erreur('adresse trop longue');
      return valeur;
    case 'booleen':
      if (typeof valeur !== 'boolean') erreur('oui/non attendu');
      return valeur;
    case 'categories':
    case 'listeTextes': {
      if (!Array.isArray(valeur)) erreur('liste attendue');
      if (valeur.length > (noeud.max ?? 30)) erreur('liste trop longue');
      const type = noeud.type === 'categories' ? 'slug' : (noeud.element ?? 'texte');
      return valeur.map((v, i) => valider(v, { type }, `${chemin}.${i}`));
    }
    case 'liste': {
      if (!Array.isArray(valeur)) erreur('liste attendue');
      if (valeur.length > (noeud.max ?? 50)) erreur('liste trop longue');
      return valeur.map((element, i) => validerObjet(element, noeud.champs, `${chemin}.${i}`));
    }
    case 'groupe':
      return validerObjet(valeur, noeud.champs, chemin);
    default:
      return erreur('type inconnu');
  }
}

function validerObjet(valeur, champs, chemin) {
  if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) {
    throw new Error(`${chemin} : objet attendu`);
  }
  return Object.fromEntries(
    Object.entries(champs).map(([nom, sous]) => [
      nom,
      valider(valeur[nom] === undefined ? valeurVide(sous) : valeur[nom], sous, chemin ? `${chemin}.${nom}` : nom),
    ]),
  );
}

/** Contrôles propres aux réalisations (adresses uniques). */
export function verifierRealisations(contenu) {
  const slugs = new Set();
  for (const projet of contenu.projets) {
    if (slugs.has(projet.slug)) throw new Error(`Deux projets ont la même adresse : « ${projet.slug} »`);
    slugs.add(projet.slug);
  }
}
