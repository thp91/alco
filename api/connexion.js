import { erreur, json, memeOrigine } from '../server/http.js';
import { cookieSession, creerJeton, verifierIdentifiants } from '../server/session.js';

/** Connexion au back-office (comptes déclarés dans ADMIN_COMPTES). */
export async function POST(request) {
  if (!memeOrigine(request)) return erreur('Origine refusée.', 403);

  const { email = '', motDePasse = '' } = await request.json().catch(() => ({}));
  if (!email || !motDePasse) return erreur('Renseignez votre e-mail et votre mot de passe.');

  const compte = await verifierIdentifiants(email, motDePasse);
  if (!compte) {
    // Message volontairement générique, et petit délai contre les essais en rafale.
    await new Promise((resoudre) => setTimeout(resoudre, 600));
    return erreur('E-mail ou mot de passe incorrect.', 401);
  }

  try {
    return json({ email: compte }, 200, { 'Set-Cookie': cookieSession(creerJeton(compte)) });
  } catch (e) {
    console.error('Ouverture de session impossible', e);
    return erreur('Back-office mal configuré (ADMIN_SECRET_SESSION).', 500);
  }
}
