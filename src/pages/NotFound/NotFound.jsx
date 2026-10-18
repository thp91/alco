import { Link } from 'react-router-dom';
import { useContenu } from '../../cms/ContentProvider';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import './NotFound.css';

/** Page introuvable (404) : servie avec le code 404 et exclue de l'indexation. */
function NotFound() {
  const services = useContenu('services');

  return (
    <section className="not-found">
      <div className="not-found__inner container">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <p className="not-found__surtitre">Page introuvable</p>
        <h1 className="not-found__titre">
          Cette page est <span className="highlight highlight--bright">hors de portée</span>
        </h1>
        <p className="not-found__texte">
          L’adresse demandée n’existe pas ou a été déplacée. Même nos cordistes ne l’ont pas trouvée : repartez
          d’une de ces pages.
        </p>
        <div className="not-found__actions">
          <Button to="/">
            Retour à l’accueil
            <Icon name="arrowForward" className="button__icon" size={11} />
          </Button>
          <Button to="/contact" variant="ghost">
            Nous contacter
          </Button>
        </div>

        <nav className="not-found__liens" aria-label="Nos services">
          <p className="not-found__liens-titre">Nos services</p>
          <ul className="not-found__liste">
            {services.map((service) => (
              <li key={service.slug}>
                <Link className="not-found__lien" to={`/services/${service.slug}`}>
                  <Icon name={service.menu.icone} size={16} />
                  {service.menu.titre}
                </Link>
              </li>
            ))}
            <li>
              <Link className="not-found__lien" to="/realisations">
                <Icon name="architecture" size={16} />
                Nos réalisations
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}

export default NotFound;
