import { estDetaille } from '../cms/format';
import { texteBrut } from '../cms/texte';

/** Adresse publique du site (canonicals, Open Graph, sitemap). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://alcorope.fr').replace(/\/$/, '');
export const NOM_SITE = 'Alco’rope';

const absolue = (chemin) => `${SITE_URL}${chemin === '/' ? '' : chemin}` || SITE_URL;

/** Coupe un texte à ~155 caractères sur une fin de mot (longueur utile d'une meta description). */
export function resumer(texte = '', longueur = 155) {
  const propre = texteBrut(texte).replace(/\s+/g, ' ').trim();
  if (propre.length <= longueur) return propre;
  return `${propre.slice(0, propre.lastIndexOf(' ', longueur - 1)).replace(/[,;:.\s]+$/, '')}…`;
}

/** Image Open Graph générée au build (1200 × 630, JPEG) pour une page. */
export const imageOg = (chemin) => `/og/${chemin === '/' ? 'accueil' : chemin.slice(1).replace(/\//g, '-')}.jpg`;

/** Toutes les pages publiques à pré-générer et à déclarer dans le sitemap. */
export function routesPubliques(contenu) {
  return [
    '/',
    ...contenu.services.map((service) => `/services/${service.slug}`),
    '/realisations',
    ...contenu.realisations.projets.filter((projet) => projet.publie).map((projet) => `/realisations/${projet.slug}`),
    '/contact',
    '/mentions-legales',
    '/politique-de-confidentialite',
  ];
}

