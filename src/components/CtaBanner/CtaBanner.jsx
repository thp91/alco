import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import { lienTelephone } from '../../cms/format';
import RichText from '../../cms/RichText';
import Button from '../Button/Button';
import './CtaBanner.css';

function CtaBanner() {
  const { appel } = useContenu('general');

  return (
    <section className="cta-banner" aria-labelledby="cta-banner-title">
      <div className="cta-banner__inner container">
        <div className="cta-banner__card">
          <div className="cta-banner__content">
            <Editable as="h2" className="cta-banner__title" id="cta-banner-title" path="general.appel.titre">
              <RichText text={appel.titre} />
            </Editable>
            <Editable as="p" className="cta-banner__text" path="general.appel.texte">
              {appel.texte}
            </Editable>
          </div>

          <div className="cta-banner__actions">
            <Button to="/contact" size="large" className="button--block">
              <Editable path="general.appel.bouton">{appel.bouton}</Editable>
            </Button>
            <Editable
              as="a"
              className="cta-banner__phone"
              href={lienTelephone(appel.telephone)}
              path="general.appel.telephone"
            >
              {appel.telephone}
            </Editable>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
