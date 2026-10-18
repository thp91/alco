import { randomBytes } from 'node:crypto';
import { erreur, json, protege } from '../server/http.js';
import { deposerImage } from '../server/stockage.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const TAILLE_MAX = 3 * 1024 * 1024;

const slugifier = (texte) =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'image';

/** Envoi d'une image (déjà réduite par le navigateur) : renvoie son futur chemin public. */
export const POST = protege(async (request) => {
  const donnees = await request.formData().catch(() => null);
  const fichier = donnees?.get('fichier');
  if (!fichier || typeof fichier === 'string') return erreur('Aucune image reçue.');

  const extension = TYPES[fichier.type];
  if (!extension) return erreur('Image : JPEG, PNG ou WebP uniquement.');
  if (fichier.size > TAILLE_MAX) return erreur('Image trop lourde (3 Mo maximum).');

  const octets = new Uint8Array(await fichier.arrayBuffer());
  // Vérifie la signature du fichier, pas seulement le type annoncé.
  const signatures = { jpg: [0xff, 0xd8, 0xff], png: [0x89, 0x50, 0x4e, 0x47], webp: [0x52, 0x49, 0x46, 0x46] };
  if (!signatures[extension].every((octet, i) => octets[i] === octet)) return erreur('Fichier image invalide.');

  const base = slugifier(String(fichier.name ?? '').replace(/\.[^.]+$/, ''));
  const nom = `${base}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.${extension}`;
  return json(await deposerImage(nom, octets));
});
