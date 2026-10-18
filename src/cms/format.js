/** « 06 64 20 82 10 » ou « +33 (0)6 64 20 82 10 » → « tel:+33664208210 ». */
export function lienTelephone(numero = '') {
  let chiffres = String(numero).replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  if (chiffres.startsWith('0')) chiffres = `+33${chiffres.slice(1)}`;
  return `tel:${chiffres}`;
}

/** Une réalisation a une fiche détaillée dès qu'elle a un défi ou une solution. */
export const estDetaille = (projet) => Boolean(projet.defi || projet.solution);
