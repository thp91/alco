import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { champAuChemin } from '../../shared/schema';
import { useBrouillons } from './Brouillons';
import Champ, { ContexteChamps } from './champs/Champ';
import IconeAdmin from './IconeAdmin';
import { egal, lire } from './outils';
import './EditeurVisuel.css';

const appartient = (chemin, base) => chemin === base || chemin.startsWith(`${base}.`);

/**
 * Section du panneau : un chemin du contenu (« accueil.hero »), ou un objet
 * { id, chemin, titre, champs } pour ne montrer que certains champs d'un élément.
 */
const normaliser = (section) =>
  typeof section === 'string' ? { id: section, chemin: section, champs: null, titre: null } : section;

const contient = (section, chemin) =>
  section.champs
    ? section.champs.some((champ) => appartient(chemin, `${section.chemin}.${champ}`))
    : appartient(chemin, section.chemin);

/**
 * Éditeur visuel (même principe que château-l-arc) : la page s'affiche dans un
 * aperçu (iframe, ?edit) ; un clic sur un texte ou une image ouvre son champ et
 * chaque saisie s'applique en direct dans l'aperçu. Seuls les contenus changent,
 * jamais le design.
 *
 * `sections` : chemins du contenu proposés (« accueil.hero », « general.avis »…).
 * `titres` : libellés à utiliser à la place de ceux du schéma (facultatif).
 */
