import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import { lienTelephone } from '../../cms/format';
import { navLinks } from '../../data/navigation';
import Icon from '../Icon/Icon';
import './Footer.css';

const footerNav = [
  { ...navLinks[0] },
  { ...navLinks[1], label: 'Nos Services' },
  { ...navLinks[2] },
  { ...navLinks[3], label: 'Nous Contacter' },
];

const legalLinks = ['Mentions Légales', 'Politique de Confidentialité', 'CGU'];

function Footer() {
  const { coordonnees, piedDePage } = useContenu('general');

  return (
    <footer className="footer">
      <div className="footer__main container">
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="Alco'rope — accueil">
            <img className="footer__logo-image" src={logo} alt="Alco'rope" width="129" height="86" />
          </Link>
          <Editable as="p" className="footer__tagline" path="general.piedDePage.accroche">
            {piedDePage.accroche}
          </Editable>
        </div>

        <nav className="footer__column" aria-labelledby="footer-nav-title">
          <h2 className="footer__title" id="footer-nav-title">
            Navigation
          </h2>
          <ul className="footer__list">
            {footerNav.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `footer__link${isActive ? ' footer__link--active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__column">
          <h2 className="footer__title">Contact</h2>
          <ul className="footer__list">
            <li className="footer__contact">
              <Icon name="location" className="footer__icon" size={14} />
              <address className="footer__address">
                <Editable path="general.coordonnees.adresseLigne1">{coordonnees.adresseLigne1}</Editable>
                <br />
                <Editable path="general.coordonnees.adresseLigne2">{coordonnees.adresseLigne2}</Editable>
              </address>
            </li>
            <li className="footer__contact">
              <Icon name="phone" className="footer__icon" size={14} />
              <Editable
                as="a"
                className="footer__link"
                href={lienTelephone(coordonnees.telephone)}
                path="general.coordonnees.telephone"
              >
                {coordonnees.telephone}
              </Editable>
            </li>
            <li className="footer__contact">
              <Icon name="mail" className="footer__icon" size={11} />
              <Editable
                as="a"
                className="footer__link"
                href={`mailto:${coordonnees.email}`}
                path="general.coordonnees.email"
              >
                {coordonnees.email}
              </Editable>
            </li>
          </ul>
        </div>

        <div className="footer__column">
          <h2 className="footer__title">Informations</h2>
          <ul className="footer__list">
            {legalLinks.map((label) => (
              <li key={label}>
                <a className="footer__link" href="#">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner container">
          <p className="footer__copyright">
            © {new Date().getFullYear()}{' '}
            <Editable path="general.piedDePage.mentions">{piedDePage.mentions}</Editable>
          </p>
          <Editable as="p" className="footer__motto" path="general.piedDePage.devise">
            {piedDePage.devise}
          </Editable>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
