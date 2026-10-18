import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const ENTETES_IGNORES = new Set(['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'host']);

/**
 * En développement, sert les fonctions de api/ (déployées telles quelles sur
 * Vercel) depuis le serveur Vite : `GET /api/session` → export GET de api/session.js.
 */
function apiEnDeveloppement() {
  return {
    name: 'alco-api-dev',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''), { ALCO_DEV: '1' });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const nom = req.url.slice(5).split('?')[0].replace(/\/$/, '');
        if (!/^[a-z-]+$/.test(nom)) {
          res.statusCode = 404;
          return res.end();
        }

        try {
          const module = await server.ssrLoadModule(`/api/${nom}.js`);
          const gestionnaire = module[req.method];
          if (!gestionnaire) {
            res.statusCode = 405;
            return res.end();
          }

          const morceaux = [];
          for await (const morceau of req) morceaux.push(morceau);
          const entetes = new Headers();
          for (const [cle, valeur] of Object.entries(req.headers)) {
            if (!ENTETES_IGNORES.has(cle) && valeur !== undefined) entetes.set(cle, String(valeur));
          }

          const reponse = await gestionnaire(
            new Request(`http://${req.headers.host}${req.url}`, {
              method: req.method,
              headers: entetes,
              body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(morceaux),
            }),
          );

          res.statusCode = reponse.status;
          reponse.headers.forEach((valeur, cle) => {
            if (cle !== 'set-cookie') res.setHeader(cle, valeur);
          });
          const cookies = reponse.headers.getSetCookie();
          if (cookies.length) res.setHeader('set-cookie', cookies);
          res.end(Buffer.from(await reponse.arrayBuffer()));
        } catch (erreur) {
          server.ssrFixStacktrace(erreur);
          console.error(erreur);
          res.statusCode = 500;
          res.end(JSON.stringify({ erreur: 'Erreur serveur (voir le terminal).' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiEnDeveloppement()],
});
