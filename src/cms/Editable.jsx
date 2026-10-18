import { estModeEdition } from './mode';

/**
 * Zone modifiable depuis l'éditeur visuel du back-office.
 * `path` : « fichier.chemin.dans.le.json » (ex. « accueil.services.liste.2.titre »).
 * Hors aperçu, rend simplement la balise ; dans l'aperçu, un clic ouvre le champ.
 */
function Editable({ path, as: Tag = 'span', image = false, children, ...props }) {
  if (!estModeEdition()) {
    return <Tag {...props}>{children}</Tag>;
  }

  const ouvrir = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.parent.postMessage({ type: 'cms:clic', path }, window.location.origin);
  };

  return (
    <Tag {...props} data-cms-path={path} data-cms-image={image ? '' : undefined} onClick={ouvrir}>
      {children}
    </Tag>
  );
}

export default Editable;
