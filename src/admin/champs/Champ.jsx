import { createContext, useContext, useRef, useState } from 'react';
import { elementVide, ICONES } from '../../../shared/schema';
import Icon from '../../components/Icon/Icon';
import IconeAdmin from '../IconeAdmin';
import { slugifier } from '../outils';
import './Champ.css';

/**
 * Contexte des champs : champ actif (synchronisé avec l'aperçu), envoi d'images,
 * catégories disponibles pour les filtres de réalisations.
 */
export const ContexteChamps = createContext({
  actif: null,
  focaliser: () => {},
  envoyerImage: async () => '',
  urlImage: (chemin) => chemin,
  categories: [],
});

const useChamps = () => useContext(ContexteChamps);

function Etiquette({ htmlFor, noeud }) {
  return (
    <label className="admin-champ__label" htmlFor={htmlFor}>
      {noeud.libelle}
      {noeud.optionnel && <span className="admin-champ__optionnel"> · facultatif</span>}
    </label>
  );
}

function Aide({ children }) {
  return children ? <p className="admin-champ__aide">{children}</p> : null;
}

function ChampTexte({ noeud, valeur, chemin, onChange }) {
  const { actif, focaliser } = useChamps();
  const multiligne = noeud.type === 'texteLong' || noeud.type === 'titre';
  const lignes = noeud.type === 'titre' ? 2 : Math.min(10, Math.max(3, Math.ceil(valeur.length / 60) + 1));
  const Balise = multiligne ? 'textarea' : 'input';

  return (
    <div className={`admin-champ${actif === chemin ? ' admin-champ--actif' : ''}`} data-champ={chemin}>
      <Etiquette htmlFor={chemin} noeud={noeud} />
      <Balise
        id={chemin}
        className={`admin-champ__input${multiligne ? ' admin-champ__input--zone' : ''}`}
        value={valeur}
        rows={multiligne ? lignes : undefined}
        readOnly={noeud.verrouille}
        onFocus={() => focaliser(chemin)}
        onChange={(event) => onChange(noeud.type === 'slug' ? slugifier(event.target.value) : event.target.value)}
      />
      <Aide>
        {noeud.type === 'titre'
          ? 'Entourez un mot d’astérisques pour le mettre en couleur (*mot*). Retour à la ligne = saut de ligne.'
          : noeud.aide}
      </Aide>
    </div>
  );
}

function ChampImage({ noeud, valeur, chemin, onChange }) {
  const { actif, focaliser, envoyerImage, urlImage } = useChamps();
  const entree = useRef(null);
  const [etat, setEtat] = useState({ envoi: false, erreur: null });

  const choisir = async (fichier) => {
    setEtat({ envoi: true, erreur: null });
    try {
      onChange(await envoyerImage(fichier));
      setEtat({ envoi: false, erreur: null });
    } catch (erreur) {
      setEtat({ envoi: false, erreur: erreur.message ?? 'Envoi impossible.' });
    }
  };

  return (
    <div className={`admin-champ${actif === chemin ? ' admin-champ--actif' : ''}`} data-champ={chemin}>
      <span className="admin-champ__label">
        {noeud.libelle}
        {noeud.optionnel && <span className="admin-champ__optionnel"> · facultatif</span>}
      </span>
      <div className="admin-image">
        {valeur ? (
          <img className="admin-image__apercu" src={urlImage(valeur)} alt="" />
        ) : (
          <span className="admin-image__apercu admin-image__apercu--vide">
            <IconeAdmin nom="image" taille={22} />
          </span>
        )}
        <div className="admin-image__infos">
          <p className="admin-image__nom">{etat.envoi ? 'Envoi en cours…' : valeur ? valeur.split('/').pop() : 'Aucune image'}</p>
          <div className="admin-image__actions">
            <button
              type="button"
              className="admin-bouton admin-bouton--petit"
              disabled={etat.envoi}
              onClick={() => {
                focaliser(chemin);
                entree.current?.click();
              }}
            >
              {valeur ? 'Remplacer' : 'Choisir une image'}
            </button>
            {valeur && noeud.optionnel && (
              <button type="button" className="admin-bouton admin-bouton--petit admin-bouton--discret" onClick={() => onChange('')}>
                Retirer
              </button>
            )}
          </div>
        </div>
        <input
          ref={entree}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="visually-hidden"
          aria-label={`Choisir : ${noeud.libelle}`}
          onChange={(event) => {
            const fichier = event.target.files?.[0];
            if (fichier) choisir(fichier);
            event.target.value = '';
          }}
        />
      </div>
      {etat.erreur && <p className="admin-champ__erreur">{etat.erreur}</p>}
      <Aide>{noeud.aide}</Aide>
    </div>
  );
}

