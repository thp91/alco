import { useState } from 'react';
import { estModeEdition } from '../../cms/mode';
import Editable from '../../cms/Editable';
import Icon from '../Icon/Icon';
import './Faq.css';

/** `path` : chemin de la liste dans le contenu (ex. « accueil.faq.liste »). */
function Faq({ items, path, variant = 'default', heading }) {
  const [openIndex, setOpenIndex] = useState(null);
  // Dans l'aperçu de l'éditeur, toutes les réponses sont visibles (et cliquables).
  const toutOuvert = estModeEdition();

  return (
    <section className={`faq faq--${variant}`}>
      <div className="faq__inner container">
        {heading}
        <ul className="faq__list">
          {items.map((item, index) => {
            const isOpen = toutOuvert || openIndex === index;
            const panelId = `faq-${variant}-${index}`;
            return (
              <li className={`faq__item${isOpen ? ' faq__item--open' : ''}`} key={index}>
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <Editable path={`${path}.${index}.question`}>{item.question}</Editable>
                  <Icon name="chevronDown" className="faq__chevron" size={7} />
                </button>
                <div className="faq__answer" id={panelId} role="region" hidden={!isOpen}>
                  <Editable as="p" className="faq__answer-text" path={`${path}.${index}.reponse`}>
                    {item.reponse}
                  </Editable>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Faq;
