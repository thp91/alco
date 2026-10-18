import { COOKIE_SESSION, lireJeton } from './session.js';
import { ErreurContenu } from './stockage.js';

export const json = (donnees, status = 200, entetes = {}) =>
  new Response(JSON.stringify(donnees), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes },
  });

export const erreur = (message, status = 400) => json({ erreur: message }, status);

function lireCookie(request, nom) {
  const entete = request.headers.get('cookie') ?? '';
  for (const morceau of entete.split(';')) {
    const [cle, ...valeur] = morceau.trim().split('=');
    if (cle === nom) return valeur.join('=');
  }
  return null;
}

/** Administrateur connecté (e-mail), ou null. */
export const utilisateur = (request) => lireJeton(lireCookie(request, COOKIE_SESSION));

/**
 * Les écritures ne sont acceptées que depuis le site lui-même (protection CSRF,
 * en plus du cookie SameSite=Lax).
 */
function memeOrigine(request) {
  const origine = request.headers.get('origin');
  if (!origine) return true;
  return new URL(origine).host === new URL(request.url).host;
}

/**
 * Enveloppe d'une route protégée : session obligatoire, origine vérifiée pour
 * les écritures, erreurs transformées en réponses lisibles par le back-office.
 */
export function protege(gestionnaire) {
  return async (request) => {
    const email = utilisateur(request);
    if (!email) return erreur('Session expirée : reconnectez-vous.', 401);
    if (request.method !== 'GET' && !memeOrigine(request)) return erreur('Origine refusée.', 403);

    try {
      return await gestionnaire(request, email);
    } catch (e) {
      if (e instanceof ErreurContenu) return erreur(e.message, e.status);
      console.error('Back-office', e);
      return erreur('Une erreur est survenue. Réessayez dans un instant.', 500);
    }
  };
}

export { memeOrigine };
