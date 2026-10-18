import { Fragment } from 'react';

/**
 * Texte de titre saisi dans le back-office :
 * - « *mot* » : mot mis en couleur ;
 * - retour à la ligne : saut de ligne sur grand écran (espace sur mobile).
 */
function RichText({ text = '', accent = 'brown' }) {
  const accentClass = accent === 'bright' ? 'highlight highlight--bright' : 'highlight';
  const lignes = String(text).split('\n');

  return lignes.map((ligne, indexLigne) => (
    <Fragment key={indexLigne}>
      {indexLigne > 0 && (
        <>
          {' '}
          <br className="break-desktop" />
        </>
      )}
      {ligne.split(/(\*[^*]+\*)/g).map((morceau, index) =>
        morceau.startsWith('*') && morceau.endsWith('*') && morceau.length > 2 ? (
          <span className={accentClass} key={index}>
            {morceau.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={index}>{morceau}</Fragment>
        ),
      )}
    </Fragment>
  ));
}

/** Version texte brut d'un titre (attributs alt, title…). */
export const texteBrut = (text = '') => String(text).replace(/\*/g, '').replace(/\n/g, ' ');

export default RichText;
