import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import RichText from '../../cms/RichText';
import Icon from '../Icon/Icon';
import SectionHeading from '../SectionHeading/SectionHeading';
import './Testimonials.css';

function Testimonials() {
  const { avis } = useContenu('general');

  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="testimonials__inner container">
        <SectionHeading>
          <Editable id="testimonials-title" path="general.avis.titre">
            <RichText text={avis.titre} />
          </Editable>
        </SectionHeading>

        <ul className="testimonials__list">
          {avis.liste.map((item, index) => (
            <li className="testimonials__card" key={index}>
              <Editable as="blockquote" className="testimonials__quote" path={`general.avis.liste.${index}.citation`}>
                “{item.citation}”
              </Editable>
              <div className="testimonials__author">
                <span className="testimonials__avatar">
                  <Icon name={item.icone} size={18} />
                </span>
                <Editable className="testimonials__name" path={`general.avis.liste.${index}.auteur`}>
                  {item.auteur}
                </Editable>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Testimonials;
