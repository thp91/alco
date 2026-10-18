import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useSession } from '../AdminApp';
import { api } from '../api';
import './Connexion.css';

function Connexion() {
  const { session, actualiser } = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [etat, setEtat] = useState({ envoi: false, erreur: null });

  const suite = params.get('suite')?.startsWith('/admin') ? params.get('suite') : '/admin';
  if (session?.email) return <Navigate to={suite} replace />;

  const envoyer = async (event) => {
    event.preventDefault();
    const donnees = new FormData(event.currentTarget);
    setEtat({ envoi: true, erreur: null });
    try {
      await api.connexion(donnees.get('email'), donnees.get('motDePasse'));
      await actualiser();
      navigate(suite, { replace: true });
    } catch (erreur) {
      setEtat({ envoi: false, erreur: erreur.message });
    }
  };

  return (
    <main className="admin-connexion">
      <form className="admin-connexion__carte" onSubmit={envoyer}>
        <img className="admin-connexion__logo" src={logo} alt="Alco'rope" />
        <h1 className="admin-connexion__titre">Back-office</h1>
        <p className="admin-connexion__texte">Connectez-vous pour modifier le contenu du site.</p>

        <label className="admin-champ">
          <span className="admin-champ__label">E-mail</span>
          <input className="admin-champ__input" name="email" type="email" autoComplete="username" required />
        </label>
        <label className="admin-champ">
          <span className="admin-champ__label">Mot de passe</span>
          <input
            className="admin-champ__input"
            name="motDePasse"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {etat.erreur && (
          <p className="admin-alerte admin-alerte--erreur" role="alert">
            {etat.erreur}
          </p>
        )}

        <button type="submit" className="admin-bouton admin-bouton--sombre admin-connexion__bouton" disabled={etat.envoi}>
          {etat.envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}

export default Connexion;
