import { Navigate, useParams } from 'react-router-dom';
import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import RichText from '../../cms/RichText';
import CtaBanner from '../../components/CtaBanner/CtaBanner';
import Faq from '../../components/Faq/Faq';
import Icon from '../../components/Icon/Icon';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import Testimonials from '../../components/Testimonials/Testimonials';
import './Service.css';

function Service() {
  const { slug } = useParams();
  const services = useContenu('services');
  const index = services.findIndex((page) => page.slug === slug);

  if (index === -1) return <Navigate to="/" replace />;

  const page = services[index];
  const base = `services.${index}`;
  const { hero, raisons, approche, faq } = page;

  return (
    <>
      <section className="page-hero">
        <img className="page-hero__image" src={hero.image} alt="" />
        <Editable as="div" className="page-hero__overlay" path={`${base}.hero.image`} image aria-hidden="true" />
        <div className="page-hero__ascender" aria-hidden="true">
          <span className="page-hero__ascender-dot" />
        </div>

        <div className="page-hero__inner container">
          <Editable as="p" className="page-hero__eyebrow" path={`${base}.hero.surtitre`}>
            {hero.surtitre}
          </Editable>
          <Editable as="h1" className="page-hero__title" path={`${base}.hero.titre`}>
            <RichText text={hero.titre} accent="bright" />
          </Editable>
          <Editable as="p" className="page-hero__text" path={`${base}.hero.texte`}>
            {hero.texte}
          </Editable>
        </div>
      </section>

      <section className="strengths" aria-labelledby="strengths-title">
        <div className="strengths__inner container">
          <SectionHeading align="left" size="small">
            <Editable id="strengths-title" path={`${base}.raisons.titre`}>
              <RichText text={raisons.titre} />
            </Editable>
          </SectionHeading>

          <ul className="strengths__list">
            {raisons.liste.map((item, i) => {
              const chemin = `${base}.raisons.liste.${i}`;
              return (
                <li className={`strengths__item${item.image ? '' : ' strengths__item--icon'}`} key={i}>
                  <Editable as="div" className="strengths__media" path={`${chemin}.image`} image>
                    {item.image ? (
                      <img className="strengths__image" src={item.image} alt="" loading="lazy" />
                    ) : (
                      <Icon name={item.icone} className="strengths__icon" size={56} />
                    )}
                  </Editable>
                  <Editable as="h3" className="strengths__title" path={`${chemin}.titre`}>
                    {item.titre}
                  </Editable>
                  <Editable as="p" className="strengths__text" path={`${chemin}.texte`}>
                    {item.texte}
                  </Editable>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="approach" aria-labelledby="approach-title">
        <div className="approach__inner container">
          <div className="approach__content">
            <span className="approach__glow" aria-hidden="true" />
            <div className="approach__intro">
              <Editable as="h2" className="approach__title" id="approach-title" path={`${base}.approche.titre`}>
                <RichText text={approche.titre} />
              </Editable>
              <Editable as="p" className="approach__text" path={`${base}.approche.texte`}>
                {approche.texte}
              </Editable>
            </div>

            <ol className="approach__steps" aria-label="Fonctionnement">
              {approche.etapes.map((step, i) => (
                <li className="approach__step" key={i}>
                  <span className="approach__step-number">{String(i + 1).padStart(2, '0')}</span>
                  <div className="approach__step-body">
                    <Editable as="h3" className="approach__step-title" path={`${base}.approche.etapes.${i}.titre`}>
                      {step.titre}
                    </Editable>
                    <Editable as="p" className="approach__step-text" path={`${base}.approche.etapes.${i}.texte`}>
                      {step.texte}
                    </Editable>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="approach__visual">
            <Editable
              as="img"
              className="approach__image"
              src={approche.image}
              alt={approche.imageAlt}
              loading="lazy"
              path={`${base}.approche.image`}
              image
            />
            {approche.carteTitre && (
              <div className="approach__card">
                <Icon name="compass" className="approach__card-icon" size={35} />
                <Editable as="h3" className="approach__card-title" path={`${base}.approche.carteTitre`}>
                  {approche.carteTitre}
                </Editable>
                <Editable as="p" className="approach__card-text" path={`${base}.approche.carteTexte`}>
                  {approche.carteTexte}
                </Editable>
              </div>
            )}
          </div>
        </div>
      </section>

      <Faq
        key={page.slug}
        items={faq.liste}
        path={`${base}.faq.liste`}
        variant="soft"
        heading={
          <SectionHeading
            className="section-heading--no-bar"
            size="small"
            subtitle={
              faq.sousTitre && (
                <Editable path={`${base}.faq.sousTitre`}>{faq.sousTitre}</Editable>
              )
            }
          >
            <Editable path={`${base}.faq.titre`}>
              <RichText text={faq.titre} />
            </Editable>
          </SectionHeading>
        }
      />

      <Testimonials />
      <CtaBanner />
    </>
  );
}

export default Service;
