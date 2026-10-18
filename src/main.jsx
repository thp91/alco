import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/variables.css';
import './styles/base.css';
import './styles/motion.css';
import App from './App';
import { estModeEdition } from './cms/mode';

const racine = document.getElementById('root');
const application = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages pré-générées au build : React reprend le HTML existant (hydratation).
// Back-office et aperçu de l'éditeur : rendu classique, le contenu y diffère du HTML.
if (racine.hasChildNodes() && !estModeEdition()) {
  hydrateRoot(racine, application);
} else {
  createRoot(racine).render(application);
}
