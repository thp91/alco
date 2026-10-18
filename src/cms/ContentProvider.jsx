import { createContext, useContext, useEffect, useState } from 'react';
import accueil from '../../contenu/accueil.json';
import contact from '../../contenu/contact.json';
import general from '../../contenu/general.json';
import realisations from '../../contenu/realisations.json';
import services from '../../contenu/services.json';
import { estModeEdition } from './mode';

/**
 * Contenu éditable du site : un fichier JSON par clé, dans contenu/.
 * Le site embarque la version du dernier build ; dans l'aperçu du back-office
 * (?edit, dans une iframe), le brouillon en cours de saisie la remplace en direct.
 */
export const contenuEmbarque = { general, accueil, services, realisations, contact };

const ContexteContenu = createContext(contenuEmbarque);

export function ContentProvider({ children }) {
  const [contenu, setContenu] = useState(contenuEmbarque);

  useEffect(() => {
    if (!estModeEdition()) return undefined;

    const surMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'cms:contenu') {
        setContenu((actuel) => ({ ...actuel, ...event.data.contenu }));
      }
    };
    window.addEventListener('message', surMessage);
    return () => window.removeEventListener('message', surMessage);
  }, []);

  return <ContexteContenu.Provider value={contenu}>{children}</ContexteContenu.Provider>;
}

/** Contenu d'un fichier (« accueil », « general »…). */
export function useContenu(cle) {
  return useContext(ContexteContenu)[cle];
}
