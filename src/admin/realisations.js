import { elementVide, SCHEMA_PROJET } from '../../shared/schema';
import { slugifier } from './outils';

/** Adresse libre, dérivée d'un titre (« nouvelle-realisation-2 » si déjà prise). */
export function slugLibre(titre, projets, index = -1) {
  const base = slugifier(titre) || 'realisation';
  const prises = new Set(projets.filter((_, i) => i !== index).map((p) => p.slug));
  let slug = base;
  for (let n = 2; prises.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

/** Nouveau projet (brouillon non publié), ajouté en tête de liste. */
export function ajouterProjet(projets) {
  const projet = {
    ...elementVide(SCHEMA_PROJET),
    titre: 'Nouvelle réalisation',
    slug: slugLibre('Nouvelle réalisation', projets),
    publie: false,
  };
  return [projet, ...projets];
}
