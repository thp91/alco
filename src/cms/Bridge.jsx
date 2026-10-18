import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { estModeEdition } from './mode';
import './Bridge.css';

/**
 * Côté site, dans l'aperçu du back-office : annonce les zones modifiables de la
 * page, met en évidence la zone active et neutralise la navigation (liens, formulaires).
 */
function Bridge() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!estModeEdition()) return undefined;
    document.documentElement.classList.add('cms-edition');

    const annoncer = () => {
      const chemins = [...document.querySelectorAll('[data-cms-path]')].map((el) => el.dataset.cmsPath);
      window.parent.postMessage({ type: 'cms:pret', chemins: [...new Set(chemins)], pathname }, window.location.origin);
    };

    const surMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'cms:focus') {
        document.querySelectorAll('.cms-actif').forEach((el) => el.classList.remove('cms-actif'));
        const cibles = document.querySelectorAll(`[data-cms-path="${CSS.escape(event.data.path)}"]`);
        cibles.forEach((el) => el.classList.add('cms-actif'));
        cibles[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Aperçu : seules les zones s'éditent, la navigation est bloquée.
    const bloquer = (event) => {
      const cible = event.target;
      if (cible.closest?.('[data-cms-path]')) return;
      if (cible.closest?.('a, button[type=submit], form')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Les zones peuvent apparaître après coup (contenu poussé par l'éditeur).
    let minuteur = null;
    const observateur = new MutationObserver(() => {
      window.clearTimeout(minuteur);
      minuteur = window.setTimeout(annoncer, 150);
    });
    observateur.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('message', surMessage);
    document.addEventListener('click', bloquer, true);
    document.addEventListener('submit', bloquer, true);
    const annonce = window.setTimeout(annoncer, 200);

    return () => {
      window.clearTimeout(annonce);
      window.clearTimeout(minuteur);
      observateur.disconnect();
      window.removeEventListener('message', surMessage);
      document.removeEventListener('click', bloquer, true);
      document.removeEventListener('submit', bloquer, true);
    };
  }, [pathname]);

  return null;
}

export default Bridge;
