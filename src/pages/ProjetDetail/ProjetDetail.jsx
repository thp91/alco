import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContenu } from '../../cms/ContentProvider';
import { estModeEdition } from '../../cms/mode';
import Editable from '../../cms/Editable';
import { estDetaille } from '../../cms/format';
import Button from '../../components/Button/Button';
import CountUp from '../../components/CountUp/CountUp';
import CtaBanner from '../../components/CtaBanner/CtaBanner';
import Icon from '../../components/Icon/Icon';
import NotFound from '../NotFound/NotFound';
import './ProjetDetail.css';

function ProjetDetail() {
  const { slug } = useParams();
  const { detail: textes, projets } = useContenu('realisations');
  const carouselRef = useRef(null);

  const index = projets.findIndex((projet) => projet.slug === slug);
  const projet = projets[index];
  // Dans l'aperçu du back-office, le brouillon (nouvelle réalisation) arrive juste après.
  if (!projet && estModeEdition()) return <p className="project-pending container">Chargement de l’aperçu…</p>;
  // Un brouillon n'est visible que dans l'aperçu du back-office.
  if (!projet || (!projet.publie && !estModeEdition())) return <NotFound />;

  const base = `realisations.projets.${index}`;
  const detaille = estDetaille(projet);
  const autres = projets.filter((autre) => autre.publie && autre.slug !== projet.slug).slice(0, 6);

  const scrollCarousel = (direction) => {
    const track = carouselRef.current;
    if (!track) return;
    const card = track.querySelector('.similar__item');
    const step = card ? card.getBoundingClientRect().width + 32 : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <>
      <section className="project-hero">
        <img
          className="project-hero__image"
          src={projet.imageDetail || projet.image}
          alt={`Chantier ${projet.titre}`}
          fetchPriority="high"
        />
        <Editable
          as="div"
          className="project-hero__overlay"
          path={`${base}.${projet.imageDetail ? 'imageDetail' : 'image'}`}
          image
          aria-hidden="true"
        />

        <div className="project-hero__scroll" aria-hidden="true">
          <span className="project-hero__scroll-label">Découvrir</span>
          <span className="project-hero__scroll-line" />
        </div>

        <div className="project-hero__inner container">
          <Editable
            as="p"
            className="project-hero__eyebrow"
            path={`${base}.${projet.surtitre ? 'surtitre' : 'categorie'}`}
          >
            {projet.surtitre || projet.categorie}
          </Editable>
          <Editable
            as="h1"
            className="project-hero__title"
            path={`${base}.${projet.titreDetail ? 'titreDetail' : 'titre'}`}
          >
            {projet.titreDetail || projet.titre}
          </Editable>

          {projet.stats.length > 0 && (
            <dl className="project-hero__stats">
              {projet.stats.map((stat, i) => (
                <div className="project-hero__stat" key={i}>
                  <Editable as="dt" className="project-hero__stat-label" path={`${base}.stats.${i}.libelle`}>
                    {stat.libelle}
                  </Editable>
                  <Editable as="dd" className="project-hero__stat-value" path={`${base}.stats.${i}.valeur`}>
                    {stat.accent ? (
                      <>
                        <span className="project-hero__stat-number">{stat.valeur}</span> {stat.unite}
                      </>
                    ) : (
                      `${stat.valeur}${stat.unite ? ` ${stat.unite}` : ''}`
                    )}
                  </Editable>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {detaille ? (
        <div className="project-detail container">
          <div className="project-detail__main">
            <section className="project-detail__story" aria-label="Le défi et notre solution">
              <article className="story-card story-card--challenge">
                <span className="story-card__number">01</span>
                <Editable as="h2" className="story-card__title" path="realisations.detail.defiTitre">
                  {textes.defiTitre}
                </Editable>
                <Editable as="p" className="story-card__text" path={`${base}.defi`}>
                  {projet.defi}
                </Editable>
              </article>
              <article className="story-card story-card--solution">
                <span className="story-card__number">02</span>
                <Editable as="h2" className="story-card__title" path="realisations.detail.solutionTitre">
                  {textes.solutionTitre}
                </Editable>
                <Editable as="p" className="story-card__text" path={`${base}.solution`}>
                  {projet.solution}
                </Editable>
              </article>
            </section>

            {projet.galerie.length > 0 && (
              <section className="project-gallery" aria-labelledby="project-gallery-title">
                <div className="project-gallery__header">
                  <Editable
                    as="h2"
                    className="project-gallery__title"
                    id="project-gallery-title"
                    path="realisations.detail.galerieTitre"
                  >
                    {textes.galerieTitre}
                  </Editable>
                  <p className="project-gallery__count">
                    {projet.galerie.length}{' '}
                    <Editable path="realisations.detail.galerieCompteur">{textes.galerieCompteur}</Editable>
                  </p>
                </div>
                <div className="project-gallery__grid">
                  {projet.galerie.map((photo, i) => (
                    <Editable
                      as="figure"
                      className={`project-gallery__item${i === 0 ? ' project-gallery__item--large' : ''}`}
                      key={i}
                      path={`${base}.galerie.${i}.image`}
                      image
                    >
                      <img className="project-gallery__image" src={photo.image} alt={photo.alt} loading="lazy" />
                    </Editable>
                  ))}
                </div>
              </section>
            )}

            {projet.resultats.length > 0 && (
              <section className="project-results" aria-label="Résultats">
                <span className="project-results__glow" aria-hidden="true" />
                <ul className="project-results__list">
                  {projet.resultats.map((resultat, i) => (
                    <li className="project-results__item" key={i}>
                      <Editable path={`${base}.resultats.${i}.valeur`}>
                        <CountUp className="project-results__value" value={resultat.valeur} />
                      </Editable>
                      <Editable as="p" className="project-results__text" path={`${base}.resultats.${i}.texte`}>
                        {resultat.texte}
                      </Editable>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="project-sheet" aria-labelledby="project-sheet-title">
            <h2 className="project-sheet__title" id="project-sheet-title">
              <Icon name="description" className="project-sheet__icon" size={19} />
              <Editable path="realisations.detail.ficheTitre">{textes.ficheTitre}</Editable>
            </h2>
            <dl className="project-sheet__list">
              {projet.maitreOuvrage && (
                <div className="project-sheet__row">
                  <dt className="project-sheet__label">Maître d’ouvrage</dt>
                  <Editable as="dd" className="project-sheet__value" path={`${base}.maitreOuvrage`}>
                    {projet.maitreOuvrage}
                  </Editable>
                </div>
              )}
              {projet.duree && (
                <div className="project-sheet__row">
                  <dt className="project-sheet__label">Durée du chantier</dt>
                  <Editable as="dd" className="project-sheet__value" path={`${base}.duree`}>
                    {projet.duree}
                  </Editable>
                </div>
              )}
              {projet.expertises.length > 0 && (
                <div className="project-sheet__row">
                  <dt className="project-sheet__label">Expertises déployées</dt>
                  <dd>
                    <ul className="project-sheet__bullets">
                      {projet.expertises.map((item, i) => (
                        <Editable as="li" className="project-sheet__bullet" key={i} path={`${base}.expertises.${i}`}>
                          {item}
                        </Editable>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {projet.normes.length > 0 && (
                <div className="project-sheet__row">
                  <dt className="project-sheet__label">Normes de sécurité</dt>
                  <dd>
                    <ul className="project-sheet__tags">
                      {projet.normes.map((norme, i) => (
                        <Editable as="li" className="project-sheet__tag" key={i} path={`${base}.normes.${i}`}>
                          {norme}
                        </Editable>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      ) : (
        <section className="project-pending container">
          <Editable as="p" className="project-pending__text" path="realisations.detail.enAttente">
            {textes.enAttente}
          </Editable>
          <Button to="/contact">Nous contacter</Button>
        </section>
      )}

      {autres.length > 0 && (
        <section className="similar" aria-labelledby="similar-title">
          <div className="similar__inner container">
            <div className="similar__header">
              <div className="similar__intro">
                <Editable as="h2" className="similar__title" id="similar-title" path="realisations.detail.similairesTitre">
                  {textes.similairesTitre}
                </Editable>
                <Editable as="p" className="similar__text" path="realisations.detail.similairesTexte">
                  {textes.similairesTexte}
                </Editable>
              </div>
              <div className="similar__controls">
                <button type="button" className="similar__arrow" onClick={() => scrollCarousel(-1)}>
                  <span className="visually-hidden">Projets précédents</span>
                  <Icon name="chevronLeft" size={11} />
                </button>
                <button type="button" className="similar__arrow" onClick={() => scrollCarousel(1)}>
                  <span className="visually-hidden">Projets suivants</span>
                  <Icon name="chevronRight" size={11} />
                </button>
              </div>
            </div>

            <ul className="similar__track" ref={carouselRef}>
              {autres.map((item) => (
                <li className="similar__item" key={item.slug}>
                  <Link to={`/realisations/${item.slug}`} className="similar__card">
                    <img className="similar__image" src={item.image} alt={`Chantier ${item.titre}`} loading="lazy" />
                    <span className="similar__overlay" aria-hidden="true" />
                    <span className="similar__caption">
                      <span className="similar__category">{item.categorie}</span>
                      <span className="similar__name">{item.titre}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}

export default ProjetDetail;
