import { useState } from 'react';
import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import { lienTelephone } from '../../cms/format';
import RichText from '../../cms/RichText';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import './Contact.css';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  message: '',
};

function Contact() {
  const { hero, formulaire, coordonnees: textes } = useContenu('contact');
  const { coordonnees } = useContenu('general');
  const projectTypes = formulaire.typesProjet;
  const [form, setForm] = useState({ ...initialForm, projectType: projectTypes[0] ?? '' });
  const [isSent, setIsSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  // Pas de backend dans la maquette : l'envoi est simulé côté client.
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSent(true);
    setForm({ ...initialForm, projectType: projectTypes[0] ?? '' });
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <span className="contact-hero__accent" aria-hidden="true" />
        <div className="contact-hero__inner container">
          <Editable as="p" className="contact-hero__badge" path="contact.hero.badge">
            {hero.badge}
          </Editable>
          <Editable as="h1" className="contact-hero__title" path="contact.hero.titre">
            <RichText text={hero.titre} accent="bright" />
          </Editable>
          <Editable as="p" className="contact-hero__text" path="contact.hero.texte">
            {hero.texte}
          </Editable>
        </div>
      </section>

      <div className="contact-grid container">
        <section className="contact-form" aria-labelledby="contact-form-title">
          <Editable as="h2" className="contact-form__title" id="contact-form-title" path="contact.formulaire.titre">
            {formulaire.titre}
          </Editable>
          <Editable as="p" className="contact-form__subtitle" path="contact.formulaire.sousTitre">
            {formulaire.sousTitre}
          </Editable>

          <form className="contact-form__form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="contact-name">
                  Nom complet
                </label>
                <input
                  className="contact-form__input"
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jean Dupont"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="contact-email">
                  Email professionnel
                </label>
                <input
                  className="contact-form__input"
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="contact@entreprise.fr"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="contact-form__row">
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="contact-phone">
                  Téléphone
                </label>
                <input
                  className="contact-form__input"
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+33 1 00 00 00 00"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="contact-type">
                  Type de projet
                </label>
                <div className="contact-form__select-wrapper">
                  <select
                    className="contact-form__input contact-form__input--select"
                    id="contact-type"
                    name="projectType"
                    value={form.projectType}
                    onChange={handleChange}
                  >
                    {projectTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  <Icon name="chevronDown" className="contact-form__select-icon" size={6} />
                </div>
              </div>
            </div>

            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-message">
                Description du besoin
              </label>
              <textarea
                className="contact-form__input contact-form__input--textarea"
                id="contact-message"
                name="message"
                rows="4"
                placeholder="Détaillez votre projet et les contraintes d’accès..."
                required
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="button--block contact-form__submit">
              <Editable path="contact.formulaire.bouton">{formulaire.bouton}</Editable>
              <Icon name="arrowForward" className="button__icon" size={13} />
            </Button>

            {isSent && (
              <Editable as="p" className="contact-form__success" role="status" path="contact.formulaire.confirmation">
                {formulaire.confirmation}
              </Editable>
            )}
          </form>
        </section>

        <aside className="contact-info" aria-label="Coordonnées">
          <Editable as="div" className="contact-info__map" path="contact.coordonnees.image" image>
            <img className="contact-info__map-image" src={textes.image} alt={textes.imageAlt} loading="lazy" />
          </Editable>

          <div className="contact-info__grid">
            <a className="contact-info__card" href={lienTelephone(coordonnees.telephone)}>
              <Icon name="phone" className="contact-info__icon" size={18} />
              <Editable className="contact-info__label" path="contact.coordonnees.telephoneTitre">
                {textes.telephoneTitre}
              </Editable>
              <Editable className="contact-info__value" path="general.coordonnees.telephone">
                {coordonnees.telephone}
              </Editable>
            </a>
            <a className="contact-info__card" href={`mailto:${coordonnees.email}`}>
              <Icon name="at" className="contact-info__icon" size={20} />
              <Editable className="contact-info__label" path="contact.coordonnees.emailTitre">
                {textes.emailTitre}
              </Editable>
              <Editable className="contact-info__value" path="general.coordonnees.email">
                {coordonnees.email}
              </Editable>
            </a>
            <div className="contact-info__card contact-info__card--wide">
              <span className="contact-info__icon-box">
                <Icon name="apartment" className="contact-info__icon" size={18} />
              </span>
              <div>
                <Editable className="contact-info__label" path="contact.coordonnees.adresseTitre">
                  {textes.adresseTitre}
                </Editable>
                <address className="contact-info__address">
                  <Editable path="general.coordonnees.adresseLigne1">{coordonnees.adresseLigne1}</Editable>
                  <br />
                  <Editable path="general.coordonnees.adresseLigne2">{coordonnees.adresseLigne2}</Editable>
                </address>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
