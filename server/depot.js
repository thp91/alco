import { execFileSync } from 'node:child_process';

/**
 * Le dépôt GitHub tient lieu de base de données (même principe que château-l-arc) :
 * le contenu vit dans contenu/*.json et les images dans public/images/uploads/,
 * chaque publication est un commit sur la branche du site, que Vercel redéploie.
 *
 * Variables d'environnement :
 * - GITHUB_DEPOT : « propriétaire/dépôt » (obligatoire en production) ;
 * - GITHUB_TOKEN : jeton « fine-grained » limité à ce dépôt (Contents : read & write).
 *   En développement, à défaut, le jeton de la GitHub CLI (`gh auth token`) est utilisé ;
 * - GITHUB_BRANCHE (facultatif) : branche lue et écrite, « main » par défaut.
 */
const branche = () => process.env.GITHUB_BRANCHE || 'main';
const api = () => `https://api.github.com/repos/${process.env.GITHUB_DEPOT}`;

let jetonCli;

function jeton() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.ALCO_DEV !== '1') return null;
  if (jetonCli === undefined) {
    try {
      jetonCli = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', timeout: 5000 }).trim() || null;
    } catch {
      jetonCli = null;
    }
  }
  return jetonCli;
}

export const depotConfigure = () => Boolean(process.env.GITHUB_DEPOT && jeton());

export class ErreurDepot extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ErreurDepot';
    this.status = status;
  }
}

async function github(chemin, { accept = 'application/vnd.github+json', ...init } = {}) {
  const valeur = jeton();
  if (!valeur) throw new ErreurDepot('GITHUB_TOKEN manquant', 401);

  const reponse = await fetch(`${api()}${chemin}`, {
    ...init,
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: accept,
      Authorization: `Bearer ${valeur}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
  });

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => '');
    throw new ErreurDepot(`GitHub ${reponse.status} sur ${chemin} : ${detail}`, reponse.status);
  }
  return reponse;
}

const encoderChemin = (chemin) => chemin.split('/').map(encodeURIComponent).join('/');

/** Texte d'un fichier et son empreinte git (sha), ou null s'il n'existe pas. */
export async function lireFichier(chemin) {
  try {
    const donnees = await (
      await github(`/contents/${encoderChemin(chemin)}?ref=${encodeURIComponent(branche())}`)
    ).json();
    return { texte: Buffer.from(donnees.content, 'base64').toString('utf8'), sha: donnees.sha };
  } catch (erreur) {
    if (erreur instanceof ErreurDepot && erreur.status === 404) return null;
    throw erreur;
  }
}

/** Dépose un fichier binaire sans commit (blob git) : il sera relié à l'arbre à la publication. */
export async function creerBlob(contenu) {
  const blob = await (
    await github('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: Buffer.from(contenu).toString('base64'), encoding: 'base64' }),
    })
  ).json();
  return blob.sha;
}

/**
 * Un seul commit pour plusieurs fichiers. `preparer` reçoit un lecteur figé sur
 * le commit de départ et renvoie les changements ({ chemin, contenu } ou
 * { chemin, sha } pour un blob déjà déposé). Si la branche a bougé entre-temps
 * (autre publication), tout est rejoué sur la nouvelle version, jusqu'à 3 fois.
 */
export async function commiter(message, preparer) {
  for (let essai = 1; ; essai += 1) {
    const ref = await (await github(`/git/ref/heads/${encodeURIComponent(branche())}`)).json();
    const parent = ref.object.sha;

    const changements = await preparer();
    if (!changements?.length) return null;

    const commitParent = await (await github(`/git/commits/${parent}`)).json();

    const entrees = await Promise.all(
      changements.map(async ({ chemin, contenu, sha }) => {
        if (sha) return { path: chemin, mode: '100644', type: 'blob', sha };
        const blob = await (
          await github('/git/blobs', { method: 'POST', body: JSON.stringify({ content: contenu, encoding: 'utf-8' }) })
        ).json();
        return { path: chemin, mode: '100644', type: 'blob', sha: blob.sha };
      }),
    );

    const arbre = await (
      await github('/git/trees', {
        method: 'POST',
        body: JSON.stringify({ base_tree: commitParent.tree.sha, tree: entrees }),
      })
    ).json();

    // Republication à l'identique : pas de commit vide.
    if (arbre.sha === commitParent.tree.sha) return null;

    const commit = await (
      await github('/git/commits', {
        method: 'POST',
        body: JSON.stringify({ message, tree: arbre.sha, parents: [parent] }),
      })
    ).json();

    try {
      await github(`/git/refs/heads/${encodeURIComponent(branche())}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return { commit: commit.sha };
    } catch (erreur) {
      // 422 : la branche a avancé entre-temps (publication concurrente).
      if (erreur instanceof ErreurDepot && erreur.status === 422 && essai < 3) continue;
      throw erreur;
    }
  }
}

/** Date (ISO) du dernier commit touchant un chemin, ou null. */
export async function derniereModification(chemin) {
  const commits = await (
    await github(`/commits?path=${encodeURIComponent(chemin)}&sha=${encodeURIComponent(branche())}&per_page=1`)
  ).json();
  return commits?.[0]?.commit?.committer?.date ?? null;
}
