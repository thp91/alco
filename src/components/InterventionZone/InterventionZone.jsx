import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import RichText from '../../cms/RichText';
import Icon from '../Icon/Icon';
import './InterventionZone.css';

function InterventionZone() {
  const { zone } = useContenu('general');

  return (
    <section className="intervention-zone" aria-labelledby="intervention-zone-title">
      <div className="intervention-zone__inner container">
        <div className="intervention-zone__visual">
          <Editable as="div" className="intervention-zone__map" path="general.zone.image" image>
            <img className="intervention-zone__map-image" src={zone.image} alt="Carte de France" loading="lazy" />
            <span className="intervention-zone__node intervention-zone__node--north" />
            <span className="intervention-zone__node intervention-zone__node--west" />
            <span className="intervention-zone__node intervention-zone__node--south" />
          </Editable>
          <div className="intervention-zone__card">
            <Editable as="h3" className="intervention-zone__card-title" path="general.zone.carteTitre">
              {zone.carteTitre}
            </Editable>
            <Editable as="p" className="intervention-zone__card-text" path="general.zone.carteTexte">
              {zone.carteTexte}
            </Editable>
          </div>
        </div>

        <div className="intervention-zone__content">
          <Editable as="h2" className="intervention-zone__title" id="intervention-zone-title" path="general.zone.titre">
            <RichText text={zone.titre} accent="bright" />
          </Editable>
          <ul className="intervention-zone__list">
            {zone.liste.map((item, index) => (
              <li className="intervention-zone__item" key={index}>
                <Icon name="location" className="intervention-zone__icon" size={19} />
                <div>
                  <Editable
                    as="strong"
                    className="intervention-zone__item-title"
                    path={`general.zone.liste.${index}.titre`}
                  >
                    {item.titre}
                  </Editable>
                  <Editable as="p" className="intervention-zone__item-text" path={`general.zone.liste.${index}.texte`}>
                    {item.texte}
                  </Editable>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default InterventionZone;
