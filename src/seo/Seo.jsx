import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToutLeContenu } from '../cms/ContentProvider';
import { balisesHead, jsonLd, seo404, seoPour } from './metadonnees';

/**
 * Met à jour le <head> à chaque changement de page (navigation sans rechargement).
 * Au premier chargement, les balises sont déjà dans le HTML pré-généré : ce
 * composant les retrouve par leur clé et les remplace, sans doublon.
 */
function Seo() {
  const { pathname } = useLocation();
  const contenu = useToutLeContenu();

  useEffect(() => {
    const meta = seoPour(pathname, contenu) ?? seo404(contenu);
    document.title = meta.titre;

    const presentes = new Set();
    for (const { cle, tag, attrs } of balisesHead(meta)) {
      presentes.add(cle);
      const [attribut, valeur] = cle.split('=');
      let element = document.head.querySelector(`${tag}[${attribut}="${CSS.escape(valeur)}"]`);
      if (!element) {
        element = document.createElement(tag);
        document.head.appendChild(element);
      }
      for (const [nom, contenuAttribut] of Object.entries(attrs)) element.setAttribute(nom, contenuAttribut);
    }
    // Pas de canonical sur une page 404.
    if (!presentes.has('rel=canonical')) document.head.querySelector('link[rel="canonical"]')?.remove();
    if (!presentes.has('property=og:url')) document.head.querySelector('meta[property="og:url"]')?.remove();

    let script = document.getElementById('donnees-structurees');
    const donnees = meta.donnees.filter(Boolean);
    if (donnees.length) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'donnees-structurees';
        document.head.appendChild(script);
      }
      script.textContent = jsonLd(donnees);
    } else {
      script?.remove();
    }
  }, [pathname, contenu]);

  return null;
}

export default Seo;
