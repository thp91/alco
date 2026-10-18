import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CLES_CONTENU, SCHEMA, valider, verifierRealisations } from '../shared/schema.js';
import { commiter, creerBlob, depotConfigure, derniereModification, lireFichier } from './depot.js';

/**
 * Stockage du contenu, sans base de données :
 * - « github » : lecture et écriture dans le dépôt (production, ou local avec GITHUB_DEPOT) ;
 * - « local » : en développement sans dépôt configuré, les fichiers du projet sont
 *   modifiés directement sur le disque (pratique pour essayer le back-office).
 */
export function modeStockage() {
  if (depotConfigure()) return 'github';
  if (process.env.ALCO_DEV === '1') return 'local';
  return null;
}

const racine = () => process.cwd();
const cheminContenu = (cle) => `contenu/${cle}.json`;
const DOSSIER_IMAGES = 'public/images/uploads';

/** Empreinte git d'un texte : identique à celle que renvoie GitHub. */
const empreinte = (texte) => {
  const octets = Buffer.from(texte, 'utf8');
  return createHash('sha1').update(`blob ${octets.length}\0`).update(octets).digest('hex');
};

export const versJson = (valeur) => `${JSON.stringify(valeur, null, 2)}\n`;

export class ErreurContenu extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function exigerMode() {
  const mode = modeStockage();
  if (!mode) throw new ErreurContenu('Back-office mal configuré : GITHUB_DEPOT ou GITHUB_TOKEN manquant.', 503);
  return mode;
}

/** Dernière version publiée d'un fichier de contenu, avec sa version (sha). */
export async function lireContenu(cle) {
  if (!CLES_CONTENU.includes(cle)) throw new ErreurContenu('Contenu inconnu', 404);
  const mode = exigerMode();

  const fichier =
    mode === 'github'
      ? await lireFichier(cheminContenu(cle))
      : await readFile(path.join(racine(), cheminContenu(cle)), 'utf8').then((texte) => ({
          texte,
          sha: empreinte(texte),
        }));

  if (!fichier) throw new ErreurContenu(`Fichier ${cheminContenu(cle)} absent du dépôt`, 404);
  return { valeur: JSON.parse(fichier.texte), version: fichier.sha };
}

/**
 * Image envoyée depuis le back-office. En mode GitHub, elle est déposée comme
 * blob (sans commit) et ne sera reliée au site qu'à la publication.
 */
export async function deposerImage(nom, octets) {
  const mode = exigerMode();
  const chemin = `/images/uploads/${nom}`;

  if (mode === 'github') return { chemin, ref: await creerBlob(octets) };

  const dossier = path.join(racine(), DOSSIER_IMAGES);
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, nom), octets);
  return { chemin, ref: null };
}

/**
 * Publie un ou plusieurs fichiers de contenu (un seul commit). `versions` :
 * version de chaque fichier au moment où l'éditeur l'a ouvert ; si quelqu'un a
 * publié entre-temps, la publication est refusée plutôt que d'écraser son travail.
 */
export async function publier({ fichiers, versions = {}, images = [], auteur }) {
  const mode = exigerMode();
  const cles = Object.keys(fichiers ?? {});
  if (cles.length === 0) throw new ErreurContenu('Aucune modification à publier.');

  const textes = {};
  for (const cle of cles) {
    if (!CLES_CONTENU.includes(cle)) throw new ErreurContenu(`Contenu inconnu : ${cle}`);
    let propre;
    try {
      propre = valider(fichiers[cle], SCHEMA[cle], cle);
      if (cle === 'realisations') verifierRealisations(propre);
    } catch (erreur) {
      throw new ErreurContenu(`Contenu refusé — ${erreur.message}`);
    }
    textes[cle] = versJson(propre);
  }

  const imagesValides = images.filter(
    (image) =>
      typeof image?.chemin === 'string' &&
      /^\/images\/uploads\/[\w-]+\.(jpe?g|png|webp)$/i.test(image.chemin) &&
      typeof image.ref === 'string' &&
      /^[0-9a-f]{40}$/.test(image.ref),
  );

  const verifierVersions = async () => {
    for (const cle of cles) {
      if (!versions[cle]) continue;
      const actuel = await lireContenu(cle);
      if (actuel.version !== versions[cle]) {
        throw new ErreurContenu(
          'Ce contenu a été modifié entre-temps (autre onglet ou autre personne). Rechargez la page pour repartir de la dernière version.',
          409,
        );
      }
    }
  };

  const libelle = cles.map((cle) => SCHEMA[cle].libelle).join(', ');
  const message = `Back-office : ${libelle}${auteur ? ` (${auteur})` : ''}`;

  if (mode === 'local') {
    await verifierVersions();
    for (const cle of cles) await writeFile(path.join(racine(), cheminContenu(cle)), textes[cle]);
    return { publie: true, versions: Object.fromEntries(cles.map((cle) => [cle, empreinte(textes[cle])])) };
  }

  const resultat = await commiter(message, async () => {
    await verifierVersions();
    return [
      ...cles.map((cle) => ({ chemin: cheminContenu(cle), contenu: textes[cle] })),
      ...imagesValides.map((image) => ({ chemin: `public${image.chemin}`, sha: image.ref })),
    ];
  });

  return {
    publie: Boolean(resultat),
    versions: Object.fromEntries(cles.map((cle) => [cle, empreinte(textes[cle])])),
  };
}

/** Date de la dernière publication du contenu (ISO), ou null. */
export async function dernierePublication() {
  const mode = modeStockage();
  if (mode === 'github') return derniereModification('contenu');
  if (mode === 'local') {
    const dates = await Promise.all(
      CLES_CONTENU.map((cle) => stat(path.join(racine(), cheminContenu(cle))).then((s) => s.mtimeMs)),
    );
    return new Date(Math.max(...dates)).toISOString();
  }
  return null;
}
