import { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useBrouillons, useFichiers } from '../Brouillons';
import EditeurVisuel from '../EditeurVisuel';
import { cheminPage, trouverPage } from '../pages';

function EditeurPage() {
  const { page: id } = useParams();
  const page = trouverPage(id);
  const { brouillons } = useBrouillons();
  const navigate = useNavigate();
  const { pret, erreur } = useFichiers(page?.fichiers ?? []);

  // Clic sur une réalisation dans l'aperçu : elle se modifie dans sa propre rubrique.
  const surClicAilleurs = useCallback(
    (chemin) => {
      const projet = chemin.match(/^realisations\.projets\.(\d+)/);
      if (projet) navigate(`/admin/realisations/${projet[1]}`);
    },
    [navigate],
  );

  if (!page) return <Navigate to="/admin/pages" replace />;
  if (erreur) return <p className="admin-alerte admin-alerte--erreur">{erreur}</p>;
  if (!pret) return <p className="admin-chargement">Chargement de la page…</p>;

  return (
    <EditeurVisuel
      key={page.id}
      titre={page.titre}
      retour={{ to: '/admin/pages', libelle: 'Pages' }}
      apercu={cheminPage(page, brouillons)}
      sections={page.sections}
      surClicAilleurs={surClicAilleurs}
    />
  );
}

export default EditeurPage;