function entreprise(contenu) {
  const { coordonnees } = contenu.general;
  const [, codePostal = '', ville = ''] = coordonnees.adresseLigne2.match(/(\d{5}),?\s*([^,]+)/) ?? [];
  return {
    '@type': 'GeneralContractor',
    '@id': `${SITE_URL}/#entreprise`,
    name: NOM_SITE,
    description: resumer(contenu.accueil.hero.texte, 300),
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}${imageOg('/')}`,
    telephone: coordonnees.telephone,
    email: coordonnees.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: coordonnees.adresseLigne1,
      postalCode: codePostal,
      addressLocality: ville.trim(),
      addressRegion: 'Île-de-France',
      addressCountry: 'FR',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Île-de-France' },
      { '@type': 'Country', name: 'France' },
    ],
    knowsAbout: contenu.services.map((service) => service.menu.titre),
  };
}

const filAriane = (etapes) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ nom: 'Accueil', chemin: '/' }, ...etapes].map((etape, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: etape.nom,
    item: absolue(etape.chemin),
  })),
});

const faqPage = (liste) =>
  liste.length > 0 && {
    '@type': 'FAQPage',
    mainEntity: liste.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.reponse },
    })),
  };

/**
 * Métadonnées d'une page : title, description, Open Graph, canonical et
 * données structurées Schema.org. `null` : la page n'existe pas (404).
 */
export function seoPour(pathname, contenu) {
  const chemin = pathname.replace(/\/+$/, '') || '/';
  const base = { chemin, canonical: absolue(chemin), image: imageOg(chemin), type: 'website', indexable: true };
  const organisation = entreprise(contenu);

  if (chemin === '/') {
    const { hero, faq } = contenu.accueil;
    return {
      ...base,
      titre: contenu.accueil.seo.titre || 'Alco’rope — Cordistes et travaux en hauteur en Île-de-France',
      description: resumer(contenu.accueil.seo.description || hero.texte),
      imageSource: hero.image,
      donnees: [
        organisation,
        { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, url: `${SITE_URL}/`, name: NOM_SITE, inLanguage: 'fr-FR' },
        faqPage(faq.liste),
      ],
    };
  }

  const service = contenu.services.find((s) => chemin === `/services/${s.slug}`);
  if (service) {
    return {
      ...base,
      titre: service.seo.titre || `${service.menu.titre} — travaux sur cordes | ${NOM_SITE}`,
      description: resumer(service.seo.description || service.approche.texte),
      imageSource: service.hero.image,
      donnees: [
        organisation,
        {
          '@type': 'Service',
          name: service.menu.titre,
          serviceType: service.menu.titre,
          description: resumer(service.approche.texte, 300),
          provider: { '@id': organisation['@id'] },
          areaServed: organisation.areaServed,
          url: base.canonical,
        },
        filAriane([{ nom: service.menu.titre, chemin }]),
        faqPage(service.faq.liste),
      ],
    };
  }

  if (chemin === '/realisations') {
    const { page, projets } = contenu.realisations;
    const publies = projets.filter((p) => p.publie);
    return {
      ...base,
      titre: contenu.realisations.seo.titre || `Nos réalisations — chantiers de cordistes | ${NOM_SITE}`,
      description: resumer(contenu.realisations.seo.description || page.texte),
      imageSource: publies[0]?.image,
      donnees: [
        organisation,
        filAriane([{ nom: 'Réalisations', chemin }]),
        {
          '@type': 'ItemList',
          itemListElement: publies.map((projet, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absolue(`/realisations/${projet.slug}`),
            name: projet.titre,
          })),
        },
      ],
    };
  }

  const projet = contenu.realisations.projets.find((p) => p.publie && chemin === `/realisations/${p.slug}`);
  if (projet) {
    const description = resumer(
      projet.resume ||
        projet.defi ||
        projet.solution ||
        `${projet.titre} : chantier ${projet.categorie ? `de ${projet.categorie.toLowerCase()} ` : ''}réalisé par les cordistes d’${NOM_SITE}, sans échafaudage ni nacelle. ${contenu.realisations.page.texte}`,
    );
    return {
      ...base,
      type: 'article',
      titre: `${projet.titre} | Réalisation ${NOM_SITE}`,
      description,
      imageSource: projet.imageDetail || projet.image,
      donnees: [
        organisation,
        filAriane([
          { nom: 'Réalisations', chemin: '/realisations' },
          { nom: projet.titre, chemin },
        ]),
        {
          '@type': 'CreativeWork',
          name: projet.titreDetail || projet.titre,
          description,
          genre: projet.categorie,
          image: [projet.image, ...projet.galerie.map((photo) => photo.image)].filter(Boolean).map(absolue),
          creator: { '@id': organisation['@id'] },
          ...(estDetaille(projet) && { abstract: resumer(projet.defi, 300) }),
        },
      ],
    };
  }

  if (chemin === '/contact') {
    return {
      ...base,
      titre: contenu.contact.seo.titre || `Contact et devis gratuit — cordistes | ${NOM_SITE}`,
      description: resumer(contenu.contact.seo.description || contenu.contact.hero.texte),
      imageSource: contenu.accueil.hero.image,
      donnees: [
        organisation,
        filAriane([{ nom: 'Contact', chemin }]),
        { '@type': 'ContactPage', url: base.canonical, about: { '@id': organisation['@id'] } },
      ],
    };
  }

  const legal = { '/mentions-legales': 'mentions', '/politique-de-confidentialite': 'confidentialite' }[chemin];
  if (legal) {
    const page = contenu.legal[legal];
    return {
      ...base,
      titre: `${page.titre} | ${NOM_SITE}`,
      description: resumer(page.sections.map((s) => s.texte).join(' ')),
      imageSource: contenu.accueil.hero.image,
      donnees: [organisation, filAriane([{ nom: page.titre, chemin }])],
    };
  }

  return null;
}

/** Métadonnées de la page 404 (jamais indexée). */
export const seo404 = (contenu) => ({
  chemin: '/404',
  canonical: null,
  titre: `Page introuvable | ${NOM_SITE}`,
  description: resumer(contenu.accueil.hero.texte),
  image: imageOg('/'),
  type: 'website',
  indexable: false,
  donnees: [],
});

/** Bloc JSON-LD unique (un @graph) prêt à insérer dans la page. */
export const jsonLd = (donnees) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': donnees.filter(Boolean) }).replace(/</g, '\\u003c');

/**
 * Balises du <head> d'une page : utilisées telles quelles au build (HTML statique)
 * et par le composant Seo lors de la navigation dans le site.
 * `cle` identifie la balise à remplacer d'une page à l'autre.
 */
export function balisesHead(meta) {
  const image = `${SITE_URL}${meta.image}`;
  const balises = [
    { cle: 'name=description', tag: 'meta', attrs: { name: 'description', content: meta.description } },
    { cle: 'name=robots', tag: 'meta', attrs: { name: 'robots', content: meta.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow' } },
    { cle: 'property=og:type', tag: 'meta', attrs: { property: 'og:type', content: meta.type } },
    { cle: 'property=og:site_name', tag: 'meta', attrs: { property: 'og:site_name', content: NOM_SITE } },
    { cle: 'property=og:locale', tag: 'meta', attrs: { property: 'og:locale', content: 'fr_FR' } },
    { cle: 'property=og:title', tag: 'meta', attrs: { property: 'og:title', content: meta.titre } },
    { cle: 'property=og:description', tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    { cle: 'property=og:image', tag: 'meta', attrs: { property: 'og:image', content: image } },
    { cle: 'property=og:image:width', tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { cle: 'property=og:image:height', tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { cle: 'property=og:image:alt', tag: 'meta', attrs: { property: 'og:image:alt', content: meta.titre } },
    { cle: 'name=twitter:card', tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { cle: 'name=twitter:title', tag: 'meta', attrs: { name: 'twitter:title', content: meta.titre } },
    { cle: 'name=twitter:description', tag: 'meta', attrs: { name: 'twitter:description', content: meta.description } },
    { cle: 'name=twitter:image', tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ];
  if (meta.canonical) {
    balises.push(
      { cle: 'rel=canonical', tag: 'link', attrs: { rel: 'canonical', href: meta.canonical } },
      { cle: 'property=og:url', tag: 'meta', attrs: { property: 'og:url', content: meta.canonical } },
    );
  }
  return balises;
}

const echapper = (valeur) =>
  String(valeur).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Même chose en HTML (pré-génération des pages). */
export function headHtml(meta) {
  const balises = balisesHead(meta).map(
    ({ tag, attrs }) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${echapper(v)}"`).join(' ')} />`,
  );
  const donnees = meta.donnees.filter(Boolean);
  return [
    `<title>${echapper(meta.titre)}</title>`,
    ...balises,
    ...(donnees.length ? [`<script type="application/ld+json" id="donnees-structurees">${jsonLd(donnees)}</script>`] : []),
  ].join('\n    ');
}