function ChampIcone({ noeud, valeur, chemin, onChange }) {
  const { actif, focaliser } = useChamps();
  return (
    <fieldset className={`admin-champ${actif === chemin ? ' admin-champ--actif' : ''}`} data-champ={chemin}>
      <legend className="admin-champ__label">{noeud.libelle}</legend>
      <div className="admin-icones" role="radiogroup">
        {Object.entries(ICONES).map(([nom, libelle]) => (
          <button
            type="button"
            key={nom}
            role="radio"
            aria-checked={valeur === nom}
            title={libelle}
            aria-label={libelle}
            className={`admin-icones__choix${valeur === nom ? ' admin-icones__choix--actif' : ''}`}
            onClick={() => {
              focaliser(chemin);
              onChange(nom);
            }}
          >
            <Icon name={nom} size={18} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ChampBooleen({ noeud, valeur, chemin, onChange }) {
  return (
    <div className="admin-champ admin-champ--ligne" data-champ={chemin}>
      <label className="admin-interrupteur" htmlFor={chemin}>
        <input
          id={chemin}
          type="checkbox"
          className="admin-interrupteur__case"
          checked={valeur}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="admin-interrupteur__piste" aria-hidden="true" />
        <span className="admin-interrupteur__libelle">{noeud.libelle}</span>
      </label>
    </div>
  );
}

function ChampCategories({ noeud, valeur, chemin, onChange }) {
  const { categories } = useChamps();
  return (
    <fieldset className="admin-champ" data-champ={chemin}>
      <legend className="admin-champ__label">{noeud.libelle}</legend>
      <div className="admin-puces">
        {categories.map((categorie) => {
          const coche = valeur.includes(categorie.id);
          return (
            <label className={`admin-puces__puce${coche ? ' admin-puces__puce--active' : ''}`} key={categorie.id}>
              <input
                type="checkbox"
                className="visually-hidden"
                checked={coche}
                onChange={() =>
                  onChange(coche ? valeur.filter((id) => id !== categorie.id) : [...valeur, categorie.id])
                }
              />
              {coche && <IconeAdmin nom="check" taille={14} />}
              {categorie.libelle}
            </label>
          );
        })}
      </div>
      <Aide>{noeud.aide}</Aide>
    </fieldset>
  );
}

/** Boutons déplacer / supprimer d'un élément de liste. */
function ActionsElement({ index, total, onDeplacer, onSupprimer, nom }) {
  return (
    <div className="admin-liste__actions">
      <button type="button" className="admin-icone-bouton" disabled={index === 0} onClick={() => onDeplacer(-1)} aria-label="Monter">
        <IconeAdmin nom="haut" taille={16} />
      </button>
      <button
        type="button"
        className="admin-icone-bouton"
        disabled={index === total - 1}
        onClick={() => onDeplacer(1)}
        aria-label="Descendre"
      >
        <IconeAdmin nom="bas" taille={16} />
      </button>
      {onSupprimer && (
        <button
          type="button"
          className="admin-icone-bouton admin-icone-bouton--danger"
          onClick={onSupprimer}
          aria-label={`Supprimer ce ${nom}`}
        >
          <IconeAdmin nom="poubelle" taille={16} />
        </button>
      )}
    </div>
  );
}

const deplacer = (liste, index, sens) => {
  const copie = [...liste];
  const [element] = copie.splice(index, 1);
  copie.splice(index + sens, 0, element);
  return copie;
};

const TYPES_TEXTE = ['texte', 'titre', 'texteLong'];

/** Résumé d'un élément de liste : son premier texte renseigné. */
const resume = (element, champs) =>
  Object.entries(champs)
    .filter(([, sous]) => TYPES_TEXTE.includes(sous.type))
    .map(([nom]) => element[nom])
    .find((v) => typeof v === 'string' && v.trim())
    ?.replace(/\*/g, '') ?? '';

function ChampListeTextes({ noeud, valeur, chemin, onChange }) {
  const { actif, focaliser } = useChamps();
  const nom = noeud.nomElement ?? 'élément';
  const Balise = noeud.element === 'texteLong' ? 'textarea' : 'input';

  return (
    <fieldset className="admin-champ" data-champ={chemin}>
      <legend className="admin-champ__label">{noeud.libelle}</legend>
      <div className="admin-liste admin-liste--compacte">
        {valeur.map((texte, index) => {
          const sousChemin = `${chemin}.${index}`;
          return (
            <div
              className={`admin-liste__ligne${actif === sousChemin ? ' admin-liste__ligne--actif' : ''}`}
              key={index}
              data-champ={sousChemin}
            >
              <Balise
                className={`admin-champ__input${Balise === 'textarea' ? ' admin-champ__input--zone' : ''}`}
                value={texte}
                rows={Balise === 'textarea' ? 4 : undefined}
                aria-label={`${noeud.libelle} ${index + 1}`}
                onFocus={() => focaliser(sousChemin)}
                onChange={(event) => onChange(valeur.map((v, i) => (i === index ? event.target.value : v)))}
              />
              <ActionsElement
                index={index}
                total={valeur.length}
                nom={nom}
                onDeplacer={(sens) => onChange(deplacer(valeur, index, sens))}
                onSupprimer={() => onChange(valeur.filter((_, i) => i !== index))}
              />
            </div>
          );
        })}
      </div>
      {valeur.length < (noeud.max ?? 30) && (
        <button type="button" className="admin-bouton admin-bouton--petit admin-bouton--ajout" onClick={() => onChange([...valeur, ''])}>
          <IconeAdmin nom="plus" taille={16} /> Ajouter un {nom}
        </button>
      )}
    </fieldset>
  );
}

function ChampListe({ noeud, valeur, chemin, onChange }) {
  const nom = noeud.nomElement ?? 'élément';

  return (
    <fieldset className="admin-champ" data-champ={chemin}>
      <legend className="admin-champ__label">{noeud.libelle}</legend>
      <Aide>{noeud.aide}</Aide>
      <div className="admin-liste">
        {valeur.map((element, index) => (
          <div className="admin-liste__element" key={index}>
            <div className="admin-liste__entete">
              <p className="admin-liste__titre">
                <span className="admin-liste__numero">{index + 1}</span>
                <span className="admin-liste__resume">{resume(element, noeud.champs) || `${nom} ${index + 1}`}</span>
              </p>
              {!noeud.fixe && (
                <ActionsElement
                  index={index}
                  total={valeur.length}
                  nom={nom}
                  onDeplacer={(sens) => onChange(deplacer(valeur, index, sens))}
                  onSupprimer={() => {
                    if (window.confirm(`Supprimer ce ${nom} ?`)) onChange(valeur.filter((_, i) => i !== index));
                  }}
                />
              )}
            </div>
            <div className="admin-liste__champs">
              {Object.entries(noeud.champs).map(([cle, sous]) => (
                <Champ
                  key={cle}
                  noeud={sous}
                  valeur={element[cle]}
                  chemin={`${chemin}.${index}.${cle}`}
                  onChange={(v) => onChange(valeur.map((e, i) => (i === index ? { ...e, [cle]: v } : e)))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!noeud.fixe && valeur.length < (noeud.max ?? 50) && (
        <button
          type="button"
          className="admin-bouton admin-bouton--petit admin-bouton--ajout"
          onClick={() => onChange([...valeur, elementVide(noeud.champs)])}
        >
          <IconeAdmin nom="plus" taille={16} /> Ajouter un {nom}
        </button>
      )}
    </fieldset>
  );
}

function ChampGroupe({ noeud, valeur, chemin, onChange }) {
  return (
    <fieldset className="admin-champ admin-champ--groupe" data-champ={chemin}>
      <legend className="admin-champ__label">{noeud.libelle}</legend>
      {Object.entries(noeud.champs).map(([cle, sous]) => (
        <Champ
          key={cle}
          noeud={sous}
          valeur={valeur[cle]}
          chemin={`${chemin}.${cle}`}
          onChange={(v) => onChange({ ...valeur, [cle]: v })}
        />
      ))}
    </fieldset>
  );
}

/** Champ du formulaire, choisi selon le type du schéma. */
function Champ(props) {
  switch (props.noeud.type) {
    case 'image':
      return <ChampImage {...props} />;
    case 'icone':
      return <ChampIcone {...props} />;
    case 'booleen':
      return <ChampBooleen {...props} />;
    case 'categories':
      return <ChampCategories {...props} />;
    case 'listeTextes':
      return <ChampListeTextes {...props} />;
    case 'liste':
      return <ChampListe {...props} />;
    case 'groupe':
      return <ChampGroupe {...props} />;
    default:
      return <ChampTexte {...props} valeur={props.valeur ?? ''} />;
  }
}

export default Champ;
