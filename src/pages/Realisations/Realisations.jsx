import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import RichText from '../../cms/RichText';
import CtaBanner from '../../components/CtaBanner/CtaBanner';
import Icon from '../../components/Icon/Icon';
import InterventionZone from '../../components/InterventionZone/InterventionZone';
import Testimonials from '../../components/Testimonials/Testimonials';
import './Realisations.css';

function Realisations() {
  const { page, categories, projets } = useContenu('realisations');
  const [activeFilter, setActiveFilter] = useState('all');

  // On garde l'index d'origine : il sert au chemin des champs dans l'éditeur.
  const publies = projets.map((projet, index) => ({ projet, index })).filter(({ projet }) => projet.publie);
  const visibles =
    activeFilter === 'all' ? publies : publies.filter(({ projet }) => projet.filtres.includes(activeFilter));
  const filtres = [{ id: 'all', libelle: page.tousLesProjets }, ...categories];

  return (
    <>
      <section className="portfolio-hero">
        <div className="portfolio-hero__inner container">
          <div className="portfolio-hero__content">
            <Editable as="p" className="portfolio-hero__badge" path="realisations.page.badge">
              {page.badge}
            </Editable>
            <Editable as="h1" className="portfolio-hero__title" path="realisations.page.titre">
              <RichText text={page.titre} accent="bright" />
            </Editable>
            <Editable as="p" className="portfolio-hero__text" path="realisations.page.texte">
              {page.texte}
            </Editable>
          </div>

          <div className="portfolio-hero__visual" aria-hidden="true">
            <span className="portfolio-hero__frame" />
            <span className="portfolio-hero__panel">
              <Icon name="architecture" className="portfolio-hero__icon" size={93} />
            </span>
          </div>
        </div>
      </section>

      <section className="projects" aria-label="Galerie de projets">
        <div className="projects__inner container">
          <div className="projects__filters" role="group" aria-label="Filtrer les projets">
            {filtres.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={`projects__filter${activeFilter === filter.id ? ' projects__filter--active' : ''}`}
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.libelle}
              </button>
            ))}
          </div>

          {visibles.length > 0 ? (
            <ul className="projects__list">
              {visibles.map(({ projet, index }, position) => {
                const chemin = `realisations.projets.${index}`;
                return (
                  <li
                    className={`project-card${position % 2 === 1 ? ' project-card--reversed' : ''}`}
                    key={projet.slug}
                  >
                    <Editable as="div" className="project-card__media" path={`${chemin}.image`} image>
                      <img className="project-card__image" src={projet.image} alt="" loading="lazy" />
                    </Editable>
                    <div className="project-card__body">
                      <Editable as="p" className="project-card__category" path={`${chemin}.categorie`}>
                        {projet.categorie}
                      </Editable>
                      <Editable as="h2" className="project-card__title" path={`${chemin}.titre`}>
                        {projet.titre}
                      </Editable>
                      {projet.resume && (
                        <Editable as="p" className="project-card__excerpt" path={`${chemin}.resume`}>
                          {projet.resume}
                        </Editable>
                      )}
                      <Link className="project-card__link" to={`/realisations/${projet.slug}`}>
                        <Editable path="realisations.page.lienProjet">{page.lienProjet}</Editable>
                        <Icon name="arrowForward" size={9} />
                        <span className="visually-hidden"> : {projet.titre}</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Editable as="p" className="projects__empty" path="realisations.page.aucunProjet">
              {page.aucunProjet}
            </Editable>
          )}
        </div>
      </section>

      <InterventionZone />
      <Testimonials />
      <CtaBanner />
    </>
  );
}

export default Realisations;
