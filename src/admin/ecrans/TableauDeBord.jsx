import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../AdminApp';
import { useBrouillons, useFichiers } from '../Brouillons';
import IconeAdmin from '../IconeAdmin';
import { dateLisible } from '../outils';
import { ajouterProjet } from '../realisations';
import './TableauDeBord.css';

function TableauDeBord() {
  const { session } = useSession();
  const { brouillons, modifier } = useBrouillons();
  const { pret } = useFichiers(['realisations']);
  const navigate = useNavigate();

  const projets = brouillons.realisations?.projets ?? [];
  const publies = projets.filter((p) => p.publie).length;

  const nouvelleRealisation = () => {
    modifier('realisations', 'projets', ajouterProjet(projets));
    navigate('/admin/realisations/0');
  };

  return (
    <main className="admin-contenu tableau">
      <header className="admin-entete">
        <div>
          <h1 className="admin-entete__titre">Bonjour 👋</h1>
          <p className="admin-entete__texte">
            Modifiez les textes et les images du site, ajoutez vos nouvelles réalisations, puis publiez : le site
            est mis à jour en ligne une à deux minutes plus tard.
          </p>
        </div>
      </header>

      {session.mode === 'local' && (
        <p className="admin-alerte tableau__alerte">
          <IconeAdmin nom="alerte" />
          Mode local : les publications modifient directement les fichiers de ce projet (aucun dépôt GitHub
          configuré).
        </p>
      )}

      <div className="tableau__actions">
        <Link to="/admin/pages" className="admin-carte tableau__action">
          <span className="tableau__icone">
            <IconeAdmin nom="pages" taille={22} />
          </span>
          <span className="tableau__titre">Modifier une page</span>
          <span className="tableau__texte">Cliquez sur un texte ou une image dans l’aperçu pour le changer.</span>
        </Link>

        <button type="button" className="admin-carte tableau__action" onClick={nouvelleRealisation} disabled={!pret}>
          <span className="tableau__icone tableau__icone--orange">
            <IconeAdmin nom="plus" taille={22} />
          </span>
          <span className="tableau__titre">Ajouter une réalisation</span>
          <span className="tableau__texte">Photos, défi, solution, résultats : votre nouveau chantier en ligne.</span>
        </button>

        <Link to="/admin/realisations" className="admin-carte tableau__action">
          <span className="tableau__icone">
            <IconeAdmin nom="projets" taille={22} />
          </span>
          <span className="tableau__titre">Gérer les réalisations</span>
          <span className="tableau__texte">
            {pret ? `${publies} publiée${publies > 1 ? 's' : ''} sur ${projets.length}` : 'Chargement…'}
          </span>
        </Link>
      </div>

      <section className="admin-carte tableau__infos">
        <h2 className="tableau__sous-titre">Publication</h2>
        <dl className="tableau__liste">
          <div>
            <dt>Dernière publication</dt>
            <dd>{dateLisible(session.dernierePublication) ?? '—'}</dd>
          </div>
          <div>
            <dt>Stockage</dt>
            <dd>{session.mode === 'github' ? 'Dépôt GitHub du site' : session.mode === 'local' ? 'Fichiers locaux' : 'Non configuré'}</dd>
          </div>
        </dl>
        <p className="tableau__note">
          Chaque publication est enregistrée dans l’historique du site : une erreur peut toujours être annulée en
          revenant à la version précédente.
        </p>
      </section>
    </main>
  );
}

export default TableauDeBord;
