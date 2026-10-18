import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.webp';
import { api } from './api';
import { BrouillonsProvider, useBrouillons } from './Brouillons';
import Connexion from './ecrans/Connexion';
import EditeurPage from './ecrans/EditeurPage';
import EditionRealisation from './ecrans/EditionRealisation';
import ListePages from './ecrans/ListePages';
import ListeRealisations from './ecrans/ListeRealisations';
import TableauDeBord from './ecrans/TableauDeBord';
import IconeAdmin from './IconeAdmin';
import './admin.css';

const ContexteSession = createContext(null);
export const useSession = () => useContext(ContexteSession);

const NAVIGATION = [
  { libelle: 'Tableau de bord', to: '/admin', icone: 'maison', end: true },
  { libelle: 'Pages', to: '/admin/pages', icone: 'pages' },
  { libelle: 'Réalisations', to: '/admin/realisations', icone: 'projets' },
];

/** Barre du haut : état des modifications et bouton « Publier ». */
function BarrePublication({ onMenu }) {
  const { modifies, publier, annuler, publication, effacerMessage } = useBrouillons();
  const nombre = modifies.length;

  useEffect(() => {
    if (!publication.message?.ok) return undefined;
    const minuteur = window.setTimeout(effacerMessage, 7000);
    return () => window.clearTimeout(minuteur);
  }, [publication.message, effacerMessage]);

  return (
    <>
      <div className="admin-publication">
        <div className="admin-publication__etat">
          <button type="button" className="admin-icone-bouton admin-burger" onClick={onMenu} aria-label="Menu">
            <IconeAdmin nom="menu" />
          </button>
          <span
            className={`admin-publication__pastille${nombre ? ' admin-publication__pastille--modifie' : ''}`}
            aria-hidden="true"
          />
          <p className="admin-publication__texte">
            {nombre ? (
              <>
                <strong>Modifications non publiées</strong> — visibles seulement ici tant que vous ne publiez pas.
              </>
            ) : (
              'Tout est publié.'
            )}
          </p>
        </div>
        <div className="admin-publication__actions">
          {nombre > 0 && (
            <button
              type="button"
              className="admin-bouton admin-bouton--discret"
              disabled={publication.enCours}
              onClick={() => {
                if (window.confirm('Annuler toutes les modifications non publiées ?')) annuler();
              }}
            >
              <IconeAdmin nom="annuler" taille={16} />
              Annuler
            </button>
          )}
          <button
            type="button"
            className="admin-bouton admin-bouton--primaire"
            disabled={!nombre || publication.enCours}
            onClick={publier}
          >
            <IconeAdmin nom="publier" taille={16} />
            {publication.enCours ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </div>

      {publication.message && (
        <div
          className={`admin-message${publication.message.ok ? '' : ' admin-message--erreur'}`}
          role={publication.message.ok ? 'status' : 'alert'}
        >
          <IconeAdmin nom={publication.message.ok ? 'check' : 'alerte'} className="admin-message__icone" />
          <p>{publication.message.texte}</p>
          <button type="button" className="admin-message__fermer" onClick={effacerMessage} aria-label="Fermer">
            <IconeAdmin nom="fermer" taille={16} />
          </button>
        </div>
      )}
    </>
  );
}

function Structure({ children }) {
  const { session, seDeconnecter } = useSession();
  const { brouillons } = useBrouillons();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { pathname } = useLocation();
  const nombreProjets = brouillons.realisations?.projets.length;

  useEffect(() => setMenuOuvert(false), [pathname]);

  return (
    <div className={`admin-layout${menuOuvert ? ' admin-layout--menu' : ''}`}>
      <aside className="admin-barre">
        <div className="admin-barre__marque">
          <img className="admin-barre__logo" src={logo} alt="" />
          <p className="admin-barre__nom">
            Alco’rope
            <span className="admin-barre__sous-titre">Back-office</span>
          </p>
        </div>

        <nav className="admin-barre__nav" aria-label="Back-office">
          {NAVIGATION.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.end}
              className={({ isActive }) => `admin-barre__lien${isActive ? ' admin-barre__lien--actif' : ''}`}
            >
              <IconeAdmin nom={lien.icone} />
              {lien.libelle}
              {lien.to === '/admin/realisations' && nombreProjets !== undefined && (
                <span className="admin-barre__compteur">{nombreProjets}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-barre__pied">
          <a className="admin-barre__lien" href="/" target="_blank" rel="noopener">
            <IconeAdmin nom="externe" />
            Voir le site
          </a>
          <button type="button" className="admin-barre__lien admin-barre__bouton" onClick={seDeconnecter}>
            <IconeAdmin nom="sortie" />
            Se déconnecter
          </button>
          <p className="admin-barre__compte">{session.email}</p>
        </div>
      </aside>

      <div className="admin-principal">
        <BarrePublication onMenu={() => setMenuOuvert((ouvert) => !ouvert)} />
        {children}
      </div>
    </div>
  );
}

/** Écrans réservés aux comptes connectés. */
function Protege({ children }) {
  const { session } = useSession();
  const { pathname } = useLocation();
  if (session === undefined) return <p className="admin-chargement">Chargement…</p>;
  if (!session.email) return <Navigate to={`/admin/connexion?suite=${encodeURIComponent(pathname)}`} replace />;
  return <Structure>{children}</Structure>;
}

function AdminApp() {
  const [session, setSession] = useState(undefined);
  const navigate = useNavigate();

  const actualiser = useCallback(async () => {
    try {
      setSession(await api.session());
    } catch {
      setSession({ email: null });
    }
  }, []);

  useEffect(() => {
    actualiser();
    document.title = 'Back-office — Alco’rope';
  }, [actualiser]);

  const seDeconnecter = useCallback(async () => {
    await api.deconnexion().catch(() => {});
    setSession({ email: null });
    navigate('/admin/connexion');
  }, [navigate]);

  return (
    <ContexteSession.Provider value={{ session, actualiser, seDeconnecter }}>
      <BrouillonsProvider>
        <div className="admin">
          <Routes>
            <Route path="connexion" element={<Connexion />} />
            <Route index element={<Protege><TableauDeBord /></Protege>} />
            <Route path="pages" element={<Protege><ListePages /></Protege>} />
            <Route path="pages/:page" element={<Protege><EditeurPage /></Protege>} />
            <Route path="realisations" element={<Protege><ListeRealisations /></Protege>} />
            <Route path="realisations/:index" element={<Protege><EditionRealisation /></Protege>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </BrouillonsProvider>
    </ContexteSession.Provider>
  );
}

export default AdminApp;
