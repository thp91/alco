import { erreur, json, protege } from '../server/http.js';
import { lireContenu, publier } from '../server/stockage.js';

/** Dernière version publiée d'un fichier de contenu (?cle=accueil). */
export const GET = protege(async (request) => {
  const cle = new URL(request.url).searchParams.get('cle');
  return json(await lireContenu(cle));
});

/**
 * Publication : { fichiers: { cle: valeur }, versions: { cle: sha }, images: [{ chemin, ref }] }.
 * Le contenu est validé par le schéma (shared/schema.js) avant tout commit.
 */
export const POST = protege(async (request, email) => {
  const corps = await request.json().catch(() => null);
  if (!corps || typeof corps !== 'object') return erreur('Données illisibles. Rechargez la page.');

  const resultat = await publier({ ...corps, auteur: email });
  return json(resultat);
});
