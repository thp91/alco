import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

export { contenuEmbarque } from './cms/ContentProvider';
export { headHtml, imageOg, resumer, routesPubliques, seo404, seoPour, SITE_URL, NOM_SITE } from './seo/metadonnees';

/** HTML d'une page du site, pour la pré-génération au build (scripts/prerendre.mjs). */
export function rendre(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