function EditeurVisuel({ titre, retour, apercu, sections: brutes, titres = {}, surClicAilleurs, entete }) {
  const sections = useMemo(() => brutes.map(normaliser), [brutes]);
  const { brouillons, publies, modifier, envoyerImage, urlImage, contenuApercu } = useBrouillons();
  const [actif, setActif] = useState(null);
  const [ouvertes, setOuvertes] = useState(() => new Set(brutes.slice(0, 1).map((s) => normaliser(s).id)));
  const [presents, setPresents] = useState([]);
  const [appareil, setAppareil] = useState('ordinateur');
  const iframe = useRef(null);
  const panneau = useRef(null);

  const envoyer = useCallback((message) => {
    iframe.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  // Le brouillon (images locales comprises) est poussé dans l'aperçu à chaque saisie.
  const dernierEnvoi = useRef(contenuApercu);
  dernierEnvoi.current = contenuApercu;
  useEffect(() => {
    const minuteur = window.setTimeout(() => envoyer({ type: 'cms:contenu', contenu: contenuApercu }), 60);
    return () => window.clearTimeout(minuteur);
  }, [contenuApercu, envoyer]);

  const focaliser = useCallback(
    (chemin) => {
      setActif(chemin);
      envoyer({ type: 'cms:focus', path: chemin });
    },
    [envoyer],
  );

  /** Ouvre la section d'un chemin, puis amène et active son champ dans le panneau. */
  const montrer = useCallback(
    (chemin) => {
      const section = sections.find((s) => contient(s, chemin));
      if (!section) {
        surClicAilleurs?.(chemin);
        return;
      }
      setOuvertes((o) => new Set(o).add(section.id));
      setActif(chemin);
      envoyer({ type: 'cms:focus', path: chemin });

      window.setTimeout(() => {
        // Le champ exact, ou à défaut le plus proche parent affiché.
        const morceaux = chemin.split('.');
        let cible = null;
        while (morceaux.length && !cible) {
          cible = panneau.current?.querySelector(`[data-champ="${CSS.escape(morceaux.join('.'))}"]`);
          morceaux.pop();
        }
        cible?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cible?.querySelector('input:not([type=file]):not([type=checkbox]), textarea')?.focus({ preventScroll: true });
      }, 80);
    },
    [sections, envoyer, surClicAilleurs],
  );

  useEffect(() => {
    const surMessage = (event) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      if (event.data?.type === 'cms:pret') {
        setPresents(event.data.chemins ?? []);
        envoyer({ type: 'cms:contenu', contenu: dernierEnvoi.current });
      }
      if (event.data?.type === 'cms:clic') montrer(event.data.path);
    };
    window.addEventListener('message', surMessage);
    return () => window.removeEventListener('message', surMessage);
  }, [envoyer, montrer]);

  // Sections dans l'ordre où elles apparaissent sur la page.
  const ordonnees = useMemo(() => {
    const rang = (section) => {
      const index = presents.findIndex((chemin) => contient(section, chemin));
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };
    // Les sections communes (« general ») ne sont proposées que si la page les affiche.
    const absente = (section) =>
      presents.length > 0 && section.chemin.startsWith('general.') && rang(section) === Number.MAX_SAFE_INTEGER;
    // Tri stable : les sections absentes de l'aperçu gardent leur ordre déclaré.
    return sections
      .filter((section) => !absente(section))
      .map((section, i) => ({ section, i }))
      .sort((a, b) => rang(a.section) - rang(b.section) || a.i - b.i)
      .map(({ section }) => section);
  }, [sections, presents]);

  const basculer = (section) =>
    setOuvertes((o) => {
      const copie = new Set(o);
      if (copie.has(section)) copie.delete(section);
      else copie.add(section);
      return copie;
    });

  const contexte = useMemo(
    () => ({
      actif,
      focaliser,
      envoyerImage,
      urlImage,
      categories: brouillons.realisations?.categories ?? [],
    }),
    [actif, focaliser, envoyerImage, urlImage, brouillons.realisations?.categories],
  );

  return (
    <div className={`editeur editeur--${appareil}`}>
      <div className="editeur__apercu">
        <div className="editeur__barre">
          <Link to={retour.to} className="editeur__retour">
            <IconeAdmin nom="retour" taille={16} />
            {retour.libelle}
          </Link>
          <p className="editeur__titre">{titre}</p>
          <div className="editeur__outils">
            <div className="editeur__appareils" role="radiogroup" aria-label="Taille de l’aperçu">
              {[
                ['ordinateur', 'Ordinateur'],
                ['mobile', 'Mobile'],
              ].map(([valeur, libelle]) => (
                <button
                  key={valeur}
                  type="button"
                  role="radio"
                  aria-checked={appareil === valeur}
                  aria-label={libelle}
                  className={`editeur__appareil${appareil === valeur ? ' editeur__appareil--actif' : ''}`}
                  onClick={() => setAppareil(valeur)}
                >
                  <IconeAdmin nom={valeur} taille={16} />
                </button>
              ))}
            </div>
            <a className="admin-icone-bouton" href={apercu} target="_blank" rel="noopener" aria-label="Ouvrir la page en ligne">
              <IconeAdmin nom="externe" taille={16} />
            </a>
          </div>
        </div>
        <div className="editeur__cadre">
          <iframe
            ref={iframe}
            className="editeur__iframe"
            src={`${apercu}?edit`}
            title={`Aperçu modifiable : ${titre}`}
          />
        </div>
      </div>

      <aside className="editeur__panneau" ref={panneau}>
        <div className="editeur__panneau-entete">
          {entete ?? (
            <>
              <h1 className="editeur__panneau-titre">Contenus de la page</h1>
              <p className="editeur__panneau-texte">Cliquez sur un texte ou une image dans l’aperçu.</p>
            </>
          )}
        </div>

        <ContexteChamps.Provider value={contexte}>
          <div className="editeur__sections">
            {ordonnees.map((section) => {
              const [cle, ...reste] = section.chemin.split('.');
              const noeud = champAuChemin(section.chemin);
              const valeur = lire(brouillons, section.chemin);
              if (!noeud || valeur === undefined) return null;

              const ouverte = ouvertes.has(section.id);
              const commune = cle === 'general';
              const modifierSection = (v) => modifier(cle, reste, v);
              // Champs de la section, dans l'ordre demandé (ou celui du schéma).
              const champs = noeud.champs
                ? section.champs
                  ? section.champs.filter((nom) => noeud.champs[nom]).map((nom) => [nom, noeud.champs[nom]])
                  : Object.entries(noeud.champs)
                : null;
              const modifiee = champs
                ? champs.some(([nom]) => !egal(valeur[nom], lire(publies, `${section.chemin}.${nom}`)))
                : !egal(valeur, lire(publies, section.chemin));

              return (
                <section className={`editeur__section${ouverte ? ' editeur__section--ouverte' : ''}`} key={section.id}>
                  <button
                    type="button"
                    className="editeur__section-entete"
                    aria-expanded={ouverte}
                    onClick={() => basculer(section.id)}
                  >
                    <span className="editeur__section-titre">
                      {section.titre ?? titres[section.id] ?? noeud.libelle}
                      {modifiee && <span className="editeur__pastille" title="Modifié, non publié" />}
                    </span>
                    {commune && <span className="editeur__badge">Tout le site</span>}
                    <IconeAdmin nom="bas" className="editeur__chevron" taille={16} />
                  </button>

                  {ouverte && (
                    <div className="editeur__section-corps">
                      {champs ? (
                        champs.map(([nom, sous]) => (
                          <Champ
                            key={nom}
                            noeud={sous}
                            valeur={valeur[nom]}
                            chemin={`${section.chemin}.${nom}`}
                            onChange={(v) => modifier(cle, [...reste, nom], v)}
                          />
                        ))
                      ) : (
                        <Champ noeud={{ ...noeud, libelle: '' }} valeur={valeur} chemin={section.chemin} onChange={modifierSection} />
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </ContexteChamps.Provider>
      </aside>
    </div>
  );
}

export default EditeurVisuel;
