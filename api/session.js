import { json, utilisateur } from '../server/http.js';
import { dernierePublication, modeStockage } from '../server/stockage.js';

/** Compte connecté et état du stockage (affichés dans le back-office). */
export async function GET(request) {
  const email = utilisateur(request);
  if (!email) return json({ email: null });

  const publication = await dernierePublication().catch((e) => {
    console.error('Date de publication illisible', e);
    return null;
  });
  return json({ email, mode: modeStockage(), dernierePublication: publication });
}
