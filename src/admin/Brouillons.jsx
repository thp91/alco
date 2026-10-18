import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import { ecrire, egal, reduireImage, remplacerImages } from './outils';

/**
 * Brouillon du back-office : les fichiers de contenu chargés depuis le serveur,
 * les modifications en cours et les images envoyées. Partagé par tous les écrans :
 * on peut modifier plusieurs pages puis tout publier d'un coup (un seul commit).
 */
const ContexteBrouillons = createContext(null);

export function BrouillonsProvider({ children }) {
  const [publies, setPublies] = useState({});
  const [brouillons, setBrouillons] = useState({});
  const [versions, setVersions] = useState({});
  const [erreurs, setErreurs] = useState({});
  // Images envoyées mais pas encore publiées : chemin → { ref, url locale }.
  const [images, setImages] = useState({});
  const [publication, setPublication] = useState({ enCours: false, message: null });
  const enChargement = useRef(new Set());

  const charger = useCallback(async (cle, { forcer = false } = {}) => {
    if (!forcer && enChargement.current.has(cle)) return;
    enChargement.current.add(cle);
    try {
      const { valeur, version } = await api.lireContenu(cle);
      setPublies((p) => ({ ...p, [cle]: valeur }));
      setBrouillons((b) => ({ ...b, [cle]: valeur }));
      setVersions((v) => ({ ...v, [cle]: version }));
      setErreurs((e) => ({ ...e, [cle]: null }));
    } catch (erreur) {
      enChargement.current.delete(cle);
      setErreurs((e) => ({ ...e, [cle]: erreur.message }));
    }
  }, []);

  const modifier = useCallback((cle, chemin, valeur) => {
    setBrouillons((b) => ({ ...b, [cle]: ecrire(b[cle], chemin, valeur) }));
  }, []);

  const modifies = useMemo(
    () => Object.keys(brouillons).filter((cle) => !egal(brouillons[cle], publies[cle])),
    [brouillons, publies],
  );

  const annuler = useCallback(() => setBrouillons(publies), [publies]);

  const envoyerImage = useCallback(async (fichier) => {
    const reduite = fichier.type === 'image/png' && fichier.size < 400_000 ? fichier : await reduireImage(fichier);
    const { chemin, ref } = await api.envoyerImage(reduite);
    setImages((i) => ({ ...i, [chemin]: { ref, url: URL.createObjectURL(reduite) } }));
    return chemin;
  }, []);

  /** URL affichable d'une image (locale tant qu'elle n'est pas publiée). */
  const urlImage = useCallback((chemin) => images[chemin]?.url ?? chemin, [images]);

  /** Contenu à pousser dans l'aperçu : brouillons, images locales comprises. */
  const contenuApercu = useMemo(() => {
    const correspondances = Object.fromEntries(Object.entries(images).map(([chemin, { url }]) => [chemin, url]));
    return remplacerImages(brouillons, correspondances);
  }, [brouillons, images]);

  const publier = useCallback(async () => {
    if (modifies.length === 0) return;
    setPublication({ enCours: true, message: null });
    const fichiers = Object.fromEntries(modifies.map((cle) => [cle, brouillons[cle]]));
    const texte = JSON.stringify(fichiers);
    const utilisees = Object.entries(images)
      .filter(([chemin, { ref }]) => ref && texte.includes(chemin))
      .map(([chemin, { ref }]) => ({ chemin, ref }));

    try {
      const resultat = await api.publier({
        fichiers,
        versions: Object.fromEntries(modifies.map((cle) => [cle, versions[cle]])),
        images: utilisees,
      });
      setPublies((p) => ({ ...p, ...fichiers }));
      setVersions((v) => ({ ...v, ...resultat.versions }));
      setPublication({
        enCours: false,
        message: {
          ok: true,
          texte: resultat.publie
            ? 'Publié ! Le site sera à jour en ligne d’ici une à deux minutes.'
            : 'Rien n’a changé : le site est déjà à jour.',
        },
      });
    } catch (erreur) {
      setPublication({ enCours: false, message: { ok: false, texte: erreur.message } });
    }
  }, [modifies, brouillons, images, versions]);

  const effacerMessage = useCallback(() => setPublication((p) => ({ ...p, message: null })), []);

  // Prévient avant de quitter le back-office avec des modifications non publiées.
  useEffect(() => {
    if (modifies.length === 0) return undefined;
    const avertir = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', avertir);
    return () => window.removeEventListener('beforeunload', avertir);
  }, [modifies.length]);

  const valeur = {
    brouillons,
    publies,
    erreurs,
    charger,
    modifier,
    modifies,
    annuler,
    publier,
    publication,
    effacerMessage,
    envoyerImage,
    urlImage,
    contenuApercu,
  };

  return <ContexteBrouillons.Provider value={valeur}>{children}</ContexteBrouillons.Provider>;
}

export function useBrouillons() {
  return useContext(ContexteBrouillons);
}

/** Charge les fichiers demandés ; renvoie vrai quand ils sont tous disponibles. */
export function useFichiers(cles) {
  const { brouillons, charger, erreurs } = useBrouillons();
  const cle = cles.join(',');

  useEffect(() => {
    cle.split(',').forEach((c) => charger(c));
  }, [cle, charger]);

  const erreur = cles.map((c) => erreurs[c]).find(Boolean) ?? null;
  return { pret: cles.every((c) => brouillons[c] !== undefined), erreur };
}
