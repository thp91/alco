/** Appels au serveur du back-office (fonctions de api/). */
export class ErreurApi extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function appel(chemin, options = {}) {
  let reponse;
  try {
    reponse = await fetch(`/api/${chemin}`, { credentials: 'same-origin', ...options });
  } catch {
    throw new ErreurApi('Connexion impossible. Vérifiez votre réseau.', 0);
  }
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) throw new ErreurApi(donnees.erreur ?? 'Une erreur est survenue.', reponse.status);
  return donnees;
}

const enJson = (methode, corps) => ({
  method: methode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corps),
});

export const api = {
  session: () => appel('session'),
  connexion: (email, motDePasse) => appel('connexion', enJson('POST', { email, motDePasse })),
  deconnexion: () => appel('deconnexion', { method: 'POST' }),
  lireContenu: (cle) => appel(`contenu?cle=${encodeURIComponent(cle)}`),
  publier: (corps) => appel('contenu', enJson('POST', corps)),
  envoyerImage: (fichier) => {
    const donnees = new FormData();
    donnees.set('fichier', fichier);
    return appel('image', { method: 'POST', body: donnees });
  },
};
