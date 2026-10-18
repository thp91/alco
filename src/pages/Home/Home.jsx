import { Link } from 'react-router-dom';
import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import RichText from '../../cms/RichText';
import Button from '../../components/Button/Button';
import CountUp from '../../components/CountUp/CountUp';
import CtaBanner from '../../components/CtaBanner/CtaBanner';
import Faq from '../../components/Faq/Faq';
import Icon from '../../components/Icon/Icon';
import InterventionZone from '../../components/InterventionZone/InterventionZone';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import Testimonials from '../../components/Testimonials/Testimonials';
import './Home.css';

function Home() {
  const { hero, services, expertise, raisons, faq } = useContenu('accueil');

  return (
    <>
      <section className="home-hero">
        <img
          className="home-hero__image"
          src={hero.image}
          alt={hero.imageAlt}
          fetchPriority="high"
        />
        <Editable as="div" className="home-hero__overlay" path="accueil.hero.image" image aria-hidden="true" />

        <div className="home-hero__ascender" aria-hidden="true">
          <span className="home-hero__ascender-dot" />
        </div>

        <div className="home-hero__inner container">
          <div className="home-hero__content">
            <Editable as="p" className="home-hero__badge" path="accueil.hero.badge">
              {hero.badge}
            </Editable>
            <Editable as="h1" className="home-hero__title" path="accueil.hero.titre">
              <RichText text={hero.titre} accent="bright" />
            </Editable>
            <Editable as="p" className="home-hero__text" path="accueil.hero.texte">
              {hero.texte}
            </Editable>
            <div className="home-hero__actions">
              <Button href="#services">
                <Editable path="accueil.hero.boutonPrincipal">{hero.boutonPrincipal}</Editable>
                <Icon name="arrowForward" className="button__icon" size={11} />
              </Button>
              <Button href="#expertise" variant="ghost">
                <Editable path="accueil.hero.boutonSecondaire">{hero.boutonSecondaire}</Editable>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services" aria-labelledby="services-title">
        <div className="services__inner container">
          <div className="services__header">
            <div className="services__intro">
              <Editable as="h2" className="services__title" id="services-title" path="accueil.services.titre">
                <RichText text={services.titre} />
              </Editable>
              <Editable as="p" className="services__text" path="accueil.services.texte">
                {services.texte}
              </Editable>
            </div>
            <span className="services__divider" aria-hidden="true" />
          </div>

          <ul className="services__grid">
            {services.liste.map((service, index) => {
              const chemin = `accueil.services.liste.${index}`;
              const content = (
                <>
                  <Icon name={service.icone} className="services__icon" size={30} />
                  <Editable as="h3" className="services__card-title" path={`${chemin}.titre`}>
                    {service.titre}
                  </Editable>
                  <Editable as="p" className="services__card-text" path={`${chemin}.texte`}>
                    {service.texte}
                  </Editable>
                </>
              );
              return (
                <li className="services__item" key={index}>
                  {service.lien ? (
                    <Link to={service.lien} className="services__card services__card--link">
                      {content}
                    </Link>
                  ) : (
                    <div className="services__card">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="expertise" id="expertise" aria-labelledby="expertise-title">
        <div className="expertise__inner container">
          <div className="expertise__visual">
            <span className="expertise__glow" aria-hidden="true" />
            <Editable as="div" className="expertise__frame" path="accueil.expertise.image" image>
              <img className="expertise__image" src={expertise.image} alt={expertise.imageAlt} loading="lazy" />
            </Editable>
            <p className="expertise__stat">
              <Editable path="accueil.expertise.chiffre">
                <CountUp className="expertise__stat-value" value={expertise.chiffre} />
              </Editable>
              <Editable className="expertise__stat-label" path="accueil.expertise.chiffreLibelle">
                {expertise.chiffreLibelle}
              </Editable>
            </p>
          </div>

          <div className="expertise__content">
            <Editable as="p" className="expertise__eyebrow" path="accueil.expertise.surtitre">
              {expertise.surtitre}
            </Editable>
            <Editable as="h2" className="expertise__title" id="expertise-title" path="accueil.expertise.titre">
              <RichText text={expertise.titre} accent="bright" />
            </Editable>
            <div className="expertise__body">
              {expertise.paragraphes.map((paragraphe, index) => (
                <Editable as="p" key={index} path={`accueil.expertise.paragraphes.${index}`}>
                  {paragraphe}
                </Editable>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="reasons" aria-labelledby="reasons-title">
        <div className="reasons__inner container">
          <SectionHeading>
            <Editable id="reasons-title" path="accueil.raisons.titre">
              <RichText text={raisons.titre} />
            </Editable>
          </SectionHeading>

          <ul className="reasons__list">
            {raisons.liste.map((reason, index) => (
              <li className="reasons__card" key={index}>
                <span className="reasons__icon">
                  <Icon name={reason.icone} size={19} />
                </span>
                <Editable as="h3" className="reasons__title" path={`accueil.raisons.liste.${index}.titre`}>
                  {reason.titre}
                </Editable>
                <Editable as="p" className="reasons__text" path={`accueil.raisons.liste.${index}.texte`}>
                  {reason.texte}
                </Editable>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InterventionZone />
      <Testimonials />

      <Faq
        items={faq.liste}
        path="accueil.faq.liste"
        heading={
          <SectionHeading>
            <Editable path="accueil.faq.titre">
              <RichText text={faq.titre} />
            </Editable>
          </SectionHeading>
        }
      />

      <CtaBanner />
    </>
  );
}

export default Home;
