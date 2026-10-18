import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useBrouillons, useFichiers } from '../Brouillons';
import EditeurVisuel from '../EditeurVisuel';
import IconeAdmin from '../IconeAdmin';
import { slugLibre } from '../realisations';
import './EditionRealisation.css';

/** Champs d'une réalisation, regroupés comme sur sa fiche. */
const GROUPES = [
  { id: 'carte', titre: 'Carte & publication', champs: ['titre', 'publie', 'categorie', 'filtres', 'resume', 'image', 'slug'] },
  { id: 'entete', titre: 'En-tête de la fiche', champs: ['surtitre', 'titreDetail', 'imageDetail', 'stats'] },
  { id: 'recit', titre: 'Le défi & notre solution', champs: ['defi', 'solution'] },
  { id: 'galerie', titre: 'Galerie photos', champs: ['galerie'] },
  { id: 'resultats', titre: 'Résultats', champs: ['resultats'] },
  { id: 'fiche', titre: 'Fiche technique', champs: ['maitreOuvrage', 'duree', 'expertises', 'normes'] },
];

function EditionRealisation() {
  const index = Number(useParams().index);
  const { brouillons, publies, modifier } = useBrouillons();
  const { pret, erreur } = useFichiers(['realisations', 'general']);
  const navigate = useNavigate();

  const projets = brouillons.realisations?.projets ?? [];
  const projet = projets[index];
  const estNouveau = useMemo(
    () => Boolean(projet) && !(publies.realisations?.projets ?? []).some((p) => p.slug === projet.slug),
    // Évalué à l'ouverture : la saisie de l'adresse ne doit pas changer le statut.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pret, index],
  );

  // Nouvelle réalisation : l'adresse suit le titre tant qu'on ne l'a pas modifiée à la main.
  const titrePrecedent = useRef(projet?.titre);
  useEffect(() => {
    if (!projet || !estNouveau) return;
    const attendue = slugLibre(titrePrecedent.current ?? '', projets, index);
    if (projet.slug === attendue) {
      const nouvelle = slugLibre(projet.titre, projets, index);
      if (nouvelle !== projet.slug) modifier('realisations', ['projets', index, 'slug'], nouvelle);
    }
    titrePrecedent.current = projet.titre;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projet?.titre]);

  // L'aperçu ne se recharge qu'une fois la saisie de l'adresse terminée.
  const [slugApercu, setSlugApercu] = useState(projet?.slug);
  useEffect(() => {
    const minuteur = window.setTimeout(() => setSlugApercu(projet?.slug), 700);
    return () => window.clearTimeout(minuteur);
  }, [projet?.slug]);

  const sections = useMemo(
    () => GROUPES.map((groupe) => ({ ...groupe, id: `projet-${groupe.id}`, chemin: `realisations.projets.${index}` })),
    [index],
  );

  if (erreur) return <p className="admin-alerte admin-alerte--erreur">{erreur}</p>;
  if (!pret) return <p className="admin-chargement">Chargement…</p>;
  if (!projet) return <Navigate to="/admin/realisations" replace />;

  const supprimer = () => {
    if (!window.confirm(`Supprimer « ${projet.titre} » ? Elle disparaîtra du site à la prochaine publication.`)) return;
    modifier('realisations', 'projets', projets.filter((_, i) => i !== index));
    navigate('/admin/realisations');
  };

  return (
    <EditeurVisuel
      key={index}
      titre={projet.titre || 'Sans titre'}
      retour={{ to: '/admin/realisations', libelle: 'Réalisations' }}
      apercu={`/realisations/${slugApercu || projet.slug}`}
      sections={sections}
      entete={
        <div className="edition-realisation">
          <div>
            <p className="edition-realisation__statut">
              <span
                className={`edition-realisation__pastille${projet.publie ? ' edition-realisation__pastille--publie' : ''}`}
              />
              {projet.publie ? 'Publiée' : 'Brouillon (invisible en ligne)'}
            </p>
            <p className="edition-realisation__aide">Cliquez sur un élément de la fiche pour le modifier.</p>
          </div>
          <button type="button" className="admin-icone-bouton admin-icone-bouton--danger" onClick={supprimer} aria-label="Supprimer">
            <IconeAdmin nom="poubelle" />
          </button>
        </div>
      }
    />
  );
}

export default EditionRealisation;
