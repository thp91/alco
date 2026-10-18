/** Version texte brut d'un titre saisi dans le back-office (sans « * » ni retours à la ligne). */
export const texteBrut = (text = '') => String(text).replace(/\*/g, '').replace(/\n/g, ' ');
