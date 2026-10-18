import { Link } from 'react-router-dom';
import { contenuEmbarque } from '../../cms/ContentProvider';
import { useBrouillons } from '../Brouillons';
import IconeAdmin from '../IconeAdmin';
import { PAGES } from '../pages';
import './ListePages.css';

function ListePages() {
  const { brouillons, urlImage } = useBrouillons();
  // Vignettes : brouillon s'il est chargé, sinon contenu du site.
  const contenu = { ...contenuEmbarque, ...brouillons };

  return (
    <main className="admin-contenu">
      <header className="admin-entete">
        <div>
          <h1 className="admin-entete__titre">Pages</h1>
          <p className="admin-entete__texte">
            Choisissez une page : elle s’ouvre dans un aperçu où chaque texte et chaque image se modifie d’un clic.
            Le design, lui, ne bouge pas.
          </p>
        </div>
      </header>

      <ul className="liste-pages">
        {PAGES.map((page) => {
          const image = page.image(contenu);
          return (
            <li key={page.id}>
              <Link to={`/admin/pages/${page.id}`} className="liste-pages__carte">
                <span className="liste-pages__vignette">
                  {image ? <img src={urlImage(image)} alt="" loading="lazy" /> : <IconeAdmin nom="pages" taille={28} />}
                </span>
                <span className="liste-pages__corps">
                  {page.groupe && <span className="liste-pages__groupe">{page.groupe}</span>}
                  <span className="liste-pages__titre">{page.titre}</span>
                  {page.description && <span className="liste-pages__description">{page.description}</span>}
                </span>
                <IconeAdmin nom="crayon" className="liste-pages__icone" taille={16} />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default ListePages;
