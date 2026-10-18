/** Vrai dans l'aperçu du back-office (page chargée avec ?edit, dans une iframe). */
export const estModeEdition = () =>
  typeof window !== 'undefined' &&
  window !== window.parent &&
  new URLSearchParams(window.location.search).has('edit');
