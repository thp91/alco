/** Lecture d'une valeur par chemin (« services.2.hero.titre » ou tableau de morceaux). */
export function lire(objet, chemin) {
  const morceaux = Array.isArray(chemin) ? chemin : String(chemin).split('.').filter(Boolean);
  return morceaux.reduce((valeur, morceau) => (valeur == null ? undefined : valeur[morceau]), objet);
}

/** Copie modifiée d'un objet, la valeur au chemin donné remplacée (sans muter l'original). */
export function ecrire(objet, chemin, valeur) {
  const morceaux = Array.isArray(chemin) ? chemin : String(chemin).split('.').filter(Boolean);
  if (morceaux.length === 0) return valeur;
  const [tete, ...reste] = morceaux;
  const copie = Array.isArray(objet) ? [...objet] : { ...objet };
  copie[tete] = ecrire(objet?.[tete], reste, valeur);
  return copie;
}

export const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const slugifier = (texte) =>
  String(texte)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

/** Remplace, partout dans un objet, les chemins d'images connus par une autre URL (aperçu local). */
export function remplacerImages(valeur, correspondances) {
  if (typeof valeur === 'string') return correspondances[valeur] ?? valeur;
  if (Array.isArray(valeur)) return valeur.map((v) => remplacerImages(v, correspondances));
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, remplacerImages(v, correspondances)]));
  }
  return valeur;
}

/** Réduit une photo à 2000 px de large au plus (JPEG) : envoi léger, rendu net. */
export async function reduireImage(fichier) {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, 2000 / image.width);
  const toile = document.createElement('canvas');
  toile.width = Math.round(image.width * echelle);
  toile.height = Math.round(image.height * echelle);
  toile.getContext('2d').drawImage(image, 0, 0, toile.width, toile.height);
  const blob = await new Promise((ok) => toile.toBlob(ok, 'image/jpeg', 0.84));
  if (!blob) throw new Error('Image illisible');
  return new File([blob], `${fichier.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

const formatDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export const dateLisible = (iso) => (iso ? formatDate.format(new Date(iso)) : null);
