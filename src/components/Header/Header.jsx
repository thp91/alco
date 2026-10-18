import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.webp';
import { useContenu } from '../../cms/ContentProvider';
import { navLinks } from '../../data/navigation';
import Button from '../Button/Button';
import { lockScroll } from '../../lib/smoothScroll';
import Icon from '../Icon/Icon';
import './Header.css';

const SCROLLED_THRESHOLD = 24;
const HIDE_THRESHOLD = 320;

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { pathname } = useLocation();
  const services = useContenu('services');
  const isServicesActive = pathname.startsWith('/services');

  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(isOpen);
    return () => lockScroll(false);
  }, [isOpen]);

  // Compacte le header au défilement, le masque en descendant et le réaffiche en remontant
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = null;

    const update = () => {
      frame = null;
      const y = window.scrollY;
      setIsScrolled(y > SCROLLED_THRESHOLD);
      if (Math.abs(y - lastY) > 4) {
        setIsHidden(y > lastY && y > HIDE_THRESHOLD);
        lastY = y;
      }
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const headerClasses = [
    'header',
    isOpen && 'header--open',
    isScrolled && 'header--scrolled',
    isHidden && !isOpen && !isServicesOpen && 'header--hidden',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClasses}>
      <div className="header__inner container">
        <Link to="/" className="header__logo" aria-label="Alco'rope — accueil">
          <img className="header__logo-image" src={logo} alt="Alco'rope" width="120" height="80" />
        </Link>

        <nav className="header__nav" id="main-navigation" aria-label="Navigation principale" data-lenis-prevent>
          <ul className="header__list">
            {navLinks.map((link) =>
              link.isServices ? (
                <li
                  className={`header__item header__item--dropdown${isServicesOpen ? ' header__item--expanded' : ''}`}
                  key={link.to}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setIsServicesOpen(false);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setIsServicesOpen(false);
                  }}
                >
                  <button
                    type="button"
                    className={`header__link header__toggle${isServicesActive ? ' header__link--active' : ''}`}
                    aria-expanded={isServicesOpen}
                    aria-controls="services-submenu"
                    onClick={() => setIsServicesOpen((open) => !open)}
                  >
                    {link.label}
                    <Icon name="chevronDown" className="header__toggle-icon" size={6} />
                  </button>
                  <ul className="header__submenu" id="services-submenu">
                    {services.map((service) => (
                      <li key={service.slug}>
                        <NavLink
                          to={`/services/${service.slug}`}
                          className={({ isActive }) =>
                            `header__sublink${isActive ? ' header__sublink--active' : ''}`
                          }
                        >
                          <Icon name={service.menu.icone} className="header__sublink-icon" size={18} />
                          {service.menu.titre}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="header__item" key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `header__link${isActive ? ' header__link--active' : ''}`}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
          <Button to="/contact" variant="solid" size="small" className="header__cta header__cta--mobile">
            Obtenir un devis
          </Button>
        </nav>

        <Button to="/contact" variant="solid" size="small" className="header__cta">
          Obtenir un devis
        </Button>

        <button
          type="button"
          className="header__burger"
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="visually-hidden">{isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          <span className="header__burger-line" />
          <span className="header__burger-line" />
          <span className="header__burger-line" />
        </button>
      </div>
    </header>
  );
}

export default Header;
