/**
 * Pré-génération du site, après `vite build` (client) et `vite build --ssr` :
 * - une page HTML complète par adresse publique (contenu, title, meta, Open Graph,
 *   canonical, Schema.org), que React reprend ensuite dans le navigateur ;
 * - 404.html (servie par Vercel avec le code 404) et app.html (back-office) ;
 * - une image Open Graph 1200 × 630 par page (dist/og/) ;
 * - sitemap.xml, robots.txt et llms.txt.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const racine = process.cwd();
const dist = join(racine, 'dist');
const ssr = join(racine, 'dist-ssr');

const serveur = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const { contenuEmbarque: contenu, headHtml, imageOg, resumer, routesPubliques, seo404, seoPour, SITE_URL, NOM_SITE, rendre } =
  serveur;

const gabarit = readFileSync(join(dist, 'index.html'), 'utf8');
const ZONE_SEO = /<!--seo:debut-->[\s\S]*<!--seo:fin-->/;
if (!ZONE_SEO.test(gabarit) || !gabarit.includes('<div id="root"></div>')) {
  throw new Error('index.html : zone <!--seo:debut--> … <!--seo:fin--> ou <div id="root"> introuvable.');
}

const page = (head, html) =>
  gabarit.replace(ZONE_SEO, head).replace('<div id="root"></div>', `<div id="root">${html}</div>`);

const ecrire = (chemin, texte) => {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, texte);
};

/** Image Open Graph (JPEG 1200 × 630, format accepté partout) à partir de la photo de la page. */
async function genererOg(meta) {
  const source = join(racine, 'public', meta.imageSource ?? contenu.accueil.hero.image);
  const cible = join(dist, meta.image);
  if (!existsSync(source)) return;
  mkdirSync(dirname(cible), { recursive: true });
  await sharp(source).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(cible);
}

// ---------- Pages publiques ----------
const routes = routesPubliques(contenu);
for (const route of routes) {
  const meta = seoPour(route, contenu);
  const fichier = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  ecrire(join(dist, fichier), page(headHtml(meta), rendre(route)));
  await genererOg(meta);
}

// ---------- 404 et coquille du back-office ----------
const meta404 = seo404(contenu);
ecrire(join(dist, '404.html'), page(headHtml(meta404), rendre('/page-introuvable')));
ecrire(
  join(dist, 'app.html'),
  gabarit.replace(ZONE_SEO, `<title>Back-office — ${NOM_SITE}</title>\n    <meta name="robots" content="noindex, nofollow" />`),
);

// ---------- sitemap.xml ----------
const aujourdHui = new Date().toISOString().slice(0, 10);
const priorite = (route) => (route === '/' ? '1.0' : route.startsWith('/services/') ? '0.9' : route.includes('legal') || route.includes('confidentialite') ? '0.2' : '0.7');
ecrire(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route === '/' ? '/' : route}</loc>
    <lastmod>${aujourdHui}</lastmod>
    <priority>${priorite(route)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
);

// ---------- robots.txt ----------
ecrire(
  join(dist, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`,
);

// ---------- llms.txt (présentation du site pour les assistants IA) ----------
const { coordonnees } = contenu.general;
const projets = contenu.realisations.projets.filter((p) => p.publie);
ecrire(
  join(dist, 'llms.txt'),
  `# ${NOM_SITE}

> ${resumer(contenu.accueil.hero.texte, 400)}

${resumer(contenu.accueil.expertise.paragraphes.join(' '), 600)}

Zone d'intervention : Paris, toute l'Île-de-France, la France entière et les pays limitrophes (Belgique, Luxembourg). Interventions sur cordes, sans échafaudage ni nacelle, pour les professionnels (syndics, industriels, collectivités) comme pour les particuliers. Devis détaillé sous 48 h.

## Services

${contenu.services.map((s) => `- [${s.menu.titre}](${SITE_URL}/services/${s.slug}) : ${resumer(s.seo.description || s.approche.texte, 220)}`).join('\n')}

## Réalisations

- [Toutes les réalisations](${SITE_URL}/realisations) : ${resumer(contenu.realisations.page.texte, 200)}
${projets.map((p) => `- [${p.titre}](${SITE_URL}/realisations/${p.slug}) : ${p.categorie}${p.resume ? ` — ${resumer(p.resume, 160)}` : ''}`).join('\n')}

## Contact

- [Demande de devis](${SITE_URL}/contact)
- Téléphone : ${coordonnees.telephone}
- E-mail : ${coordonnees.email}
- Adresse : ${coordonnees.adresseLigne1}, ${coordonnees.adresseLigne2}

## Optional

- [Mentions légales](${SITE_URL}/mentions-legales)
- [Politique de confidentialité](${SITE_URL}/politique-de-confidentialite)
`,
);

rmSync(ssr, { recursive: true, force: true });
console.log(`Pré-génération : ${routes.length} pages, 404, sitemap.xml, robots.txt, llms.txt.`);
