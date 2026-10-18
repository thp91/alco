// Pictogrammes du back-office (trait de 1,75 px, grille de 24).
const TRACES = {
  maison: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  pages: 'M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M8 13h8M8 17h6',
  projets: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 11h18',
  sortie: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
  externe: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  retour: 'M15 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  poubelle: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  haut: 'M12 19V5M6 11l6-6 6 6',
  bas: 'M12 5v14M6 13l6 6 6-6',
  ordinateur: 'M4 5h16v11H4zM8 20h8M12 16v4',
  mobile: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  image: 'M4 5h16v14H4zM4 15l5-5 4 4 2-2 5 5M15 9.5a1.5 1.5 0 1 0 0-.01',
  crayon: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  publier: 'M12 16V4M7 9l5-5 5 5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5',
  alerte: 'M12 9v4M12 17h.01M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z',
  check: 'M5 12.5 10 17 19 7',
  fermer: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  oeil: 'M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  annuler: 'M4 9h11a5 5 0 0 1 0 10h-3M4 9l4-4M4 9l4 4',
};

function IconeAdmin({ nom, className, taille = 18 }) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={TRACES[nom]} />
    </svg>
  );
}

export default IconeAdmin;
