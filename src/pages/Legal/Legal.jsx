import { useContenu } from '../../cms/ContentProvider';
import Editable from '../../cms/Editable';
import './Legal.css';

/** Texte saisi dans le back-office : ligne vide = paragraphe, « - » en début de ligne = puce. */
function TexteSimple({ texte }) {
  return texte.split(/\n\s*\n/).map((bloc, index) => {
    const lignes = bloc.split('\n').filter((ligne) => ligne.trim());
    if (lignes.length && lignes.every((ligne) => ligne.trim().startsWith('- '))) {
      return (
        <ul className="legal__puces" key={index}>
          {lignes.map((ligne, i) => (
            <li key={i}>{ligne.trim().slice(2)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p className="legal__paragraphe" key={index}>
        {lignes.join(' ')}
      </p>
    );
  });
}

/** Mentions légales ou politique de confidentialité (`cle` : « mentions » ou « confidentialite »). */
function Legal({ cle }) {
  const page = useContenu('legal')[cle];
  const base = `legal.${cle}`;

  return (
    <article className="legal">
      <header className="legal__entete">
        <div className="container">
          <Editable as="h1" className="legal__titre" path={`${base}.titre`}>
            {page.titre}
          </Editable>
          <p className="legal__date">
            Dernière mise à jour : <Editable path={`${base}.miseAJour`}>{page.miseAJour}</Editable>
          </p>
        </div>
      </header>

      <div className="legal__corps container">
        {page.sections.map((section, index) => (
          <section className="legal__section" key={index}>
            {section.titre && (
              <Editable as="h2" className="legal__intertitre" path={`${base}.sections.${index}.titre`}>
                {section.titre}
              </Editable>
            )}
            <Editable as="div" className="legal__texte" path={`${base}.sections.${index}.texte`}>
              <TexteSimple texte={section.texte} />
            </Editable>
          </section>
        ))}
      </div>
    </article>
  );
}

export default Legal;
