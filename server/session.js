import { createHmac, scrypt, timingSafeEqual } from 'node:crypto';

/**
 * Accès au back-office, sans base de données (même principe que château-l-arc).
 *
 * Comptes : variable ADMIN_COMPTES, une entrée par compte séparées par des virgules,
 * au format produit par `node scripts/creer-compte-admin.mjs` :
 *   prenom@alcorope.fr:scrypt:<sel>:<empreinte>
 * Le mot de passe n'est jamais stocké, seulement son empreinte. Retirer une entrée
 * coupe l'accès, y compris aux sessions déjà ouvertes.
 *
 * Session : cookie signé (HMAC-SHA256) avec ADMIN_SECRET_SESSION, valable 7 jours.
 */
export const COOKIE_SESSION = 'alco_admin';
const DUREE_SESSION_S = 60 * 60 * 24 * 7;

function comptes() {
  const liste = new Map();
  for (const entree of (process.env.ADMIN_COMPTES ?? '').split(',')) {
    const [email, algo, sel, empreinte] = entree.trim().split(':');
    if (!email || algo !== 'scrypt' || !sel || !empreinte) continue;
    liste.set(email.toLowerCase(), {
      sel: Buffer.from(sel, 'base64url'),
      empreinte: Buffer.from(empreinte, 'base64url'),
    });
  }
  return liste;
}

const hacher = (motDePasse, sel) =>
  new Promise((resoudre, rejeter) =>
    scrypt(motDePasse, sel, 64, (erreur, cle) => (erreur ? rejeter(erreur) : resoudre(cle))),
  );

/** Vérifie le couple e-mail / mot de passe ; renvoie l'e-mail normalisé, ou null. */
export async function verifierIdentifiants(email, motDePasse) {
  const normalise = String(email).trim().toLowerCase();
  const compte = comptes().get(normalise);

  // Même calcul que le compte existe ou non : la durée ne trahit rien.
  const calcule = await hacher(String(motDePasse), compte?.sel ?? Buffer.alloc(16));
  if (!compte || calcule.length !== compte.empreinte.length) return null;
  return timingSafeEqual(calcule, compte.empreinte) ? normalise : null;
}

function secret() {
  const valeur = process.env.ADMIN_SECRET_SESSION;
  if (valeur && valeur.length >= 32) return valeur;
  // En local seulement, une clé fixe évite d'avoir à en générer une.
  return process.env.ALCO_DEV === '1' ? 'developpement-local-uniquement-0000' : null;
}

const signer = (donnees, cle) => createHmac('sha256', cle).update(donnees).digest('base64url');

export function creerJeton(email) {
  const cle = secret();
  if (!cle) throw new Error('ADMIN_SECRET_SESSION manquante (32 caractères minimum).');
  const charge = { email, exp: Math.floor(Date.now() / 1000) + DUREE_SESSION_S };
  const donnees = Buffer.from(JSON.stringify(charge)).toString('base64url');
  return `${donnees}.${signer(donnees, cle)}`;
}

/** E-mail porté par un jeton valide, non expiré et dont le compte existe encore. */
export function lireJeton(jeton) {
  const cle = secret();
  if (!jeton || !cle) return null;

  const [donnees, signature] = jeton.split('.');
  if (!donnees || !signature) return null;

  const attendue = Buffer.from(signer(donnees, cle));
  const recue = Buffer.from(signature);
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null;

  try {
    const charge = JSON.parse(Buffer.from(donnees, 'base64url').toString());
    if (typeof charge.email !== 'string' || charge.exp * 1000 < Date.now()) return null;
    return comptes().has(charge.email) ? charge.email : null;
  } catch {
    return null;
  }
}

const securise = () => process.env.ALCO_DEV !== '1';

export const cookieSession = (jeton) =>
  `${COOKIE_SESSION}=${jeton}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DUREE_SESSION_S}${securise() ? '; Secure' : ''}`;

export const cookieExpire = () =>
  `${COOKIE_SESSION}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${securise() ? '; Secure' : ''}`;
