import { Link, useNavigate } from 'react-router-dom';
import { estDetaille } from '../../cms/format';
import { useBrouillons, useFichiers } from '../Brouillons';
import IconeAdmin from '../IconeAdmin';
import { egal } from '../outils';
import { ajouterProjet } from '../realisations';
import './ListeRealisations.css';

function ListeRealisations() {
  const { brouillons, publies, modifier, urlImage } = useBrouillons();
  const { pret, erreur } = useFichiers(['realisations']);
  const navigate = useNavigate();

  if (erreur) return <p className="admin-alerte admin-alerte--erreur">{erreur}</p>;
  if (!pret) return <p className="admin-chargement">Chargement des réalisations…</p>;

  const projets = brouillons.realisations.projets;
  const anciens = publies.realisations?.projets ?? [];
  const changer = (liste) => modifier('realisations', 'projets', liste);

  const deplacer = (index, sens) => {
    const copie = [...projets];
    const [projet] = copie.splice(index, 1);
    copie.splice(index + sens, 0, projet);
    changer(copie);
  };

  const supprimer = (index) => {
    if (!window.confirm(`Supprimer « ${projets[index].titre} » ? Elle disparaîtra du site à la prochaine publication.`)) return;
    changer(projets.filter((_, i) => i !== index));
  };

  const nouvelle = () => {
    changer(ajouterProjet(projets));
    navigate('/admin/realisations/0');
  };

  return (
    <main className="admin-contenu realisations-admin">
      <header className="admin-entete">
        <div>
          <h1 className="admin-entete__titre">Réalisations</h1>
          <p className="admin-entete__texte">
            L’ordre de cette liste est celui du site. Une réalisation non publiée reste un brouillon, invisible en
            ligne.
          </p>
        </div>
        <button type="button" className="admin-bouton admin-bouton--primaire" onClick={nouvelle}>
          <IconeAdmin nom="plus" taille={16} />
          Nouvelle réalisation
        </button>
      </header>

      {projets.length === 0 ? (
        <p className="admin-carte realisations-admin__vide">Aucune réalisation pour le moment.</p>
      ) : (
        <ul className="realisations-admin__liste">
          {projets.map((projet, index) => {
            const ancien = anciens.find((a) => a.slug === projet.slug);
            const statut = !ancien ? 'Nouvelle' : !egal(ancien, projet) ? 'Modifiée' : null;
            return (
              <li className="realisations-admin__ligne" key={`${projet.slug}-${index}`}>
                <Link to={`/admin/realisations/${index}`} className="realisations-admin__vignette">
                  {projet.image ? (
                    <img src={urlImage(projet.image)} alt="" loading="lazy" />
                  ) : (
                    <IconeAdmin nom="image" taille={22} />
                  )}
                </Link>

                <div className="realisations-admin__infos">
                  <Link to={`/admin/realisations/${index}`} className="realisations-admin__titre">
                    {projet.titre || 'Sans titre'}
                  </Link>
                  <p className="realisations-admin__meta">
                    <span
                      className={`realisations-admin__statut${projet.publie ? ' realisations-admin__statut--publie' : ''}`}
                    >
                      {projet.publie ? 'Publiée' : 'Brouillon'}
                    </span>
                    {projet.categorie && <span>{projet.categorie}</span>}
                    {!estDetaille(projet) && <span>Fiche à rédiger</span>}
                    {statut && <span className="realisations-admin__modifie">{statut} · non publiée</span>}
                  </p>
                </div>

                <div className="realisations-admin__actions">
                  <button
                    type="button"
                    className="admin-icone-bouton"
                    disabled={index === 0}
                    onClick={() => deplacer(index, -1)}
                    aria-label="Monter"
                  >
                    <IconeAdmin nom="haut" taille={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icone-bouton"
                    disabled={index === projets.length - 1}
                    onClick={() => deplacer(index, 1)}
                    aria-label="Descendre"
                  >
                    <IconeAdmin nom="bas" taille={16} />
                  </button>
                  <Link to={`/admin/realisations/${index}`} className="admin-bouton admin-bouton--petit">
                    <IconeAdmin nom="crayon" taille={15} />
                    Modifier
                  </Link>
                  <button
                    type="button"
                    className="admin-icone-bouton admin-icone-bouton--danger"
                    onClick={() => supprimer(index)}
                    aria-label={`Supprimer ${projet.titre}`}
                  >
                    <IconeAdmin nom="poubelle" taille={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default ListeRealisations;
